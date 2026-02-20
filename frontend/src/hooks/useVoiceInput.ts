/**
 * useVoiceInput — MediaRecorder → POST /api/voice/transcribe → transcribed text (PRD V-04 to V-07, V-10)
 */

import { useState, useRef, useCallback } from "react";
import { getCurrentLanguage } from "./useLanguage";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

interface UseVoiceInputOptions {
  onTranscript: (text: string) => void;
}

interface UseVoiceInputState {
  isRecording: boolean;
  isTranscribing: boolean;
  error: string | null;
}

interface UseVoiceInputActions {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  clearError: () => void;
}

export function useVoiceInput(options: UseVoiceInputOptions): [UseVoiceInputState, UseVoiceInputActions] {
  const [state, setState] = useState<UseVoiceInputState>({
    isRecording: false,
    isTranscribing: false,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/ogg;codecs=opus";

      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setState((prev) => ({ ...prev, isRecording: false, isTranscribing: true }));
        await sendAudioForTranscription(new Blob(chunksRef.current, { type: mimeType }), options.onTranscript, setState);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setState({ isRecording: true, isTranscribing: false, error: null });
    } catch (err) {
      const isDenied = err instanceof Error && err.name === "NotAllowedError";
      setState({
        isRecording: false,
        isTranscribing: false,
        error: isDenied
          ? "Microphone access denied. Please allow microphone access in your browser settings."
          : "Could not start recording. Please check your microphone.",
      });
    }
  }, [options]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return [state, { startRecording, stopRecording, clearError }];
}

async function sendAudioForTranscription(
  audioBlob: Blob,
  onTranscript: (text: string) => void,
  setState: React.Dispatch<React.SetStateAction<UseVoiceInputState>>,
): Promise<void> {
  try {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    const response = await fetch(`${API_BASE_URL}/voice/transcribe`, {
      method: "POST",
      headers: { "x-language": getCurrentLanguage() },
      body: formData,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({})) as { error?: string };
      throw new Error(body.error ?? `Transcription failed: HTTP ${response.status}`);
    }

    const { text } = await response.json() as { text: string };
    onTranscript(text);
    setState({ isRecording: false, isTranscribing: false, error: null });
  } catch (err) {
    setState({
      isRecording: false,
      isTranscribing: false,
      error: err instanceof Error ? err.message : "Voice transcription failed.",
    });
  }
}
