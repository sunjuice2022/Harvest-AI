/**
 * useLanguage — reads and persists the user's preferred language (PRD V-01, V-02, V-08)
 */

import { useState, useCallback } from "react";
import i18n from "../i18n";
import { LANGUAGE_STORAGE_KEY, DEFAULT_LANGUAGE_CODE } from "@harvest-ai/shared";
import type { VoiceLanguageCode } from "@harvest-ai/shared";

function readStoredLanguage(): VoiceLanguageCode {
  return (localStorage.getItem(LANGUAGE_STORAGE_KEY) as VoiceLanguageCode) ?? DEFAULT_LANGUAGE_CODE;
}

export function useLanguage(): { language: VoiceLanguageCode; setLanguage: (code: VoiceLanguageCode) => void } {
  const [language, setLanguageState] = useState<VoiceLanguageCode>(readStoredLanguage);

  const setLanguage = useCallback((code: VoiceLanguageCode) => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    setLanguageState(code);
    void i18n.changeLanguage(code);
  }, []);

  return { language, setLanguage };
}

/** Read current language for use in fetch headers (non-reactive, call-time read) */
export function getCurrentLanguage(): VoiceLanguageCode {
  return readStoredLanguage();
}
