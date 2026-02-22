# Deployment Plan

## Harvest AI — Infrastructure, CI/CD & Deployment

| Field            | Detail                              |
| ---------------- | ----------------------------------- |
| **Document**     | Deployment Plan                     |
| **Version**      | 1.0                                 |
| **Date**         | 2026-02-15                          |
| **Author**       | Jenny                               |
| **IaC**          | AWS CDK (TypeScript)                |
| **Lambda Deploy**| ZIP bundles (no Docker)             |
| **CI/CD**        | GitHub Actions                      |
| **Frontend Host**| AWS Amplify                         |

---

## 1. Deployment Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          GitHub Repository                                │
│                     github.com/sunjuice2022/Harvest-AI                   │
└────────────────────────────┬─────────────────────────────────────────────┘
                             │
                     Push / Merge PR
                             │
                             v
┌──────────────────────────────────────────────────────────────────────────┐
│                        GitHub Actions CI/CD                               │
│                                                                           │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐  │
│  │   Lint &     │  │    Build &   │  │   CDK Deploy │  │   Amplify    │  │
│  │   Type Check │──│    Test      │──│   (Backend)  │──│   (Frontend) │  │
│  └─────────────┘  └──────────────┘  └─────────────┘  └──────────────┘  │
│                                            │                  │          │
└────────────────────────────────────────────┼──────────────────┼──────────┘
                                             │                  │
                                             v                  v
┌──────────────────────────────────────────────────────────────────────────┐
│                              AWS Account                                  │
│                                                                           │
│  ┌──────────────────────────────┐    ┌────────────────────────────────┐  │
│  │      Backend (CDK Stacks)    │    │      Frontend (Amplify)        │  │
│  │                              │    │                                │  │
│  │  Auth Stack (Cognito)        │    │  React + Vite                  │  │
│  │  API Stack (API Gateway)     │    │  CloudFront CDN               │  │
│  │  Weather Stack (Lambda+DDB)  │    │  Auto SSL                     │  │
│  │  Diagnosis Stack (Lambda+S3) │    │  Branch previews              │  │
│  │  News Stack (Lambda+DDB)     │    │                                │  │
│  │  Community Stack (Lambda+S3) │    │                                │  │
│  │  Monitoring Stack            │    │                                │  │
│  └──────────────────────────────┘    └────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Environment Strategy

| Environment | Branch | AWS Account / Stage | Purpose |
|-------------|--------|---------------------|---------|
| **Local** | any | N/A | Developer machine, `npm run dev` |
| **Dev** | `dev` | `stage=dev` | Integration testing, auto-deploys on push |
| **Staging** | `staging` | `stage=staging` | Pre-production verification, manual approval to prod |
| **Production** | `main` | `stage=prod` | Live platform, deploy on merge to `main` |

### Environment Variables per Stage

```
CDK_STAGE=dev|staging|prod
CDK_ACCOUNT=123456789012
CDK_REGION=ap-southeast-2
```

Each CDK stack reads the stage from context and names resources accordingly:
- Dev: `HarvestAI-Dev-WeatherStack`
- Staging: `HarvestAI-Staging-WeatherStack`
- Prod: `HarvestAI-Prod-WeatherStack`

---

## 3. AWS CDK — Infrastructure as Code

### 3.1 Why CDK (Not Terraform)

| Factor | AWS CDK | Terraform |
|--------|---------|-----------|
| Language | TypeScript (same as app code) | HCL (separate language) |
| AWS Integration | Native, first-party | Third-party provider |
| Construct Library | High-level abstracts (L2/L3) | Module registry |
| Learning Curve | Low (if you know TypeScript) | Separate syntax to learn |
| State Management | CloudFormation (managed by AWS) | Terraform state file (you manage) |
| Best For | AWS-only projects | Multi-cloud projects |

**Decision:** CDK is the right choice since Harvest AI is 100% AWS.

### 3.2 CDK Stack Architecture

