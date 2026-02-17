/**
 * ChatSession repository - handles DynamoDB operations
 */
import type { ChatSession } from "@agrisense/shared";
export declare class ChatSessionRepository {
    private docClient;
    private tableName;
    constructor(region?: string);
    getSession(userId: string, sessionId: string): Promise<ChatSession | null>;
    createSession(session: ChatSession): Promise<void>;
    updateSession(session: ChatSession): Promise<void>;
    getUserSessions(userId: string, limit?: number): Promise<ChatSession[]>;
}
//# sourceMappingURL=chatSession.repository.d.ts.map