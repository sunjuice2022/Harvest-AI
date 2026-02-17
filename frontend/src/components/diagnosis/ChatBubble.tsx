/**
 * ChatBubble component - displays individual chat messages
 */

import React from "react";
import type { ChatMessage, DiagnosisResult } from "@agrisense/shared";
import "./ChatBubble.css";

interface ChatBubbleProps {
  message: ChatMessage;
  isUser: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isUser }) => {
  return (
    <div className={`chat-bubble ${isUser ? "user" : "assistant"}`}>
      {message.imageUrl && <img src={message.imageUrl} alt="uploaded" className="chat-image" />}

      <div className="chat-content">
        {message.diagnosis && (
          <DiagnosisResultCard diagnosis={message.diagnosis} />
        )}
        <p className="chat-text">{message.content}</p>
      </div>

      <span className="chat-timestamp">
        {new Date(message.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
  );
};

interface DiagnosisResultCardProps {
  diagnosis: DiagnosisResult;
}

const DiagnosisResultCard: React.FC<DiagnosisResultCardProps> = ({ diagnosis }) => {
  const severityColors: Record<string, string> = {
    critical: "var(--color-alert-red)",
    warning: "var(--color-warning-amber)",
    info: "var(--color-info-blue)",
  };

  return (
    <div className="diagnosis-card">
      <div className="diagnosis-header">
        <h3 className="diagnosis-condition">{diagnosis.condition}</h3>
        <span className="diagnosis-confidence">{diagnosis.confidence}%</span>
      </div>

      <div
        className="diagnosis-severity"
        style={{ borderLeftColor: severityColors[diagnosis.severity] }}
      >
        {diagnosis.severity.toUpperCase()}
      </div>

      {diagnosis.treatment && diagnosis.treatment.length > 0 && (
        <div className="diagnosis-treatment">
          <strong>Treatment:</strong>
          <ul>
            {diagnosis.treatment.slice(0, 3).map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
