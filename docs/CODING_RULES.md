# Harvest AI — Coding Rules & Conventions

> This document defines strict coding rules for the Harvest AI project.
> All contributors (human and AI) must follow these rules.
> AI coding tools (Claude, Copilot, Cursor, etc.) should reference this file before generating code.

---

## 1. Core Principles

### 1.1 SOLID

| Principle | Rule | Example |
|-----------|------|---------|
| **S — Single Responsibility** | Every file, class, and function does exactly ONE thing. No exceptions. | `WeatherAgent` handles weather only. It does NOT handle notifications. A separate `NotificationService` handles that. |
| **O — Open/Closed** | Code is open for extension, closed for modification. Use interfaces and composition. | Add a new alert type by creating a new class that implements `AlertHandler`, not by adding `if/else` branches to existing code. |
| **L — Liskov Substitution** | Any subclass or implementation can replace its parent/interface without breaking behavior. | All agents implement `BaseAgent` and can be swapped in the orchestrator without side effects. |
| **I — Interface Segregation** | No code should depend on methods it does not use. Keep interfaces small and focused. | Split `IUserService` into `IUserAuth`, `IUserProfile`, `IUserPreferences` rather than one large interface. |
| **D — Dependency Inversion** | Depend on abstractions, not concrete implementations. Inject dependencies. | Lambda handlers receive service instances via dependency injection, not via direct imports of concrete classes. |

### 1.2 DRY (Don't Repeat Yourself)

- **NEVER** duplicate logic. If the same logic appears twice, extract it into a shared utility or service.
- Shared constants go in a single `constants/` file per domain.
- Shared types go in a single `types/` file per domain.
- Reusable UI components go in `components/common/`.
- Exception: Do NOT over-abstract. If two pieces of code look similar but serve different domains, they may evolve independently — keep them separate.

### 1.3 KISS (Keep It Simple, Stupid)

- Prefer the simplest solution that works correctly.
- No premature optimization. No premature abstraction.
- If a function needs a comment to explain WHAT it does, it is too complex — refactor it.
- Comments should explain WHY, never WHAT.
- Maximum function length: 30 lines (excluding type definitions).
- Maximum file length: 300 lines. If a file exceeds this, split it by responsibility.
- Maximum function parameters: 3. Use an options/config object if more are needed.

### 1.4 Readability First

- Code is read 10x more than it is written. Optimize for reading.
- Use descriptive, unambiguous names. No abbreviations except industry-standard ones (e.g., `API`, `URL`, `ID`).
- Consistent formatting enforced by linter and formatter — no exceptions.
- Every module starts with a single-line doc comment describing its purpose.

---

## 2. Project Structure

```
harvest-ai/
├── docs/                          # Documentation (PRD, design guide, this file)
├── infrastructure/                # AWS CDK / IaC
│   ├── lib/
│   │   ├── stacks/                # One stack per domain
│   │   │   ├── weather-stack.ts
│   │   │   ├── diagnosis-stack.ts
│   │   │   ├── news-stack.ts
│   │   │   ├── community-stack.ts
│   │   │   └── auth-stack.ts
│   │   └── constructs/            # Reusable CDK constructs
│   └── bin/                       # CDK app entry point
├── backend/
│   ├── src/
│   │   ├── agents/                # Agentic AI agent definitions
│   │   │   ├── orchestrator/
│   │   │   ├── weather/
│   │   │   ├── diagnosis/
│   │   │   ├── news/
│   │   │   └── community/
│   │   ├── handlers/              # Lambda function handlers (thin entry points)
│   │   ├── services/              # Business logic (one service per domain)
│   │   ├── repositories/          # Data access layer (DynamoDB, S3, etc.)
│   │   ├── models/                # Data models and type definitions
│   │   ├── utils/                 # Shared utilities (no business logic here)
│   │   ├── constants/             # Shared constants and enums
│   │   └── types/                 # Shared TypeScript types and interfaces
│   └── tests/
│       ├── unit/                  # Mirror src/ structure
│       └── integration/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/            # Reusable UI components
│   │   │   ├── weather/
│   │   │   ├── diagnosis/
│   │   │   ├── news/
│   │   │   └── community/
│   │   ├── pages/                 # Page-level components (one per route)
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── services/              # API client and external service calls
│   │   ├── store/                 # State management
│   │   ├── types/                 # Frontend type definitions
│   │   ├── utils/                 # Frontend utilities
│   │   ├── constants/             # Frontend constants
│   │   └── styles/                # Global styles, theme, CSS variables
│   └── tests/
└── shared/                        # Code shared between frontend and backend
    ├── types/                     # Shared type definitions (API contracts)
    └── constants/                 # Shared constants
```

### Structure Rules

