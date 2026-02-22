# Harvest AI — Start Guide

Everything you need to run, develop, and deploy the project.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Clone & Install](#2-clone--install)
3. [Run Locally Without AWS (Mock Mode)](#3-run-locally-without-aws-mock-mode)
4. [Run Locally With AWS](#4-run-locally-with-aws)
5. [Project Structure](#5-project-structure)
6. [Pages & Features](#6-pages--features)
7. [Environment Variables](#7-environment-variables)
8. [Running Tests](#8-running-tests)
9. [CI/CD Pipelines](#9-cicd-pipelines)
10. [Deploying to AWS](#10-deploying-to-aws)

---

## 1. Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | >= 22 | [nodejs.org](https://nodejs.org) |
| npm | >= 10 | Included with Node |
| Git | any | [git-scm.com](https://git-scm.com) |
| AWS CLI | >= 2 | Only needed for AWS deployment |
| AWS CDK CLI | >= 2 | `npm install -g aws-cdk` — only for deployment |

---

## 2. Clone & Install

```bash
git clone <repository-url>
cd harvest-ai

# Install all workspace dependencies (frontend + backend + shared + infrastructure)
npm install
```

This is an **npm workspace monorepo** — one `npm install` from the root installs everything.

---

## 3. Run Locally Without AWS (Mock Mode)

No AWS account needed. The mock backend simulates Bedrock, DynamoDB, and S3 in memory.

### Step 1 — Start the mock backend

```bash
npm run dev:mock -w backend
```

Expected output:
```
✅ Mock Backend Server running on http://localhost:3000
📡 API Base: http://localhost:3000/api
🧪 Mode: Mock (using in-memory database + mock Bedrock)
```

### Step 2 — Start the frontend (new terminal)

```bash
npm run dev -w frontend
```

Expected output:
```
VITE v5.x ready in ~900ms
➜  Local:   http://localhost:5173/
```

### Step 3 — Open the app

Go to **http://localhost:5173**

Try the diagnosis chatbot at **http://localhost:5173/diagnosis** with messages like:
- `"My tomato has yellow spots"` → returns Early Blight diagnosis
- `"White powder on cucumber leaves"` → returns Powdery Mildew
- `"Leaves are turning pale yellow"` → returns Nitrogen Deficiency

> For full details on mock endpoints and API testing, see [QUICK_START_MOCK.md](QUICK_START_MOCK.md).

---

## 4. Run Locally With AWS

### Step 1 — Configure AWS credentials

```bash
aws configure
# Enter: Access Key ID, Secret Access Key, Region (ap-southeast-2), Output (json)
```

Or use SSO / OIDC if your team has that configured.

### Step 2 — Deploy infrastructure

```bash
cd infrastructure
cdk bootstrap   # first time only, per AWS account/region
cdk deploy --all --context stage=dev
```

This creates Lambda functions, API Gateway, DynamoDB tables, S3 buckets, SNS topics, and Cognito user pool.

### Step 3 — Create `.env` file in `frontend/`

```bash
cp frontend/.env.example frontend/.env
```

Fill in the values from the CDK outputs:

```env
VITE_API_BASE_URL=https://xxxxxxxxxx.execute-api.ap-southeast-2.amazonaws.com/dev
VITE_AWS_REGION=ap-southeast-2
VITE_COGNITO_USER_POOL_ID=ap-southeast-2_XXXXXXXXX
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 4 — Start the frontend

```bash
npm run dev -w frontend
```

---

## 5. Project Structure

```
harvest-ai/
├── frontend/                   # React 19 + Vite + TypeScript
│   └── src/
│       ├── components/         # Reusable UI components
│       │   └── weather/        # WeatherCard, etc.
│       ├── pages/              # Page-level components
│       │   ├── HomePage.tsx    # Landing page with navbar & feature cards
│       │   ├── WeatherPage.tsx # Weather dashboard
│       │   └── ...
│       ├── hooks/              # Custom React hooks (useWeatherData, etc.)
│       ├── services/           # API client functions
│       ├── styles/             # Global CSS variables & tokens
│       └── types/              # TypeScript types (frontend-only)
│
├── backend/
│   └── src/
│       ├── handlers/           # Lambda function entry points
│       ├── services/           # Business logic
│       │   └── diagnosis/      # Bedrock, DynamoDB, S3 services + mocks
│       ├── repositories/       # Data access layer
│       └── models/             # Data models
│
├── shared/                     # Types & constants shared across workspaces
│   └── src/
│       ├── index.ts            # Main exports
│       ├── weather.types.ts    # WeatherForecast, WeatherAlert, etc.
│       └── weather.constants.ts
│
├── infrastructure/             # AWS CDK stacks
│   └── lib/
│       ├── harvest-ai-stack.ts  # Main stack
│       └── constructs/         # CDK constructs per domain
│
├── docs/                       # PRD, design guide, coding rules
├── .github/workflows/          # GitHub Actions CI/CD
├── amplify.yml                 # AWS Amplify build config
├── package.json                # Root workspace config
└── START_GUIDE.md              # This file
```

---

## 6. Pages & Features

| Route | Feature | Description |
|-------|---------|-------------|
| `/` | Home | Landing page with auth-aware navbar, background photo, feature cards |
| `/login` | Sign In | Email + password sign-in form (mock auth, ready for Cognito) |
| `/signup` | Sign Up | Name, email, password registration form |
| `/weather` | Weather Agent | 7-day forecast, SNS threshold alerts, Bedrock advisory + weather outlook, location picker, alert subscriptions |
| `/diagnosis` | AI Crop Diagnosis | Chatbot — upload photo + describe symptoms, get instant AI diagnosis |
| `/farm-recommendation` | Farm Planner | AI-powered crop schedule and planting recommendations |
| `/market` | Market Price Intelligence | Real-time crop market prices |
| `/voice` | Voice Assistant | Multilingual voice-powered farming assistant |

### Weather Page — Key Features

- **Location picker** — styled dropdown with 35 Australian cities across all states and territories (NSW, VIC, QLD, WA, SA, TAS, NT, ACT), grouped by state using `<optgroup>`
- **Weather Agent Status** — current conditions (temp, humidity, wind, UV index)
- **SNS Threshold Alerts** — real-time alerts for high temp (>35°C), frost (<5°C), flood (>50mm rain), drought (7+ dry days)
- **Daily Farming Advisory** — AI-generated farming advice (Bedrock), with static fallback if Bedrock is not configured
- **7-Day Weather Outlook** — plain-language forecast block derived from the 7-day forecast data (rain, frost, heat stress, humidity, wind, irrigation, best operating day)
- **7-Day Forecast** — scrollable strip with condition icons, high/low temps, rainfall
- **Alert Subscriptions** — subscribe by email or SMS (powered by AWS SNS)
- **Advisory Actions** — "Acknowledge" dismisses the alert; "Adjust Schedule" navigates to the Farm Planner

### Authentication

The Home page navbar is auth-aware:

- **Signed out:** shows "Log In" link → navigates to `/login`
- **Signed in:** shows the user's name and a "Sign Out" button
- Session is persisted in `localStorage` — survives page refresh
- Sign up at `/signup` — automatically signs in on success

> Current auth is **UI-only (mock)**. No AWS backend calls are made. To integrate AWS Cognito, replace the `useAuth` hook implementation in `frontend/src/hooks/useAuth.ts`.

---

## 7. Environment Variables

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | Yes | Backend API URL (API Gateway or localhost:3000) |
| `VITE_AWS_REGION` | Yes | AWS region, e.g. `ap-southeast-2` |
| `VITE_COGNITO_USER_POOL_ID` | No | Cognito pool for auth |
| `VITE_COGNITO_CLIENT_ID` | No | Cognito client for auth |

### Backend (Lambda environment / local `.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `WEATHER_API_KEY` | Yes | OpenWeatherMap (or equivalent) API key |
| `USE_REAL_BEDROCK` | No | Set to `true` to use real Amazon Bedrock |
| `DYNAMODB_TABLE_NAME` | Yes (AWS) | DynamoDB table name |
| `S3_BUCKET_NAME` | Yes (AWS) | S3 bucket for uploads |
| `SNS_TOPIC_ARN` | Yes (AWS) | SNS topic for weather alerts |

---

## 8. Running Tests

```bash
# Run all tests (backend Jest + frontend Vitest)
npm run test

# Backend tests only
npm run test -w backend

# Frontend tests only
npm run test -w frontend

# Type check all workspaces
npm run build -w shared
npx tsc --noEmit -p backend/tsconfig.json
npx tsc --noEmit -p frontend/tsconfig.json

# Lint all workspaces
npm run lint

# Format check
npx prettier --check "**/*.{ts,tsx,css,md}" --ignore-path .gitignore
```

---

## 9. CI/CD Pipelines

Three GitHub Actions workflows run automatically when you push:

### `ci.yml` — Runs on every push

Triggered on: `dev`, `staging`, `main`, `feature/**` branches

Jobs run in parallel:
```
push
├── lint          (ESLint + Prettier)
├── typecheck     (tsc --noEmit for backend, frontend, infrastructure)
├── security-audit (npm audit --audit-level=high)
└── [after lint + typecheck pass]
    ├── test-backend   (Jest)
    ├── test-frontend  (Vitest)
    └── [after tests pass]
        └── build      (build all workspaces, upload artifacts)
```

### `deploy-backend.yml` — Runs on push to `dev` or `staging`

```
push to dev/staging
├── ci (full CI gate)
├── resolve-stage (dev vs staging)
├── deploy-infra  (CDK deploy — requires AWS_DEPLOY_ROLE_ARN secret)
├── deploy-frontend (S3 sync + CloudFront invalidation)
└── health-check  (API + frontend reachability)
```

### `deploy-production.yml` — Runs on push to `main`

```
push to main
├── ci (full CI gate)
├── deploy-infra  (CDK deploy — requires "production" env approval in GitHub)
├── deploy-frontend (S3 sync + CloudFront)
├── smoke-tests   (per-feature endpoint checks)
└── release       (creates GitHub Release + version tag)
```

### How to monitor runs

```bash
# View recent runs
gh run list --limit 10

# Watch a run live
gh run watch

# See logs for failed steps
gh run view --log-failed
```

Or go to **GitHub repo → Actions tab** in your browser.

### Required GitHub Secrets & Variables

Go to **Settings → Secrets and Variables → Actions** and add:

**Secrets:**
| Name | Description |
|------|-------------|
| `AWS_DEPLOY_ROLE_ARN` | IAM role for OIDC-based deployment |
| `WEATHER_API_KEY` | Weather data API key |
| `COGNITO_USER_POOL_ID` | Cognito user pool |
| `COGNITO_CLIENT_ID` | Cognito app client |

**Variables (non-secret):**
| Name | Description |
|------|-------------|
| `API_BASE_URL` | Deployed API Gateway URL |
| `FRONTEND_URL` | Deployed frontend URL |
| `FRONTEND_BUCKET_NAME` | S3 bucket name |
| `CLOUDFRONT_DIST_ID` | CloudFront distribution ID |

> CI jobs (lint, typecheck, tests, build) run without any AWS credentials. Only the deploy jobs need secrets configured.

---

## 10. Deploying to AWS

### First-time setup

```bash
# Bootstrap CDK (once per AWS account + region)
cd infrastructure
cdk bootstrap aws://ACCOUNT_ID/ap-southeast-2

# Preview what will be created
cdk diff --context stage=dev

# Deploy dev environment
cdk deploy --all --context stage=dev
```

### Promote to production

Push to `main` branch — GitHub Actions handles the full pipeline automatically, including a manual approval gate (configured in GitHub Environments → `production`).

### AWS Amplify (alternative frontend hosting)

The project includes `amplify.yml` at the root. If you connect the repo to AWS Amplify:

- Amplify auto-builds on push using the `amplify.yml` config
- It pins Node 22, installs dependencies, builds `shared` then `frontend`
- Output: `frontend/dist/`

---

## Common Commands Reference

```bash
npm install                   # Install all dependencies
npm run dev -w frontend       # Start frontend dev server (port 5173)
npm run dev:mock -w backend   # Start mock backend (port 3000)
npm run build                 # Build all workspaces
npm run build -w shared       # Build shared package only
npm run test                  # Run all tests
npm run lint                  # Run ESLint
npm run format                # Run Prettier (auto-fix)
cdk deploy --all              # Deploy infrastructure to AWS
gh run watch                  # Watch GitHub Actions live
```
