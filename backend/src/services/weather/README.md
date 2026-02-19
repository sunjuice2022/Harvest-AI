# Weather Intelligence Agent

AI-powered weather monitoring and advisory service for AgriSense AI. Fetches real-time forecasts, detects threshold-based alert conditions, sends notifications via SNS, and generates Claude-powered recommendations and daily farming advisories via AWS Bedrock.

---

## Architecture

The weather feature spans four backend layers:

```
GET /weather/forecast           EventBridge (every 30 min)
        │                                │
        ▼                                ▼
weatherForecast.handler      weatherAlert.handler
        │                                │
        └──────────┬─────────────────────┘
                   ▼
            WeatherService          ← fetches + parses OpenWeather API
                   │
            WeatherAgent            ← orchestrates alert cycle
                   │
            WeatherAgentTools       ← fetchAndEvaluate / persist / notify
                   │
         ┌─────────┼──────────┐
         ▼         ▼          ▼
  WeatherAlert  Weather    Weather
  Repository   Bedrock    Notification
  (DynamoDB)   Service    Service (SNS)
               (Claude)
```

### Two execution flows

| Flow | Trigger | Purpose |
|---|---|---|
| **On-demand forecast** | `GET /api/weather/forecast?lat=&lng=` | Returns parsed 7-day forecast + daily advisory |
| **Scheduled polling** | EventBridge rule every 30 min | Evaluates alert thresholds, persists to DynamoDB, sends SNS notifications |

---

## Files

### Services (`src/services/weather/`)

| File | Responsibility |
|---|---|
| `weather.service.ts` | Fetches raw forecast from OpenWeather One Call API 3.0, parses to shared types, evaluates alert thresholds |
| `weather.types.ts` | Backend domain models: `WeatherConfig`, `CreateAlertInput` |
| `weather.dto.ts` | Raw OpenWeather API response shapes: `OpenWeatherOneCallResponse`, `OpenWeatherDailyResponse`, etc. |
| `weatherBedrock.service.ts` | Calls Claude via AWS Bedrock — enriches alert recommendations and generates daily farming advisories |
| `weatherNotification.service.ts` | Sends alert notifications via AWS SNS (email topic + optional SMS) |

### Agents (`src/agents/weather/`)

| File | Responsibility |
|---|---|
| `weather.agent.ts` | Orchestrates the scheduled polling cycle: fetch → evaluate → persist → notify |
| `weather.tools.ts` | Tool functions invoked by the agent: `fetchAndEvaluateWeather`, `persistAlerts`, `notifyAlerts` |
| `weather.types.ts` | Agent-specific types: `WeatherAgentToolInput`, `AlertRecommendation`, `FetchWeatherResult` |
| `weather.prompts.ts` | Claude system prompt and hardcoded recommendation templates (fallback when Bedrock is unavailable) |

### Handlers (`src/handlers/weather/`)

| File | Trigger | Returns |
|---|---|---|
| `weatherForecast.handler.ts` | `GET /api/weather/forecast` | `{ forecast, advisory? }` |
| `weatherAlert.handler.ts` | EventBridge schedule | Persists alerts + sends SNS |

### Repository (`src/repositories/weather/`)

| File | Responsibility |
|---|---|
| `weatherAlert.repository.ts` | DynamoDB CRUD for `WeatherAlerts` table |

---

## Alert Types

| Type | Trigger condition | Default severity |
|---|---|---|
| `high_temp` | Max temp (next 3 days) > `WEATHER_HIGH_TEMP` | `warning` / `critical` if > 40°C |
| `low_temp` | Min temp (next 3 days) < `WEATHER_LOW_TEMP` | `warning` / `critical` if < 0°C |
| `flood` | Day-1 rainfall > 50mm | `warning` / `critical` if > 100mm |
| `drought` | ≥ 7 consecutive dry days (< 1mm/day) | `warning` / `critical` if > 14 days |

Thresholds are set in `src/constants/weather.constants.ts` and overridden by env vars.

---

## Daily Advisory

When `BEDROCK_MODEL_ID` is set, every call to `GET /api/weather/forecast` generates a **1–2 sentence daily farming advisory** using Claude — even when there are no active alerts.

