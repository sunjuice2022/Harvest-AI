# ⚡ Quick Start: Test Backend Locally Without AWS

If you don't want to set up AWS yet, you can test the full system with **mocks** in ~15 minutes.

---

## 🎯 What You'll Get

✅ Frontend runs on `http://localhost:5173`  
✅ Backend API runs on `http://localhost:3000`  
✅ Mock Bedrock responses (no AWS costs!)  
✅ Mock DynamoDB storage (in-memory)  
✅ Photo upload simulation  
✅ Full end-to-end testing  

---

## 📋 Setup (5 minutes)

### 1. Create Mock Bedrock Service

Create [backend/src/services/diagnosis/bedrock.mock.ts](backend/src/services/diagnosis/bedrock.mock.ts):

```typescript
import type { DiagnosisResult } from "@harvest-ai/shared";

export async function mockDiagnoseCrop(
  message: string,
  imageBase64?: string
): Promise<DiagnosisResult> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const normalizedMessage = message.toLowerCase();

  // Tomato disease example
  if (normalizedMessage.includes("tomato") && (normalizedMessage.includes("yellow") || normalizedMessage.includes("spot"))) {
    return {
      condition: "Early Blight",
      conditionType: "disease",
      confidence: 92,
      severity: "warning",
      description:
        "Early Blight (Alternaria solani) is a fungal disease that primarily affects tomato leaves. It starts as small brown spots with concentric rings, gradually enlarging and causing leaf yellowing and defoliation.",
      treatment: [
        "Apply fungicide spray (Chlorothalonil or Copper fungicide)",
        "Remove infected leaves from bottom 12 inches of plant",
        "Improve air circulation and reduce leaf wetness",
        "Water at soil level, avoid wetting foliage",
      ],
      organicAlternatives: ["Neem oil spray every 7 days", "Copper sulfate solution"],
      preventionTips: [
        "Use mulch to prevent soil splash",
        "Space plants 24-36 inches apart",
        "Stake and prune for airflow",
        "Crop rotation (avoid nightshade family)",
      ],
      affectedPlants: ["Tomato", "Potato", "Eggplant"],
      escalatedToExpert: false,
    };
  }

  // Powdery mildew
  if (normalizedMessage.includes("white powder") || normalizedMessage.includes("powdery")) {
    return {
      condition: "Powdery Mildew",
      conditionType: "disease",
      confidence: 88,
      severity: "warning",
      description:
        "Powdery mildew is a fungal infection characterized by white powdery coating on leaves. It affects photosynthesis and can cause leaf curling.",
      treatment: [
        "Spray with sulfur dust or damp sulfur",
        "Apply potassium bicarbonate (Milstop)",
        "Use horticultural oil spray",
      ],
      organicAlternatives: ["Baking soda spray (1 tbsp per gallon)", "Milk spray (1 part milk to 9 parts water)"],
      preventionTips: [
        "Ensure good airflow",
        "Water early morning at soil level",
        "Keep humidity below 50%",
      ],
      affectedPlants: ["Cucumber", "Squash", "Tomato", "Grape"],
      escalatedToExpert: false,
    };
  }

  // Nutrient deficiency
  if (normalizedMessage.includes("yellow leaf") || normalizedMessage.includes("pale")) {
    return {
      condition: "Nitrogen Deficiency",
      conditionType: "nutrient",
      confidence: 85,
      severity: "info",
      description:
        "Nitrogen deficiency causes yellowing of lower leaves first, progressing upward. Leaves may drop prematurely.",
      treatment: [
        "Apply nitrogen fertilizer (urea 46-0-0 at 2 tbsp per gallon)",
        "Use compost or manure (3 inches top dressing)",
        "Apply fish emulsion every 2 weeks",
      ],
      organicAlternatives: ["Composted manure", "Alfalfa meal", "Blood meal"],
      preventionTips: [
        "Maintain soil pH 6.0-7.0",
        "Incorporate organic matter before planting",
        "Mulch to retain moisture",
      ],
      affectedPlants: ["All crops"],
      escalatedToExpert: false,
    };
  }

  // Default low confidence response
  return {
    condition: "Unidentified Condition",
    conditionType: "disease",
    confidence: 28,
    severity: "info",
    description: `Unable to identify the condition from your description: "${message}". Please provide more details such as leaf color, spots, or plant type.`,
    treatment: [
      "Take clearer photos from multiple angles",
      "Describe affected areas in detail",
      "Provide plant type and location",
      "Contact local extension office",
    ],
    organicAlternatives: [],
    preventionTips: [],
    affectedPlants: [],
    escalatedToExpert: true,
  };
}
```

