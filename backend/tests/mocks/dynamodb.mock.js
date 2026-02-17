// In-memory storage (replaces DynamoDB)
const mockDatabase = new Map();
export async function mockGetSession(userId, sessionId) {
    const key = `${userId}#${sessionId}`;
    const item = mockDatabase.get(key);
    if (!item)
        return null;
    const session = {
        sessionId,
        userId,
        messages: item.messages || [],
        createdAt: item.createdAt || Date.now(),
        updatedAt: item.updatedAt || Date.now(),
    };
    if (item.lastDiagnosis) {
        session.lastDiagnosis = item.lastDiagnosis;
    }
    return session;
}
export async function mockCreateSession(sessionId, userId) {
    const key = `${userId}#${sessionId}`;
    const now = Date.now();
    const session = {
        sessionId,
        userId,
        messages: [],
        createdAt: now,
        updatedAt: now,
    };
    mockDatabase.set(key, session);
    return session;
}
export async function mockUpdateSession(session) {
    const key = `${session.userId}#${session.sessionId}`;
    const updated = {
        ...session,
        updatedAt: Date.now(),
    };
    mockDatabase.set(key, updated);
    return session;
}
export async function mockGetUserSessions(userId, limit = 10) {
    // Filter all sessions for this user
    const userSessions = Array.from(mockDatabase.entries())
        .filter(([key]) => key.startsWith(`${userId}#`))
        .map(([, value]) => ({
        sessionId: value.sessionId,
        userId,
        messages: value.messages || [],
        lastDiagnosis: value.lastDiagnosis || null,
        createdAt: value.createdAt,
        updatedAt: value.updatedAt,
    }))
        .sort((a, b) => {
        const timeA = a.updatedAt || a.createdAt;
        const timeB = b.updatedAt || b.createdAt;
        return timeB - timeA; // Most recent first
    })
        .slice(0, limit);
    return userSessions;
}
export function mockClearDatabase() {
    mockDatabase.clear();
}
export function mockGetDatabaseSize() {
    return mockDatabase.size;
}
//# sourceMappingURL=dynamodb.mock.js.map