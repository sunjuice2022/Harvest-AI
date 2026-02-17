/**
 * PhotoUpload component - handles camera capture and gallery upload
 */

import React, { useRef, useState } from "react";
import { DIAGNOSIS_CONSTANTS } from "../../constants/diagnosis.constants";
import "./PhotoUpload.css";

interface PhotoUploadProps {
  onPhotoSelected: (file: File) => void;
  isLoading?: boolean;
  uploadProgress?: number;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  onPhotoSelected,
  isLoading = false,
  uploadProgress = 0,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file.size > DIAGNOSIS_CONSTANTS.MAX_IMAGE_SIZE_BYTES) {
      alert(`File too large (max ${DIAGNOSIS_CONSTANTS.MAX_IMAGE_SIZE_MB}MB)`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setSelectedFileName(file.name);
    onPhotoSelected(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleClearPreview = () => {
    setPreview(null);
    setSelectedFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  };

  return (
    <div className="photo-upload">
      {preview ? (
        <div className="photo-preview">
          <img src={preview} alt="preview" className="preview-image" />
          <div className="preview-info">
            <span className="preview-filename">{selectedFileName}</span>
            {isLoading && (
              <div className="upload-progress">
                <div
                  className="progress-bar"
                  style={{ width: `${uploadProgress}%` }}
                />
                <span className="progress-text">{uploadProgress}%</span>
              </div>
            )}
          </div>
          {!isLoading && (
            <button
              className="clear-button"
              onClick={handleClearPreview}
              type="button"
            >
              ✕
            </button>
          )}
        </div>
      ) : (
        <div className="upload-actions">
          <button
            className="upload-button camera-button"
            onClick={handleCameraClick}
            disabled={isLoading}
            type="button"
          >
            <span className="button-icon">📷</span>
            <span className="button-text">Take Photo</span>
          </button>
          <span className="upload-divider">or</span>
          <button
            className="upload-button gallery-button"
            onClick={handleGalleryClick}
            disabled={isLoading}
            type="button"
          >
            <span className="button-icon">🖼️</span>
            <span className="button-text">Upload Photo</span>
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        style={{ display: "none" }}
        capture={false}
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        onChange={handleCameraCapture}
        style={{ display: "none" }}
        capture="environment"
      />
    </div>
  );
};
