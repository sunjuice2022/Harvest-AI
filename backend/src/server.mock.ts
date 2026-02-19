import express from "express";
import type { Express, Request, Response } from "express";
import cors from "cors";
import axios from "axios";
import type { ChatMessage, DiagnosisResult, FarmRecommendationRequest } from "@harvest-ai/shared";
import { mockDiagnoseCrop } from "../tests/mocks/bedrock.mock.js";
import {
  mockGetSession,
mockCreateSession,
  mockUpdateSession,
  mockGetUserSessions,
} from "../tests/mocks/dynamodb.mock.js";
import {
  mockGeneratePresignedUrl,
  mockValidateFileType,
} from "../tests/mocks/s3.mock.js";
import { mockFarmRecommendation } from "../tests/mocks/farmRecommendation.mock";
import { DiagnosisService } from "./services/diagnosis/diagnosis.service";

const USE_REAL_BEDROCK = process.env.USE_REAL_BEDROCK === "true";
const diagnosisService = USE_REAL_BEDROCK
  ? new DiagnosisService({ region: process.env.AWS_REGION || "us-east-1" })
  : null;

async function performDiagnosis(message: string, imageUrl?: string): Promise<DiagnosisResult> {
  if (USE_REAL_BEDROCK && diagnosisService) {
    const imageBase64 = imageUrl ? await fetchImageAsBase64(imageUrl) : undefined;
    return diagnosisService.diagnoseCrop(message, imageBase64);
  }
  return mockDiagnoseCrop(message, imageUrl);
}

async function fetchImageAsBase64(url: string): Promise<string | undefined> {
  try {
    const response = await axios.get<ArrayBuffer>(url, { responseType: "arraybuffer" });
    return Buffer.from(response.data).toString("base64");
  } catch {
    console.warn("[Bedrock] Could not fetch image, proceeding without it:", url);
    return undefined;
  }
}

const app: Express = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
  })
);
app.use(express.json());

// Middleware: Mock JWT validation (skip auth for testing)
app.use((req: Request, res: Response, next): void => {
  // Extract user ID from header or use mock
  const mockUserId = req.headers["x-user-id"] || `user-${Date.now()}`;
  res.locals.userId = mockUserId;
  next();
});

// Helper: Create user message
function createUserMessage(message: string, imageUrl?: string): ChatMessage {
  const now = Date.now();
  const chatMessage: ChatMessage = {
    id: `msg-${now}-user`,
    role: "user",
    content: message,
    timestamp: now,
  };
  if (imageUrl) {
    chatMessage.imageUrl = imageUrl;
  }
  return chatMessage;
}

// Helper: Create assistant message with diagnosis
function createAssistantMessage(diagnosis: any): ChatMessage {
  const now = Date.now();
  return {
    id: `msg-${now}-assistant`,
    role: "assistant",
    content: `I've identified a potential condition: **${diagnosis.condition}** (${diagnosis.confidence}% confidence)`,
    diagnosis,
    timestamp: now + 1,
  };
}

// Helper: Generate follow-up suggestions
function generateFollowUpSuggestions(diagnosis: any): string[] {
  return [
    `Tell me more about the ${diagnosis.condition}`,
    "How should I apply the treatment?",
    "Are there resistant varieties I can plant?",
  ];
}

// POST /api/diagnosis/chat
app.post("/api/diagnosis/chat", async (req: Request, res: Response) => {
  try {
    const { sessionId, message, imageUrl } = req.body;
    const userId = res.locals.userId as string;

    if (!message || !sessionId) {
      return res.status(400).json({
        error: "Missing required fields: sessionId, message",
      });
    }

    let session = await mockGetSession(userId, sessionId);
    if (!session) {
      session = await mockCreateSession(sessionId, userId);
    }

    const diagnosis = await performDiagnosis(message, imageUrl);
    const userMessage = createUserMessage(message, imageUrl);
    const assistantMessage = createAssistantMessage(diagnosis);

    session.messages.push(userMessage, assistantMessage);
    session.lastDiagnosis = diagnosis;
    await mockUpdateSession(session);

    return res.json({
      messageId: assistantMessage.id,
      message: assistantMessage.content,
      diagnosis,
      followUpSuggestions: generateFollowUpSuggestions(diagnosis),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
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

    return res.json({
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
    return res.status(500).json({ error: "Failed to load sessions" });
  }
});

// POST /api/diagnosis/upload
app.post("/api/diagnosis/upload", async (req: Request, res: Response) => {
  try {
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({ error: "Missing fileName or fileType" });
    }

    const isValid = await mockValidateFileType(fileType);
    if (!isValid) {
      return res.status(400).json({
        error: `Invalid file type: ${fileType}. Allowed: image/jpeg, image/png, image/webp`,
      });
    }

    const presignedUrl = await mockGeneratePresignedUrl(fileName, fileType);

    return res.json({
      uploadId: `upload-${Date.now()}`,
      presignedUrl,
      expiresIn: 600,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to generate presigned URL" });
  }
});

// POST /api/farm-recommendation
app.post("/api/farm-recommendation", (req: Request, res: Response) => {
  try {
    const request = req.body as FarmRecommendationRequest;

    if (!request.farmType || !request.climateZone || !request.season) {
      return res.status(400).json({ error: "Missing required fields: farmType, climateZone, season" });
    }

    const result = mockFarmRecommendation(request);
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    mode: USE_REAL_BEDROCK ? "real-bedrock (Claude 3.5 Sonnet)" : "mock (local testing)",
  });
});

// Start server
app.listen(PORT, () => {
  const mode = USE_REAL_BEDROCK
    ? `Real Bedrock AI (Claude 3.5 Sonnet) — region: ${process.env.AWS_REGION || "us-east-1"}`
    : "Mock (in-memory database + mock Bedrock)";
  console.log(`\n✅ Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 API Base: http://localhost:${PORT}/api`);
  console.log(`🧪 Mode: ${mode}`);
  console.log(`\n💡 Endpoints:`);
  console.log(`   POST   /api/diagnosis/chat          - Send message & get diagnosis`);
  console.log(`   GET    /api/diagnosis/sessions      - Load user sessions`);
  console.log(`   POST   /api/diagnosis/upload        - Get presigned URL for photo upload`);
  console.log(`   POST   /api/farm-recommendation     - Get crop & livestock recommendations`);
  console.log(`   GET    /health                      - Health check`);
  console.log(`\n🌐 Frontend: http://localhost:5173 or http://localhost:5174\n`);
});
