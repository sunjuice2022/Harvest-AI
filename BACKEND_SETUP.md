# 🚀 AWS Infrastructure Setup Guide — Make Backend Work

## ⚠️ Current Limitation

The frontend is working, but backend API calls will fail because:

```
❌ Lambda functions not deployed
❌ DynamoDB table (ChatSessions) doesn't exist
❌ S3 bucket (harvest-ai-media) not created
❌ Bedrock Claude not accessible
❌ API Gateway not configured
❌ Cognito User Pool not set up
```

This guide shows you how to **set up everything needed** to make the backend functional.

---

## 📋 Complete Checklist

### **Prerequisites** (Do First)
- [ ] AWS Account with admin access
- [ ] AWS CLI installed and configured
- [ ] AWS CDK installed globally
- [ ] Node.js 18+ installed
- [ ] Amazon Bedrock Claude access granted

### **Phase 0A: Local Setup** (30 minutes)
- [ ] Configure AWS credentials
- [ ] Set up CDK project
- [ ] Create infrastructure code

### **Phase 0B: AWS Service Setup** (1-2 hours)
- [ ] Request Bedrock model access
- [ ] Create Cognito User Pool
- [ ] Deploy DynamoDB table
- [ ] Create S3 bucket
- [ ] Deploy API Gateway

### **Phase 0C: Testing** (30 minutes)
- [ ] Test Bedrock connection
- [ ] Test DynamoDB with sample data
- [ ] Test S3 presigned URLs
- [ ] Test full API flow

---

## 🔑 Step 1: Configure AWS Credentials

### Check if AWS CLI is installed

```bash
aws --version
# Should show: aws-cli/2.x.x ...
```

If not installed:
```bash
# macOS
brew install awscli

# Or download from: https://aws.amazon.com/cli/
```

### Configure AWS credentials

```bash
aws configure
```

When prompted, enter:
```
AWS Access Key ID: [your-access-key]
AWS Secret Access Key: [your-secret-key]
Default region name: [us-east-1]
Default output format: [json]
```

**Find your AWS credentials:**
1. Log into AWS Console
2. Go to IAM → Users → Your User
3. Security credentials → Create access key
4. Copy Access Key ID and Secret Key

### Verify credentials work

```bash
aws sts get-caller-identity
# Should show your AWS account info
```

---

## 🏗️ Step 2: Set Up AWS CDK

### Install CDK globally

```bash
npm install -g aws-cdk@2.127.0

# Verify installation
cdk --version
# Should show: 2.127.0
```

### Bootstrap CDK (one-time setup per region)

```bash
cdk bootstrap aws://ACCOUNT_ID/us-east-1
```

Get your account ID:
```bash
aws sts get-caller-identity --query Account --output text
```

Example:
```bash
cdk bootstrap aws://123456789012/us-east-1
```

---

## 🏛️ Step 3: Create Infrastructure Code (CDK Stacks)

The infrastructure folder is already scaffolded. Now we'll add the diagnosis stack.

### Create CDK Stack File

Create [infrastructure/lib/stacks/diagnosis-stack.ts](infrastructure/lib/stacks/diagnosis-stack.ts):

```typescript
import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";

export class DiagnosisStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table for Chat Sessions
    const chatSessionsTable = new dynamodb.Table(this, "ChatSessionsTable", {
      tableName: "ChatSessions",
      partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "SK", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Dev only!
      timeToLiveAttribute: "ttl",
      stream: dynamodb.StreamSpecification.NEW_AND_OLD_IMAGES,
    });

    // S3 Bucket for Media Uploads
    const mediaBucket = new s3.Bucket(this, "MediaBucket", {
      bucketName: `harvest-ai-media-${cdk.Stack.of(this).account}`,
      versioned: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Dev only!
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
          allowedOrigins: ["http://localhost:5173", "http://localhost:3000"],
          allowedHeaders: ["*"],
          maxAge: 3000,
        },
      ],
    });

    // Lambda Execution Role
    const lambdaRole = new cdk.aws_iam.Role(this, "LambdaExecutionRole", {
      assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
      ],
    });

    // Grant DynamoDB access
    chatSessionsTable.grantReadWriteData(lambdaRole);

    // Grant S3 access
    mediaBucket.grantReadWrite(lambdaRole);

    // Grant Bedrock access
    lambdaRole.addToPrincipalPolicy(
      new cdk.aws_iam.PolicyStatement({
        actions: ["bedrock:InvokeModel"],
        resources: [
          `arn:aws:bedrock:${this.region}::foundation-model/anthropic.claude-3-5-sonnet-20241022`,
        ],
      })
    );

    // Outputs
    new cdk.CfnOutput(this, "ChatSessionsTableName", {
      value: chatSessionsTable.tableName,
      exportName: "ChatSessionsTableName",
    });

    new cdk.CfnOutput(this, "MediaBucketName", {
      value: mediaBucket.bucketName,
      exportName: "MediaBucketName",
    });
  }
}
```

### Create CDK App Entry Point

Create [infrastructure/lib/app.ts](infrastructure/lib/app.ts):

