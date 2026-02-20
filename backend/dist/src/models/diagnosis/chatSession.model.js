/**
 * Diagnosis data models for storage and API contracts
 */
import { DIAGNOSIS_CONSTANTS } from "../../constants/diagnosis.constants";
export function toChatSession(item) {
    return {
        sessionId: item.SK,
        userId: item.PK,
        messages: item.messages,
        lastDiagnosis: item.lastDiagnosis,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
    };
}
export function toChatSessionItem(session) {
    const ttl = Math.floor(Date.now() / 1000) + DIAGNOSIS_CONSTANTS.SESSION_EXPIRY_DAYS * 24 * 60 * 60;
    return {
        PK: session.userId,
        SK: session.sessionId,
        messages: session.messages,
        lastDiagnosis: session.lastDiagnosis,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        ttl,
    };
}
//# sourceMappingURL=chatSession.model.js.map