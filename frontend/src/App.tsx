/**
 * Root App component with routing
 */

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DiagnosisPage } from "./pages/DiagnosisPage";
import { HomePage } from "./pages/HomePage";
import { FarmRecommendationPage } from "./pages/FarmRecommendationPage";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/diagnosis" element={<DiagnosisPage />} />
        <Route path="/farm-recommendation" element={<FarmRecommendationPage />} />
      </Routes>
    </BrowserRouter>
  );
};
