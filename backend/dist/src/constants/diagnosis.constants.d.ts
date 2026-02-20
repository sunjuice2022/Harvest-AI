/**
 * Diagnosis feature constants and configuration
 */
export declare const DIAGNOSIS_CONSTANTS: {
    CHAT_SESSIONS_TABLE: string;
    MEDIA_BUCKET: string;
    BEDROCK_MODEL_ID: string;
    IMAGE_ANALYSIS_TIMEOUT: number;
    SESSION_EXPIRY_DAYS: number;
    MAX_SESSION_MESSAGES: number;
    LOW_CONFIDENCE_THRESHOLD: number;
    HIGH_CONFIDENCE_THRESHOLD: number;
    UPLOAD_EXPIRY_SECONDS: number;
    MAX_FILE_SIZE_MB: number;
    ALLOWED_MIME_TYPES: string[];
};
export declare const DIAGNOSIS_SEVERITY_BADGES: {
    readonly info: {
        readonly color: "#3B82F6";
        readonly label: "Info";
    };
    readonly warning: {
        readonly color: "#F59E0B";
        readonly label: "Warning";
    };
    readonly critical: {
        readonly color: "#EF4444";
        readonly label: "Critical";
    };
};
export declare const CROP_TYPES: readonly ["Tomato", "Rice", "Wheat", "Maize", "Cotton", "Potato", "Soybean", "Apple", "Orange", "Grape"];
//# sourceMappingURL=diagnosis.constants.d.ts.map