/**
 * LanguageSelector — dropdown to pick from the 7 supported languages (PRD V-01)
 */

import React from "react";
import { SUPPORTED_LANGUAGES } from "@agrisense/shared";
import type { VoiceLanguageCode } from "@agrisense/shared";
import "./LanguageSelector.css";

interface LanguageSelectorProps {
  value: VoiceLanguageCode;
  onChange: (code: VoiceLanguageCode) => void;
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps): React.ReactElement {
  return (
    <div className="language-selector">
      <select
        className="language-selector__select"
        value={value}
        onChange={(e) => onChange(e.target.value as VoiceLanguageCode)}
        aria-label="Select language"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeLabel} — {lang.label}
          </option>
        ))}
      </select>
      <span className="language-selector__arrow" aria-hidden="true">▾</span>
    </div>
  );
}
