/**
 * Diagnosis data models for storage and API contracts
 */

import type { ChatSession, ChatMessage, DiagnosisResult } from "@agrisense/shared";
import { DIAGNOSIS_CONSTANTS } from "../../constants/diagnosis.constants";

export interface ChatSessionItem {
  PK: string; // userId
  SK: string; // sessionId
  messages: ChatMessageItem[];
  lastDiagnosis?: DiagnosisResult;
  createdAt: number;
  updatedAt: number;
  ttl: number; // TTL for DynamoDB auto-expiry
}

export interface ChatMessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  timestamp: number;
  diagnosis?: DiagnosisResult;
}

export function toChatSession(item: ChatSessionItem): ChatSession {
  return {
    sessionId: item.SK,
    userId: item.PK,
    messages: item.messages,
    lastDiagnosis: item.lastDiagnosis,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export function toChatSessionItem(session: ChatSession): ChatSessionItem {
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
