/**
 * DiagnosisPage - main crop diagnosis chatbot interface
 */

import React, { useEffect, useRef, useState } from "react";
import { ChatBubble } from "../components/diagnosis/ChatBubble";
import { ChatInput } from "../components/diagnosis/ChatInput";
import { PhotoUpload } from "../components/diagnosis/PhotoUpload";
import { EmptyState } from "../components/diagnosis/EmptyState";
import { useDiagnosis } from "../hooks/useDiagnosis";
import "./DiagnosisPage.css";

export const DiagnosisPage: React.FC = () => {
  const [state, actions] = useDiagnosis();
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Initialize session on mount (only once)
    if (!initializedRef.current && !state.session) {
      initializedRef.current = true;
      actions.initializeSession();
    }
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.session?.messages]);

  const handlePhotoSelected = async (file: File) => {
    console.log("📸 Photo selected:", file.name, file.size, file.type);
    setShowPhotoUpload(true);
    console.log("🔄 Calling uploadPhoto...");
    const imageUrl = await actions.uploadPhoto(file);
    console.log("✅ Upload complete, imageUrl:", imageUrl ? "✓ (length: " + imageUrl.length + ")" : "✗ empty");
    if (imageUrl) {
      setSelectedImageUrl(imageUrl);
      console.log("✅ Image URL set for next message");
    } else {
      console.log("❌ Upload failed, no imageUrl returned");
    }
  };

  const handleSendMessage = async (message: string) => {
    if (state.isLoading) return;

    const imageUrl = selectedImageUrl || undefined;
    const diagnosis = await actions.sendMessage(message, imageUrl);

    if (diagnosis) {
      setSelectedImageUrl("");
    }
  };

  if (!state.session) {
    return (
      <div className="diagnosis-page loading">
        <div className="loading-spinner"></div>
        <p>Initializing diagnostic chatbot...</p>
      </div>
    );
  }

  return (
    <div className="diagnosis-page">
      <div className="diagnosis-header">
        <h1>🌾 Crop Diagnosis AI</h1>
        <p>Upload a photo or describe your plant issue for instant diagnosis</p>
      </div>

      {state.error && (
        <div className="error-banner">
          <span>{state.error}</span>
          <button onClick={actions.clearError} className="close-error">
            ✕
          </button>
        </div>
      )}

      <div className="chat-container">
        {state.session.messages.length === 0 ? (
          <EmptyState
            onPhotoUploadClick={() => setShowPhotoUpload(true)}
            onTextInputFocus={() => {
              const input = document.querySelector(".chat-input") as HTMLTextAreaElement;
              input?.focus();
            }}
            hasSelectedPhoto={!!selectedImageUrl}
          />
        ) : (
          <div className="messages-list">
            {state.session.messages.map((message) => (
              <ChatBubble
                key={message.id}
                message={message}
                isUser={message.role === "user"}
              />
            ))}
            {selectedImageUrl && (
              <div className="photo-preview-in-chat">
                <img src={selectedImageUrl} alt="selected for diagnosis" />
                <span>📸 Photo ready to send</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {showPhotoUpload && (
        <div className="photo-upload-modal">
          <div className="photo-upload-content">
            <h3>Upload Plant Photo</h3>
            <PhotoUpload
              onPhotoSelected={handlePhotoSelected}
              isLoading={state.isLoading}
              uploadProgress={state.uploadProgress}
            />
            <button
              className="close-modal"
              onClick={() => {
                setShowPhotoUpload(false);
              }}
              type="button"
            >
              Done
            </button>
          </div>
        </div>
      )}

      <div className="chat-footer">
        {selectedImageUrl && (
          <div className="photo-status">
            <span>✅ Photo selected</span>
            <button
              className="remove-photo"
              onClick={() => {
                setSelectedImageUrl("");
                console.log("❌ Photo removed");
              }}
              type="button"
              title="Remove photo"
            >
              ✕
            </button>
          </div>
        )}
        <ChatInput
          onSendMessage={handleSendMessage}
          onPhotoClick={() => setShowPhotoUpload(true)}
          isLoading={state.isLoading}
        />
      </div>
    </div>
  );
};
