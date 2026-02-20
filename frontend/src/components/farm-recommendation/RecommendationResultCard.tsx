/**
 * RecommendationResultCard — displays a single crop or livestock recommendation
 */

import React from "react";
import type { CropRecommendation, LivestockRecommendation, MarketDemand } from "@harvest-ai/shared";
import "./RecommendationResultCard.css";

type CardVariant = "crop" | "livestock";

interface CropCardProps {
  variant: "crop";
  recommendation: CropRecommendation;
  rank: number;
}

interface LivestockCardProps {
  variant: "livestock";
  recommendation: LivestockRecommendation;
  rank: number;
}

type RecommendationResultCardProps = CropCardProps | LivestockCardProps;

const RANK_MEDALS = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];

const DEMAND_LABELS: Record<MarketDemand, { label: string; className: string }> = {
  high: { label: "↑ High Demand", className: "demand--high" },
  medium: { label: "→ Med Demand", className: "demand--medium" },
  low: { label: "↓ Low Demand", className: "demand--low" },
};

function ScoreBar({ score }: { score: number }): React.ReactElement {
  return (
    <div className="result-card__score-bar">
      <div className="result-card__score-fill" style={{ width: `${score}%` }} />
    </div>
  );
}

function CropDetails({ rec }: { rec: CropRecommendation }): React.ReactElement {
  return (
    <div className="result-card__meta">
      <span className="result-card__meta-item">🌱 {rec.estimatedYieldPerHectare} / ha</span>
      <span className="result-card__meta-item">📅 {rec.growingPeriodDays} days</span>
    </div>
  );
}

function LivestockDetails({ rec }: { rec: LivestockRecommendation }): React.ReactElement {
  return (
    <div className="result-card__meta">
      <span className="result-card__meta-item">🏷️ {rec.primaryOutput}</span>
      <span className="result-card__meta-item">⏱ {rec.productionTimeline}</span>
    </div>
  );
}

export function RecommendationResultCard(props: RecommendationResultCardProps): React.ReactElement {
  const { variant, rank } = props;
  const rec = props.recommendation;
  const name = variant === "crop" ? (rec as CropRecommendation).cropName : (rec as LivestockRecommendation).animalName;
  const emoji = variant === "crop" ? (rec as CropRecommendation).cropEmoji : (rec as LivestockRecommendation).animalEmoji;
  const demandKey = rec.marketDemand?.toLowerCase() as MarketDemand;
  const demand = DEMAND_LABELS[demandKey] ?? DEMAND_LABELS["medium"];

  return (
    <div className={`result-card result-card--${variant}`}>
      <div className="result-card__header">
        <span className="result-card__rank">{RANK_MEDALS[rank] ?? `#${rank + 1}`}</span>
        <span className="result-card__emoji">{emoji}</span>
        <div className="result-card__title-group">
          <h3 className="result-card__name">{name}</h3>
          <span className={`result-card__demand ${demand.className}`}>{demand.label}</span>
        </div>
        <span className="result-card__score-value">{rec.suitabilityScore}%</span>
      </div>

      <ScoreBar score={rec.suitabilityScore} />

      {variant === "crop"
        ? <CropDetails rec={rec as CropRecommendation} />
        : <LivestockDetails rec={rec as LivestockRecommendation} />}

      <ul className="result-card__reasons">
        {rec.reasons.map((reason, i) => (
          <li key={i} className="result-card__reason">• {reason}</li>
        ))}
      </ul>
    </div>
  );
}
