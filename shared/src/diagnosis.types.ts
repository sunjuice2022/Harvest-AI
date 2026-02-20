/**
 * Shared types for Crop Diagnosis AI feature
 */

export type DiagnosisSeverity = "info" | "warning" | "critical";

export type DiagnosisConditionType = "disease" | "pest" | "nutrient_deficiency" | "abiotic_stress";

export interface DiagnosisResult {
  condition: string;
  conditionType: DiagnosisConditionType;
  confidence: number; // 0-100 percentage
  severity: DiagnosisSeverity;
  description: string;
  treatment: string[];
  organicAlternatives?: string[];
  preventionTips?: string[];
  affectedPlants?: string[];
  escalatedToExpert?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  timestamp: number;
  diagnosis?: DiagnosisResult;
}

export interface ChatSession {
  sessionId: string;
  userId: string;
  messages: ChatMessage[];
  lastDiagnosis?: DiagnosisResult;
  createdAt: number;
  updatedAt: number;
}

export interface PhotoUploadRequest {
  userId: string;
  sessionId: string;
}

export interface PhotoUploadResponse {
  presignedUrl: string;
  uploadId: string;
  expires: number;
}

export interface DiagnosisRequest {
  sessionId: string;
  userId: string;
  message: string;
  imageUrl?: string;
}

export interface DiagnosisResponse {
  messageId: string;
  diagnosis: DiagnosisResult;
  followUpSuggestions: string[];
}
