/** Weather CDK Stack — DynamoDB, Lambda functions, SNS topic, EventBridge rule, API Gateway. */

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { HarvestLambda } from '../constructs/lambda-function';
import { HarvestTable } from '../constructs/dynamo-table';

export interface WeatherStackProps extends cdk.StackProps {
  stage: string;
}

export class WeatherStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: WeatherStackProps) {
    super(scope, id, props);
    const { stage } = props;

    const alertsTable = this.createAlertsTable(stage);
    const alertsTopic = this.createAlertsTopic(stage);
    const lambdas = this.createLambdas(stage, alertsTable, alertsTopic);
    this.grantPermissions(alertsTable, alertsTopic, lambdas);
    this.createPollingRule(stage, lambdas.polling);
    this.createApiGateway(stage, lambdas);
  }

  private createAlertsTable(stage: string): HarvestTable {
    return new HarvestTable(this, 'AlertsTable', {
      tableName: `HarvestAI-${stage}-WeatherAlerts`,
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'alertId', type: dynamodb.AttributeType.STRING },
      removalPolicy: stage === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });
  }

  private createAlertsTopic(stage: string): sns.Topic {
    return new sns.Topic(this, 'AlertsTopic', {
      topicName: `HarvestAI-${stage}-WeatherAlerts`,
    });
  }

  private buildCommonEnv(
    stage: string,
    alertsTable: HarvestTable,
    alertsTopic: sns.Topic
  ): Record<string, string> {
    const weatherApiKey = process.env['WEATHER_API_KEY'] ?? '';
    return {
      STAGE: stage,
      DYNAMODB_WEATHER_ALERTS_TABLE: alertsTable.table.tableName,
      SNS_ALERT_TOPIC_ARN: alertsTopic.topicArn,
      BEDROCK_MODEL_ID: 'apac.anthropic.claude-3-5-sonnet-20241022-v2:0',
      WEATHER_API_BASE_URL: 'https://api.openweathermap.org/data/3.0',
      WEATHER_API_KEY: weatherApiKey,
    };
  }

  private createLambdas(
    stage: string,
    alertsTable: HarvestTable,
    alertsTopic: sns.Topic
  ): Record<string, HarvestLambda> {
    const env = this.buildCommonEnv(stage, alertsTable, alertsTopic);
    const pollingEnv = {
      ...env,
      SYSTEM_POLLING_USER_ID: `harvest-ai-system-${stage}`,
      DEFAULT_FARM_LAT: '-33.8688',
      DEFAULT_FARM_LNG: '151.2093',
    };

    return {
      forecast: new HarvestLambda(this, 'ForecastFn', {
        stage, name: 'WeatherForecast',
        entry: 'backend/src/handlers/weather/weatherForecast.handler.ts',
        handler: 'handler', environment: env,
      }),
      alerts: new HarvestLambda(this, 'AlertsFn', {
        stage, name: 'WeatherAlerts',
        entry: 'backend/src/handlers/weather/weatherAlert.handler.ts',
        handler: 'listAlertsHandler', environment: pollingEnv,
      }),
      acknowledge: new HarvestLambda(this, 'AcknowledgeFn', {
        stage, name: 'WeatherAcknowledge',
        entry: 'backend/src/handlers/weather/weatherAlert.handler.ts',
        handler: 'acknowledgeAlertHandler', environment: pollingEnv,
      }),
      subscription: new HarvestLambda(this, 'SubscriptionFn', {
        stage, name: 'WeatherSubscription',
        entry: 'backend/src/handlers/weather/weatherSubscription.handler.ts',
        handler: 'handler', environment: env,
      }),
      polling: new HarvestLambda(this, 'PollingFn', {
        stage, name: 'WeatherPolling',
        entry: 'backend/src/handlers/weather/weatherAlert.handler.ts',
        handler: 'scheduledPollHandler',
        timeout: cdk.Duration.seconds(60), environment: pollingEnv,
      }),
    };
  }

  private grantPermissions(
    alertsTable: HarvestTable,
    alertsTopic: sns.Topic,
    lambdas: Record<string, HarvestLambda>
  ): void {
    const tableReadWriteFns = [lambdas['alerts'], lambdas['acknowledge'], lambdas['polling']];
    tableReadWriteFns.forEach((l) => alertsTable.table.grantReadWriteData(l!.fn));
    alertsTable.table.grantReadData(lambdas['forecast']!.fn);

    alertsTopic.grantPublish(lambdas['polling']!.fn);

    const bedrockStatement = new iam.PolicyStatement({
      actions: ['bedrock:InvokeModel'],
      resources: ['*'],
    });
    lambdas['forecast']!.fn.addToRolePolicy(bedrockStatement);
    lambdas['polling']!.fn.addToRolePolicy(bedrockStatement);

    lambdas['subscription']!.fn.addToRolePolicy(new iam.PolicyStatement({
      actions: ['sns:Subscribe'],
      resources: [alertsTopic.topicArn],
    }));
  }

  private createPollingRule(stage: string, pollingLambda: HarvestLambda): void {
    const rule = new events.Rule(this, 'PollingRule', {
      ruleName: `HarvestAI-${stage}-WeatherPolling`,
      schedule: events.Schedule.rate(cdk.Duration.minutes(30)),
    });
    rule.addTarget(new targets.LambdaFunction(pollingLambda.fn));
  }

  private createApiGateway(stage: string, lambdas: Record<string, HarvestLambda>): apigw.RestApi {
    const api = new apigw.RestApi(this, 'WeatherApi', {
      restApiName: `HarvestAI-${stage}-WeatherApi`,
      deployOptions: { stageName: stage },
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    const weather = api.root.addResource('api').addResource('weather');
    weather.addResource('forecast').addMethod('GET', new apigw.LambdaIntegration(lambdas['forecast']!.fn));

    const alertsRes = weather.addResource('alerts');
    alertsRes.addMethod('GET', new apigw.LambdaIntegration(lambdas['alerts']!.fn));
    alertsRes.addResource('{alertId}').addResource('acknowledge')
      .addMethod('PUT', new apigw.LambdaIntegration(lambdas['acknowledge']!.fn));

    weather.addResource('subscribe').addMethod('POST', new apigw.LambdaIntegration(lambdas['subscription']!.fn));

    new cdk.CfnOutput(this, 'ApiUrl', { value: api.url, description: 'Weather API Gateway URL' });

    return api;
  }
}
