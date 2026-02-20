import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import axios from "axios";
import { DEFAULT_LANGUAGE_CODE } from "@harvest-ai/shared";
import { mockDiagnoseCrop } from "../tests/mocks/bedrock.mock.js";
import { mockGetSession, mockCreateSession, mockUpdateSession, mockGetUserSessions, } from "../tests/mocks/dynamodb.mock.js";
import { mockGeneratePresignedUrl, mockValidateFileType, } from "../tests/mocks/s3.mock.js";
import { mockFarmRecommendation } from "../tests/mocks/farmRecommendation.mock";
import { mockGetMarketPrices, mockGetMarketInsight } from "../tests/mocks/marketPrice.mock";
import { mockTranscribeAudio, mockVoiceChat } from "../tests/mocks/voice.mock";
import { VoiceChatService } from "./services/voice-chat/voiceChat.service";
import { fetchWorldBankData, enrichCommodity, WB_COMMODITY_IDS } from "./services/market-price/worldBank.service";
import { DiagnosisService } from "./services/diagnosis/diagnosis.service";
import { FarmRecommendationService } from "./services/farm-recommendation/farmRecommendation.service";
import { VoiceService } from "./services/voice/voice.service";
import { VOICE_CONSTANTS } from "./constants/voice.constants";
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
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: VOICE_CONSTANTS.MAX_AUDIO_SIZE_BYTES },
});
async function performDiagnosis(message, imageUrl, language) {
    if (USE_REAL_BEDROCK && diagnosisService) {
        const imageBase64 = imageUrl ? await fetchImageAsBase64(imageUrl) : undefined;
        return diagnosisService.diagnoseCrop(message, imageBase64, undefined, language);
    }
    return mockDiagnoseCrop(message, imageUrl);
}
async function fetchImageAsBase64(url) {
    try {
        const response = await axios.get(url, { responseType: "arraybuffer" });
        return Buffer.from(response.data).toString("base64");
    }
    catch {
        console.warn("[Bedrock] Could not fetch image, proceeding without it:", url);
        return undefined;
    }
}
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
}));
app.use(express.json());
// Middleware: Mock JWT validation + language extraction
app.use((req, res, next) => {
    const mockUserId = req.headers["x-user-id"] || `user-${Date.now()}`;
    const language = req.headers["x-language"] || DEFAULT_LANGUAGE_CODE;
    res.locals.userId = mockUserId;
    res.locals.language = language;
    next();
});
// Helper: Create user message
function createUserMessage(message, imageUrl) {
    const now = Date.now();
    const chatMessage = {
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
function createAssistantMessage(diagnosis) {
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
function generateFollowUpSuggestions(diagnosis) {
    return [
        `Tell me more about the ${diagnosis.condition}`,
        "How should I apply the treatment?",
        "Are there resistant varieties I can plant?",
    ];
}
// Helper: Enrich mock commodities with real World Bank data (5s timeout, graceful fallback)
async function enrichWithWorldBank(commodities) {
    try {
        const wbData = await Promise.race([
            fetchWorldBankData(),
            new Promise((_, reject) => setTimeout(() => reject(new Error("WB timeout")), 5000)),
        ]);
        return commodities.map((c) => {
            const pts = wbData.get(c.id);
            return pts ? enrichCommodity(c, pts) : c;
        });
    }
    catch (err) {
        console.warn("[WorldBank] Falling back to mock data:", err instanceof Error ? err.message : err);
        return commodities;
    }
}
// POST /api/diagnosis/chat
app.post("/api/diagnosis/chat", async (req, res) => {
    try {
        const { sessionId, message, imageUrl } = req.body;
        const userId = res.locals.userId;
        const language = res.locals.language;
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Internal server error",
            message: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
// GET /api/diagnosis/sessions
app.get("/api/diagnosis/sessions", async (req, res) => {
    try {
        const userId = res.locals.userId;
        const limit = parseInt(req.query.limit) || 10;
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to load sessions" });
    }
});
// POST /api/diagnosis/upload
app.post("/api/diagnosis/upload", async (req, res) => {
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to generate presigned URL" });
    }
});
// POST /api/farm-recommendation
app.post("/api/farm-recommendation", async (req, res) => {
    try {
        const request = req.body;
        const language = res.locals.language;
        if (!request.farmType || !request.climateZone || !request.season) {
            return res.status(400).json({ error: "Missing required fields: farmType, climateZone, season" });
        }
        const result = USE_REAL_BEDROCK && farmRecommendationService
            ? await farmRecommendationService.recommendFarm(request, language)
            : mockFarmRecommendation(request);
        return res.json(result);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
// GET /api/market-prices
app.get("/api/market-prices", async (_req, res) => {
    try {
        const { commodities } = mockGetMarketPrices();
        const enriched = await enrichWithWorldBank(commodities);
        return res.json({
            commodities: enriched,
            lastUpdated: new Date().toISOString(),
            worldBankCommodities: WB_COMMODITY_IDS,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to load market prices" });
    }
});
// POST /api/market-prices/insight
app.post("/api/market-prices/insight", (req, res) => {
    try {
        const body = req.body;
        if (!body.commodityId || !body.commodityName || body.currentPrice === undefined) {
            return res.status(400).json({ error: "commodityId, commodityName and currentPrice are required" });
        }
        return res.json(mockGetMarketInsight(body));
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to generate market insight" });
    }
});
// POST /api/voice/chat
app.post("/api/voice/chat", async (req, res) => {
    try {
        const { message, history = [] } = req.body;
        const language = res.locals.language;
        if (!message)
            return res.status(400).json({ error: "message is required" });
        const reply = USE_REAL_BEDROCK && voiceChatService
            ? await voiceChatService.chat(message, history, language)
            : mockVoiceChat(message);
        return res.json({ reply });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Voice chat failed" });
    }
});
// POST /api/voice/transcribe
app.post("/api/voice/transcribe", upload.single("audio"), async (req, res) => {
    try {
        const audioBuffer = req.file?.buffer;
        const languageCode = res.locals.language || DEFAULT_LANGUAGE_CODE;
        if (!audioBuffer || audioBuffer.length === 0) {
            return res.status(400).json({ error: "Missing audio file" });
        }
        const text = USE_REAL_BEDROCK && voiceService
            ? await voiceService.transcribeAudio(audioBuffer, languageCode)
            : mockTranscribeAudio(audioBuffer, languageCode);
        return res.json({ text, languageCode });
    }
    catch (error) {
        console.error(error);
        const isSubscription = error instanceof Error && error.name === "SubscriptionRequiredException";
        const message = isSubscription
            ? "AWS Transcribe is not enabled for this account. Add transcribe:StartStreamTranscription to your IAM policy."
            : "Voice transcription failed";
        return res.status(isSubscription ? 403 : 500).json({ error: message });
    }
});
// Health check
app.get("/health", (_req, res) => {
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
    console.log(`   GET    /health                      - Health check`);
    console.log(`\n🌐 Frontend: http://localhost:5173 or http://localhost:5174\n`);
});
//# sourceMappingURL=server.mock.js.map