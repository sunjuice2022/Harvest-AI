import dotenv from "dotenv";
import { resolve } from "path";
// Load root .env (backend runs from backend/ dir, so step up two levels from tests/)
dotenv.config({ path: resolve(__dirname, "../../.env") });
import express from "express";
import type { Express, Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import axios from "axios";
import type {
  ChatMessage,
  DiagnosisResult,
  FarmRecommendationRequest,
  MarketInsightRequest,
  VoiceLanguageCode,
} from "@agrisense/shared";
import { DEFAULT_LANGUAGE_CODE } from "@agrisense/shared";
import { mockDiagnoseCrop } from "./mocks/bedrock.mock.js";
import {
  mockGetSession,
  mockCreateSession,
  mockUpdateSession,
  mockGetUserSessions,
} from "./mocks/dynamodb.mock.js";
import {
  mockGeneratePresignedUrl,
  mockValidateFileType,
} from "./mocks/s3.mock.js";
import { mockFarmRecommendation } from "./mocks/farmRecommendation.mock";
import { mockGetMarketPrices, mockGetMarketInsight } from "./mocks/marketPrice.mock";
import { mockTranscribeAudio, mockVoiceChat } from "./mocks/voice.mock";
import { VoiceChatService } from "../src/services/voice-chat/voiceChat.service";
import type { HistoryItem } from "../src/services/voice-chat/voiceChat.service";
import { fetchWorldBankData, enrichCommodity, WB_COMMODITY_IDS } from "../src/services/market-price/worldBank.service";
import { DiagnosisService } from "../src/services/diagnosis/diagnosis.service";
import { FarmRecommendationService } from "../src/services/farm-recommendation/farmRecommendation.service";
import { VoiceService } from "../src/services/voice/voice.service";
import { PollyService, type PollyVoiceInfo } from "../src/services/voice/polly.service";
import { VOICE_CONSTANTS } from "../src/constants/voice.constants";
import { WeatherService } from "../src/services/weather/weather.service";
import { WeatherBedrockService } from "../src/services/weather/weatherBedrock.service";
import { WeatherNotificationService } from "../src/services/weather/weatherNotification.service";
import type { WeatherAlert } from "@agrisense/shared";
import { ALERT_THRESHOLDS } from "../src/constants/weather.constants";

const USE_REAL_BEDROCK = process.env.USE_REAL_BEDROCK === "true";
const awsRegion = process.env.AWS_REGION || "ap-southeast-2";

const diagnosisService = USE_REAL_BEDROCK
  ? new DiagnosisService({ region: awsRegion })
  : null;
const farmRecommendationService = USE_REAL_BEDROCK
  ? new FarmRecommendationService({ region: awsRegion })
  : null;
const voiceService = USE_REAL_BEDROCK
  ? new VoiceService({ region: awsRegion })
  : null;
const voiceChatService = USE_REAL_BEDROCK
  ? new VoiceChatService({ region: awsRegion })
  : null;
const pollyService = USE_REAL_BEDROCK
  ? new PollyService({ region: awsRegion })
  : null;

// Weather services — wired when USE_REAL_BEDROCK=true
const weatherService = USE_REAL_BEDROCK
  ? new WeatherService({
      apiBaseUrl: process.env.WEATHER_API_BASE_URL ?? "https://api.openweathermap.org/data/3.0",
      apiKey: process.env.WEATHER_API_KEY ?? "",
      highTempThreshold: Number(process.env.WEATHER_HIGH_TEMP ?? "35"),
      lowTempThreshold: Number(process.env.WEATHER_LOW_TEMP ?? "5"),
      pollIntervalMinutes: Number(process.env.WEATHER_POLL_INTERVAL ?? "30"),
    })
  : null;

const weatherBedrockService =
  USE_REAL_BEDROCK && process.env.BEDROCK_MODEL_ID
    ? new WeatherBedrockService({ modelId: process.env.BEDROCK_MODEL_ID, region: awsRegion })
    : null;

const weatherNotificationService =
  USE_REAL_BEDROCK && process.env.SNS_ALERT_TOPIC_ARN
    ? new WeatherNotificationService({
        topicArn: process.env.SNS_ALERT_TOPIC_ARN,
        ...(process.env.ALERT_PHONE_NUMBER ? { phoneNumber: process.env.ALERT_PHONE_NUMBER } : {}),
      })
    : null;

// In-memory alert store keyed by userId (replaces DynamoDB in local dev)
const inMemoryAlerts = new Map<string, WeatherAlert[]>();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: VOICE_CONSTANTS.MAX_AUDIO_SIZE_BYTES },
});

