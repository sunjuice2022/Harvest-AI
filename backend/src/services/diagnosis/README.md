# Diagnosis Service

> AI-powered crop disease, pest, and nutrient deficiency analysis using Amazon Bedrock Claude.

Introduced in: `feature/chatbot` · Extended in: `feature-chatbot-recomendations` · Current: `features/chatbotRecomemdationsMarkets`

---

## What It Does

Accepts a text description and/or base64-encoded crop photo, sends it to Amazon Bedrock Claude, and returns a structured diagnosis with:

- Condition name and type (disease / pest / nutrient deficiency / abiotic stress)
- Confidence score (0–100)
- Severity level (info / warning / critical)
- Treatment steps and organic alternatives
- Expert escalation flag when confidence < 60%

---

## Architecture

```
POST /api/diagnosis/chat
        │
        ▼
diagnosis.handler.ts       ← validates request, extracts userId
        │
        ▼
diagnosis.service.ts       ← builds Bedrock prompt, parses response
        │
        ▼
Amazon Bedrock Claude       ← model: au.anthropic.claude-sonnet-4-6
        │
        ▼
chatSession.repository.ts  ← persists session + messages to DynamoDB
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/diagnosis/chat` | Submit crop description or photo for diagnosis |
| `POST` | `/api/diagnosis/upload` | Get presigned S3 URL for photo upload |
| `GET` | `/api/diagnosis/sessions` | List user's past chat sessions |
| `GET` | `/api/diagnosis/sessions/{sessionId}` | Get full session with all messages |

### POST /api/diagnosis/chat

**Request:**
```json
{
  "sessionId": "optional-existing-session-id",
  "message": "My tomato leaves have brown spots with yellow halos",
  "imageUrl": "s3://harvest-ai-media/uploads/abc123.jpg"
}
```

**Response:**
```json
{
  "messageId": "msg-uuid",
  "diagnosis": {
    "condition": "Early Blight",
    "conditionType": "disease",
    "confidence": 82,
    "severity": "warning",
    "description": "Fungal infection caused by Alternaria solani...",
    "treatment": ["Remove affected leaves", "Apply copper-based fungicide"],
    "organicAlternatives": ["Neem oil spray", "Baking soda solution"],
    "preventionTips": ["Avoid overhead watering", "Rotate crops annually"],
    "affectedPlants": ["Tomato", "Potato", "Eggplant"],
    "escalatedToExpert": false
  },
  "followUpSuggestions": ["How do I apply copper fungicide?", "Is this contagious to nearby plants?"]
}
```

---

## Data Models

### DiagnosisResult
```typescript
{
  condition: string;
  conditionType: "disease" | "pest" | "nutrient_deficiency" | "abiotic_stress";
  confidence: number;           // 0–100
  severity: "info" | "warning" | "critical";
  description: string;
  treatment: string[];
  organicAlternatives?: string[];
  preventionTips?: string[];
  affectedPlants?: string[];
  escalatedToExpert?: boolean;  // true when confidence < 60
}
```

### ChatSession (DynamoDB)
```
Table:  ChatSessions
PK:     userId (String)
SK:     sessionId (String)
TTL:    90 days from creation
```

---

## AWS Services

| Service | Usage |
|---------|-------|
| **Amazon Bedrock** | Claude Sonnet 4.6 via `ConverseCommand` for diagnosis |
| **DynamoDB** | `ChatSessions` table — stores sessions and message history |
| **S3** | `harvest-ai-media` bucket — stores uploaded crop photos |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CHAT_SESSIONS_TABLE` | Yes | DynamoDB table name (default: `ChatSessions`) |
| `MEDIA_BUCKET` | Yes | S3 bucket name for image uploads (default: `harvest-ai-media`) |
| `AWS_REGION` | No | AWS region (default: `ap-southeast-2`) |

---

## Key Files

| File | Description |
|------|-------------|
| `diagnosis.service.ts` | Core Bedrock integration and response parsing |
| `../../handlers/diagnosis/diagnosis.handler.ts` | Lambda entry point for chat endpoint |
| `../../handlers/diagnosis/upload.handler.ts` | Lambda entry point for presigned URL generation |
| `../../handlers/diagnosis/sessions.handler.ts` | Lambda entry points for session list/detail |
| `../../repositories/diagnosis/chatSession.repository.ts` | DynamoDB CRUD for sessions |
| `../../constants/diagnosis.constants.ts` | Model ID, thresholds, timeouts |

---

## Confidence & Severity Rules

| Confidence | Severity | Expert Escalation |
|------------|----------|------------------|
| < 40% | `info` | Yes |
| 40–70% | `warning` | Yes (if < 60%) |
| > 70% | `critical` | No |

---

## Local Testing

```bash
# Set environment variables
export CHAT_SESSIONS_TABLE=ChatSessions
export MEDIA_BUCKET=harvest-ai-media
export AWS_REGION=ap-southeast-2

# Run via the test script
npx ts-node backend/scripts/test-diagnosis.ts
```
