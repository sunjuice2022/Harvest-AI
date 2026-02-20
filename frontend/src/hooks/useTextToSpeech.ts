/**
 * useTextToSpeech — Juna speaks via Amazon Polly (Neural TTS) when AWS is connected.
 * Falls back to browser SpeechSynthesis automatically in local / mock mode.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { getCurrentLanguage } from "./useLanguage";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

interface UseTextToSpeechState {
  isSpeaking: boolean;
}

interface UseTextToSpeechActions {
  speak: (text: string) => void;
  stop: () => void;
  setVoice: (voice: { id: string; engine: "neural" | "standard" } | null) => void;
}

/** Strip markdown and emojis so the TTS reads clean prose. */
function stripForSpeech(text: string): string {
  return text
    .replace(/\p{Extended_Pictographic}/gu, "") // emojis
    .replace(/\*\*(.+?)\*\*/gs, "$1")           // **bold**
    .replace(/\*(.+?)\*/gs, "$1")               // *italic*
    .replace(/#{1,6}\s+/g, "")                  // ## headers
    .replace(/^\s*[-*•·]\s/gm, "")              // bullet chars
    .replace(/\n{2,}/g, ". ")                   // paragraph breaks → pause
    .replace(/\n/g, ", ")                       // line breaks → brief pause
    .replace(/\s{2,}/g, " ")                    // collapse whitespace
    .trim();
}

/** Browser SpeechSynthesis fallback — used when Polly is not available. */
function speakWithBrowser(
  text: string,
  onStart: () => void,
  onEnd: () => void,
): void {
  if (!("speechSynthesis" in window)) { onEnd(); return; }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = getCurrentLanguage();
  utterance.rate = 0.93;
  utterance.pitch = 1.08;

  const voices = window.speechSynthesis.getVoices();
  const lang = getCurrentLanguage();
  const match =
    voices.find((v) => v.lang === lang) ??
    voices.find((v) => v.lang.startsWith(lang.split("-")[0]));
  if (match) utterance.voice = match;

  utterance.onstart = onStart;
  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  window.speechSynthesis.speak(utterance);
}

export function useTextToSpeech(): [UseTextToSpeechState, UseTextToSpeechActions] {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const voiceRef = useRef<{ id: string; engine: "neural" | "standard" } | null>(null);

  // Preload browser voices (Chrome loads them async)
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.getVoices();
    const load = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  // Stop everything on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      cleanupAudio();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, [cleanupAudio]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    cleanupAudio();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [cleanupAudio]);

  const setVoice = useCallback((voice: { id: string; engine: "neural" | "standard" } | null) => {
    voiceRef.current = voice;
  }, []);

  const speak = useCallback((text: string): void => {
    abortRef.current?.abort();
    cleanupAudio();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();

    const clean = stripForSpeech(text);
    if (!clean) return;

    const controller = new AbortController();
    abortRef.current = controller;

    void (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/voice/speak`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-language": getCurrentLanguage(),
          },
          body: JSON.stringify({
            text: clean,
            ...(voiceRef.current
              ? { voiceId: voiceRef.current.id, engine: voiceRef.current.engine }
              : {}),
          }),
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        // 204 = mock mode — fall back to browser TTS
        if (response.status === 204) {
          speakWithBrowser(
            clean,
            () => setIsSpeaking(true),
            () => setIsSpeaking(false),
          );
          return;
        }

        if (!response.ok) {
          // On error also fall back to browser TTS
          speakWithBrowser(
            clean,
            () => setIsSpeaking(true),
            () => setIsSpeaking(false),
          );
          return;
        }

        // Polly audio — play the MP3
        const blob = await response.blob();
        if (controller.signal.aborted) return;

        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => { setIsSpeaking(false); cleanupAudio(); };
        audio.onerror = () => { setIsSpeaking(false); cleanupAudio(); };

        await audio.play();
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        console.warn("[Juna TTS]", err);
        // Last-resort fallback
        speakWithBrowser(
          clean,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false),
        );
      }
    })();
  }, [cleanupAudio]);

  return [{ isSpeaking }, { speak, stop, setVoice }];
}
