/**
 * useWebSpeech — free in-browser voice input via Web Speech API
 * Works in Chrome, Edge, and Safari — no backend or AWS required.
 */

import { useState, useRef, useCallback } from "react";
import { getCurrentLanguage } from "./useLanguage";

declare global {
  interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList;
  }
  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
  }
  interface SpeechRecognition {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    start(): void;
    stop(): void;
  }
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface UseWebSpeechOptions {
  onTranscript: (text: string) => void;
}

interface UseWebSpeechState {
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
}

interface UseWebSpeechActions {
  startListening: () => void;
  stopListening: () => void;
  clearError: () => void;
}

export function useWebSpeech(
  options: UseWebSpeechOptions,
): [UseWebSpeechState, UseWebSpeechActions] {
  const isSupported =
    typeof window !== "undefined" &&
    (window.SpeechRecognition !== undefined || window.webkitSpeechRecognition !== undefined);

  const [state, setState] = useState<UseWebSpeechState>({
    isListening: false,
    isSupported,
    error: null,
  });

  // Stable ref so startListening closure never goes stale
  const onTranscriptRef = useRef(options.onTranscript);
  onTranscriptRef.current = options.onTranscript;

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startListening = useCallback(() => {
    const RecognitionClass = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!RecognitionClass) {
      setState((prev) => ({
        ...prev,
        error: "Voice input is not supported in this browser.",
      }));
      return;
    }

    const recognition = new RecognitionClass();
    recognition.lang = getCurrentLanguage();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results.item(0)?.item(0)?.transcript ?? "";
      if (transcript) onTranscriptRef.current(transcript);
    };

    recognition.onerror = (event) => {
      const msg =
        event.error === "not-allowed"
          ? "Microphone access denied. Please allow microphone access in your browser settings."
          : "Voice recognition failed. Please try again.";
      setState({ isListening: false, isSupported: true, error: msg });
    };

    recognition.onend = () => {
      setState((prev) => ({ ...prev, isListening: false }));
    };

    recognitionRef.current = recognition;
    recognition.start();
    setState({ isListening: true, isSupported: true, error: null });
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setState((prev) => ({ ...prev, isListening: false }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return [state, { startListening, stopListening, clearError }];
}
