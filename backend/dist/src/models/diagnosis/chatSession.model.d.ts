/**
 * Diagnosis data models for storage and API contracts
 */
import type { ChatSession, DiagnosisResult } from "@harvest-ai/shared";
export interface ChatSessionItem {
    PK: string;
    SK: string;
    messages: ChatMessageItem[];
    lastDiagnosis?: DiagnosisResult;
    createdAt: number;
    updatedAt: number;
    ttl: number;
}
export interface ChatMessageItem {
    id: string;
    role: "user" | "assistant";
    content: string;
    imageUrl?: string;
    timestamp: number;
    diagnosis?: DiagnosisResult;
}
export declare function toChatSession(item: ChatSessionItem): ChatSession;
export declare function toChatSessionItem(session: ChatSession): ChatSessionItem;
//# sourceMappingURL=chatSession.model.d.ts.map