/**
 * Shared voice and language types for multilingual voice assistant (PRD §4.5)
 */

export type VoiceLanguageCode = "en-AU" | "zh-CN" | "zh-HK" | "vi-VN" | "hi-IN" | "it-IT" | "ar-SA";

export interface SupportedLanguage {
  code: VoiceLanguageCode;
  /** Display name in English */
  label: string;
  /** Display name in the language itself */
  nativeLabel: string;
  /** AWS Transcribe language identifier */
  transcribeCode: string;
}

export interface VoiceTranscribeResponse {
  text: string;
  languageCode: VoiceLanguageCode;
}
