/**
 * Lambda handler for GET /api/diagnosis/sessions
 * Returns chat session list and detail
 */

import { ChatSessionRepository } from '../../repositories/diagnosis/chatSession.repository';
import type { ChatSession } from '@harvest-ai/shared';
import {
  APIGatewayProxyEvent, APIGatewayProxyResult,
  successResponse, errorResponse, extractUserId,
} from '../../types/api/apiGateway.types';

const sessionRepository = new ChatSessionRepository();
const SESSION_LIST_DEFAULT_LIMIT = 10;

export async function getSessions(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const userId = extractUserId(event);
    if (!userId) return errorResponse(401, 'Unauthorized');

    const sessionId = event.pathParameters?.sessionId;
    if (sessionId) return await getSessionDetail(userId, sessionId);

    const limit = event.queryStringParameters?.limit
      ? parseInt(event.queryStringParameters.limit)
      : SESSION_LIST_DEFAULT_LIMIT;

    const sessions = await sessionRepository.getUserSessions(userId, limit);
    return successResponse({ sessions: sessions.map(formatSessionForList), count: sessions.length });
  } catch (error) {
    console.error('[getSessions] error:', error);
    return errorResponse(500, 'Internal server error');
  }
}

async function getSessionDetail(userId: string, sessionId: string): Promise<APIGatewayProxyResult> {
  const session = await sessionRepository.getSession(userId, sessionId);
  if (!session) return errorResponse(404, 'Session not found');
  return successResponse(formatSessionDetail(session));
}

function formatSessionForList(session: ChatSession): Record<string, unknown> {
  return {
    sessionId: session.sessionId,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    messageCount: session.messages.length,
    lastMessage: session.messages[session.messages.length - 1],
    lastDiagnosis: session.lastDiagnosis,
  };
}

function formatSessionDetail(session: ChatSession): Record<string, unknown> {
  return {
    sessionId: session.sessionId,
    messages: session.messages,
    lastDiagnosis: session.lastDiagnosis,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}
