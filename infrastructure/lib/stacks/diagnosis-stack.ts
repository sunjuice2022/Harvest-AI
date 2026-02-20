/**
 * Diagnosis Stack - AWS CDK infrastructure for diagnosis domain
 */

import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import { Construct } from "constructs";

const BACKEND_DIR = path.join(__dirname, "../../../backend");

export class DiagnosisStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const chatSessionsTable = this.createChatSessionsTable();
    const mediaBucket = this.createMediaBucket();
    const lambdaRole = this.createLambdaRole(
      chatSessionsTable,
      mediaBucket,
    );
    const lambdaFunctions = this.createLambdaFunctions(
      lambdaRole,
      chatSessionsTable,
      mediaBucket,
    );
    this.createApiGateway(lambdaFunctions);
    this.createOutputs(chatSessionsTable, mediaBucket);
  }

  private createChatSessionsTable(): dynamodb.Table {
    return new dynamodb.Table(this, "ChatSessionsTable", {
      tableName: "ChatSessions",
      partitionKey: {
        name: "PK",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "SK",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: "ttl",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }

  private createMediaBucket(): s3.Bucket {
    return new s3.Bucket(this, "MediaBucket", {
      bucketName: `harvest-ai-media-${this.account}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
          allowedOrigins: [
            "http://localhost:5173",
            "http://localhost:3000",
          ],
          allowedHeaders: ["*"],
          maxAge: 3000,
        },
      ],
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }

  private createLambdaRole(
    table: dynamodb.Table,
    bucket: s3.Bucket,
  ): iam.Role {
    const role = new iam.Role(this, "DiagnosisLambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole",
        ),
      ],
    });

    table.grantReadWriteData(role);
    bucket.grantReadWrite(role);

    role.addToPolicy(
      new iam.PolicyStatement({
        actions: ["bedrock:InvokeModel"],
        resources: [
          `arn:aws:bedrock:${this.region}::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0`,
        ],
      }),
    );

    return role;
  }

  private createLambdaFunctions(
    role: iam.Role,
    table: dynamodb.Table,
    bucket: s3.Bucket,
  ): Record<string, NodejsFunction> {
    const chatFn = new NodejsFunction(this, "DiagnosisChatFn", {
      functionName: "diagnosis-chat",
      runtime: Runtime.NODEJS_18_X,
      entry: path.join(
        BACKEND_DIR,
        "src/handlers/diagnosis/diagnosis.handler.ts",
      ),
      handler: "diagnosisChat",
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      role,
      environment: {
        CHAT_SESSIONS_TABLE: table.tableName,
        MEDIA_BUCKET: bucket.bucketName,
      },
      bundling: {
        externalModules: [],
      },
    });

    const sessionsFn = new NodejsFunction(
      this,
      "DiagnosisSessionsFn",
      {
        functionName: "diagnosis-sessions",
        runtime: Runtime.NODEJS_18_X,
        entry: path.join(
          BACKEND_DIR,
          "src/handlers/diagnosis/sessions.handler.ts",
        ),
        handler: "getSessions",
        timeout: cdk.Duration.seconds(10),
        memorySize: 256,
        role,
        environment: {
          CHAT_SESSIONS_TABLE: table.tableName,
        },
      },
    );

    const uploadFn = new NodejsFunction(this, "DiagnosisUploadFn", {
      functionName: "diagnosis-upload",
      runtime: Runtime.NODEJS_18_X,
      entry: path.join(
        BACKEND_DIR,
        "src/handlers/diagnosis/upload.handler.ts",
      ),
      handler: "uploadPhoto",
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
      role,
      environment: {
        MEDIA_BUCKET: bucket.bucketName,
      },
    });

    return { chatFn, sessionsFn, uploadFn };
  }

  private createApiGateway(
    fns: Record<string, NodejsFunction>,
  ): apigateway.RestApi {
    const api = new apigateway.RestApi(this, "DiagnosisApi", {
      restApiName: "harvest-ai-diagnosis-api",
      deployOptions: { stageName: "dev" },
      defaultCorsPreflightOptions: {
        allowOrigins: [
          "http://localhost:5173",
          "http://localhost:3000",
        ],
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ["Content-Type", "Authorization"],
      },
    });

    const apiResource = api.root.addResource("api");
    const diagnosis = apiResource.addResource("diagnosis");

    const chat = diagnosis.addResource("chat");
    chat.addMethod(
      "POST",
      new apigateway.LambdaIntegration(fns.chatFn),
    );

    const sessions = diagnosis.addResource("sessions");
    sessions.addMethod(
      "GET",
      new apigateway.LambdaIntegration(fns.sessionsFn),
    );

    const sessionById = sessions.addResource("{sessionId}");
    sessionById.addMethod(
      "GET",
      new apigateway.LambdaIntegration(fns.sessionsFn),
    );

    const upload = diagnosis.addResource("upload");
    upload.addMethod(
      "POST",
      new apigateway.LambdaIntegration(fns.uploadFn),
    );

    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.url,
      description: "Diagnosis API Gateway URL",
    });

    return api;
  }

  private createOutputs(
    table: dynamodb.Table,
    bucket: s3.Bucket,
  ): void {
    new cdk.CfnOutput(this, "ChatSessionsTableName", {
      value: table.tableName,
      description: "DynamoDB table for chat sessions",
    });

    new cdk.CfnOutput(this, "MediaBucketName", {
      value: bucket.bucketName,
      description: "S3 bucket for media uploads",
    });
  }
}
