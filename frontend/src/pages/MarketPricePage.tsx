/**
 * Market Price Intelligence page
 * Hero featured charts + filterable commodity list with AI detail panel
 */

import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import type { CommodityCategory, Commodity } from "@harvest-ai/shared";
import { useMarketPrices } from "../hooks/useMarketPrices";
import { useMarketInsight } from "../hooks/useMarketInsight";
import { TrendChartCard } from "../components/market-price/TrendChartCard";
import { CategoryFilter } from "../components/market-price/CategoryFilter";
import { CommodityRow } from "../components/market-price/CommodityRow";
import { ProductDetailPanel } from "../components/market-price/ProductDetailPanel";
import "./MarketPricePage.css";

type FilterCat = CommodityCategory | "all";

export const MarketPricePage: React.FC = () => {
  const [category, setCategory] = useState<FilterCat>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { commodities, featured, filtered, isLoading, error, lastUpdated, worldBankCommodities } =
    useMarketPrices(category);
  const { insight, isLoading: insightLoading, error: insightError, fetchInsight, clearInsight } =
    useMarketInsight();

  const selectedCommodity: Commodity | null =
    selectedId ? (commodities.find((c) => c.id === selectedId) ?? null) : null;

  const counts = useMemo(() => {
    const map: Partial<Record<FilterCat, number>> = { all: commodities.length };
    for (const c of commodities) {
      map[c.category] = (map[c.category] ?? 0) + 1;
    }
    return map;
  }, [commodities]);

  function handleToggleRow(id: string): void {
    if (selectedId === id) {
      setSelectedId(null);
      clearInsight();
    } else {
      setSelectedId(id);
      clearInsight();
    }
  }

  function handleFeaturedClick(c: Commodity): void {
    setSelectedId((prev) => (prev === c.id ? null : c.id));
    clearInsight();
  }

  return (
    <div className="market-page">
      <header className="market-header">
        <Link to="/" className="market-header__back">← Home</Link>
        <div className="market-header__title-row">
          <h1 className="market-header__title">📈 Market Price Intelligence</h1>
          {lastUpdated && (
            <span className="market-header__updated">
              Updated {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </div>
        <p className="market-header__subtitle">
          Indicative commodity prices · AI-powered sell / hold / buy signals
        </p>
        <div className="market-header__sources">
          <span className="market-source-badge market-source-badge--wb">
            🌐{" "}
            <a href="https://api.worldbank.org/v2/en/indicator" target="_blank" rel="noreferrer">
              World Bank Commodity API
            </a>
            {worldBankCommodities.length > 0 && `: ${worldBankCommodities.join(", ")}`}
          </span>
<span className="market-source-badge market-source-badge--ai">
            🤖{" "}
            <a href="https://aws.amazon.com/bedrock/" target="_blank" rel="noreferrer">
              Amazon Bedrock (Claude)
            </a>
          </span>
        </div>
        <p className="market-header__disclaimer">
          Grain & commodity prices sourced from the{" "}
          <a href="https://www.worldbank.org/en/research/commodity-markets" target="_blank" rel="noreferrer">
            World Bank Pink Sheet
          </a>{" "}
          (monthly, public domain). AI analysis powered by Amazon Bedrock. Prices are indicative only and do not constitute financial advice.
          For live AU prices refer to{" "}
          <a href="https://www.agriculture.gov.au/abares" target="_blank" rel="noreferrer">ABARES</a>,{" "}
          <a href="https://www.mla.com.au/prices-and-markets/" target="_blank" rel="noreferrer">MLA</a>, or{" "}
          <a href="https://www.asx.com.au/markets/trade-our-derivatives-market/derivatives-market-prices/agricultural" target="_blank" rel="noreferrer">ASX Agricultural Futures</a>.
          USD → AUD at approx. 1.58.
        </p>
      </header>

      {isLoading && (
        <div className="market-loading">
          <span className="market-loading__spinner" />
          Loading market data…
        </div>
      )}

      {error && (
        <div className="market-error">⚠ Failed to load prices: {error}</div>
      )}

      {!isLoading && !error && (
        <>
          {/* Featured hero charts */}
          <section className="market-featured">
            <h2 className="market-section-title">Featured Trends</h2>
            <div className="market-featured__grid">
              {featured.map((c) => (
                <TrendChartCard
                  key={c.id}
                  commodity={c}
                  isSelected={selectedId === c.id}
                  onClick={handleFeaturedClick}
                />
              ))}
            </div>

            {selectedCommodity && featured.some((f) => f.id === selectedId) && (
              <div className="market-featured__detail">
                <ProductDetailPanel
                  commodity={selectedCommodity}
                  insight={insight}
                  isLoadingInsight={insightLoading}
                  insightError={insightError}
                  onGetInsight={fetchInsight}
                />
              </div>
            )}
          </section>

          {/* Commodity list */}
          <section className="market-list-section">
            <h2 className="market-section-title">All Commodities</h2>
            <CategoryFilter
              selected={category}
              onChange={setCategory}
              counts={counts}
            />

            <div className="market-list">
              {filtered.map((c) => (
                <React.Fragment key={c.id}>
                  <CommodityRow
                    commodity={c}
                    isSelected={selectedId === c.id}
                    onToggle={handleToggleRow}
                  />
                  {selectedId === c.id && selectedCommodity && (
                    <ProductDetailPanel
                      commodity={selectedCommodity}
                      insight={insight}
                      isLoadingInsight={insightLoading}
                      insightError={insightError}
                      onGetInsight={fetchInsight}
                    />
                  )}
                </React.Fragment>
              ))}

              {filtered.length === 0 && (
                <p className="market-list__empty">No commodities in this category.</p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};