async function performDiagnosis(message: string, imageUrl: string | undefined, language: string): Promise<DiagnosisResult> {
  if (USE_REAL_BEDROCK && diagnosisService) {
    const imageBase64 = imageUrl ? await fetchImageAsBase64(imageUrl) : undefined;
    return diagnosisService.diagnoseCrop(message, imageBase64, undefined, language);
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

// Middleware: Mock JWT validation + language extraction
app.use((req: Request, res: Response, next): void => {
  const mockUserId = req.headers["x-user-id"] || `user-${Date.now()}`;
  const language = (req.headers["x-language"] as string) || DEFAULT_LANGUAGE_CODE;
  res.locals.userId = mockUserId;
  res.locals.language = language;
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
function createAssistantMessage(diagnosis: DiagnosisResult): ChatMessage {
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
function generateFollowUpSuggestions(diagnosis: DiagnosisResult): string[] {
  return [
    `Tell me more about the ${diagnosis.condition}`,
    "How should I apply the treatment?",
    "Are there resistant varieties I can plant?",
  ];
}

// Helper: Enrich mock commodities with real World Bank data (5s timeout, graceful fallback)
async function enrichWithWorldBank(commodities: ReturnType<typeof mockGetMarketPrices>["commodities"]) {
  try {
    const wbData = await Promise.race([
      fetchWorldBankData(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("WB timeout")), 5000)),
    ]);
    return commodities.map((c) => {
      const pts = wbData.get(c.id);
      return pts ? enrichCommodity(c, pts) : c;
    });
  } catch (err) {
    console.warn("[WorldBank] Falling back to mock data:", err instanceof Error ? err.message : err);
    return commodities;
  }
}

// POST /api/diagnosis/chat
app.post("/api/diagnosis/chat", async (req: Request, res: Response) => {
  try {
    const { sessionId, message, imageUrl } = req.body;
    const userId = res.locals.userId as string;
    const language = res.locals.language as string;

    if (!message || !sessionId) {
      return res.status(400).json({
        error: "Missing required fields: sessionId, message",
      });
    }

    let session = await mockGetSession(userId, sessionId);
    if (!session) {
      session = await mockCreateSession(sessionId, userId);
    }

    const diagnosis = await performDiagnosis(message, imageUrl, language);
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
app.post("/api/farm-recommendation", async (req: Request, res: Response) => {
  try {
    const request = req.body as FarmRecommendationRequest;
    const language = res.locals.language as string;

    if (!request.farmType || !request.climateZone || !request.season) {
      return res.status(400).json({ error: "Missing required fields: farmType, climateZone, season" });
    }

    const result =
      USE_REAL_BEDROCK && farmRecommendationService
        ? await farmRecommendationService.recommendFarm(request, language)
        : mockFarmRecommendation(request);
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/market-prices
app.get("/api/market-prices", async (_req: Request, res: Response) => {
  try {
    const { commodities } = mockGetMarketPrices();
    const enriched = await enrichWithWorldBank(commodities);
    return res.json({
      commodities: enriched,
      lastUpdated: new Date().toISOString(),
      worldBankCommodities: WB_COMMODITY_IDS,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to load market prices" });
  }
});

// POST /api/market-prices/insight
app.post("/api/market-prices/insight", (req: Request, res: Response) => {
  try {
    const body = req.body as Partial<MarketInsightRequest>;
    if (!body.commodityId || !body.commodityName || body.currentPrice === undefined) {
      return res.status(400).json({ error: "commodityId, commodityName and currentPrice are required" });
    }
    return res.json(mockGetMarketInsight(body as MarketInsightRequest));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to generate market insight" });
  }
});

/** Static voice list shown in mock mode (en-AU equivalents). */
const MOCK_VOICES: PollyVoiceInfo[] = [
  { id: "Olivia",  name: "Olivia",  gender: "Female", engine: "neural"   },
  { id: "Nicole",  name: "Nicole",  gender: "Female", engine: "standard" },
  { id: "Russell", name: "Russell", gender: "Male",   engine: "standard" },
];

// GET /api/voice/voices — Polly alive check + available voices for current language
app.get("/api/voice/voices", async (_req: Request, res: Response) => {
  const language = res.locals.language as string;

  if (!USE_REAL_BEDROCK || !pollyService) {
    return res.json({ status: "mock", voices: MOCK_VOICES });
  }

  try {
    const voices = await pollyService.listVoices(language);
    return res.json({ status: "live", voices });
  } catch (error) {
    console.error("[Polly listVoices]", error);
    return res.json({ status: "error", voices: [] });
  }
});

// POST /api/voice/chat
app.post("/api/voice/chat", async (req: Request, res: Response) => {
  try {
    const { message, history = [] } = req.body as { message: string; history: HistoryItem[] };
    const language = res.locals.language as string;
    if (!message) return res.status(400).json({ error: "message is required" });
    const reply = USE_REAL_BEDROCK && voiceChatService
      ? await voiceChatService.chat(message, history, language)
      : mockVoiceChat(message);
    return res.json({ reply });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Voice chat failed" });
  }
});

// POST /api/voice/transcribe
app.post("/api/voice/transcribe", upload.single("audio"), async (req: Request, res: Response) => {
  try {
    const audioBuffer = req.file?.buffer;
    const languageCode = (res.locals.language as VoiceLanguageCode) || DEFAULT_LANGUAGE_CODE;

    if (!audioBuffer || audioBuffer.length === 0) {
      return res.status(400).json({ error: "Missing audio file" });
    }

    const text = USE_REAL_BEDROCK && voiceService
      ? await voiceService.transcribeAudio(audioBuffer, languageCode)
      : mockTranscribeAudio(audioBuffer, languageCode);

    return res.json({ text, languageCode });
  } catch (error) {
    console.error(error);
    const isSubscription = error instanceof Error && error.name === "SubscriptionRequiredException";
    const message = isSubscription
      ? "AWS Transcribe is not enabled for this account. Add transcribe:StartStreamTranscription to your IAM policy."
      : "Voice transcription failed";
    return res.status(isSubscription ? 403 : 500).json({ error: message });
  }
});

// POST /api/voice/speak — Juna speaks via Amazon Polly (Neural TTS)
app.post("/api/voice/speak", async (req: Request, res: Response) => {
  try {
    const { text, voiceId, engine } = req.body as {
      text?: string;
      voiceId?: string;
      engine?: string;
    };
    const language = res.locals.language as string;

    if (!text?.trim()) {
      return res.status(400).json({ error: "text is required" });
    }

    if (!USE_REAL_BEDROCK || !pollyService) {
      // Mock mode — no audio available yet; frontend will stay silent gracefully
      return res.status(204).end();
    }

    const override =
      voiceId
        ? { voiceId, engine: (engine === "standard" ? "standard" : "neural") as "neural" | "standard" }
        : undefined;

    const audioBuffer = await pollyService.synthesizeSpeech(text.trim(), language, override);
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", audioBuffer.length);
    res.setHeader("Cache-Control", "no-store");
    return res.send(audioBuffer);
  } catch (error) {
    console.error("[Polly]", error);
    return res.status(500).json({ error: "Speech synthesis failed" });
  }
});

// GET /api/weather/forecast?lat=x&lng=y
app.get("/api/weather/forecast", async (req: Request, res: Response) => {
  const lat = parseFloat(req.query.lat as string) || -37.8136;
  const lng = parseFloat(req.query.lng as string) || 144.9631;
  const userId = res.locals.userId as string;

  if (USE_REAL_BEDROCK && weatherService) {
    try {
      const rawForecast = await weatherService.fetchForecast({ lat, lng });
      const forecast = weatherService.parseForecast(rawForecast);

      // Evaluate thresholds and enrich with Bedrock, then store alerts in memory
      const recommendations = weatherService.evaluateAlertConditions(rawForecast, {
        highTempThreshold: ALERT_THRESHOLDS.HIGH_TEMP_CELSIUS,
        lowTempThreshold: ALERT_THRESHOLDS.LOW_TEMP_CELSIUS,
      });
      const enriched = recommendations.length > 0 && weatherBedrockService
        ? await weatherBedrockService.enrichRecommendations(recommendations, forecast)
        : recommendations;

      if (enriched.length > 0) {
        const now = new Date().toISOString();
        const newAlerts: WeatherAlert[] = enriched.map((a, i) => ({
          alertId: `alert-${Date.now()}-${i}`,
          userId,
          type: a.type,
          severity: a.severity,
          message: a.message,
          recommendation: a.recommendation,
          acknowledged: false,
          createdAt: now,
        }));
        inMemoryAlerts.set(userId, [...(inMemoryAlerts.get(userId) ?? []), ...newAlerts]);

        // Send SNS notifications if configured
        if (weatherNotificationService) {
          weatherNotificationService.sendAlertNotifications(enriched).catch((err: Error) =>
            console.warn("[SNS] Notification failed:", err.message)
          );
        }
      }

      const advisory = weatherBedrockService
        ? await weatherBedrockService.generateDailyAdvisory(forecast, lat)
        : undefined;

      return res.json({ forecast, ...(advisory ? { advisory } : {}) });
    } catch (err) {
      console.error("[Weather] Real fetch failed, falling back to mock:", err);
    }
  }

  // Mock fallback
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      date: d.toISOString().split("T")[0],
      tempHigh: 22 + Math.round(Math.random() * 8),
      tempLow: 12 + Math.round(Math.random() * 5),
      humidity: 55 + Math.round(Math.random() * 25),
      windSpeed: 10 + Math.round(Math.random() * 15),
      rainMm: Math.random() > 0.6 ? Math.round(Math.random() * 20) : 0,
      condition: (["Sunny", "Partly cloudy", "Overcast", "Light rain"] as const)[Math.floor(Math.random() * 4)] ?? "Sunny",
      icon: (["01d", "02d", "03d", "10d"] as const)[Math.floor(Math.random() * 4)] ?? "01d",
    };
  });
  return res.json({
    forecast: {
      location: { lat, lng },
      current: { temperature: 20, feelsLike: 19, humidity: 62, windSpeed: 14, condition: "Partly cloudy", icon: "02d" },
      days,
      fetchedAt: new Date().toISOString(),
    },
  });
});

// GET /api/weather/alerts
app.get("/api/weather/alerts", (req: Request, res: Response) => {
  const userId = res.locals.userId as string;
  const stored = (inMemoryAlerts.get(userId) ?? []).filter((a) => !a.acknowledged);

  // In mock mode, inject a demo alert so the UI section is visible
  if (!USE_REAL_BEDROCK && stored.length === 0) {
    const demo: WeatherAlert = {
      alertId: "demo-alert-001",
      userId,
      type: "high_temp",
      severity: "warning",
      message: "High temperature alert: 37°C forecast in the next 3 days.",
      recommendation:
        "Increase irrigation frequency, apply shade nets to sensitive crops, and avoid working in the field during peak afternoon heat (12–3pm).",
      acknowledged: false,
      createdAt: new Date().toISOString(),
    };
    return res.json({ alerts: [demo] });
  }

  return res.json({ alerts: stored });
});

// PUT /api/weather/alerts/:alertId/acknowledge
app.put("/api/weather/alerts/:alertId/acknowledge", (req: Request, res: Response) => {
  const userId = res.locals.userId as string;
  const { alertId } = req.params;
  const userAlerts = inMemoryAlerts.get(userId) ?? [];
  inMemoryAlerts.set(
    userId,
    userAlerts.map((a) => (a.alertId === alertId ? { ...a, acknowledged: true } : a))
  );
  return res.json({ alertId, acknowledged: true });
});

// POST /api/weather/subscribe
app.post("/api/weather/subscribe", async (req: Request, res: Response) => {
  const { email, phone } = req.body as { email?: string; phone?: string };

  if (!email && !phone) {
    return res.status(400).json({ error: "email or phone is required" });
  }

  if (USE_REAL_BEDROCK && weatherNotificationService) {
    try {
      let subscriptionArn = "";
      let pendingConfirmation = false;
      if (email) {
        const result = await weatherNotificationService.subscribeEmail(email);
        subscriptionArn = result.subscriptionArn;
        pendingConfirmation = result.pendingConfirmation;
      }
      if (phone) {
        const result = await weatherNotificationService.subscribePhone(phone);
        subscriptionArn = result.subscriptionArn;
      }
      return res.json({ subscriptionArn, pendingConfirmation });
    } catch (err) {
      console.error("[SNS] Subscribe failed:", err);
      return res.status(500).json({ error: "Subscription failed" });
    }
  }

  // Mock mode — simulate successful subscription
  console.log(`[Mock] Alert subscription: email=${email ?? "—"}, phone=${phone ?? "—"}`);
  return res.json({ subscriptionArn: "arn:aws:sns:ap-southeast-2:mock:WeatherAlerts:mock-sub-001", pendingConfirmation: !!email });
});

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    mode: USE_REAL_BEDROCK ? `Real Bedrock AI + Transcribe — region: ${awsRegion}` : "Mock (local testing)",
  });
});

// Start server
app.listen(PORT, () => {
  const mode = USE_REAL_BEDROCK
    ? `Real Bedrock AI (Claude) + AWS Transcribe — region: ${awsRegion}`
    : "Mock (in-memory database + mock Bedrock)";
  console.log(`\n✅ Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 API Base: http://localhost:${PORT}/api`);
  console.log(`🧪 Mode: ${mode}`);
  console.log(`\n💡 Endpoints:`);
  console.log(`   POST   /api/diagnosis/chat          - Send message & get diagnosis`);
  console.log(`   GET    /api/diagnosis/sessions      - Load user sessions`);
  console.log(`   POST   /api/diagnosis/upload        - Get presigned URL for photo upload`);
  console.log(`   POST   /api/farm-recommendation     - Get crop & livestock recommendations`);
  console.log(`   GET    /api/market-prices           - Get all commodity prices`);
  console.log(`   POST   /api/market-prices/insight   - Get AI insight for a commodity`);
  console.log(`   POST   /api/voice/chat              - Multilingual agricultural chatbot`);
  console.log(`   POST   /api/voice/transcribe        - Transcribe audio to text (multilingual)`);
  console.log(`   POST   /api/voice/speak             - Juna speaks via Amazon Polly (Neural TTS)`);
  console.log(`   GET    /api/voice/voices            - Polly alive check + available voices`);
  console.log(`   GET    /health                      - Health check`);
  console.log(`\n🌐 Frontend: http://localhost:5173 or http://localhost:5174\n`);
});
