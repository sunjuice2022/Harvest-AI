/**
 * Root application component — sets up routing and global layout.
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DiagnosisPage } from './pages/DiagnosisPage';
import { FarmRecommendationPage } from './pages/FarmRecommendationPage';
import { MarketPricePage } from './pages/MarketPricePage';
import { SettingsPage } from './pages/SettingsPage';
import { VoiceAssistantPage } from './pages/VoiceAssistantPage';
import '@/styles/global.css';

const HomePage = lazy(() => import('./pages/HomePage'));

export function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/weather" element={<HomePage />} />
          <Route path="/diagnosis" element={<DiagnosisPage />} />
          <Route path="/farm-recommendation" element={<FarmRecommendationPage />} />
          <Route path="/market-prices" element={<MarketPricePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/voice" element={<VoiceAssistantPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

function PageLoadingFallback(): JSX.Element {
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
