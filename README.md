# AgriSense AI

An agentic AI platform for agriculture built on AWS. It gives farmers weather intelligence, AI-powered crop diagnosis, curated agricultural news, and a community marketplace — all powered by autonomous AI agents.

---

## Features

### Weather Intelligence Agent
- 7-day forecast with hourly breakdown
- High/low temperature alerts (configurable thresholds)
- Flood risk and drought alerts
- Push notifications and SMS for critical weather events
- Proactive crop-specific recommendations

### Crop Diagnosis AI Chatbot
- Upload a photo and get instant diagnosis in seconds
- Identifies diseases, pest damage, nutrient deficiencies, and abiotic stress
- Treatment and remedy recommendations
- Multi-turn conversation with context retention

### Agricultural News
- AI-curated and summarized news from trusted sources
- Personalized feed based on crops, region, and interests
- Breaking alerts for pest outbreaks and policy changes

### AgriCommunity & Marketplace
- Community feed — post text, photos, and videos
- Q&A with topic tagging
- Marketplace to buy/sell seeds, equipment, and produce
- Location-based feed and direct messaging
- AI-powered content moderation

---

## Architecture

```
                    ┌─────────────────────┐
                    │  Orchestrator Agent  │
                    │  (Bedrock Agents)    │
                    └────────┬────────────┘
                 ┌───────┬───┴────┬──────────┐
                 v       v        v          v
            Weather  Diagnosis   News    Community
             Agent    Agent     Agent      Agent
```

### AWS Services

| Service | Purpose |
|---------|---------|
| Amazon Bedrock | Foundation models + agentic orchestration |
| AWS Lambda | Serverless business logic |
| API Gateway | REST + WebSocket APIs |
| AWS AppSync | GraphQL for real-time community features |
| DynamoDB | User data, chat history, posts, listings |
| S3 | Photo uploads, media, news cache |
| Cognito | Authentication |
| SNS / SES / Pinpoint | Push, email, and SMS notifications |
| EventBridge | Scheduled agent triggers |
| AWS Amplify | Frontend hosting |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React / React Native |
| Backend | TypeScript, AWS Lambda |
| AI | Amazon Bedrock (Claude), Bedrock Agents, Bedrock Knowledge Bases |
| Database | DynamoDB, OpenSearch |
| Infrastructure | AWS CDK (TypeScript) |
| CI/CD | AWS Amplify, GitHub Actions |

---

## Project Structure

```
agrisense-ai/
├── docs/                     # PRD, design guide, coding rules
├── infrastructure/           # AWS CDK stacks and constructs
├── backend/
│   └── src/
│       ├── agents/           # AI agent definitions
│       ├── handlers/         # Lambda handlers
│       ├── services/         # Business logic
│       ├── repositories/     # Data access layer
│       ├── models/           # Data models
│       ├── types/            # Shared types
│       ├── utils/            # Utilities
│       └── constants/        # Constants and enums
├── frontend/
│   └── src/
│       ├── components/       # React components
│       ├── pages/            # Page-level components
│       ├── hooks/            # Custom hooks
│       ├── services/         # API clients
│       ├── store/            # State management
│       └── styles/           # Theme and global styles
└── shared/                   # Types and constants shared across layers
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [PRD](docs/PRD.md) | Product requirements, features, data models, release plan |
| [Design Guide](docs/DESIGN_GUIDE.md) | Color palette, typography, components, CSS variables |
| [Coding Rules](docs/CODING_RULES.md) | SOLID, DRY, KISS, naming conventions, AI tool instructions |

---

## Getting Started

### Prerequisites

- Node.js >= 18
- AWS CLI configured with credentials
- AWS CDK CLI (`npm install -g aws-cdk`)

### Setup

```bash
git clone <repository-url>
cd agrisense-ai

npm install

# Deploy infrastructure
cd infrastructure
cdk deploy --all

# Run frontend locally
cd ../frontend
npm run dev
```

### Environment Variables

Copy `.env.example` and fill in the required values. Secrets should be stored in AWS Secrets Manager.

```bash
cp .env.example .env
```

---

## Contributing

1. Read [Coding Rules](docs/CODING_RULES.md) before writing any code.
2. Branch naming: `feature/your-feature-name`
3. Commit format: `feat(scope): description` (Conventional Commits)
4. All tests must pass before merging.
5. One feature/fix per PR.

---

## License

Proprietary. All rights reserved.
