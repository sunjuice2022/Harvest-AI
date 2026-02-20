/**
 * Hook for fetching AI market insight for a selected commodity
 */

import { useState } from "react";
import type { Commodity, MarketInsightResponse } from "@harvest-ai/shared";
import { getCurrentLanguage } from "./useLanguage";

interface InsightState {
  insight: MarketInsightResponse | null;
  isLoading: boolean;
  error: string | null;
}

export function useMarketInsight() {
  const [state, setState] = useState<InsightState>({
    insight: null,
    isLoading: false,
    error: null,
  });

  async function fetchInsight(commodity: Commodity): Promise<void> {
    setState({ insight: null, isLoading: true, error: null });
    try {
      const res = await fetch("/api/market-prices/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-language": getCurrentLanguage() },
        body: JSON.stringify({
          commodityId: commodity.id,
          commodityName: commodity.name,
          currentPrice: commodity.currentPrice,
          unit: commodity.unit,
          currency: commodity.currency,
          priceChangePct: commodity.priceChangePct,
          trend: commodity.trend,
          monthlyHigh: commodity.monthlyHigh,
          monthlyLow: commodity.monthlyLow,
          averagePrice: commodity.averagePrice,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const insight = (await res.json()) as MarketInsightResponse;
      setState({ insight, isLoading: false, error: null });
    } catch (err) {
      setState({
        insight: null,
        isLoading: false,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  function clearInsight(): void {
    setState({ insight: null, isLoading: false, error: null });
  }

  return { ...state, fetchInsight, clearInsight };
}
