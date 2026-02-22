/**
 * Root application component — sets up routing and global layout.
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DiagnosisPage } from './pages/DiagnosisPage';
import { PresentationPage } from './pages/PresentationPage';
import { FarmRecommendationPage } from './pages/FarmRecommendationPage';
import { MarketPricePage } from './pages/MarketPricePage';
import { SettingsPage } from './pages/SettingsPage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { VoiceAssistantPage } from './pages/VoiceAssistantPage';
import { WeatherPage } from './pages/WeatherPage';
import '@/styles/global.css';

const HomePage = lazy(() => import('./pages/HomePage'));

export function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/diagnosis" element={<DiagnosisPage />} />
          <Route path="/farm-recommendation" element={<FarmRecommendationPage />} />
          <Route path="/market-prices" element={<MarketPricePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/voice" element={<VoiceAssistantPage />} />
          <Route path="/demo" element={<PresentationPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

function PageLoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        color: 'var(--color-medium-gray)',
        fontFamily: 'var(--font-primary)',
      }}
      role="status"
      aria-live="polite"
    >
      Loading…
    </div>
  );
}
