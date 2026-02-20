/**
 * i18next initialisation — multilingual support for 7 Australian-focused languages (PRD §4.5)
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { LANGUAGE_STORAGE_KEY, DEFAULT_LANGUAGE_CODE } from "@harvest-ai/shared";

import en from "./locales/en.json";
import zhCN from "./locales/zh-CN.json";
import zhHK from "./locales/zh-HK.json";
import viVN from "./locales/vi-VN.json";
import hiIN from "./locales/hi-IN.json";
import itIT from "./locales/it-IT.json";
import arSA from "./locales/ar-SA.json";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      "en-AU": { translation: en },
      "zh-CN": { translation: zhCN },
      "zh-HK": { translation: zhHK },
      "vi-VN": { translation: viVN },
      "hi-IN": { translation: hiIN },
      "it-IT": { translation: itIT },
      "ar-SA": { translation: arSA },
    },
    lng: localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? DEFAULT_LANGUAGE_CODE,
    fallbackLng: DEFAULT_LANGUAGE_CODE,
    interpolation: { escapeValue: false },
    detection: { order: ["localStorage"], lookupLocalStorage: LANGUAGE_STORAGE_KEY },
  });

export default i18n;
