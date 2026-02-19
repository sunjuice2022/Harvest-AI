/**
 * useDiagnosis hook - manages diagnosis chat state and API interactions
 */

import { useState, useCallback, useRef, useEffect } from "react";
import type { ChatSession, ChatMessage, DiagnosisResult, DiagnosisResponse } from "@harvest-ai/shared";
import { DIAGNOSIS_CONSTANTS } from "../constants/diagnosis.constants";

// Simple UUID v4 generator for browser
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c): string {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface UseDiagnosisState {
  session: ChatSession | null;
  isLoading: boolean;
  error: string | null;
  uploadProgress: number;
}

interface UseDiagnosisActions {
  initializeSession: () => Promise<void>;
  sendMessage: (message: string, imageUrl?: string) => Promise<DiagnosisResult | null>;
  uploadPhoto: (file: File) => Promise<string>;
  loadSession: (sessionId: string) => Promise<void>;
  clearError: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Helper: Send diagnosis request to API
async function sendDiagnosisRequest(
  sessionId: string,
  message: string,
  userId: string,
  imageUrl?: string
): Promise<DiagnosisResponse> {
  const response = await fetch(`${API_BASE_URL}/diagnosis/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
    },
    body: JSON.stringify({ sessionId, message, imageUrl }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json() as Promise<DiagnosisResponse>;
}

// Helper: Update session with new messages
function updateSessionWithMessages(
  session: ChatSession,
  message: string,
  imageUrl: string | undefined,
  data: DiagnosisResponse
): ChatSession {
  return {
    ...session,
    messages: [
      ...session.messages,
      {
        id: generateUUID(),
        role: "user",
        content: message,
        imageUrl,
        timestamp: Date.now(),
      },
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

// Helper: Get presigned URL for file upload
async function getPresignedUrl(fileName: string, fileType: string, userId: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/diagnosis/upload`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
    },
    body: JSON.stringify({ fileName, fileType }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get upload URL: ${response.status}`);
  }

  const { presignedUrl } = await response.json();
  return presignedUrl;
}

// Helper: Convert file to data URL
async function convertToDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (): void => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
}

// Helper: Upload file to S3
async function uploadToS3(presignedUrl: string, file: File): Promise<string> {
  const uploadResponse = await fetch(presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error("Failed to upload file to S3");
  }

  return presignedUrl.split("?")[0];
}

export function useDiagnosis(): [UseDiagnosisState, UseDiagnosisActions] {
  const [state, setState] = useState<UseDiagnosisState>({
    session: null,
    isLoading: false,
    error: null,
    uploadProgress: 0,
  });

  // Use ref to store userId so it's stable across renders
  const userIdRef = useRef<string>("");

  // Initialize userId once
  useEffect(() => {
    if (!userIdRef.current) {
      let userId = localStorage.getItem("userId");
      if (!userId) {
        userId = `user-${Math.random().toString(36).substring(2, 11)}`;
        localStorage.setItem("userId", userId);
      }
      userIdRef.current = userId;
    }
  }, []);

  const initializeSession = useCallback(async () => {
    const newSession: ChatSession = {
      sessionId: generateUUID(),
      userId: userIdRef.current,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setState((prev) => ({ ...prev, session: newSession, error: null }));
  }, []);

  const sendMessage = useCallback(
    async (message: string, imageUrl?: string): Promise<DiagnosisResult | null> => {
      if (!state.session) {
        setState((prev) => ({ ...prev, error: "No active session" }));
        return null;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const data = await sendDiagnosisRequest(
          state.session.sessionId,
          message,
          userIdRef.current,
          imageUrl
        );

        const updatedSession = updateSessionWithMessages(state.session, message, imageUrl, data);

        setState((prev) => ({
          ...prev,
          session: updatedSession,
          isLoading: false,
        }));

        return data.diagnosis;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setState((prev) => ({ ...prev, error: errorMessage, isLoading: false }));
        return null;
      }
    },
    [state.session],
  );

  const uploadPhoto = useCallback(
    async (file: File): Promise<string> => {
      if (file.size > DIAGNOSIS_CONSTANTS.MAX_IMAGE_SIZE_BYTES) {
        setState((prev) => ({ ...prev, error: `File too large (max ${DIAGNOSIS_CONSTANTS.MAX_IMAGE_SIZE_MB}MB)` }));
        return "";
      }

      console.log("📸 Starting photo upload:", file.name, file.type);
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const presignedUrl = await getPresignedUrl(file.name, file.type, userIdRef.current);
        console.log("✅ Got presigned URL");

        let imageUrl: string;
        if (API_BASE_URL.includes("localhost")) {
          console.log("📱 Mock mode: Converting to data URL...");
          imageUrl = await convertToDataUrl(file);
          console.log("✅ Data URL created, length:", imageUrl.length);
        } else {
          console.log("🌐 Production mode: Uploading to S3...");
          imageUrl = await uploadToS3(presignedUrl, file);
          console.log("✅ File uploaded to S3");
        }

        console.log("✅ Upload complete, imageUrl length:", imageUrl.length);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          uploadProgress: 100,
        }));

        return imageUrl;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Upload failed";
        console.error("❌ Upload error:", errorMessage);
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
          uploadProgress: 0,
        }));
        return "";
      }
    },
    [],
  );

  const loadSession = useCallback(
    async (sessionId: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch(`${API_BASE_URL}/diagnosis/sessions`, {
          headers: {
            "x-user-id": userIdRef.current,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load session");
        }

        const session = await response.json();
        setState((prev) => ({
          ...prev,
          session,
          isLoading: false,
        }));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load session";
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
      }
    },
    [],
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const actions: UseDiagnosisActions = {
    initializeSession,
    sendMessage,
    uploadPhoto,
    loadSession,
    clearError,
  };

  return [state, actions];
}

function formatDiagnosisForDisplay(diagnosis: DiagnosisResult): string {
  const parts: string[] = [
    `${diagnosis.condition} (${diagnosis.confidence}% confidence)`,
    `Severity: ${diagnosis.severity}`,
    `\n${diagnosis.description}`,
  ];

  if (diagnosis.treatment && diagnosis.treatment.length > 0) {
    parts.push("\nTreatment:");
    parts.push(diagnosis.treatment.map((t) => `• ${t}`).join("\n"));
  }

  return parts.join("\n");
}
