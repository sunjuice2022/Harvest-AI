/**
 * Diagnosis feature constants and configuration
 */
export const DIAGNOSIS_CONSTANTS = {
    // Table names
    CHAT_SESSIONS_TABLE: process.env.CHAT_SESSIONS_TABLE || "ChatSessions",
    MEDIA_BUCKET: process.env.MEDIA_BUCKET || "harvest-ai-media",
    // Bedrock configuration
    BEDROCK_MODEL_ID: "au.anthropic.claude-sonnet-4-6",
    IMAGE_ANALYSIS_TIMEOUT: 5000, // 5 seconds for instant diagnosis requirement
    // Session configuration
    SESSION_EXPIRY_DAYS: 90,
    MAX_SESSION_MESSAGES: 100,
    // Confidence thresholds
    LOW_CONFIDENCE_THRESHOLD: 60, // Below this, escalate to expert
    HIGH_CONFIDENCE_THRESHOLD: 85,
    // S3 configuration
    UPLOAD_EXPIRY_SECONDS: 600, // 10 minutes
    MAX_FILE_SIZE_MB: 10,
    ALLOWED_MIME_TYPES: ["image/jpeg", "image/png", "image/webp"],
};
export const DIAGNOSIS_SEVERITY_BADGES = {
    info: { color: "#3B82F6", label: "Info" },
    warning: { color: "#F59E0B", label: "Warning" },
    critical: { color: "#EF4444", label: "Critical" },
};
export const CROP_TYPES = [
    "Tomato",
    "Rice",
    "Wheat",
    "Maize",
    "Cotton",
    "Potato",
    "Soybean",
    "Apple",
    "Orange",
    "Grape",
];
//# sourceMappingURL=diagnosis.constants.js.map