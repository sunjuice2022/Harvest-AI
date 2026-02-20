/**
 * Voice transcription constants and language name mapping (PRD §4.5)
 */
export const VOICE_CONSTANTS = {
    SAMPLE_RATE_HZ: 16000,
    MEDIA_ENCODING: "ogg-opus",
    MAX_AUDIO_SIZE_BYTES: 5 * 1024 * 1024,
    AUDIO_CHUNK_SIZE: 1024,
};
/** Human-readable language names injected into Claude system prompts */
export const LANGUAGE_NAMES = {
    "en-AU": "English",
    "zh-CN": "Mandarin Chinese (简体中文)",
    "zh-HK": "Cantonese (廣東話)",
    "vi-VN": "Vietnamese (Tiếng Việt)",
    "hi-IN": "Hindi (हिन्दी)",
    "it-IT": "Italian (Italiano)",
    "ar-SA": "Arabic (العربية)",
};
//# sourceMappingURL=voice.constants.js.map