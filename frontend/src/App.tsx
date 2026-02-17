/** Root application component — sets up routing and global layout. */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@/styles/global.css';

const HomePage = lazy(() => import('./pages/HomePage.js'));

export default function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/weather" element={<HomePage />} />
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
