/**
 * Hook for fetching and filtering commodity market prices
 */

import { useState, useEffect, useMemo } from "react";
import type { Commodity, CommodityCategory, MarketPricesResponse } from "@harvest-ai/shared";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

interface ExtendedResponse extends MarketPricesResponse {
  worldBankCommodities?: readonly string[];
}

interface MarketPricesState {
  commodities: Commodity[];
  featured: Commodity[];
  filtered: Commodity[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  worldBankCommodities: readonly string[];
}

export function useMarketPrices(category: CommodityCategory | "all") {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [worldBankCommodities, setWorldBankCommodities] = useState<readonly string[]>([]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(`${API_BASE_URL}/market-prices`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<ExtendedResponse>;
      })
      .then((data) => {
        if (!cancelled) {
          setCommodities(data.commodities);
          setLastUpdated(data.lastUpdated);
          setWorldBankCommodities(data.worldBankCommodities ?? []);
          setIsLoading(false);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
          setIsLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  const featured = useMemo(
    () => commodities.filter((c) => c.isFeatured),
    [commodities]
  );

  const filtered = useMemo(
    () =>
      category === "all"
        ? commodities
        : commodities.filter((c) => c.category === category),
    [commodities, category]
  );

  const state: MarketPricesState = {
    commodities,
    featured,
    filtered,
    isLoading,
    error,
    lastUpdated,
    worldBankCommodities,
  };

  return state;
}