```typescript
import * as cdk from "aws-cdk-lib";
import { DiagnosisStack } from "./stacks/diagnosis-stack";

const app = new cdk.App();

new DiagnosisStack(app, "DiagnosisStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || "us-east-1",
  },
});

app.synth();
```

### Create CDK Bin Entry Point

Create [infrastructure/bin/cdk.ts](infrastructure/bin/cdk.ts):

```typescript
#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { DiagnosisStack } from "../lib/stacks/diagnosis-stack";

const app = new cdk.App();

new DiagnosisStack(app, "DiagnosisStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || "us-east-1",
  },
});
```

---

## 🔐 Step 4: Enable AWS Services

### Request Bedrock Model Access

1. **Open AWS Console** → Bedrock → Model access
2. **Click "Manage model access"**
3. **Find "Anthropic Claude 3.5 Sonnet"**
4. **Click checkbox** → Accept license
5. **Save changes**
6. **Wait 5-10 minutes** for access to be granted

Verify access:
```bash
aws bedrock list-foundation-models \
  --region us-east-1 \
  --query "modelSummaries[?contains(modelName, 'Claude 3.5')].{name: modelName, id: modelId}"
```

### Enable DynamoDB

```bash
# Already enabled, will be created by CDK
```

### Enable S3

```bash
# Already enabled, will be created by CDK
```

---

## 🚀 Step 5: Deploy Infrastructure with CDK

### Synthesize CloudFormation (Preview)

```bash
cd infrastructure
cdk synth
```

This generates CloudFormation template in `cdk.out/`

### View deployment plan

```bash
cdk diff
```

Shows what resources will be created.

### Deploy to AWS

```bash
cdk deploy DiagnosisStack
```

When prompted:
```
Do you wish to deploy these changes (y/n)? y
```

**This will:**
- ✅ Create DynamoDB table (ChatSessions)
- ✅ Create S3 bucket (harvest-ai-media)
- ✅ Create IAM role with Bedrock + DynamoDB + S3 permissions
- ⏱️ Takes ~5-10 minutes

After deployment, you'll see:
```
✓ DiagnosisStack
Outputs:
DiagnosisStack.ChatSessionsTableName = ChatSessions
DiagnosisStack.MediaBucketName = harvest-ai-media-123456789012
```

---

## 🔗 Step 6: Deploy Lambda Functions

### Deploy Diagnosis Chat Handler

```bash
# Build backend
npm run build -w backend

# Create function from dist
aws lambda create-function \
  --function-name diagnosis-chat \
  --runtime nodejs18.x \
  --role arn:aws:iam::ACCOUNT_ID:role/DiagnosisStack-LambdaExecutionRoleXXXX-XXXXX \
  --handler dist/handlers/diagnosis/diagnosis.handler.diagnosisChat \
  --zip-file fileb://backend/dist.zip \
  --environment Variables="{CHAT_SESSIONS_TABLE=ChatSessions,MEDIA_BUCKET=harvest-ai-media-ACCOUNT_ID,AWS_REGION=us-east-1}"
```

Or use AWS Lambda Console to upload manually (easier for now).

---

## 🌐 Step 7: Create API Gateway

### Create REST API

1. **AWS Console** → API Gateway → Create API
2. **REST API** → Build
3. **API Name:** `harvest-ai-diagnosis-api`
4. **Description:** Crop Diagnosis API

### Add Route: POST /api/diagnosis/chat

1. **Create resource:** `/api/diagnosis/chat`
2. **Create POST method**
3. **Integration type:** AWS Lambda
4. **Lambda function:** `diagnosis-chat`
5. **Deploy** to stage: `dev`

### Get API URL

```
https://xxxxxxx.execute-api.us-east-1.amazonaws.com/dev
```

### Update Frontend .env

Edit [frontend/.env](frontend/.env):

```
VITE_API_URL=https://xxxxxxx.execute-api.us-east-1.amazonaws.com/dev
```

---

## 🧪 Step 8: Test Everything

### Test Bedrock Connection

```bash
aws bedrock-runtime invoke-model \
  --model-id anthropic.claude-3-5-sonnet-20241022 \
  --body '{"prompt": "Hello", "max_tokens": 100}' \
  --region us-east-1 \
  response.txt

cat response.txt
```

### Test DynamoDB Table

```bash
aws dynamodb describe-table --table-name ChatSessions

# Put test item
aws dynamodb put-item \
  --table-name ChatSessions \
  --item '{"PK": {"S": "user-123"}, "SK": {"S": "session-456"}, "messages": {"L": []}}'

# Get test item
aws dynamodb get-item \
  --table-name ChatSessions \
  --key '{"PK": {"S": "user-123"}, "SK": {"S": "session-456"}}'
```

### Test S3 Presigned URL

```bash
aws s3api generate-presigned-url put-object \
  --bucket harvest-ai-media-ACCOUNT_ID \
  --key "test/image.jpg" \
  --expires-in 600
```

### Test Full API Flow

```bash
curl -X POST https://YOUR_API_ENDPOINT/api/diagnosis/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session",
    "message": "My tomato has yellow spots",
    "imageUrl": null
  }'
```

---