1. **One domain per folder.** Weather, Diagnosis, News, Community each get their own folder at every layer.
2. **No cross-domain imports within the same layer.** `services/weather/` must NOT import from `services/diagnosis/`. Cross-domain communication goes through the orchestrator or event bus.
3. **Layers only depend downward.** `handlers/ → services/ → repositories/ → models/`. Never upward.
4. **`shared/`** contains ONLY types and constants used by both frontend and backend. No logic.
5. **Tests mirror source structure.** `tests/unit/services/weather/` tests `src/services/weather/`.

---

## 3. Naming Conventions

### 3.1 Files and Directories

| Type | Convention | Example |
|------|-----------|---------|
| Directories | `kebab-case` | `weather-agent/`, `crop-diagnosis/` |
| React components | `PascalCase.tsx` | `WeatherCard.tsx`, `DiagnosisChat.tsx` |
| Hooks | `camelCase.ts` prefixed with `use` | `useWeatherData.ts`, `useDiagnosis.ts` |
| Services | `camelCase.service.ts` | `weather.service.ts` |
| Repositories | `camelCase.repository.ts` | `user.repository.ts` |
| Handlers (Lambda) | `camelCase.handler.ts` | `weatherAlert.handler.ts` |
| Types | `camelCase.types.ts` | `weather.types.ts` |
| Constants | `camelCase.constants.ts` | `weather.constants.ts` |
| Tests | `camelCase.test.ts` | `weather.service.test.ts` |
| Utilities | `camelCase.util.ts` | `date.util.ts` |
| CDK Stacks | `PascalCase-stack.ts` | `WeatherStack.ts` |

### 3.2 Code Identifiers

| Type | Convention | Example |
|------|-----------|---------|
| Variables | `camelCase` | `currentTemperature`, `alertThreshold` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_RETRY_COUNT`, `DEFAULT_TEMP_HIGH` |
| Functions | `camelCase`, verb-first | `fetchWeatherData()`, `diagnoseImage()` |
| Classes | `PascalCase` | `WeatherAgent`, `DiagnosisService` |
| Interfaces | `PascalCase`, no `I` prefix | `WeatherData`, `UserProfile` |
| Type aliases | `PascalCase` | `AlertType`, `CropCategory` |
| Enums | `PascalCase` (members: `PascalCase`) | `AlertSeverity.Critical` |
| React components | `PascalCase` | `WeatherDashboard`, `CropCard` |
| Event handlers | `camelCase`, prefixed with `handle` or `on` | `handleSubmit`, `onAlertDismiss` |
| Boolean variables | `camelCase`, prefixed with `is`, `has`, `should`, `can` | `isLoading`, `hasAlerts` |
| Database tables | `PascalCase` | `UserProfiles`, `WeatherAlerts` |
| API endpoints | `kebab-case` | `/api/weather-alerts`, `/api/crop-diagnosis` |
| Environment variables | `UPPER_SNAKE_CASE` | `AWS_REGION`, `WEATHER_API_KEY` |

### 3.3 Naming Quality Rules

- Names must be **self-documenting**. A reader should understand purpose without reading the implementation.
- **BAD:** `data`, `result`, `temp`, `val`, `item`, `info`, `process()`, `handle()`, `doStuff()`
- **GOOD:** `weatherForecast`, `diagnosisResult`, `currentTemperature`, `alertThreshold`, `fetchWeatherForecast()`, `handleAlertDismiss()`
- Function names start with a **verb**: `get`, `set`, `fetch`, `create`, `update`, `delete`, `validate`, `format`, `parse`, `calculate`, `check`, `send`, `notify`.
- Boolean functions start with: `is`, `has`, `should`, `can`, `will`.

---

## 4. TypeScript Rules

### 4.1 Strict Mode

```jsonc
// tsconfig.json — mandatory settings
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "forceConsistentCasingInFileNames": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### 4.2 Type Rules

- **NEVER** use `any`. Use `unknown` if the type is truly unknown, then narrow it.
- **ALWAYS** define explicit return types for exported functions.
- **ALWAYS** define interfaces for API request/response payloads.
- **PREFER** `interface` for object shapes, `type` for unions and intersections.
- **PREFER** `enum` for fixed sets of related constants.
- **NEVER** use type assertions (`as`) unless absolutely necessary and documented with a comment explaining why.

```typescript
// BAD
function processData(data: any): any { ... }

// GOOD
function processWeatherData(forecast: WeatherForecast): ProcessedForecast { ... }
```

### 4.3 Function Rules

```typescript
// RULE: Maximum 3 parameters. Use options object for more.

// BAD
function createAlert(userId: string, type: string, severity: string, message: string, lat: number, lng: number): Alert { ... }

// GOOD
interface CreateAlertInput {
  userId: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  location: GeoLocation;
}

function createAlert(input: CreateAlertInput): Alert { ... }
```