The advisory is:
- **Season-aware**: hemisphere is inferred from latitude (negative = southern), month determines season
- **Condition-aware**: uses current temperature, humidity, wind, and 7-day rainfall outlook
- **Fallback-safe**: if Bedrock is unavailable, a plain-text fallback is returned instead

Example response:
```json
{
  "forecast": { ... },
  "advisory": "With mild summer temperatures around 22°C and clear skies, today is ideal for harvesting and pesticide application; hold off on irrigation as light rain is forecast mid-week."
}
```

---

## Configuration

All values are read from the root `.env` file.

```env
# Required
WEATHER_API_KEY=<openweathermap-api-key>
WEATHER_API_BASE_URL=https://api.openweathermap.org/data/3.0

# Alert thresholds (°C)
WEATHER_HIGH_TEMP=35
WEATHER_LOW_TEMP=5
WEATHER_POLL_INTERVAL=30

# Location for scheduled polling
DEFAULT_FARM_LAT=-37.8136
DEFAULT_FARM_LNG=144.9631

# AWS
AWS_REGION=us-east-1
DYNAMODB_WEATHER_ALERTS_TABLE=WeatherAlerts

# Bedrock — enables Claude recommendations + daily advisory (opt-in)
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0

# SNS — enables email + SMS notifications (opt-in)
SNS_ALERT_TOPIC_ARN=arn:aws:sns:us-east-1:<account-id>:WeatherAlerts
ALERT_PHONE_NUMBER=+61400000000
```

Both `BEDROCK_MODEL_ID` and `SNS_ALERT_TOPIC_ARN` are **optional** — the system degrades gracefully without them (template recommendations, no notifications).

---

## Local Testing

Run the full backend pipeline without deploying to AWS. Uses the real OpenWeather API and mocks DynamoDB, SNS, and Bedrock.

```bash
cd backend
npm run test:local
```

**What it tests:**
1. Agent cycle — live forecast fetch, alert evaluation, mock DynamoDB persist, mock SNS notify
2. Daily advisory — live forecast re-fetch, mock Bedrock advisory generation

**Expected output (no alerts):**
```
🌾  AgriSense Weather Agent — Local Integration Test
════════════════════════════════════════════════════
📍  Location : lat=-37.8136, lng=144.9631
...
[WeatherAgent] No alert conditions detected for user local-test-user
[WeatherAgent] Forecast fetched { location: ..., temperature: 18.35 }

────────────────────────────────────────────────────
🌾  Testing daily advisory (no-alert scenario)...

  🌾  [Mock Bedrock Claude] Generating daily advisory for Summer (lat=-37.8136)...
  📋  Advisory: [Claude] Summer advisory: With 18.35°C and clear sky conditions...

✅  Agent cycle completed.
```

### Unit tests

```bash
cd backend
npm test
```

Tests cover `WeatherService` alert threshold logic (high temp, low temp, flood, drought, no-alert scenarios).

---

## Bedrock Integration

`WeatherBedrockService` uses the [Converse API](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_Converse.html) (`ConverseCommand`) — the modern, model-agnostic Bedrock interface.

### Alert recommendation enrichment

Called during the scheduled polling cycle when alerts are detected. Replaces the hardcoded `RECOMMENDATION_TEMPLATES` string with a Claude-generated, context-aware recommendation.

**Prompt includes:** alert type/severity/message, current conditions, 7-day max temp, total rainfall.

### Daily advisory

Called on every on-demand forecast request (when Bedrock is enabled). Always runs regardless of alert status.

**Prompt includes:** detected season, current conditions, 7-day outlook, instruction to generate suitable/avoid farming activities.

### Fallback behaviour

If any Bedrock call fails (network, throttle, model error):
- Alert enrichment: returns the original template recommendation unchanged
- Daily advisory: returns a plain-text fallback built from current temperature and condition

---

## SNS Notification Structure

When alerts are detected and `SNS_ALERT_TOPIC_ARN` is set:

**Email** (via topic subscription):
```
Subject: [AgriSense] WARNING Weather Alert
Body:    High temperature alert: 37°C forecast

         Recommendation: Increase irrigation frequency and apply shade nets if available.
```

**SMS** (when `ALERT_PHONE_NUMBER` is set):
```
[AgriSense] High temperature alert: 37°C forecast
```
