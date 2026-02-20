/**
 * Supported languages and language storage constants (PRD §4.5)
 */

import type { SupportedLanguage, VoiceLanguageCode } from "./voice.types";

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: "en-AU", label: "English (AU)",      nativeLabel: "English",      transcribeCode: "en-AU" },
  { code: "zh-CN", label: "Mandarin Chinese",   nativeLabel: "普通话",        transcribeCode: "zh-CN" },
  { code: "zh-HK", label: "Cantonese",          nativeLabel: "廣東話",        transcribeCode: "zh-HK" },
  { code: "vi-VN", label: "Vietnamese",         nativeLabel: "Tiếng Việt",   transcribeCode: "vi-VN" },
  { code: "hi-IN", label: "Hindi",              nativeLabel: "हिन्दी",        transcribeCode: "hi-IN" },
  { code: "it-IT", label: "Italian",            nativeLabel: "Italiano",     transcribeCode: "it-IT" },
  { code: "ar-SA", label: "Arabic",             nativeLabel: "العربية",      transcribeCode: "ar-SA" },
];

export const DEFAULT_LANGUAGE_CODE: VoiceLanguageCode = "en-AU";
export const LANGUAGE_STORAGE_KEY = "agrisense_language";