```
infrastructure/
├── bin/
│   └── app.ts                    # CDK app entry point, reads stage from context
├── lib/
│   ├── stacks/
│   │   ├── auth-stack.ts         # Cognito User Pool, Identity Pool
│   │   ├── api-stack.ts          # API Gateway, Cognito Authorizer
│   │   ├── weather-stack.ts      # DynamoDB, Lambda x2, EventBridge, SNS
│   │   ├── diagnosis-stack.ts    # DynamoDB, S3, Lambda x2, Bedrock
│   │   ├── news-stack.ts         # DynamoDB, Lambda x2, EventBridge
│   │   ├── community-stack.ts    # DynamoDB, S3, Lambda x3
│   │   └── monitoring-stack.ts   # CloudWatch Dashboard, Alarms, X-Ray
│   └── constructs/
│       ├── lambda-function.ts    # Reusable Lambda construct (ZIP bundling, env vars, IAM)
│       ├── dynamo-table.ts       # Reusable DynamoDB construct (GSIs, auto-scaling)
│       └── api-endpoint.ts       # Reusable API Gateway resource + Lambda integration
├── cdk.json
└── cdk.context.json
```

### 3.3 CDK Stage Configuration

```typescript
// bin/app.ts
const stage = app.node.tryGetContext("stage") ?? "dev";

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION ?? "ap-southeast-2",
};

new AuthStack(app, `HarvestAI-${stage}-Auth`, { env, stage });
new ApiStack(app, `HarvestAI-${stage}-Api`, { env, stage });
new WeatherStack(app, `HarvestAI-${stage}-Weather`, { env, stage });
// ... etc
```

### 3.4 Lambda Deployment (ZIP Bundles)

Lambda functions are bundled as ZIP files by CDK's `NodejsFunction` construct:

```typescript
// lib/constructs/lambda-function.ts
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";

// CDK automatically:
// 1. Resolves TypeScript entry point
// 2. Bundles with esbuild (tree-shaking, minification)
// 3. Creates ZIP artifact
// 4. Uploads to S3
// 5. Deploys to Lambda

new NodejsFunction(this, "WeatherPollingFunction", {
  entry: "backend/src/handlers/weatherAlert.handler.ts",
  handler: "handler",
  runtime: Runtime.NODEJS_22_X,
  memorySize: 256,
  timeout: Duration.seconds(30),
  environment: {
    WEATHER_API_KEY: weatherApiKey.secretValue.toString(),
    DYNAMODB_TABLE: weatherAlertsTable.tableName,
  },
});
```

**Why no Docker:**
- ZIP bundles have faster cold starts (~100ms vs ~500ms+ for containers)
- CDK handles bundling automatically via esbuild
- Simpler CI/CD pipeline (no Docker build step)
- Sufficient for TypeScript Lambda functions with standard dependencies

---

## 4. GitHub Actions CI/CD Pipeline

### 4.1 Pipeline Overview

```
Push to Branch
     │
     v
┌─────────────────────────────────────────────────────────────────┐
│                        CI Pipeline                               │
│                    (runs on every push)                          │
│                                                                  │
│  [Install] → [Lint] → [Type Check] → [Unit Test] → [Build]     │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                    Branch = dev, staging, or main?
                                │
                    ┌───────────┼───────────────┐
                    v           v               v
              ┌──────────┐ ┌──────────┐ ┌────────────────┐
              │ Deploy   │ │ Deploy   │ │ Deploy         │
              │ to Dev   │ │ to Stg   │ │ to Production  │
              │ (auto)   │ │ (auto)   │ │ (manual gate)  │
              └──────────┘ └──────────┘ └────────────────┘
```

### 4.2 Workflow Files

#### CI — Lint, Test, Build (every push)

```yaml
# .github/workflows/ci.yml

name: CI

on:
  push:
    branches: [dev, staging, main]
  pull_request:
    branches: [dev, staging, main]

jobs:
  lint-and-typecheck:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci

      - run: npm run lint

      - name: Type check shared
        run: npm run build -w shared

      - name: Type check backend
        run: npx tsc --noEmit -p backend/tsconfig.json

      - name: Type check frontend
        run: npx tsc --noEmit -p frontend/tsconfig.json

  test:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci

      - run: npm run build -w shared

      - name: Run backend tests
        run: npm run test -w backend

      - name: Upload coverage
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: backend/coverage/

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci

      - run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build
          path: |
            shared/dist/
            backend/dist/
            frontend/dist/
```

#### CD — Deploy Backend (CDK)

