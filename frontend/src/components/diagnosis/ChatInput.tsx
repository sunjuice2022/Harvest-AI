/**
 * ChatInput component - message input bar with send, photo upload, and voice input buttons
 */

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useVoiceInput } from "../../hooks/useVoiceInput";
import "./ChatInput.css";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onPhotoClick: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onPhotoClick,
  isLoading = false,
  placeholder,
}) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");

  const [voiceState, voiceActions] = useVoiceInput({
    onTranscript: (text) => setMessage(text),
  });

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMicClick = () => {
    if (voiceState.isRecording) {
      voiceActions.stopRecording();
    } else {
      void voiceActions.startRecording();
    }
  };

  const micLabel = voiceState.isRecording ? t("settings.voice.recording") : t("diagnosis.startMic");
  const inputPlaceholder = voiceState.isTranscribing
    ? t("settings.voice.transcribing")
    : placeholder ?? t("diagnosis.placeholder");

  return (
    <div className="chat-input-container">
      {voiceState.error && (
        <div className="chat-input-voice-error">
          <span>{voiceState.error}</span>
          <button onClick={voiceActions.clearError} type="button" aria-label="Dismiss">✕</button>
        </div>
      )}
      <div className="chat-input-wrapper">
        <button
          className="photo-button"
          onClick={onPhotoClick}
          disabled={isLoading}
          type="button"
          title={t("diagnosis.uploadPhoto")}
        >
          📸
        </button>

        <button
          className={`mic-button${voiceState.isRecording ? " mic-button--active" : ""}`}
          onClick={handleMicClick}
          disabled={isLoading || voiceState.isTranscribing}
          type="button"
          title={micLabel}
          aria-label={micLabel}
        >
          {voiceState.isTranscribing ? "⏳" : voiceState.isRecording ? "⏹️" : "🎙️"}
        </button>

        <textarea
          className="chat-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={inputPlaceholder}
          disabled={isLoading || voiceState.isRecording || voiceState.isTranscribing}
          rows={1}
        />

        <button
          className="send-button"
          onClick={handleSend}
          disabled={isLoading || !message.trim()}
          type="button"
          title={t("diagnosis.send")}
        >
          {isLoading ? "..." : "📤"}
        </button>
      </div>
    </div>
  );
};
