/** Lambda handler for POST /api/diagnosis/chat */

import { ChatSessionRepository } from '../../repositories/diagnosis/chatSession.repository';
import { DiagnosisService } from '../../services/diagnosis/diagnosis.service';
import type { ChatSession, ChatMessage, DiagnosisRequest, DiagnosisResponse, DiagnosisResult } from '@harvest-ai/shared';
import {
  APIGatewayProxyEvent, APIGatewayProxyResult,
  successResponse, errorResponse, extractUserId,
} from '../../types/api/apiGateway.types';
import { randomUUID } from 'crypto';

const sessionRepository = new ChatSessionRepository();
const diagnosisService = new DiagnosisService();

export async function diagnosisChat(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const userId = extractUserId(event);
    if (!userId) return errorResponse(401, 'Unauthorized');

    const request = JSON.parse(event.body || '{}') as DiagnosisRequest;
    if (!request.message) return errorResponse(400, 'Message is required');

    const session = await resolveSession(userId, request.sessionId);
    if (!session) return errorResponse(404, 'Session not found');

    const diagnosis = await diagnosisService.diagnoseCrop(
      request.message,
      request.imageUrl ? await convertImageUrlToBase64(request.imageUrl) : undefined,
      session.messages,
    );

    await persistMessages(session, request, diagnosis);

    const response: DiagnosisResponse = {
      messageId: randomUUID(),
      diagnosis,
      followUpSuggestions: buildFollowUpSuggestions(diagnosis),
    };
    return successResponse(response);
  } catch (error) {
    console.error('[diagnosisChat] error:', error);
    return errorResponse(500, 'Internal server error');
  }
}

async function resolveSession(userId: string, sessionId?: string): Promise<ChatSession | null> {
  if (sessionId) return sessionRepository.getSession(userId, sessionId);
  const session: ChatSession = {
    sessionId: randomUUID(), userId, messages: [], createdAt: Date.now(), updatedAt: Date.now(),
  };
  await sessionRepository.createSession(session);
  return session;
}

async function persistMessages(session: ChatSession, request: DiagnosisRequest, diagnosis: DiagnosisResult): Promise<void> {
  const now = Date.now();
  const userMessage: ChatMessage = {
    id: randomUUID(), role: 'user', content: request.message,
    ...(request.imageUrl ? { imageUrl: request.imageUrl } : {}), timestamp: now,
  };
  const assistantMessage: ChatMessage = {
    id: randomUUID(), role: 'assistant', content: formatDiagnosisAsText(diagnosis), timestamp: now, diagnosis,
  };
  session.messages.push(userMessage, assistantMessage);
  session.lastDiagnosis = diagnosis;
  await sessionRepository.updateSession({ ...session, updatedAt: now });
}

function formatDiagnosisAsText(diagnosis: DiagnosisResult): string {
  const lines = [
    `**${diagnosis.condition}** (${diagnosis.confidence}% confidence)`,
    `Severity: ${diagnosis.severity.toUpperCase()}`,
    `\n${diagnosis.description}`,
    `\n**Treatment:**`,
    diagnosis.treatment.map((t) => `• ${t}`).join('\n'),
  ];
  if (diagnosis.organicAlternatives?.length) {
    lines.push(`\n**Organic Alternatives:**`, diagnosis.organicAlternatives.map((a) => `• ${a}`).join('\n'));
  }
  if (diagnosis.preventionTips?.length) {
    lines.push(`\n**Prevention Tips:**`, diagnosis.preventionTips.map((tip) => `• ${tip}`).join('\n'));
  }
  return lines.join('\n');
}

function buildFollowUpSuggestions(diagnosis: DiagnosisResult): string[] {
  const suggestions: string[] = [];
  if (diagnosis.confidence < 60) suggestions.push('Take another photo from a different angle for better diagnosis');
  if (diagnosis.treatment.length > 0) suggestions.push('What is your current treatment approach?');
  if (diagnosis.severity === 'critical') suggestions.push('Would you like to escalate this to an agricultural expert?');
  return suggestions;
}

async function convertImageUrlToBase64(_imageUrl: string): Promise<string> {
  return '';
}