```yaml
# .github/workflows/deploy-backend.yml

name: Deploy Backend

on:
  push:
    branches: [dev, staging]
  workflow_dispatch:
    inputs:
      stage:
        description: "Deployment stage"
        required: true
        type: choice
        options: [dev, staging, prod]

permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    name: Deploy CDK Stacks
    runs-on: ubuntu-latest
    environment: ${{ github.ref_name == 'main' && 'production' || github.ref_name }}

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci

      - run: npm run build

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_DEPLOY_ROLE_ARN }}
          aws-region: ap-southeast-2

      - name: Determine stage
        id: stage
        run: |
          if [ "${{ github.event.inputs.stage }}" != "" ]; then
            echo "stage=${{ github.event.inputs.stage }}" >> $GITHUB_OUTPUT
          elif [ "${{ github.ref_name }}" == "main" ]; then
            echo "stage=prod" >> $GITHUB_OUTPUT
          elif [ "${{ github.ref_name }}" == "staging" ]; then
            echo "stage=staging" >> $GITHUB_OUTPUT
          else
            echo "stage=dev" >> $GITHUB_OUTPUT
          fi

      - name: CDK Diff
        working-directory: infrastructure
        run: npx cdk diff --context stage=${{ steps.stage.outputs.stage }}

      - name: CDK Deploy
        working-directory: infrastructure
        run: npx cdk deploy --all --require-approval never --context stage=${{ steps.stage.outputs.stage }}
```

#### CD — Deploy Production (Manual Approval)

```yaml
# .github/workflows/deploy-production.yml

name: Deploy Production

on:
  push:
    branches: [main]

permissions:
  id-token: write
  contents: read

jobs:
  # CI checks run first
  ci:
    uses: ./.github/workflows/ci.yml

  # Deploy backend to production
  deploy-backend:
    name: Deploy Backend to Production
    runs-on: ubuntu-latest
    needs: ci
    environment: production  # Requires manual approval in GitHub settings

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci
      - run: npm run build

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_DEPLOY_ROLE_ARN }}
          aws-region: ap-southeast-2

      - name: CDK Deploy Production
        working-directory: infrastructure
        run: npx cdk deploy --all --require-approval never --context stage=prod

  # Frontend auto-deploys via Amplify on push to main
  notify:
    name: Deployment Complete
    runs-on: ubuntu-latest
    needs: deploy-backend
    steps:
      - name: Tag release
        uses: actions/github-script@v7
        with:
          script: |
            const tag = `v${new Date().toISOString().slice(0,10).replace(/-/g,'.')}.${context.runNumber}`;
            await github.rest.git.createRef({
              owner: context.repo.owner,
              repo: context.repo.repo,
              ref: `refs/tags/${tag}`,
              sha: context.sha
            });
```

### 4.3 GitHub Repository Setup

#### Secrets (Settings → Secrets and variables → Actions)

| Secret | Value | Used By |
|--------|-------|---------|
| `AWS_DEPLOY_ROLE_ARN` | `arn:aws:iam::role/HarvestAI-GitHubDeploy` | CDK deploy |
| `WEATHER_API_KEY` | OpenWeather API key | CDK deploys as Lambda env var |

#### Environments (Settings → Environments)

| Environment | Protection Rules |
|-------------|-----------------|
| `dev` | None — auto-deploy on push to `dev` |
| `staging` | None — auto-deploy on push to `staging` |
| `production` | Required reviewers (1+), wait timer (optional) |

#### Branch Protection (Settings → Branches)

| Branch | Rules |
|--------|-------|
| `main` | Require PR, require CI pass, require 1 approval, no force push |
| `staging` | Require PR, require CI pass |
| `dev` | Require CI pass |

---

## 5. AWS Amplify — Frontend Deployment

### 5.1 Amplify Configuration

```yaml
# amplify.yml (project root)

version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - npm ci
            - npm run build -w shared
        build:
          commands:
            - npm run build -w frontend
      artifacts:
        baseDirectory: frontend/dist
        files:
          - "**/*"
      cache:
        paths:
          - node_modules/**/*
    appRoot: .
```

### 5.2 Amplify Branch Mapping

| Branch | Amplify Environment | URL |
|--------|-------------------|-----|
| `main` | Production | `https://harvest-ai.com` or `https://main.d1xxxxx.amplifyapp.com` |
| `dev` | Preview | `https://dev.d1xxxxx.amplifyapp.com` |
| PR branches | PR Preview | `https://pr-{number}.d1xxxxx.amplifyapp.com` |

### 5.3 Amplify Environment Variables

Set in Amplify Console → App settings → Environment variables:

