/**
 * Lambda handler for GET /api/diagnosis/sessions
 * Returns chat session list and detail
 */

import { ChatSessionRepository } from "../../repositories/diagnosis/chatSession.repository";
import type { ChatSession } from "@agrisense/shared";

const sessionRepository = new ChatSessionRepository();

interface APIGatewayProxyEvent {
  pathParameters?: Record<string, string> | null;
  queryStringParameters?: Record<string, string> | null;
  requestContext?: {
    authorizer?: {
      claims?: {
        sub?: string;
      };
    };
  };
}

interface APIGatewayProxyResult {
  statusCode: number;
  body: string;
  headers?: Record<string, string>;
}

export async function getSessions(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    // Extract user ID from Cognito authorizer
    const userId = event.requestContext?.authorizer?.claims?.sub;
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
  } catch (error) {
    console.error("Error in getSessions:", error);
    return errorResponse(500, "Internal server error");
  }
}

async function getSessionDetail(userId: string, sessionId: string): Promise<APIGatewayProxyResult> {
  const session = await sessionRepository.getSession(userId, sessionId);

  if (!session) {
    return errorResponse(404, "Session not found");
  }

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

function successResponse(data: Record<string, unknown>): APIGatewayProxyResult {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
}

function errorResponse(statusCode: number, message: string): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ error: message }),
  };
}
