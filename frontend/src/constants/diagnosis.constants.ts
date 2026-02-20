/**
 * Frontend constants for diagnosis domain
 */

export const DIAGNOSIS_CONSTANTS = {
  MAX_IMAGE_SIZE_MB: 10,
  MAX_IMAGE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  API_ENDPOINTS: {
    CHAT: "/diagnosis/chat",
    UPLOAD_PHOTO: "/diagnosis/upload",
    SESSIONS: "/diagnosis/sessions",
  },
} as const;