| Variable | Dev | Production |
|----------|-----|------------|
| `VITE_API_BASE_URL` | `https://dev-api.harvest-ai.com` | `https://api.harvest-ai.com` |
| `VITE_COGNITO_USER_POOL_ID` | Dev pool ID | Prod pool ID |
| `VITE_COGNITO_CLIENT_ID` | Dev client ID | Prod client ID |
| `VITE_WEBSOCKET_URL` | Dev WebSocket URL | Prod WebSocket URL |

---

## 6. AWS Authentication for GitHub Actions

Use OIDC (no long-lived access keys):

### 6.1 Create IAM OIDC Provider

```bash
# One-time setup
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

### 6.2 Create Deploy IAM Role

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:sunjuice2022/Harvest-AI:*"
        }
      }
    }
  ]
}
```

**Role permissions needed:**
- `CloudFormationFullAccess` (CDK deploys via CloudFormation)
- `IAMFullAccess` (CDK creates Lambda roles)
- `LambdaFullAccess`
- `DynamoDBFullAccess`
- `S3FullAccess`
- `APIGatewayAdministrator`
- `CognitoPowerUser`
- `SNSFullAccess`
- `SESFullAccess`
- `EventBridgeFullAccess`
- `BedrockFullAccess`
- `CloudWatchFullAccess`
- `SSMFullAccess`

> For production: scope these down to least-privilege after initial setup.

---

## 7. Deployment Flow per Environment

### 7.1 Local Development

```bash
# Start frontend dev server
npm run dev

# Deploy backend to dev AWS (manual)
cd infrastructure
cdk deploy --all --context stage=dev

# Run a single stack
cdk deploy HarvestAI-Dev-Weather --context stage=dev

# Diff before deploying
cdk diff --context stage=dev

# Destroy dev environment
cdk destroy --all --context stage=dev
```

### 7.2 Dev Environment (Automatic)

```
Developer pushes to `dev` branch
       │
       v
GitHub Actions CI runs (lint → test → build)
       │
       v (if CI passes)
GitHub Actions deploys CDK stacks (stage=dev)
       │
       v
Amplify auto-builds frontend from `dev` branch
       │
       v
Dev environment live and testable
```

### 7.3 Staging Environment (Automatic)

```
Developer creates PR: dev → staging
       │
       v
CI runs on PR (lint → test → build)
       │
       v (PR merged)
GitHub Actions deploys CDK stacks (stage=staging)
       │
       v
Amplify auto-builds frontend from `staging` branch
       │
       v
QA testing on staging
```

### 7.4 Production Environment (Manual Approval)

```
Developer creates PR: staging → main
       │
       v
CI runs on PR (lint → test → build)
       │
       v (PR merged)
GitHub Actions triggers production deploy workflow
       │
       v
⏸  Manual approval required (GitHub environment protection)
       │
       v (approved)
CDK deploys all stacks (stage=prod)
       │
       v
Amplify auto-builds frontend from `main` branch
       │
       v
Release tagged automatically (e.g., v2026.02.28.42)
       │
       v
Production live
```

---

## 8. Rollback Strategy

### 8.1 Backend Rollback (CDK / CloudFormation)

```bash
# Option 1: Redeploy previous commit
git revert HEAD
git push origin main
# GitHub Actions auto-deploys the reverted state

# Option 2: CloudFormation rollback (automatic on failure)
# CDK deploy will auto-rollback if any stack update fails

# Option 3: Manual rollback to previous CloudFormation stack version
aws cloudformation rollback-stack --stack-name HarvestAI-Prod-Weather
```

### 8.2 Frontend Rollback (Amplify)

```bash
# Option 1: Revert commit and push
git revert HEAD
git push origin main

# Option 2: Amplify Console → select previous build → click "Redeploy"
```

### 8.3 Lambda Rollback

```bash
# Lambda aliases + versions allow instant rollback
aws lambda update-alias \
  --function-name HarvestAI-Prod-WeatherPolling \
  --name live \
  --function-version {previous-version}
```

---

## 9. Monitoring & Alerts Post-Deployment

### 9.1 CloudWatch Dashboard

Deployed via `monitoring-stack.ts`:

| Widget | Metrics |
|--------|---------|
| Lambda Invocations | All functions, 5-min intervals |
| Lambda Errors | Error count + error rate % |
| Lambda Duration | p50, p90, p99 latency |
| API Gateway | Request count, 4xx rate, 5xx rate, latency |
| DynamoDB | Read/write capacity, throttled requests |
| Bedrock | Invocation count, latency, errors |

### 9.2 CloudWatch Alarms

