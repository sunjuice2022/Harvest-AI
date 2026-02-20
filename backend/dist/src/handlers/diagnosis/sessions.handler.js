/**
 * Lambda handler for GET /api/diagnosis/sessions
 * Returns chat session list and detail
 */
import { ChatSessionRepository } from "../../repositories/diagnosis/chatSession.repository";
const sessionRepository = new ChatSessionRepository();
export async function getSessions(event) {
    try {
        // Extract user ID from Cognito authorizer or x-user-id header (dev)
        const userId = event.requestContext?.authorizer?.claims?.sub ||
            event.headers?.["x-user-id"];
        if (!userId) {
            return errorResponse(401, "Unauthorized");
        }
        // Check if requesting specific session
        const sessionId = event.pathParameters?.sessionId;
        if (sessionId) {
            return getSessionDetail(userId, sessionId);
        }
        // Return list of sessions
        const limit = event.queryStringParameters?.limit ? parseInt(event.queryStringParameters.limit) : 10;
        const sessions = await sessionRepository.getUserSessions(userId, limit);
        return successResponse({
            sessions: sessions.map(formatSessionForList),
            count: sessions.length,
        });
    }
    catch (error) {
        console.error("Error in getSessions:", error);
        return errorResponse(500, "Internal server error");
    }
}
async function getSessionDetail(userId, sessionId) {
    const session = await sessionRepository.getSession(userId, sessionId);
    if (!session) {
        return errorResponse(404, "Session not found");
    }
    return successResponse(formatSessionDetail(session));
}
function formatSessionForList(session) {
    return {
        sessionId: session.sessionId,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        messageCount: session.messages.length,
        lastMessage: session.messages[session.messages.length - 1],
        lastDiagnosis: session.lastDiagnosis,
    };
}
function formatSessionDetail(session) {
    return {
        sessionId: session.sessionId,
        messages: session.messages,
        lastDiagnosis: session.lastDiagnosis,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
    };
}
function successResponse(data) {
    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };
}
function errorResponse(statusCode, message) {
    return {
        statusCode,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: message }),
    };
}
//# sourceMappingURL=sessions.handler.js.map