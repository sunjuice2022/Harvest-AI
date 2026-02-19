/**
 * FarmRecommendationPage — AI-powered crop and livestock planning advisor
 */

import React from "react";
import { Link } from "react-router-dom";
import { RecommendationForm } from "../components/farm-recommendation/RecommendationForm";
import { RecommendationResultCard } from "../components/farm-recommendation/RecommendationResultCard";
import { useFarmRecommendation } from "../hooks/useFarmRecommendation";
import type { FarmRecommendationResponse } from "@harvest-ai/shared";
import "./FarmRecommendationPage.css";

function MarketInsightBanner({ insight }: { insight: string }): React.ReactElement {
  return (
    <div className="farm-page__insight">
      <span className="farm-page__insight-icon">📊</span>
      <p className="farm-page__insight-text">{insight}</p>
    </div>
  );
}

function CropSection({ result }: { result: FarmRecommendationResponse }): React.ReactElement | null {
  if (result.cropRecommendations.length === 0) return null;

  return (
    <section className="farm-page__section">
      <h2 className="farm-page__section-heading">
        <span>🌿</span> Crop Recommendations
      </h2>
      <div className="farm-page__cards">
        {result.cropRecommendations.map((rec, i) => (
          <RecommendationResultCard key={rec.cropName} variant="crop" recommendation={rec} rank={i} />
        ))}
      </div>
    </section>
  );
}

function LivestockSection({ result }: { result: FarmRecommendationResponse }): React.ReactElement | null {
  if (result.livestockRecommendations.length === 0) return null;

  return (
    <section className="farm-page__section">
      <h2 className="farm-page__section-heading">
        <span>🐄</span> Livestock Recommendations
      </h2>
      <div className="farm-page__cards">
        {result.livestockRecommendations.map((rec, i) => (
          <RecommendationResultCard key={rec.animalName} variant="livestock" recommendation={rec} rank={i} />
        ))}
      </div>
    </section>
  );
}

export const FarmRecommendationPage: React.FC = () => {
  const [state, actions] = useFarmRecommendation();

  return (
    <div className="farm-page">
      <header className="farm-page__header">
        <Link to="/" className="farm-page__back">← Home</Link>
        <div className="farm-page__title-group">
          <h1 className="farm-page__title">🌾 Farm Planning Advisor</h1>
          <p className="farm-page__subtitle">
            AI analyses your farm conditions and recommends the most profitable crops and livestock — including high-demand categories like eggs and beef.
          </p>
        </div>
      </header>

      <main className="farm-page__main">
        <RecommendationForm onSubmit={actions.getRecommendations} isLoading={state.isLoading} />

        {state.error && (
          <div className="farm-page__error">
            <span>{state.error}</span>
            <button onClick={actions.clearError} className="farm-page__error-close" type="button">✕</button>
          </div>
        )}

        {state.isLoading && (
          <div className="farm-page__loading">
            <div className="farm-page__spinner" />
            <p>AI is analysing your conditions…</p>
          </div>
        )}

        {state.result && !state.isLoading && (
          <div className="farm-page__results">
            <MarketInsightBanner insight={state.result.marketInsight} />
            <CropSection result={state.result} />
            <LivestockSection result={state.result} />
          </div>
        )}
      </main>
    </div>
  );
};