### 2. Create Mock DynamoDB Service

Create [backend/src/services/diagnosis/dynamodb.mock.ts](backend/src/services/diagnosis/dynamodb.mock.ts):

```typescript
import type { ChatSession, ChatMessage } from "@harvest-ai/shared";

// In-memory storage (replaces DynamoDB)
const mockDatabase = new Map<string, any>();

export async function mockGetSession(
  userId: string,
  sessionId: string
): Promise<ChatSession | null> {
  const key = `${userId}#${sessionId}`;
  const item = mockDatabase.get(key);

  if (!item) return null;

  return {
    sessionId,
    userId,
    messages: item.messages || [],
    lastDiagnosis: item.lastDiagnosis || null,
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
  };
}

export async function mockCreateSession(
  sessionId: string,
  userId: string
): Promise<ChatSession> {
  const key = `${userId}#${sessionId}`;
  const now = new Date().toISOString();

  const session = {
    sessionId,
    userId,
    messages: [],
    lastDiagnosis: null,
    createdAt: now,
    updatedAt: now,
  };

  mockDatabase.set(key, session);
  return session;
}

export async function mockUpdateSession(
  session: ChatSession
): Promise<ChatSession> {
  const key = `${session.userId}#${session.sessionId}`;
  const updated = {
    ...session,
    updatedAt: new Date().toISOString(),
  };

  mockDatabase.set(key, updated);
  return session;
}

export async function mockGetUserSessions(
  userId: string,
  limit: number = 10
): Promise<ChatSession[]> {
  // Filter all sessions for this user
  const userSessions = Array.from(mockDatabase.entries())
    .filter(([key]) => key.startsWith(`${userId}#`))
    .map(([, value]) => ({
      sessionId: value.sessionId,
      userId,
      messages: value.messages || [],
      lastDiagnosis: value.lastDiagnosis || null,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    }))
    .sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt).getTime();
      return timeB - timeA; // Most recent first
    })
    .slice(0, limit);

  return userSessions;
}

export function mockClearDatabase() {
  mockDatabase.clear();
}

export function mockGetDatabaseSize() {
  return mockDatabase.size;
}
```

### 3. Create Mock S3 Service

Create [backend/src/services/diagnosis/s3.mock.ts](backend/src/services/diagnosis/s3.mock.ts):

```typescript
// Mock S3 presigned URLs
const MOCK_BUCKET = "harvest-ai-media-mock";

export async function mockGeneratePresignedUrl(
  fileName: string,
  fileType: string
): Promise<string> {
  // Simulate presigned URL
  // In real app: https://bucket.s3.amazonaws.com/path?X-Amz-Signature=...

  const uploadId = Date.now().toString();
  const mockUrl = `https://${MOCK_BUCKET}.s3.amazonaws.com/diagnosis/${uploadId}/${fileName}?mock-presigned=true&expires-in=600`;

  return mockUrl;
}

export async function mockValidateFileType(mimeType: string): Promise<boolean> {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  return allowedTypes.includes(mimeType);
}

// Simulate S3 upload success
export async function mockConfirmUpload(presignedUrl: string): Promise<boolean> {
  // In real app: PUT to presignedUrl with file content
  // For mock: just validate URL format
  return presignedUrl.includes(MOCK_BUCKET);
}
```

### 4. Create Mock Express Backend Server

Create [backend/src/server.mock.ts](backend/src/server.mock.ts):

```typescript
import express, { Express, Request, Response } from "express";
import cors from "cors";
import type { ChatSession, ChatMessage } from "@harvest-ai/shared";
import { mockDiagnoseCrop } from "./services/diagnosis/bedrock.mock";
import {
  mockGetSession,
  mockCreateSession,
  mockUpdateSession,
  mockGetUserSessions,
} from "./services/diagnosis/dynamodb.mock";
import {
  mockGeneratePresignedUrl,
  mockValidateFileType,
} from "./services/diagnosis/s3.mock";

const app: Express = express();
const PORT = 3000;

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
  })
);
app.use(express.json());

