/**
 * Diagnosis API helpers — low-level fetch wrappers used by useDiagnosis hook
 */

import type { DiagnosisResponse, DiagnosisResult, ChatSession } from "@agrisense/shared";
import { generateUUID } from "../utils";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export { API_BASE_URL };

export async function sendDiagnosisRequest(
  sessionId: string,
  message: string,
  userId: string,
  language: string,
  imageUrl?: string,
): Promise<DiagnosisResponse> {
  const response = await fetch(`${API_BASE_URL}/diagnosis/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
      "x-language": language,
    },
    body: JSON.stringify({ sessionId, message, imageUrl }),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json() as Promise<DiagnosisResponse>;
}

export function updateSessionWithMessages(
  session: ChatSession,
  message: string,
  imageUrl: string | undefined,
  data: DiagnosisResponse,
): ChatSession {
  return {
    ...session,
    messages: [
      ...session.messages,
      { id: generateUUID(), role: "user", content: message, imageUrl, timestamp: Date.now() },
      {
        id: data.messageId,
        role: "assistant",
        content: formatDiagnosisForDisplay(data.diagnosis),
        timestamp: Date.now(),
        diagnosis: data.diagnosis,
      },
    ],
    lastDiagnosis: data.diagnosis,
    updatedAt: Date.now(),
  };
}

export async function getPresignedUrl(fileName: string, fileType: string, userId: string, language: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/diagnosis/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": userId, "x-language": language },
    body: JSON.stringify({ fileName, fileType }),
  });
  if (!response.ok) throw new Error(`Failed to get upload URL: ${response.status}`);
  const { presignedUrl } = await response.json();
  return presignedUrl;
}

export async function convertToDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (): void => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

export async function uploadToS3(presignedUrl: string, file: File): Promise<string> {
  const response = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!response.ok) throw new Error("Failed to upload file to S3");
  return presignedUrl.split("?")[0];
}

function formatDiagnosisForDisplay(diagnosis: DiagnosisResult): string {
  const parts: string[] = [
    `${diagnosis.condition} (${diagnosis.confidence}% confidence)`,
    `Severity: ${diagnosis.severity}`,
    `\n${diagnosis.description}`,
  ];
  if (diagnosis.treatment?.length) {
    parts.push("\nTreatment:");
    parts.push(diagnosis.treatment.map((t) => `• ${t}`).join("\n"));
  }
  return parts.join("\n");
}
