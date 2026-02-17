import express from "express";
import cors from "cors";
import { mockDiagnoseCrop } from "../tests/mocks/bedrock.mock";
import { mockGetSession, mockCreateSession, mockUpdateSession, mockGetUserSessions, } from "../tests/mocks/dynamodb.mock";
import { mockGeneratePresignedUrl, mockValidateFileType, } from "../tests/mocks/s3.mock";
const app = express();
const PORT = 3000;
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
}));
app.use(express.json());
// Middleware: Mock JWT validation (skip auth for testing)
app.use((req, res, next) => {
    // Extract user ID from header or use mock
    const mockUserId = req.headers["x-user-id"] || `user-${Date.now()}`;
    res.locals.userId = mockUserId;
    next();
});
// POST /api/diagnosis/chat
app.post("/api/diagnosis/chat", async (req, res) => {
    try {
        const { sessionId, message, imageUrl } = req.body;
        const userId = res.locals.userId;
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
        const now = Date.now();
        const userMessage = {
            id: `msg-${now}-user`,
            role: "user",
            content: message,
            imageUrl,
            timestamp: now,
        };
        const assistantMessage = {
            id: `msg-${now}-assistant`,
            role: "assistant",
            content: `I've identified a potential condition: **${diagnosis.condition}** (${diagnosis.confidence}% confidence)`,
            diagnosis,
            timestamp: now + 1,
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
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
        res.json({
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
        res.status(500).json({ error: "Failed to load sessions" });
    }
});
// POST /api/diagnosis/upload
app.post("/api/diagnosis/upload", async (req, res) => {
    try {
        const { fileName, fileType } = req.body;
        const userId = res.locals.userId;
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to generate presigned URL" });
    }
});
// Health check
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        mode: "mock (local testing)",
    });
});
// Start server
app.listen(PORT, () => {
    console.log(`\n✅ Mock Backend Server running on http://localhost:${PORT}`);
    console.log(`📡 API Base: http://localhost:${PORT}/api`);
    console.log(`🧪 Mode: Mock (using in-memory database + mock Bedrock)`);
    console.log(`\n💡 Endpoints:`);
    console.log(`   POST   /api/diagnosis/chat          - Send message & get diagnosis`);
    console.log(`   GET    /api/diagnosis/sessions      - Load user sessions`);
    console.log(`   POST   /api/diagnosis/upload        - Get presigned URL for photo upload`);
    console.log(`   GET    /health                      - Health check`);
    console.log(`\n🌐 Frontend: http://localhost:5173/diagnosis\n`);
});
//# sourceMappingURL=server.mock.js.map