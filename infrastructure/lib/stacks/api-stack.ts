/** Harvest AI — unified API stack: one API Gateway, all Lambda handlers, all shared resources. */

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { HarvestLambda } from '../constructs/lambda-function';
import { HarvestTable } from '../constructs/dynamo-table';

export interface ApiStackProps extends cdk.StackProps {
  stage: string;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);
    const { stage } = props;

    const alertsTable = new HarvestTable(this, 'AlertsTable', {
      tableName: `HarvestAI-${stage}-WeatherAlerts`,
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'alertId', type: dynamodb.AttributeType.STRING },
      removalPolicy: stage === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    const chatTable = new HarvestTable(this, 'ChatTable', {
      tableName: `HarvestAI-${stage}-ChatSessions`,
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      removalPolicy: stage === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    const mediaBucket = new s3.Bucket(this, 'MediaBucket', {
      bucketName: `harvest-ai-${stage}-media-${this.account}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      cors: [{ allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT], allowedOrigins: ['*'], allowedHeaders: ['*'] }],
      autoDeleteObjects: stage !== 'prod',
      removalPolicy: stage === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    const alertsTopic = new sns.Topic(this, 'AlertsTopic', {
      topicName: `HarvestAI-${stage}-WeatherAlerts`,
    });

    const api = new apigw.RestApi(this, 'Api', {
      restApiName: `HarvestAI-${stage}-Api`,
      deployOptions: { stageName: stage },
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
      },
    });

    const apiRoot = api.root.addResource('api');
    this.addWeatherRoutes(stage, apiRoot, alertsTable, alertsTopic);
    this.addDiagnosisRoutes(stage, apiRoot, chatTable, mediaBucket);
    this.addFarmRecommendationRoutes(stage, apiRoot);
    this.addMarketPriceRoutes(stage, apiRoot);

    new cdk.CfnOutput(this, 'ApiUrl', { value: api.url, description: 'HarvestAI unified API URL' });
    new cdk.CfnOutput(this, 'MediaBucketName', { value: mediaBucket.bucketName, description: 'S3 bucket for media uploads' });
  }

  private addWeatherRoutes(stage: string, root: apigw.Resource, alertsTable: HarvestTable, alertsTopic: sns.Topic): void {
    const baseEnv = {
      STAGE: stage,
      DYNAMODB_WEATHER_ALERTS_TABLE: alertsTable.table.tableName,
      SNS_ALERT_TOPIC_ARN: alertsTopic.topicArn,
      BEDROCK_MODEL_ID: 'apac.anthropic.claude-3-5-sonnet-20241022-v2:0',
      WEATHER_API_BASE_URL: 'https://api.openweathermap.org/data/3.0',
      WEATHER_API_KEY: process.env['WEATHER_API_KEY'] ?? '',
    };
    const pollingEnv = { ...baseEnv, SYSTEM_POLLING_USER_ID: `harvest-ai-system-${stage}`, DEFAULT_FARM_LAT: '-33.8688', DEFAULT_FARM_LNG: '151.2093' };
    const bedrockPolicy = new iam.PolicyStatement({ actions: ['bedrock:InvokeModel'], resources: ['*'] });

    const forecastFn = new HarvestLambda(this, 'WeatherForecastFn', { stage, name: 'WeatherForecast', entry: 'backend/src/handlers/weather/weatherForecast.handler.ts', handler: 'handler', environment: baseEnv });
    forecastFn.fn.addToRolePolicy(bedrockPolicy);
    alertsTable.table.grantReadData(forecastFn.fn);

    const alertsFn = new HarvestLambda(this, 'WeatherAlertsFn', { stage, name: 'WeatherAlerts', entry: 'backend/src/handlers/weather/weatherAlert.handler.ts', handler: 'listAlertsHandler', environment: pollingEnv });
    alertsTable.table.grantReadWriteData(alertsFn.fn);

    const acknowledgeFn = new HarvestLambda(this, 'WeatherAcknowledgeFn', { stage, name: 'WeatherAcknowledge', entry: 'backend/src/handlers/weather/weatherAlert.handler.ts', handler: 'acknowledgeAlertHandler', environment: pollingEnv });
    alertsTable.table.grantReadWriteData(acknowledgeFn.fn);

    const subscriptionFn = new HarvestLambda(this, 'WeatherSubscriptionFn', { stage, name: 'WeatherSubscription', entry: 'backend/src/handlers/weather/weatherSubscription.handler.ts', handler: 'handler', environment: baseEnv });
    subscriptionFn.fn.addToRolePolicy(new iam.PolicyStatement({ actions: ['sns:Subscribe'], resources: [alertsTopic.topicArn] }));

    const pollingFn = new HarvestLambda(this, 'WeatherPollingFn', { stage, name: 'WeatherPolling', entry: 'backend/src/handlers/weather/weatherAlert.handler.ts', handler: 'scheduledPollHandler', timeout: cdk.Duration.seconds(60), environment: pollingEnv });
    alertsTable.table.grantReadWriteData(pollingFn.fn);
    alertsTopic.grantPublish(pollingFn.fn);
    pollingFn.fn.addToRolePolicy(bedrockPolicy);

    const rule = new events.Rule(this, 'WeatherPollingRule', { ruleName: `HarvestAI-${stage}-WeatherPolling`, schedule: events.Schedule.rate(cdk.Duration.minutes(30)) });
    rule.addTarget(new targets.LambdaFunction(pollingFn.fn));

    const weather = root.addResource('weather');
    weather.addResource('forecast').addMethod('GET', new apigw.LambdaIntegration(forecastFn.fn));
    const alertsRes = weather.addResource('alerts');
    alertsRes.addMethod('GET', new apigw.LambdaIntegration(alertsFn.fn));
    alertsRes.addResource('{alertId}').addResource('acknowledge').addMethod('PUT', new apigw.LambdaIntegration(acknowledgeFn.fn));
    weather.addResource('subscribe').addMethod('POST', new apigw.LambdaIntegration(subscriptionFn.fn));
  }

  private addDiagnosisRoutes(stage: string, root: apigw.Resource, chatTable: HarvestTable, mediaBucket: s3.Bucket): void {
    const bedrockPolicy = new iam.PolicyStatement({ actions: ['bedrock:InvokeModel'], resources: ['*'] });

    const chatFn = new HarvestLambda(this, 'DiagnosisChatFn', { stage, name: 'DiagnosisChat', entry: 'backend/src/handlers/diagnosis/diagnosis.handler.ts', handler: 'diagnosisChat', timeout: cdk.Duration.seconds(30), memorySize: 512, environment: { CHAT_SESSIONS_TABLE: chatTable.table.tableName, MEDIA_BUCKET: mediaBucket.bucketName } });
    chatTable.table.grantReadWriteData(chatFn.fn);
    mediaBucket.grantReadWrite(chatFn.fn);
    chatFn.fn.addToRolePolicy(bedrockPolicy);

    const sessionsFn = new HarvestLambda(this, 'DiagnosisSessionsFn', { stage, name: 'DiagnosisSessions', entry: 'backend/src/handlers/diagnosis/sessions.handler.ts', handler: 'getSessions', environment: { CHAT_SESSIONS_TABLE: chatTable.table.tableName } });
    chatTable.table.grantReadWriteData(sessionsFn.fn);

    const uploadFn = new HarvestLambda(this, 'DiagnosisUploadFn', { stage, name: 'DiagnosisUpload', entry: 'backend/src/handlers/diagnosis/upload.handler.ts', handler: 'uploadPhoto', environment: { MEDIA_BUCKET: mediaBucket.bucketName } });
    mediaBucket.grantReadWrite(uploadFn.fn);

    const diagnosis = root.addResource('diagnosis');
    diagnosis.addResource('chat').addMethod('POST', new apigw.LambdaIntegration(chatFn.fn));
    const sessions = diagnosis.addResource('sessions');
    sessions.addMethod('GET', new apigw.LambdaIntegration(sessionsFn.fn));
    sessions.addResource('{sessionId}').addMethod('GET', new apigw.LambdaIntegration(sessionsFn.fn));
    diagnosis.addResource('upload').addMethod('POST', new apigw.LambdaIntegration(uploadFn.fn));
  }

  private addFarmRecommendationRoutes(stage: string, root: apigw.Resource): void {
    const farmFn = new HarvestLambda(this, 'FarmRecommendationFn', { stage, name: 'FarmRecommendation', entry: 'backend/src/handlers/farm-recommendation/farmRecommendation.handler.ts', handler: 'farmRecommendation', timeout: cdk.Duration.seconds(30), memorySize: 512, environment: { BEDROCK_MODEL_ID: 'apac.anthropic.claude-3-5-sonnet-20241022-v2:0' } });
    farmFn.fn.addToRolePolicy(new iam.PolicyStatement({ actions: ['bedrock:InvokeModel'], resources: ['*'] }));
    root.addResource('farm-recommendation').addMethod('POST', new apigw.LambdaIntegration(farmFn.fn));
  }

  private addMarketPriceRoutes(stage: string, root: apigw.Resource): void {
    const marketFn = new HarvestLambda(this, 'MarketPriceFn', { stage, name: 'MarketPrice', entry: 'backend/src/handlers/market-price/marketPrice.handler.ts', handler: 'getMarketInsight', timeout: cdk.Duration.seconds(30), memorySize: 512, environment: { BEDROCK_MODEL_ID: 'anthropic.claude-3-5-sonnet-20241022-v2:0' } });
    const marketPricesFn = new HarvestLambda(this, 'MarketPricesFn', { stage, name: 'MarketPrices', entry: 'backend/src/handlers/market-price/marketPrice.handler.ts', handler: 'getMarketPrices', timeout: cdk.Duration.seconds(30), memorySize: 512, environment: {} });
    marketFn.fn.addToRolePolicy(new iam.PolicyStatement({ actions: ['bedrock:InvokeModel'], resources: ['*'] }));
    const marketPrices = root.addResource('market-prices');
    marketPrices.addMethod('GET', new apigw.LambdaIntegration(marketPricesFn.fn));
    marketPrices.addResource('insight').addMethod('POST', new apigw.LambdaIntegration(marketFn.fn));
  }
}
