/**
 * SettingsPage — global language and voice input preferences (PRD V-01, V-02, V-09)
 */

import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "../components/common/LanguageSelector";
import { useLanguage } from "../hooks/useLanguage";
import "./SettingsPage.css";

export const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  return (
    <div className="settings-page">
      <header className="settings-page__header">
        <Link to="/" className="settings-page__back">{t("common.backToHome")}</Link>
        <div className="settings-page__title-group">
          <h1 className="settings-page__title">⚙️ {t("settings.title")}</h1>
          <p className="settings-page__subtitle">{t("settings.subtitle")}</p>
        </div>
      </header>

      <main className="settings-page__main">

        <section className="settings-section">
          <h2 className="settings-section__heading">🌐 {t("settings.language.title")}</h2>
          <p className="settings-section__description">{t("settings.language.description")}</p>
          <label className="settings-section__label" htmlFor="language-select">
            {t("settings.language.label")}
          </label>
          <LanguageSelector value={language} onChange={setLanguage} />
        </section>

        <section className="settings-section">
          <h2 className="settings-section__heading">🎙️ {t("settings.voice.title")}</h2>
          <p className="settings-section__description">{t("settings.voice.description")}</p>
        </section>

        <section className="settings-section settings-section--notice">
          <p className="settings-section__notice">{t("settings.aboriginal.notice")}</p>
        </section>

      </main>
    </div>
  );
};
