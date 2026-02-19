import type { ChatSession } from "@harvest-ai/shared";
export declare function mockGetSession(userId: string, sessionId: string): Promise<ChatSession | null>;
export declare function mockCreateSession(sessionId: string, userId: string): Promise<ChatSession>;
export declare function mockUpdateSession(session: ChatSession): Promise<ChatSession>;
export declare function mockGetUserSessions(userId: string, limit?: number): Promise<ChatSession[]>;
export declare function mockClearDatabase(): void;
export declare function mockGetDatabaseSize(): number;
//# sourceMappingURL=dynamodb.mock.d.ts.map