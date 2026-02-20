"use strict";
/**
 * Supported languages and language storage constants (PRD §4.5)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LANGUAGE_STORAGE_KEY = exports.DEFAULT_LANGUAGE_CODE = exports.SUPPORTED_LANGUAGES = void 0;
exports.SUPPORTED_LANGUAGES = [
    { code: "en-AU", label: "English (AU)", nativeLabel: "English", transcribeCode: "en-AU" },
    { code: "zh-CN", label: "Mandarin Chinese", nativeLabel: "普通话", transcribeCode: "zh-CN" },
    { code: "zh-HK", label: "Cantonese", nativeLabel: "廣東話", transcribeCode: "zh-HK" },
    { code: "vi-VN", label: "Vietnamese", nativeLabel: "Tiếng Việt", transcribeCode: "vi-VN" },
    { code: "hi-IN", label: "Hindi", nativeLabel: "हिन्दी", transcribeCode: "hi-IN" },
    { code: "it-IT", label: "Italian", nativeLabel: "Italiano", transcribeCode: "it-IT" },
    { code: "ar-SA", label: "Arabic", nativeLabel: "العربية", transcribeCode: "ar-SA" },
];
exports.DEFAULT_LANGUAGE_CODE = "en-AU";
exports.LANGUAGE_STORAGE_KEY = "agrisense_language";
//# sourceMappingURL=voice.constants.js.map