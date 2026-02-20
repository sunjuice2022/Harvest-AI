/**
 * usePollyVoices — fetches available Polly voices for the current language
 * and persists the user's selection in localStorage.
 */

import { useState, useEffect, useCallback } from "react";
import { getCurrentLanguage } from "./useLanguage";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const STORAGE_KEY = "juna_voice";

export interface PollyVoiceInfo {
  id: string;
  name: string;
  gender: string;
  engine: "neural" | "standard";
}

export type PollyStatus = "live" | "mock" | "loading" | "error";

interface UsePollyVoicesState {
  voices: PollyVoiceInfo[];
  status: PollyStatus;
  selected: PollyVoiceInfo | null;
}

interface UsePollyVoicesActions {
  selectVoice: (voice: PollyVoiceInfo | null) => void;
}

function loadStoredVoice(): PollyVoiceInfo | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PollyVoiceInfo) : null;
  } catch {
    return null;
  }
}

export function usePollyVoices(): [UsePollyVoicesState, UsePollyVoicesActions] {
  const [voices, setVoices] = useState<PollyVoiceInfo[]>([]);
  const [status, setStatus] = useState<PollyStatus>("loading");
  const [selected, setSelected] = useState<PollyVoiceInfo | null>(loadStoredVoice);

  useEffect(() => {
    const lang = getCurrentLanguage();
    setStatus("loading");

    fetch(`${API_BASE_URL}/voice/voices`, {
      headers: { "x-language": lang },
    })
      .then((r) => r.json() as Promise<{ status: "live" | "mock" | "error"; voices: PollyVoiceInfo[] }>)
      .then((data) => {
        setStatus(data.status === "error" ? "error" : data.status);
        setVoices(data.voices);
        // Clear stored selection if it's no longer in the list
        setSelected((prev) => {
          if (prev && !data.voices.some((v) => v.id === prev.id)) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
          }
          return prev;
        });
      })
      .catch(() => setStatus("error"));
  }, []); // fetch once on mount — language affects backend via x-language header

  const selectVoice = useCallback((voice: PollyVoiceInfo | null) => {
    setSelected(voice);
    if (voice) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(voice));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return [{ voices, status, selected }, { selectVoice }];
}
