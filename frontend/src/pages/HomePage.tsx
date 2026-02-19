/**
 * Homepage with feature blocks for all planned platform features
 */

import React from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";

interface Feature {
  id: string;
  icon: string;
  name: string;
  description: string;
  status: "live" | "coming-soon";
  href?: string;
}

const FEATURES: Feature[] = [
  {
    id: "weather",
    icon: "🌦️",
    name: "Smart Weather & Disaster Alerts",
    description:
      "Real-time weather forecasts with high/low temperature alerts, flood and drought warnings, and early-stage natural disaster notifications to support timely farm decisions.",
    status: "coming-soon",
  },
  {
    id: "diagnosis",
    icon: "🔬",
    name: "AI Crop Disease Detection",
    description:
      "Farmers upload a crop image and AI instantly identifies diseases, diagnoses the issue, and provides clear treatment recommendations.",
    status: "live",
    href: "/diagnosis",
  },
  {
    id: "crop-recommendation",
    icon: "🌱",
    name: "Farm Planning Advisor",
    description:
      "AI recommends the most profitable crops and livestock — including eggs, beef, dairy and more — based on your soil, climate, and market conditions.",
    status: "live",
    href: "/farm-recommendation",
  },
  {
    id: "irrigation",
    icon: "💧",
    name: "Smart Irrigation Advisor",
    description:
      "Weather-aware irrigation scheduling that reduces water waste and ensures crops receive the right amount of water at the right time.",
    status: "coming-soon",
  },
  {
    id: "market",
    icon: "📈",
    name: "Market Price Intelligence",
    description:
      "Live market price tracking with AI-powered predictions to help farmers choose the best time to sell for maximum profit.",
    status: "live",
    href: "/market-prices",
  },
  {
    id: "voice",
    icon: "🎙️",
    name: "Multilingual Voice Assistant",
    description:
      "Voice interaction system supporting regional languages, enabling low-literacy farmers to access information and services easily through voice.",
    status: "coming-soon",
  },
  {
    id: "community",
    icon: "🤝",
    name: "FarmUnity – Marketplace & Community",
    description:
      "A platform for farmers to sell goods directly, connect with buyers, and share knowledge within a supportive digital farming community.",
    status: "coming-soon",
  },
  {
    id: "hiring",
    icon: "👷",
    name: "Farmers Hand – Seasonal Hiring Hub",
    description:
      "A dedicated hub for seasonal labor hiring, helping farmers quickly find workers during peak farming periods.",
    status: "coming-soon",
  },
];

const FeatureCard: React.FC<{ feature: Feature }> = ({ feature }) => {
  const inner = (
    <>
      <span className="feature-card__icon">{feature.icon}</span>
      <div className="feature-card__body">
        <div className="feature-card__header">
          <h3 className="feature-card__name">{feature.name}</h3>
          <span className={`feature-card__badge feature-card__badge--${feature.status}`}>
            {feature.status === "live" ? "Live" : "Coming Soon"}
          </span>
        </div>
        <p className="feature-card__description">{feature.description}</p>
      </div>
      {feature.status === "live" && <span className="feature-card__arrow">→</span>}
    </>
  );

  if (feature.href) {
    return (
      <Link to={feature.href} className="feature-card feature-card--live">
        {inner}
      </Link>
    );
  }

  return <div className="feature-card feature-card--soon">{inner}</div>;
};

export const HomePage: React.FC = () => (
  <div className="home-page">
    <header className="home-hero">
      <div className="home-hero__logo">🌾</div>
      <h1 className="home-hero__title">
        Harvest <span>AI</span>
      </h1>
      <p className="home-hero__subtitle">
        AI-powered tools to help farmers grow smarter, reduce loss, and maximise profit.
      </p>
      <div className="home-hero__meta">
        <span className="home-hero__meta-dot" />
        3 features live · 5 coming soon
      </div>
    </header>

    <main className="home-features">
      <h2 className="home-features__heading">Platform Features</h2>
      <div className="home-features__grid">
        {FEATURES.map((f) => (
          <FeatureCard key={f.id} feature={f} />
        ))}
      </div>
    </main>

    <footer className="home-footer">
      © {new Date().getFullYear()} Harvest AI · Powered by Amazon Bedrock
    </footer>
  </div>
);
