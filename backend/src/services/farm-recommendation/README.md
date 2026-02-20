# Farm Recommendation Service

> AI-powered crop and livestock planning using Amazon Bedrock Claude based on farm conditions.

Introduced in: `feature-chatbot-recomendations` · Current: `features/chatbotRecomemdationsMarkets`

---

## What It Does

Accepts a farmer's conditions (climate zone, soil type, water availability, budget) and returns personalised recommendations for:

- Up to 5 crop recommendations with suitability scores
- Up to 5 livestock recommendations with suitability scores
- A market insight summary covering current demand trends

---

## Architecture

```
POST /api/farm-recommendation
        │
        ▼
farmRecommendation.handler.ts   ← validates request, extracts userId
        │
        ▼
farmRecommendation.service.ts   ← builds Bedrock prompt, parses response
        │
        ▼
Amazon Bedrock Claude            ← model: anthropic.claude-3-5-sonnet-20241022-v2:0
```

---

## API Endpoint

### POST /api/farm-recommendation

**Request:**
```json
{
  "farmType": "mixed",
  "climateZone": "subtropical",
  "season": "wet",
  "waterAvailability": "rain-fed",
  "soilType": "loamy",
  "budgetLevel": "medium"
}
```

**Response:**
```json
{
  "cropRecommendations": [
    {
      "cropName": "Maize",
      "cropEmoji": "🌽",
      "suitabilityScore": 88,
      "estimatedYieldPerHectare": "4–6 tons",
      "growingPeriodDays": 90,
      "marketDemand": "high",
      "reasons": [
        "Thrives in subtropical wet seasons",
        "Loamy soil maximises root development",
        "High market demand due to feed grain shortage"
      ]
    }
  ],
  "livestockRecommendations": [
    {
      "animalName": "Layer Hens",
      "animalEmoji": "🐔",
      "suitabilityScore": 91,
      "primaryOutput": "eggs",
      "productionTimeline": "Eggs from week 18, year-round",
      "marketDemand": "high",
      "reasons": [
        "Consistent egg demand in subtropical markets",
        "Low water requirement",
        "Medium budget covers starter flock"
      ]
    }
  ],
  "marketInsight": "Egg and grain markets remain strong heading into Q2 2026..."
}
```

---

## Data Models

### FarmRecommendationRequest
```typescript
{
  farmType: "crops" | "livestock" | "mixed";
  climateZone: "tropical" | "subtropical" | "temperate" | "arid" | "mediterranean" | "continental";
  season: "wet" | "dry" | "spring" | "summer" | "autumn" | "winter" | "year-round";
  waterAvailability: "irrigated" | "rain-fed" | "both";
  soilType: "sandy" | "clay" | "loamy" | "silt" | "peaty" | "chalky" | "saline";
  budgetLevel: "low" | "medium" | "high";
}
```

### CropRecommendation
```typescript
{
  cropName: string;
  cropEmoji: string;
  suitabilityScore: number;           // 0–100
  estimatedYieldPerHectare: string;
  growingPeriodDays: number;
  marketDemand: "low" | "medium" | "high";
  reasons: string[];                  // Exactly 3 items
}
```

### LivestockRecommendation
```typescript
{
  animalName: string;
  animalEmoji: string;
  suitabilityScore: number;           // 0–100
  primaryOutput: string;              // "eggs" | "beef" | "milk" | "pork" | "wool"
  productionTimeline: string;
  marketDemand: "low" | "medium" | "high";
  reasons: string[];                  // Exactly 3 items
}
```

---

## farmType Behaviour

| farmType | cropRecommendations | livestockRecommendations |
|----------|--------------------|-----------------------|
| `crops` | Up to 5 | Empty array |
| `livestock` | Empty array | Up to 5 |
| `mixed` | Up to 5 | Up to 5 |

---

## AWS Services

| Service | Usage |
|---------|-------|
| **Amazon Bedrock** | Claude 3.5 Sonnet v2 via `ConverseCommand` |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AWS_REGION` | No | AWS region (default: `ap-southeast-2`) |

---

## Key Files

| File | Description |
|------|-------------|
| `farmRecommendation.service.ts` | Bedrock prompt building and JSON response parsing |
| `../../handlers/farm-recommendation/farmRecommendation.handler.ts` | Lambda entry point |
| `../../constants/farmRecommendation.constants.ts` | Model ID and recommendation limits |

---

## Fallback Behaviour

When Bedrock returns an unparseable response, the service returns a safe default:

- **Crop:** Maize — suitabilityScore 75, marketDemand high
- **Livestock:** Layer Hens — suitabilityScore 80, marketDemand high
- **marketInsight:** Generic global demand message

---

## Local Testing

```bash
export AWS_REGION=ap-southeast-2

curl -X POST http://localhost:3000/api/farm-recommendation \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user" \
  -d '{
    "farmType": "mixed",
    "climateZone": "subtropical",
    "season": "wet",
    "waterAvailability": "rain-fed",
    "soilType": "loamy",
    "budgetLevel": "medium"
  }'
```