## 🔑 Step 9: Set Up Authentication (Optional)

For now, you can test without auth. To add Cognito:

### Create User Pool

1. **AWS Console** → Cognito → User pools → Create
2. **User pool name:** `harvest-ai-users`
3. **Sign-in options:** Email
4. **Next**
5. **Configure sign-up:**
   - Allow self sign-up: Yes
   - Allow admin sign-up: Yes
6. **Create**

### Create App Client

1. **User pool** → App integration → App clients
2. **Create app client**
3. **App type:** Web
4. **Authorized origins:**
   - `http://localhost:5173`
   - `http://localhost:3000`
5. **Save & Create**

### Get Credentials

```bash
USER_POOL_ID="us-east-1_xxxxxxx"
CLIENT_ID="xxxxxxxxxxxxxxxxxxxxxxxxx"
```

### Add to Frontend .env

```
VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxx
VITE_COGNITO_REGION=us-east-1
```

---

## 📊 Environmental Variables Needed

### Backend (.env)

```bash
AWS_REGION=us-east-1
CHAT_SESSIONS_TABLE=ChatSessions
MEDIA_BUCKET=harvest-ai-media-ACCOUNT_ID
```

### Frontend (.env)

```bash
VITE_API_URL=https://api-endpoint.com/dev
VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxx
VITE_COGNITO_REGION=us-east-1
```

---

## 🧪 Quick Testing Without AWS (Use Mocks)

If you don't want to set up AWS yet, use mocks:

### Create Mock Bedrock Service

Create [backend/src/services/diagnosis/bedrock.mock.ts](backend/src/services/diagnosis/bedrock.mock.ts):

```typescript
import type { DiagnosisResult } from "@harvest-ai/shared";

export async function mockDiagnoseCrop(message: string): Promise<DiagnosisResult> {
  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (message.toLowerCase().includes("tomato")) {
    return {
      condition: "Early Blight",
      conditionType: "disease",
      confidence: 92,
      severity: "warning",
      description: "Early Blight (Alternaria solani) is a fungal disease affecting tomato leaves.",
      treatment: [
        "Apply fungicide spray (Mancozeb or Chlorothalonil)",
        "Remove infected leaves from bottom 12 inches",
        "Improve air circulation",
      ],
      organicAlternatives: ["Neem oil spray", "Copper sulfate solution"],
      preventionTips: ["Use mulch", "Space plants 24-36 inches apart"],
      affectedPlants: ["Tomato", "Potato"],
      escalatedToExpert: false,
    };
  }

  return {
    condition: "Unidentified",
    conditionType: "disease",
    confidence: 25,
    severity: "info",
    description: "Unable to identify. Try another angle.",
    treatment: ["Consult local agronomist"],
    escalatedToExpert: true,
  };
}
```

### Create Mock DynamoDB

```typescript
// In-memory store for testing
const mockSessions = new Map();

export async function mockSaveSession(userId: string, sessionId: string, data: any) {
  const key = `${userId}#${sessionId}`;
  mockSessions.set(key, data);
  return true;
}

export async function mockGetSession(userId: string, sessionId: string) {
  const key = `${userId}#${sessionId}`;
  return mockSessions.get(key) || null;
}
```

### Use Mocks in Handler

```typescript
import { mockDiagnoseCrop } from "../services/diagnosis/bedrock.mock";

export async function diagnosisChat(event: any) {
  try {
    const request = JSON.parse(event.body || "{}");
    
    // Use mock instead of real Bedrock
    const diagnosis = await mockDiagnoseCrop(request.message);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        messageId: "mock-123",
        diagnosis,
        followUpSuggestions: [],
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
}
```

---

## 🎯 Next Steps (Timeline)

| Step | Time | Action |
|------|------|--------|
| **Now** | 10 min | Configure AWS CLI + request Bedrock access |
| **Day 1** | 1 hour | Deploy CDK infrastructure (Lambda, DynamoDB, S3) |
| **Day 1** | 30 min | Set up API Gateway + update frontend URL |
| **Day 2** | 1 hour | Test each component with AWS CLI |
| **Day 2** | 30 min | Test full end-to-end flow via frontend |
| **Day 3** | 2 hours | Optimize, add error handling, monitoring |

---

## 📞 Troubleshooting

### "Model not found" error
```
Solution: Bedrock access not yet granted. Check AWS Console → Bedrock → Model access
```

### "DynamoDB table not found"
```
Solution: CDK deploy failed. Check: cdk deploy --verbose
```

### "S3 access denied"
```
Solution: Lambda role doesn't have S3 permissions. Check IAM role policy in AWS Console.
```

### "CORS error from API Gateway"
```
Solution: Add your frontend origin to API Gateway → API settings → CORS
```

---

## 📚 Reference Links

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [Bedrock Models](https://aws.amazon.com/bedrock/claude/)
- [DynamoDB Guide](https://docs.aws.amazon.com/dynamodb/)
- [API Gateway](https://docs.aws.amazon.com/apigateway/)
- [Lambda Developer Guide](https://docs.aws.amazon.com/lambda/)

---

**Status:** Ready to deploy! Follow steps 1-8 to make backend work. 🚀
