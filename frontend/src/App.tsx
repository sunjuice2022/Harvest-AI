/**
 * Root App component with routing
 */

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DiagnosisPage } from "./pages/DiagnosisPage";
import { HomePage } from "./pages/HomePage";
import { FarmRecommendationPage } from "./pages/FarmRecommendationPage";
import { MarketPricePage } from "./pages/MarketPricePage";
import { SettingsPage } from "./pages/SettingsPage";
import { VoiceAssistantPage } from "./pages/VoiceAssistantPage";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/diagnosis" element={<DiagnosisPage />} />
        <Route path="/farm-recommendation" element={<FarmRecommendationPage />} />
        <Route path="/market-prices" element={<MarketPricePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/voice" element={<VoiceAssistantPage />} />
      </Routes>
    </BrowserRouter>
  );
};
