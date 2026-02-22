# Harvest AI — AI Coding Assistant Instructions

Before writing any code in this project, read and follow these documents in order:

1. **Coding Rules** — `docs/CODING_RULES.md` (SOLID, DRY, KISS, naming, structure)
2. **PRD** — `docs/PRD.md` (features, architecture, data models)
3. **Design Guide** — `docs/DESIGN_GUIDE.md` (colors, typography, components)

## Project Overview

Harvest AI is an agentic AI agriculture platform on AWS with four domains:
- **Weather** — forecast, alerts (high/low temp, flood, drought)
- **Diagnosis** — photo upload chatbot for crop disease/pest/nutrient/stress detection
- **News** — AI-curated agricultural news
- **Community** — social feed, Q&A, marketplace

## Tech Stack

- **Monorepo** with npm workspaces
- **Frontend:** React 19 + Vite + TypeScript
- **Backend:** TypeScript + AWS Lambda
- **AI:** Amazon Bedrock (Claude) + Bedrock Agents
- **Infra:** AWS CDK (TypeScript)
- **Database:** DynamoDB, S3, OpenSearch
- **Auth:** Amazon Cognito

## Key Rules

- TypeScript strict mode. No `any` types.
- Functions: max 30 lines, max 3 parameters.
- Files: max 300 lines.
- Layers depend downward only: `handlers → services → repositories → models`.
- No cross-domain imports at the same layer.
- Use dependency injection in services.
- Follow Conventional Commits: `feat(weather): add flood alert`.
- CSS uses design tokens (CSS variables) from `frontend/src/styles/global.css`.

## Commands

```bash
npm install          # Install all workspace dependencies
npm run dev          # Start frontend dev server (port 3000)
npm run build        # Build all workspaces
npm run test         # Run all tests
npm run lint         # Run ESLint
npm run format       # Run Prettier
```
