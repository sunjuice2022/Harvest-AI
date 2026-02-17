/**
 * Lambda handler for POST /api/diagnosis/chat
 * Handles diagnosis requests with text and/or image
 */
import { ChatSessionRepository } from "../../repositories/diagnosis/chatSession.repository";
import { DiagnosisService } from "../../services/diagnosis/diagnosis.service";
import { randomUUID } from "crypto";
const sessionRepository = new ChatSessionRepository();
const diagnosisService = new DiagnosisService();
export async function diagnosisChat(event) {
    try {
        // Extract user ID from Cognito authorizer
        const userId = event.requestContext?.authorizer?.claims?.sub;
        if (!userId) {
            return errorResponse(401, "Unauthorized");
        }
        // Parse request
        const request = JSON.parse(event.body || "{}");
        if (!request.message) {
            return errorResponse(400, "Message is required");
        }
        // Get or create session
        let session;
        if (request.sessionId) {
            const existing = await sessionRepository.getSession(userId, request.sessionId);
            if (!existing) {
                return errorResponse(404, "Session not found");
            }
            session = existing;
        }
        else {
            session = {
                sessionId: randomUUID(),
                userId,
                messages: [],
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
            await sessionRepository.createSession(session);
        }
        // Get diagnosis from Bedrock
        const diagnosis = await diagnosisService.diagnoseCrop(request.message, request.imageUrl ? await convertImageUrlToBase64(request.imageUrl) : undefined, session.messages);
        // Create message records
        const userMessage = {
            id: randomUUID(),
            role: "user",
            content: request.message,
            imageUrl: request.imageUrl,
            timestamp: Date.now(),
        };
        const assistantMessage = {
            id: randomUUID(),
            role: "assistant",
            content: formatDiagnosisAsText(diagnosis),
            timestamp: Date.now(),
            diagnosis,
        };
        // Update session
        session.messages.push(userMessage, assistantMessage);
        session.lastDiagnosis = diagnosis;
        session.updatedAt = Date.now();
        await sessionRepository.updateSession(session);
        // Build response
        const response = {
            messageId: assistantMessage.id,
            diagnosis,
            followUpSuggestions: generateFollowUpSuggestions(diagnosis),
        };
        return successResponse(response);
    }
    catch (error) {
        console.error("Error in diagnosisChat:", error);
        return errorResponse(500, "Internal server error");
    }
}
function formatDiagnosisAsText(diagnosis) {
    const parts = [
        `**${diagnosis.condition}** (${diagnosis.confidence}% confidence)`,
        `Severity: ${diagnosis.severity.toUpperCase()}`,
        `\n${diagnosis.description}`,
        `\n**Treatment:**`,
        diagnosis.treatment.map((t) => `• ${t}`).join("\n"),
    ];
    if (diagnosis.organicAlternatives?.length) {
        parts.push(`\n**Organic Alternatives:**`);
        parts.push(diagnosis.organicAlternatives.map((alt) => `• ${alt}`).join("\n"));
    }
    if (diagnosis.preventionTips?.length) {
        parts.push(`\n**Prevention Tips:**`);
        parts.push(diagnosis.preventionTips.map((tip) => `• ${tip}`).join("\n"));
    }
    return parts.join("\n");
}
function generateFollowUpSuggestions(diagnosis) {
    const suggestions = [];
    if (diagnosis.confidence < 60) {
        suggestions.push("Take another photo from a different angle for better diagnosis");
    }
    if (diagnosis.treatment.length > 0) {
        suggestions.push("What is your current treatment approach?");
    }
    if (diagnosis.severity === "critical") {
        suggestions.push("Would you like to escalate this to an agricultural expert?");
    }
    return suggestions;
}
async function convertImageUrlToBase64(imageUrl) {
    // This would fetch the image from S3 or external URL and convert to base64
    // For now, return empty string - implement based on your image storage
    return "";
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
//# sourceMappingURL=diagnosis.handler.js.map