```typescript
// RULE: Single responsibility. One function does one thing.

// BAD
function fetchWeatherAndSendAlerts(userId: string): void { ... }

// GOOD
function fetchWeatherForecast(location: GeoLocation): Promise<WeatherForecast> { ... }
function evaluateAlertConditions(forecast: WeatherForecast, thresholds: AlertThresholds): Alert[] { ... }
function sendAlerts(userId: string, alerts: Alert[]): Promise<void> { ... }
```

### 4.4 Error Handling

- **ALWAYS** use custom error classes per domain.
- **NEVER** catch errors silently. Log them or rethrow with context.
- **NEVER** use `catch (e) {}` (empty catch block).
- Use `Result<T, E>` pattern for expected failures. Use exceptions for unexpected failures.

```typescript
// Define domain-specific errors
class WeatherServiceError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "WeatherServiceError";
  }
}

// Use specific error types
throw new WeatherServiceError("API rate limit exceeded", "RATE_LIMIT");
```

---

## 5. React / Frontend Rules

### 5.1 Component Rules

- One component per file. File name matches component name.
- Use **functional components** with hooks. No class components.
- Component files follow this order:
  1. Imports
  2. Type definitions (Props interface)
  3. Component function
  4. Export (default export for page components, named export for reusable components)
- No inline styles. Use CSS modules, Tailwind classes, or styled-components.
- Extract complex logic into custom hooks.

```typescript
// TEMPLATE: Standard component structure

import { useState } from "react";
import { WeatherData } from "@/types/weather.types";
import { useWeatherData } from "@/hooks/useWeatherData";
import { TemperatureDisplay } from "@/components/common/TemperatureDisplay";

interface WeatherCardProps {
  location: GeoLocation;
  onAlertClick: (alert: WeatherAlert) => void;
}

export function WeatherCard({ location, onAlertClick }: WeatherCardProps) {
  const { forecast, isLoading } = useWeatherData(location);

  if (isLoading) return <WeatherCardSkeleton />;

  return (
    <div className="weather-card">
      <TemperatureDisplay value={forecast.temperature} />
    </div>
  );
}
```

### 5.2 State Management Rules

- **Local state** (`useState`): UI-only state scoped to one component.
- **Shared state** (Context or store): State used by 2+ unrelated components.
- **Server state** (React Query / SWR): All data fetched from APIs.
- **NEVER** duplicate server data into local or global state.
- **NEVER** store derived data. Compute it.

### 5.3 Hook Rules

- Hooks go in `hooks/` directory.
- One hook per file. File name matches hook name.
- Hooks encapsulate one concern: data fetching, form logic, or UI behavior.
- **NEVER** put business logic directly in components. Extract to hooks or services.

---

## 6. Backend / Lambda Rules

### 6.1 Handler Pattern

Handlers are **thin entry points**. They parse input, call a service, and format output. No business logic.

```typescript
// TEMPLATE: Lambda handler structure

import { APIGatewayProxyHandler } from "aws-lambda";
import { WeatherService } from "@/services/weather.service";
import { validateGetForecastInput } from "@/validators/weather.validator";
import { formatApiResponse, formatApiError } from "@/utils/apiResponse.util";

const weatherService = new WeatherService();

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const input = validateGetForecastInput(event);
    const forecast = await weatherService.getForecast(input.location);
    return formatApiResponse(200, forecast);
  } catch (error) {
    return formatApiError(error);
  }
};
```

### 6.2 Service Layer Rules

- Services contain all business logic.
- Services receive dependencies via constructor injection.
- Services return typed results, never raw AWS SDK responses.
- Services are stateless. No instance-level mutable state.

### 6.3 Repository Layer Rules

- Repositories handle ALL data access (DynamoDB, S3, external APIs).
- One repository per data source / table.
- Repositories return domain models, never raw database records.
- Repositories encapsulate query construction and pagination.

---

## 7. Agent Architecture Rules

### 7.1 Agent Structure

Each agent follows this standard structure:

```
agents/
└── weather/
    ├── weather.agent.ts           # Agent definition and configuration
    ├── weather.tools.ts           # Tool definitions the agent can use
    ├── weather.prompts.ts         # System prompts and instruction templates
    └── weather.types.ts           # Agent-specific types
```

### 7.2 Agent Rules

- Each agent has a **single domain responsibility**.
- Agents communicate through the orchestrator, never directly with each other.
- Agent tool functions follow the same service/repository pattern as Lambda handlers.
- Agent prompts are version-controlled and stored in code, not hardcoded in configuration.
- Agent responses must be **structured** (typed JSON), not free-form text, when consumed by other system components.

---

## 8. Testing Rules

### 8.1 Coverage Requirements

| Layer | Minimum Coverage |
|-------|-----------------|
| Services | 80% |
| Repositories | 70% |
| Handlers | 70% |
| React Components | 60% |
| Utilities | 90% |
| Agent Tools | 80% |

