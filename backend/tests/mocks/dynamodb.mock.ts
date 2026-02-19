import type { ChatSession, ChatMessage } from "@harvest-ai/shared";

// In-memory storage (replaces DynamoDB)
const mockDatabase = new Map<string, ChatSession>();

export async function mockGetSession(
  userId: string,
  sessionId: string
): Promise<ChatSession | null> {
  const key = `${userId}#${sessionId}`;
  const item = mockDatabase.get(key);

  if (!item) return null;

  const session: ChatSession = {
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

export async function mockCreateSession(
  sessionId: string,
  userId: string
): Promise<ChatSession> {
  const key = `${userId}#${sessionId}`;
  const now = Date.now();

  const session: ChatSession = {
    sessionId,
    userId,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };

  mockDatabase.set(key, session);
  return session;
}

export async function mockUpdateSession(
  session: ChatSession
): Promise<ChatSession> {
  const key = `${session.userId}#${session.sessionId}`;
  const updated = {
    ...session,
    updatedAt: Date.now(),
  };

  mockDatabase.set(key, updated);
  return session;
}

export async function mockGetUserSessions(
  userId: string,
  limit: number = 10
): Promise<ChatSession[]> {
  // Filter all sessions for this user
  const userSessions = Array.from(mockDatabase.entries())
    .filter(([key]) => key.startsWith(`${userId}#`))
    .map(([, value]) => {
      const session: ChatSession = {
        sessionId: value.sessionId,
        userId,
        messages: value.messages || [],
        createdAt: value.createdAt,
        updatedAt: value.updatedAt,
      };
      if (value.lastDiagnosis) {
        session.lastDiagnosis = value.lastDiagnosis;
      }
      return session;
    })
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
