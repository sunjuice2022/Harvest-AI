/**
 * Backend-specific types for diagnosis domain (not shared with frontend)
 */

import type { ChatMessage } from "@agrisense/shared";

export interface DiagnosisServiceConfig {
  region?: string;
  modelId?: string;
}

export interface DynamoDBSessionItem {
  userId: string;
  sessionId: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  lastDiagnosis?: Record<string, unknown>;
}
