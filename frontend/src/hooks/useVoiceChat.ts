/**
 * useVoiceChat — manages message state and API calls for the Voice Assistant chatbot
 */

import { useState, useCallback } from "react";
import { getCurrentLanguage } from "./useLanguage";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const MAX_HISTORY = 10;

export interface VoiceChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface HistoryItem { role: "user" | "assistant"; content: string; }

interface UseVoiceChatState {
  messages: VoiceChatMessage[];
  isLoading: boolean;
  error: string | null;
}

interface UseVoiceChatActions {
  sendMessage: (text: string) => Promise<void>;
  clearError: () => void;
}

async function postChat(message: string, history: HistoryItem[]): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/voice/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-language": getCurrentLanguage() },
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const { reply } = await res.json() as { reply: string };
  return reply;
}

export function useVoiceChat(): [UseVoiceChatState, UseVoiceChatActions] {
  const [messages, setMessages] = useState<VoiceChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    const userMsg: VoiceChatMessage = { id: `u-${Date.now()}`, role: "user", content: text, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    try {
      const history = messages.slice(-MAX_HISTORY).map(({ role, content }) => ({ role, content }));
      const reply = await postChat(text, history);
      const aiMsg: VoiceChatMessage = { id: `a-${Date.now()}`, role: "assistant", content: reply, timestamp: Date.now() };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get a response.");
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearError = useCallback(() => setError(null), []);

  return [{ messages, isLoading, error }, { sendMessage, clearError }];
}
