/**
 * ChatInput component - message input bar with send button
 */

import React, { useState } from "react";
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
  placeholder = "Describe your crop issue...",
}) => {
  const [message, setMessage] = useState("");

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

  return (
    <div className="chat-input-container">
      <div className="chat-input-wrapper">
        <button
          className="photo-button"
          onClick={onPhotoClick}
          disabled={isLoading}
          type="button"
          title="Upload photo"
        >
          📸
        </button>

        <textarea
          className="chat-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={isLoading}
          rows={1}
        />

        <button
          className="send-button"
          onClick={handleSend}
          disabled={isLoading || !message.trim()}
          type="button"
          title="Send message"
        >
          {isLoading ? "..." : "📤"}
        </button>
      </div>
    </div>
  );
};
