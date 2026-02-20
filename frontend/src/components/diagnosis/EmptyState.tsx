/**
 * EmptyState component - displays welcome message when no messages exist
 */

import React from "react";

interface EmptyStateProps {
  onPhotoUploadClick: () => void;
  onTextInputFocus: () => void;
  hasSelectedPhoto: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onPhotoUploadClick,
  onTextInputFocus,
  hasSelectedPhoto,
}) => {
  return (
    <div className="empty-state">
      <div className="empty-icon">🌱</div>
      <h2>Welcome to Crop Diagnosis AI</h2>
      <p>Start by uploading a photo of your plant or describing the issue you're experiencing.</p>
      {hasSelectedPhoto && (
        <div className="selected-photo-badge">
          <span>📸 Photo selected - Ready to send!</span>
        </div>
      )}
      <div className="empty-actions">
        <button
          className="action-button"
          onClick={onPhotoUploadClick}
          type="button"
        >
          📸 Upload Photo
        </button>
        <span className="divider">or</span>
        <button
          className="action-button text-button"
          onClick={onTextInputFocus}
          type="button"
        >
          💬 Type Description
        </button>
      </div>
    </div>
  );
};
