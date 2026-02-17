/**
 * Root App component with routing
 */

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DiagnosisPage } from "./pages/DiagnosisPage";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/diagnosis" element={<DiagnosisPage />} />
        <Route
          path="/"
          element={
            <div style={{ padding: "40px", textAlign: "center" }}>
              <h1>🌾 AgriSense AI</h1>
              <p>Welcome to Crop Diagnosis AI</p>
              <p>
                <a href="/diagnosis" style={{ color: "#84cc16", fontSize: "18px" }}>
                  Go to Diagnosis Chatbot →
                </a>
              </p>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
