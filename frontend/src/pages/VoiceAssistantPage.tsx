/**
 * VoiceAssistantPage — Juna, your AI Farm Assistant (PRD §4.5)
 */

import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "../components/common/LanguageSelector";
import { useLanguage } from "../hooks/useLanguage";
import { useVoiceChat } from "../hooks/useVoiceChat";
import { useWebSpeech } from "../hooks/useWebSpeech";
import { useTextToSpeech } from "../hooks/useTextToSpeech";
import { usePollyVoices } from "../hooks/usePollyVoices";
import "./VoiceAssistantPage.css";

const JUNA_WELCOME =
  "Hi there! I'm Juna 🌿 — your personal farm assistant. I'm here to help with crop advice, pest management, soil questions, and anything else on the farm. How can I help you today? 😊";

const QUICK_PROMPTS = [
  { label: "🌾 Crop advice", message: "Can you give me some crop advice?" },
  { label: "🐛 Pest management", message: "Help me with pest management on my farm." },
  { label: "🌱 Soil questions", message: "I have questions about my soil health." },
];

export const VoiceAssistantPage: React.FC = () => {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const [chatState, chatActions] = useVoiceChat();
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [webSpeechState, webSpeechActions] = useWebSpeech({
    onTranscript: (text) => { void chatActions.sendMessage(text); },
  });

  const [ttsState, ttsActions] = useTextToSpeech();
  const [pollyState, pollyActions] = usePollyVoices();
  const [showVoicePicker, setShowVoicePicker] = useState(false);

  // Sync selected Polly voice into TTS hook
  useEffect(() => {
    ttsActions.setVoice(pollyState.selected);
  }, [pollyState.selected, ttsActions]);

  // Speak each new assistant message as it arrives
  const prevMsgCountRef = useRef(0);
  useEffect(() => {
    const msgs = chatState.messages;
    if (msgs.length > prevMsgCountRef.current) {
      const latest = msgs[msgs.length - 1];
      if (latest?.role === "assistant") ttsActions.speak(latest.content);
      prevMsgCountRef.current = msgs.length;
    }
  }, [chatState.messages, ttsActions]);

  // Stop Juna speaking when user starts the mic
  useEffect(() => {
    if (webSpeechState.isListening) ttsActions.stop();
  }, [webSpeechState.isListening, ttsActions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatState.messages, chatState.isLoading]);

  const handleSend = () => {
    if (inputText.trim() && !chatState.isLoading) {
      void chatActions.sendMessage(inputText.trim());
      setInputText("");
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleFreeMic = () => {
    if (webSpeechState.isListening) webSpeechActions.stopListening();
    else webSpeechActions.startListening();
  };

  const freeMicLabel = webSpeechState.isListening
    ? "Stop listening"
    : "Free voice input (Chrome / Safari)";

  const isBusy = chatState.isLoading || webSpeechState.isListening;

  return (
    <div className="voice-page">
      {/* ── Header ── */}
      <header className="voice-page__header">
        <Link to="/" className="voice-page__back">{t("common.backToHome")}</Link>

        <div className="voice-page__header-juna">
          <div
            className={`juna-avatar juna-avatar--sm${ttsState.isSpeaking ? " juna-avatar--speaking" : ""}`}
            aria-hidden="true"
          >🌿</div>
          <div>
            <div className="voice-page__juna-name">Juna</div>
            <div className="voice-page__juna-status">
              {ttsState.isSpeaking ? "🔊 Speaking…" : "🟢 Your neighbour in your pocket"}
            </div>
          </div>
          {ttsState.isSpeaking && (
            <button
              className="juna-stop-speech"
              onClick={ttsActions.stop}
              type="button"
              title="Stop Juna speaking"
              aria-label="Stop Juna speaking"
            >
              ⏹
            </button>
          )}
        </div>

        <div className="voice-page__lang">
          <button
            className={`voice-page__voice-btn${showVoicePicker ? " voice-page__voice-btn--active" : ""}`}
            onClick={() => setShowVoicePicker((v) => !v)}
            type="button"
            title="Voice settings"
            aria-label="Voice settings"
          >
            🔊
          </button>
          <LanguageSelector value={language} onChange={setLanguage} />
        </div>
      </header>

      {/* ── Voice picker panel ── */}
      {showVoicePicker && (
        <div className="voice-picker-panel">
          <div className="voice-picker__header">
            <span className="voice-picker__title">Juna's Voice</span>
            <span className={`voice-picker__status voice-picker__status--${pollyState.status}`}>
              {pollyState.status === "live"    && "🟢 Polly live"}
              {pollyState.status === "mock"    && "🌐 Browser TTS (mock mode)"}
              {pollyState.status === "loading" && "⌛ Checking…"}
              {pollyState.status === "error"   && "❌ Unavailable"}
            </span>
          </div>
          <div className="voice-picker__voices">
            <button
              className={`voice-chip${pollyState.selected === null ? " voice-chip--active" : ""}`}
              onClick={() => pollyActions.selectVoice(null)}
              type="button"
            >
              Default
            </button>
            {pollyState.voices.map((v) => (
              <button
                key={v.id}
                className={`voice-chip${pollyState.selected?.id === v.id ? " voice-chip--active" : ""}`}
                onClick={() => pollyActions.selectVoice(v)}
                type="button"
              >
                {v.name}&nbsp;·&nbsp;{v.gender === "Female" ? "♀" : "♂"}&nbsp;·&nbsp;
                <span className="voice-chip__engine">{v.engine}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Messages ── */}
      <main className="voice-page__messages" aria-live="polite">

        {/* Welcome card — shown only before the first message */}
        {chatState.messages.length === 0 && !chatState.isLoading && (
          <div className="juna-welcome">
            <div className="juna-avatar juna-avatar--lg" aria-hidden="true">🌿</div>
            <h2 className="juna-welcome__name">Juna</h2>
            <p className="juna-welcome__tagline">Your neighbour in your pocket</p>
            <div className="juna-welcome__bubble">{JUNA_WELCOME}</div>
            <div className="juna-quick-prompts">
              {QUICK_PROMPTS.map(({ label, message }) => (
                <button
                  key={label}
                  className="juna-quick-prompt"
                  onClick={() => { void chatActions.sendMessage(message); }}
                  disabled={isBusy}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat history */}
        {chatState.messages.map((msg) => (
          <div key={msg.id} className={`voice-msg voice-msg--${msg.role}`}>
            {msg.role === "assistant" && (
              <div className="juna-avatar juna-avatar--sm" aria-hidden="true">🌿</div>
            )}
            <span className="voice-msg__bubble">{msg.content}</span>
          </div>
        ))}

        {/* Juna thinking indicator */}
        {chatState.isLoading && (
          <div className="voice-msg voice-msg--assistant">
            <div className="juna-avatar juna-avatar--sm" aria-hidden="true">J</div>
            <span className="voice-msg__bubble voice-msg__bubble--thinking">
              <span className="juna-thinking-text">Juna is thinking</span>
              <span className="juna-dots" aria-hidden="true">···</span>
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* ── Footer ── */}
      <footer className="voice-page__footer">
        {(webSpeechState.error ?? chatState.error) && (
          <div className="voice-page__error">
            <span>{webSpeechState.error ?? chatState.error}</span>
            <button
              onClick={() => { webSpeechActions.clearError(); chatActions.clearError(); }}
              type="button"
              aria-label="Dismiss error"
            >✕</button>
          </div>
        )}

        <div className="voice-page__input-row">
          {/* Free mic — Web Speech API */}
          <button
            className={`voice-page__mic${webSpeechState.isListening ? " voice-page__mic--active" : ""}`}
            onClick={handleFreeMic}
            disabled={chatState.isLoading || !webSpeechState.isSupported}
            type="button"
            title={freeMicLabel}
            aria-label={freeMicLabel}
          >
            {webSpeechState.isListening ? "⏹️" : "🎤"}
          </button>

          {/* Pro mic — Amazon Transcribe (coming soon) */}
          <div
            className="voice-page__pro-mic-wrap"
            title="Advanced AI transcription via Amazon Transcribe — coming soon"
          >
            <button
              className="voice-page__mic voice-page__mic--pro"
              disabled
              type="button"
              aria-label="Advanced voice transcription — coming soon"
            >
              🎙️
            </button>
            <span className="voice-page__pro-badge">PRO</span>
          </div>

          <textarea
            className="voice-page__input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKey}
            placeholder={webSpeechState.isListening ? "Listening…" : "Ask Juna anything about your farm…"}
            disabled={isBusy}
            rows={1}
            aria-label="Message Juna"
          />
          <button
            className="voice-page__send"
            onClick={handleSend}
            disabled={chatState.isLoading || !inputText.trim()}
            type="button"
            title={t("diagnosis.send")}
            aria-label="Send message"
          >
            {chatState.isLoading ? "⏳" : "📤"}
          </button>
        </div>

        <p className="voice-page__mic-hint">
          🎤 Free (Chrome / Safari)&nbsp;&nbsp;·&nbsp;&nbsp;
          🎙️ Advanced Transcription — <em>Coming Soon</em>
        </p>
      </footer>
    </div>
  );
};