| Alarm | Threshold | Action |
|-------|-----------|--------|
| Lambda Error Rate | > 1% over 5 min | SNS → email |
| API Gateway 5xx | > 0.5% over 5 min | SNS → email |
| DynamoDB Throttle | > 0 over 1 min | SNS → email |
| Bedrock Errors | > 0 over 5 min | SNS → email |
| Lambda Duration p99 | > 10s over 5 min | SNS → email |
| Monthly Cost | > budget threshold | AWS Budgets → email |

### 9.3 Health Check

```yaml
# In CI pipeline: post-deploy smoke test
- name: Smoke Test
  run: |
    # Check API health
    curl -sf https://api.harvest-ai.com/health || exit 1

    # Check frontend
    curl -sf https://harvest-ai.com || exit 1

    echo "Smoke tests passed"
```

---

## 10. Cost Optimization

| Resource | Dev | Production |
|----------|-----|------------|
| DynamoDB | On-demand (pay per request) | On-demand (switch to provisioned if patterns are stable) |
| Lambda | Default concurrency | Provisioned concurrency for diagnosis handler only |
| S3 | Standard | Standard + Intelligent-Tiering for media older than 30 days |
| API Gateway | REST API | REST API (consider HTTP API for 70% cost savings if no advanced features needed) |
| Bedrock | On-demand | On-demand (monitor usage, consider provisioned throughput if high volume) |
| CloudWatch | Basic | Basic (avoid custom metrics unless needed) |

**Estimated monthly cost (low traffic):**

| Service | Estimated Cost |
|---------|---------------|
| Lambda (100K invocations) | ~$0.20 |
| DynamoDB (1M reads, 500K writes) | ~$5 |
| S3 (10 GB storage) | ~$0.25 |
| API Gateway (100K requests) | ~$0.35 |
| Bedrock Claude (10K requests) | ~$15–50 |
| Cognito (1K MAU free tier) | $0 |
| Amplify Hosting | ~$0 (free tier) |
| **Total** | **~$25–60/month** |

---

## 11. Files to Create

```
.github/
├── workflows/
│   ├── ci.yml                    # Lint, test, build (every push/PR)
│   ├── deploy-backend.yml        # CDK deploy to dev/staging
│   └── deploy-production.yml     # CDK deploy to production (manual gate)
amplify.yml                        # Amplify build configuration
infrastructure/
├── lib/
│   ├── stacks/
│   │   ├── api-stack.ts          # NEW: API Gateway stack
│   │   └── monitoring-stack.ts   # NEW: CloudWatch dashboard + alarms
│   └── constructs/
│       ├── lambda-function.ts    # NEW: Reusable Lambda construct
│       ├── dynamo-table.ts       # NEW: Reusable DynamoDB construct
│       └── api-endpoint.ts       # NEW: Reusable API endpoint construct
```

---

## 12. Setup Checklist

Complete in order:

### One-Time AWS Setup
- [ ] Create IAM OIDC provider for GitHub Actions
- [ ] Create `HarvestAI-GitHubDeploy` IAM role with trust policy
- [ ] Attach required permissions to deploy role
- [ ] Bootstrap CDK in AWS account (`cdk bootstrap aws://ACCOUNT/REGION`)
- [ ] Set up Amplify app and connect to GitHub repo
- [ ] Configure Amplify branch mappings (main → prod, dev → preview)
- [ ] Set Amplify environment variables per branch

### One-Time GitHub Setup
- [ ] Add `AWS_DEPLOY_ROLE_ARN` to repository secrets
- [ ] Add `WEATHER_API_KEY` to repository secrets
- [ ] Create `production` environment with required reviewers
- [ ] Create `staging` environment
- [ ] Create `dev` environment
- [ ] Set branch protection rules on `main` and `staging`

### Per-Phase Deployment
- [ ] Phase 0: Deploy Auth + API stacks
- [ ] Phase 1: Deploy Weather + Diagnosis stacks
- [ ] Phase 2: Deploy News + Community stacks
- [ ] Phase 3: Deploy updated stacks with agent features
- [ ] Phase 4: Deploy WAF, finalize monitoring stack
- [ ] Phase 5: Production deployment, DNS cutover, go-live

---

*This deployment plan ensures automated, repeatable, and safe deployments from local development through to production. All infrastructure is version-controlled via CDK, all deployments are triggered via GitHub Actions, and production requires manual approval.*