### 8.2 Test Structure

```typescript
// TEMPLATE: Test file structure

describe("WeatherService", () => {
  describe("getForecast", () => {
    it("should return a 7-day forecast for a valid location", async () => {
      // Arrange
      const location = { lat: -37.8136, lng: 144.9631 };

      // Act
      const result = await weatherService.getForecast(location);

      // Assert
      expect(result.days).toHaveLength(7);
    });

    it("should throw WeatherServiceError when API is unavailable", async () => {
      // Arrange, Act, Assert
    });
  });
});
```

### 8.3 Test Rules

- Use **Arrange-Act-Assert** pattern in every test.
- Test names describe the expected behavior: `"should [expected behavior] when [condition]"`.
- One assertion per test (logical assertion — multiple `expect` calls on the same result is fine).
- Mock external dependencies (AWS SDK, APIs). Never call real services in unit tests.
- Integration tests use localstack or test AWS accounts.

---

## 9. Git & Version Control

### 9.1 Branch Naming

```
feature/weather-alert-system
fix/diagnosis-timeout-error
refactor/community-feed-pagination
docs/update-api-documentation
chore/upgrade-cdk-dependencies
```

### 9.2 Commit Messages

Follow Conventional Commits:

```
<type>(<scope>): <short description>

<optional body>
```

**Types:** `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`
**Scopes:** `weather`, `diagnosis`, `news`, `community`, `auth`, `infra`, `frontend`, `shared`

```
feat(weather): add flood risk alert evaluation
fix(diagnosis): handle timeout for large image uploads
refactor(community): extract marketplace listing into separate service
```

### 9.3 PR Rules

- One feature/fix per PR. No mega-PRs.
- PR description references the relevant requirement IDs from the PRD.
- All tests pass before merge.
- At least one approval required.

---

## 10. Environment & Configuration

### 10.1 Environment Variables

- **NEVER** hardcode secrets, API keys, or environment-specific values.
- Use AWS Secrets Manager for secrets.
- Use SSM Parameter Store for configuration.
- Use `.env.example` to document required variables (no actual values).

### 10.2 Configuration Pattern

```typescript
// config/weather.config.ts

interface WeatherConfig {
  apiBaseUrl: string;
  apiKey: string;
  defaultHighTempThreshold: number;
  defaultLowTempThreshold: number;
  pollingIntervalMinutes: number;
}

export function loadWeatherConfig(): WeatherConfig {
  return {
    apiBaseUrl: requireEnv("WEATHER_API_BASE_URL"),
    apiKey: requireEnv("WEATHER_API_KEY"),
    defaultHighTempThreshold: Number(process.env.WEATHER_HIGH_TEMP ?? "35"),
    defaultLowTempThreshold: Number(process.env.WEATHER_LOW_TEMP ?? "5"),
    pollingIntervalMinutes: Number(process.env.WEATHER_POLL_INTERVAL ?? "30"),
  };
}
```

---

## 11. Security Rules

- **NEVER** log sensitive data (passwords, tokens, PII).
- **ALWAYS** validate and sanitize all user input at the API boundary.
- **ALWAYS** use parameterized queries. No string concatenation for queries.
- **ALWAYS** apply least-privilege IAM policies per Lambda function.
- **NEVER** expose stack traces or internal error details to the client.
- **ALWAYS** use HTTPS. No exceptions.
- **ALWAYS** set CORS to specific allowed origins. Never use `*` in production.
- Store uploaded images in a private S3 bucket. Serve via CloudFront signed URLs.

---

## 12. AI Tool Instructions

> This section is specifically for AI coding assistants (Claude, Copilot, Cursor, Windsurf, etc.)

When generating code for this project:

1. **Read this file first** before writing any code.
2. **Read the PRD** (`docs/PRD.md`) to understand feature context.
3. **Read the Design Guide** (`docs/DESIGN_GUIDE.md`) for UI/UX decisions.
4. **Follow the project structure** defined in Section 2 exactly. Do not create files outside of it.
5. **Follow all naming conventions** in Section 3. Do not use abbreviations.
6. **Use TypeScript strict mode.** No `any` types.
7. **Keep functions under 30 lines** and files under 300 lines.
8. **Use dependency injection.** Do not import concrete implementations directly in handlers.
9. **Write tests** for every new service, repository, and utility function.
10. **Use the exact file templates** shown in this document as starting points.
11. **Do not add features** not described in the PRD without explicit request.
12. **Do not add comments** that describe what the code does. Only add comments for non-obvious WHY decisions.
13. **Prefer existing patterns.** Before creating a new utility or abstraction, check if a similar one already exists in `utils/` or `shared/`.
14. **Commit messages** follow Conventional Commits (Section 9.2).

---

*This is the single source of truth for code quality in the Harvest AI project. No exceptions.*