# Market Price Service

> Real-time agricultural commodity prices from the World Bank API with AI-powered buy/sell/hold signals from Amazon Bedrock Claude.

Introduced in: `features/chatbotRecomemdationsMarkets`

---

## What It Does

Two responsibilities:

1. **WorldBankService** — fetches the last 30 months of real commodity price data from the public World Bank API, converts to AUD, and caches for 24 hours
2. **MarketPriceService** — sends current price data to Bedrock Claude and returns a buy/sell/hold recommendation with confidence score and reasoning

---

## Architecture

```
GET /api/market-price
        │
        ▼
marketPrice.handler.ts     ← fetches commodity list with real prices
        │
        ├──▶ worldBank.service.ts   ← World Bank API (24h cache)
        │
        └──▶ marketPrice.service.ts ← Bedrock recommendation per commodity
                    │
                    ▼
            Amazon Bedrock Claude   ← model: anthropic.claude-3-5-sonnet-20241022-v2:0
```

---

## API Endpoint

### GET /api/market-price

Returns all supported commodities enriched with real prices and AI signals.

**Response:**
```json
{
  "commodities": [
    {
      "id": "wheat",
      "name": "Wheat",
      "emoji": "🌾",
      "category": "grains",
      "currentPrice": 4.23,
      "unit": "per kg",
      "currency": "AUD",
      "priceChange24h": 0.08,
      "priceChangePct": 1.93,
      "trend": "up",
      "monthlyHigh": 4.51,
      "monthlyLow": 3.98,
      "averagePrice": 4.19,
      "priceHistory": [
        { "date": "2026-01", "price": 4.11 },
        { "date": "2026-02", "price": 4.23 }
      ],
      "insight": {
        "recommendation": "sell_now",
        "confidence": 78,
        "reasoning": "Wheat is trading above its 30-day average with upward momentum...",
        "priceTarget": 4.40,
        "timeframe": "7–14 days"
      }
    }
  ]
}
```

---

## Supported Commodities

| Commodity | World Bank Indicator | Unit |
|-----------|---------------------|------|
| Wheat | `PWHEAMTUSDM` | AUD/kg |
| Maize | `PMAIZMT` | AUD/kg |
| Rice | `PRICENPQ` | AUD/kg |
| Beef | `PBEEFUSDM` | AUD/kg |
| Bananas | `PBANSQ` | AUD/unit |
| Cotton | `PCOTTIND` | AUD/kg |

---

## Data Models

### MarketInsightRequest
```typescript
{
  commodityId: string;
  commodityName: string;
  currentPrice: number;
  unit: string;
  currency: string;
  priceChangePct: number;
  trend: "up" | "down" | "stable";
  monthlyHigh: number;
  monthlyLow: number;
  averagePrice: number;
}
```

### MarketInsightResponse
```typescript
{
  recommendation: "sell_now" | "hold" | "wait_to_buy";
  confidence: number;     // 0–100
  reasoning: string;      // 2–3 sentence explanation
  priceTarget: number;
  timeframe: string;      // e.g., "7–14 days"
}
```

---

## AWS Services

| Service | Usage |
|---------|-------|
| **Amazon Bedrock** | Claude 3.5 Sonnet v2 via `InvokeModelCommand` for price signals |

---

## External APIs

| API | Usage | Auth |
|-----|-------|------|
| **World Bank Commodity Price API** | Historical monthly prices | None — public |

World Bank endpoint format:
```
https://api.worldbank.org/v2/en/indicator/{INDICATOR}?format=json&mrv=30&frequency=M
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AWS_REGION` | No | AWS region (default: `ap-southeast-2`) |

---

## Key Files

| File | Description |
|------|-------------|
| `marketPrice.service.ts` | Bedrock integration for buy/sell/hold signals |
| `worldBank.service.ts` | World Bank API fetching, AUD conversion, 24h caching |
| `../../handlers/market-price/marketPrice.handler.ts` | Lambda/Express entry point |
| `../../constants/marketPrice.constants.ts` | System prompt, model ID, token limits |

---

## Caching

World Bank prices are cached in-memory for **24 hours** to avoid excessive external API calls. On cache miss, all 6 commodities are fetched in parallel.

```typescript
// Cache refreshes automatically when TTL expires
CACHE_TTL_MS = 24 * 60 * 60 * 1000
```

---

## Currency Conversion

All prices are converted from USD to AUD at a fixed rate:

```
1 USD = 1.58 AUD  (rate as of Feb 2026)
```

Unit conversions applied:
- Beef and Cotton: USD/lb → AUD/kg (× 2.20462 × 1.58)
- Bananas: USD per 1000 units → AUD per unit (÷ 1000 × 1.58)

---

## Fallback Behaviour

When Bedrock returns an unparseable response:

| Condition | Recommendation | Confidence |
|-----------|---------------|------------|
| Price > 30-day average | `sell_now` | 60% |
| Price ≤ 30-day average | `wait_to_buy` | 60% |

---

## Local Testing

```bash
export AWS_REGION=ap-southeast-2

curl http://localhost:3000/api/market-price \
  -H "x-user-id: test-user"
```