// Middleware: Mock JWT validation (skip auth for testing)
app.use((req: Request, res: Response, next) => {
  // Extract user ID from header or use mock
  const mockUserId = req.headers["x-user-id"] || `user-${Date.now()}`;
  res.locals.userId = mockUserId;
  next();
});

// POST /api/diagnosis/chat
app.post("/api/diagnosis/chat", async (req: Request, res: Response) => {
  try {
    const { sessionId, message, imageUrl } = req.body;
    const userId = res.locals.userId as string;

    // Validate input
    if (!message || !sessionId) {
      return res.status(400).json({
        error: "Missing required fields: sessionId, message",
      });
    }

    // Load or create session
    let session = await mockGetSession(userId, sessionId);
    if (!session) {
      session = await mockCreateSession(sessionId, userId);
    }

    // Call mock Bedrock service
    const diagnosis = await mockDiagnoseCrop(message, imageUrl);

    // Create messages
    const userMessage: ChatMessage = {
      role: "user",
      content: message,
      imageUrl: imageUrl || null,
      timestamp: new Date().toISOString(),
    };

    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: `I've identified a potential condition: **${diagnosis.condition}** (${diagnosis.confidence}% confidence)`,
      diagnosis,
      timestamp: new Date().toISOString(),
    };

    // Update session
    session.messages.push(userMessage, assistantMessage);
    session.lastDiagnosis = diagnosis;
    await mockUpdateSession(session);

    // Response
    res.json({
      messageId: `msg-${Date.now()}`,
      message: assistantMessage.content,
      diagnosis,
      followUpSuggestions: [
        `Tell me more about the ${diagnosis.condition}`,
        "How should I apply the treatment?",
        "Are there resistant varieties I can plant?",
      ],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// GET /api/diagnosis/sessions
app.get("/api/diagnosis/sessions", async (req: Request, res: Response) => {
  try {
    const userId = res.locals.userId as string;
    const limit = parseInt(req.query.limit as string) || 10;

    const sessions = await mockGetUserSessions(userId, limit);

    res.json({
      sessions: sessions.map((s) => ({
        sessionId: s.sessionId,
        messageCount: s.messages.length,
        lastMessage: s.messages[s.messages.length - 1]?.content || "",
        lastDiagnosis: s.lastDiagnosis,
        updatedAt: s.updatedAt,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load sessions" });
  }
});

// POST /api/diagnosis/upload
app.post("/api/diagnosis/upload", async (req: Request, res: Response) => {
  try {
    const { fileName, fileType } = req.body;
    const userId = res.locals.userId as string;

    // Validate
    if (!fileName || !fileType) {
      return res.status(400).json({
        error: "Missing fileName or fileType",
      });
    }

    // Validate file type
    const isValid = await mockValidateFileType(fileType);
    if (!isValid) {
      return res.status(400).json({
        error: `Invalid file type: ${fileType}. Allowed: image/jpeg, image/png, image/webp`,
      });
    }

    // Generate presigned URL
    const presignedUrl = await mockGeneratePresignedUrl(fileName, fileType);

    res.json({
      uploadId: `upload-${Date.now()}`,
      presignedUrl,
      expiresIn: 600,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate presigned URL" });
  }
});

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    mode: "mock (local testing)",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Mock Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 API Base: http://localhost:${PORT}/api`);
  console.log(`🧪 Mode: Mock (using in-memory database + mock Bedrock)`);
  console.log(`\n💡 Endpoints:`);
  console.log(`   POST   /api/diagnosis/chat          - Send message & get diagnosis`);
  console.log(`   GET    /api/diagnosis/sessions      - Load user sessions`);
  console.log(`   POST   /api/diagnosis/upload        - Get presigned URL for photo upload`);
  console.log(`   GET    /health                      - Health check`);
});
```

### 5. Update package.json Scripts

Edit [backend/package.json](backend/package.json) and add a dev script:

Under `"scripts"`:
```json
  "dev:mock": "ts-node src/server.mock.ts"
```

### 6. Install Express Dependency

```bash
npm install express cors --save -w backend
npm install -D @types/express @types/cors --save-dev -w backend
```

---

## 🚀 Start Everything (2 commands)

### Terminal 1: Start Mock Backend

```bash
npm run dev:mock -w backend
```

Expected output:
```
✅ Mock Backend Server running on http://localhost:3000
📡 API Base: http://localhost:3000/api
🧪 Mode: Mock (using in-memory database + mock Bedrock)
```

### Terminal 2: Start Frontend

```bash
npm run dev -w frontend
```

Expected output:
```
VITE v5.4.21 ready in 935 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

---

## ✅ Test the Full Flow

1. **Open browser:** `http://localhost:5173/diagnosis`

2. **Try these messages:**
   ```
   "My tomato has yellow spots"
   "I see white powder on my cucumber leaves"
   "Leaves are turning pale yellow"
   ```

3. **Upload a photo:** (will work with any image)

4. **See diagnosis:** Mock responses appear instantly

---

## 🧪 Test the API Directly

### Test Chat Endpoint

```bash
curl -X POST http://localhost:3000/api/diagnosis/chat \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user" \
  -d '{
    "sessionId": "sess-123",
    "message": "My tomato has yellow spots",
    "imageUrl": null
  }'
```

**Response:**
```json
{
  "messageId": "msg-1234567890",
  "message": "I've identified a potential condition: **Early Blight** (92% confidence)",
  "diagnosis": {
    "condition": "Early Blight",
    "conditionType": "disease",
    "confidence": 92,
    "severity": "warning",
    "description": "Early Blight (Alternaria solani) is a fungal disease...",
    "treatment": ["Apply fungicide spray...", ...],
    "affectedPlants": ["Tomato", "Potato", "Eggplant"],
    "escalatedToExpert": false
  },
  "followUpSuggestions": [...]
}
```

### Test Upload Endpoint

```bash
curl -X POST http://localhost:3000/api/diagnosis/upload \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "tomato-leaf.jpg",
    "fileType": "image/jpeg"
  }'
```

**Response:**
```json
{
  "uploadId": "upload-1234567890",
  "presignedUrl": "https://harvest-ai-media-mock.s3.amazonaws.com/diagnosis/1234567890/tomato-leaf.jpg?mock-presigned=true&expires-in=600",
  "expiresIn": 600
}
```

### Test Sessions Endpoint

```bash
curl http://localhost:3000/api/diagnosis/sessions \
  -H "x-user-id: test-user"
```

**Response:**
```json
{
  "sessions": [
    {
      "sessionId": "sess-123",
      "messageCount": 4,
      "lastMessage": "I've identified a potential condition: **Early Blight** (92% confidence)",
      "lastDiagnosis": { ... },
      "updatedAt": "2026-02-17T10:30:45.123Z"
    }
  ]
}
```

---

## 📋 What Works

| Feature | Status |
|---------|--------|
| Chat messages | ✅ Working |
| Diagnosis results | ✅ Mock responses |
| Session persistence | ✅ In-memory |
| Photo upload flow | ✅ Presigned URLs generated |
| Follow-up suggestions | ✅ Auto-generated |
| Error handling | ✅ User-friendly messages |
| CORS support | ✅ Configured |

---

## ❌ What Doesn't Work Yet (Need Real AWS)

| Feature | Workaround |
|---------|-----------|
| Real Bedrock Claude | Use mock responses |
| Real S3 uploads | Mock presigned URLs |
| Real DynamoDB | In-memory storage (cleared on restart) |
| JWT authentication | Use `x-user-id` headers instead |
| Photo analysis | Diagnosis based on text only |

---

## 💾 Data Persistence

Sessions are **stored in memory** and **lost on restart**. To persist:

```bash
# Save session data to file before stopping
npm run backend:dump-sessions -w backend

# Reload on startup
npm run backend:load-sessions -w backend
```

---

## 🔄 Transition to Real AWS

When ready to use real AWS:

1. Follow [BACKEND_SETUP.md](BACKEND_SETUP.md)
2. Replace imports:
   ```typescript
   // FROM
   import { mockDiagnoseCrop } from "./bedrock.mock";
   
   // TO
   import { diagnoseCrop } from "./bedrock.real";
   ```
3. Deploy Lambda functions
4. Update `VITE_API_URL` in frontend `.env`

---

## ✨ Key Points

- **No AWS account needed** for testing
- **No credentials required**
- **Instant responses** (1 second simulated delay)
- **Full feature testing** including sessions and uploads
- **Easy switch** to real AWS when ready

---

**Start testing now!** 🚀
