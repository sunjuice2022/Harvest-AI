/**
 * useDiagnosis hook - manages diagnosis chat state and API interactions
 */

import { useState, useCallback, useRef, useEffect } from "react";
import type { ChatSession, DiagnosisResult } from "@agrisense/shared";
import { DIAGNOSIS_CONSTANTS } from "../constants/diagnosis.constants";
import { getCurrentLanguage } from "./useLanguage";
import { generateUUID } from "../utils";
import {
  API_BASE_URL,
  sendDiagnosisRequest,
  updateSessionWithMessages,
  getPresignedUrl,
  convertToDataUrl,
  uploadToS3,
} from "../services/diagnosisApi";

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

export function useDiagnosis(): [UseDiagnosisState, UseDiagnosisActions] {
  const [state, setState] = useState<UseDiagnosisState>({
    session: null, isLoading: false, error: null, uploadProgress: 0,
  });
  const userIdRef = useRef<string>("");

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
          state.session.sessionId, message, userIdRef.current, getCurrentLanguage(), imageUrl,
        );
        setState((prev) => ({
          ...prev,
          session: updateSessionWithMessages(state.session!, message, imageUrl, data),
          isLoading: false,
        }));
        return data.diagnosis;
      } catch (err) {
        setState((prev) => ({ ...prev, error: err instanceof Error ? err.message : "Unknown error", isLoading: false }));
        return null;
      }
    },
    [state.session],
  );

  const uploadPhoto = useCallback(async (file: File): Promise<string> => {
    if (file.size > DIAGNOSIS_CONSTANTS.MAX_IMAGE_SIZE_BYTES) {
      setState((prev) => ({ ...prev, error: `File too large (max ${DIAGNOSIS_CONSTANTS.MAX_IMAGE_SIZE_MB}MB)` }));
      return "";
    }
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const presignedUrl = await getPresignedUrl(file.name, file.type, userIdRef.current, getCurrentLanguage());
      const imageUrl = API_BASE_URL.includes("localhost")
        ? await convertToDataUrl(file)
        : await uploadToS3(presignedUrl, file);
      setState((prev) => ({ ...prev, isLoading: false, uploadProgress: 100 }));
      return imageUrl;
    } catch (err) {
      setState((prev) => ({
        ...prev, error: err instanceof Error ? err.message : "Upload failed", isLoading: false, uploadProgress: 0,
      }));
      return "";
    }
  }, []);

  const loadSession = useCallback(async (_sessionId: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch(`${API_BASE_URL}/diagnosis/sessions`, {
        headers: { "x-user-id": userIdRef.current, "x-language": getCurrentLanguage() },
      });
      if (!response.ok) throw new Error("Failed to load session");
      const session = await response.json();
      setState((prev) => ({ ...prev, session, isLoading: false }));
    } catch (err) {
      setState((prev) => ({
        ...prev, error: err instanceof Error ? err.message : "Failed to load session", isLoading: false,
      }));
    }
  }, []);

  const clearError = useCallback(() => setState((prev) => ({ ...prev, error: null })), []);

  return [state, { initializeSession, sendMessage, uploadPhoto, loadSession, clearError }];
}
