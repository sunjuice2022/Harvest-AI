/**
 * World Bank Commodity Price API — fetches real USD prices and converts to AUD.
 * Data source: https://api.worldbank.org (public, no API key required)
 * Frequency: monthly | Cache: 24h in-memory
 */

import axios from "axios";
import type { Commodity, PriceTrend } from "@harvest-ai/shared";

interface WBPoint {
  date: string; // "YYYY-MM"
  value: number | null;
}

interface CommodityMapping {
  indicatorCode: string;
  toAud: (usdValue: number) => number;
}

const WB_BASE = "https://api.worldbank.org/v2/en/indicator";
const AUD_RATE = 1.58; // 1 USD ≈ 1.58 AUD (approximate, Feb 2026)
const LB_TO_KG = 2.20462;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export const WB_COMMODITY_IDS = ["wheat", "maize", "rice", "beef", "bananas", "cotton"] as const;

const COMMODITY_MAP: Record<string, CommodityMapping> = {
  wheat:   { indicatorCode: "PWHEAMTUSDM", toAud: (v) => Math.round(v * AUD_RATE * 100) / 100 },
  maize:   { indicatorCode: "PMAIZMT",     toAud: (v) => Math.round(v * AUD_RATE * 100) / 100 },
  rice:    { indicatorCode: "PRICENPQ",    toAud: (v) => Math.round(v * AUD_RATE * 100) / 100 },
  beef:    { indicatorCode: "PBEEFUSDM",   toAud: (v) => Math.round(v * 0.01 * LB_TO_KG * AUD_RATE * 100) / 100 },
  bananas: { indicatorCode: "PBANSQ",      toAud: (v) => Math.round((v / 1000) * AUD_RATE * 100) / 100 },
  cotton:  { indicatorCode: "PCOTTIND",    toAud: (v) => Math.round(v * 0.01 * LB_TO_KG * AUD_RATE * 100) / 100 },
};

let cache: { data: Map<string, WBPoint[]>; fetchedAt: number } | null = null;

async function fetchIndicator(code: string): Promise<WBPoint[]> {
  const url = `${WB_BASE}/${code}?format=json&mrv=30&frequency=M`;
  const response = await axios.get<[unknown, WBPoint[]]>(url, { timeout: 8000 });
  return (response.data[1] ?? []).filter((p) => p.value !== null);
}

function computeStats(audPrices: number[]) {
  const current = audPrices[0];
  const previous = audPrices[1] ?? current;
  const change = current - previous;
  const prices = audPrices;
  return {
    currentPrice: Math.round(current * 100) / 100,
    priceChange24h: Math.round(change * 100) / 100,
    priceChangePct: Math.round((change / previous) * 10000) / 100,
    monthlyHigh: Math.round(Math.max(...prices) * 100) / 100,
    monthlyLow: Math.round(Math.min(...prices) * 100) / 100,
    averagePrice: Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100,
  };
}

function deriveTrend(points: WBPoint[]): PriceTrend {
  const valid = points.filter((p): p is WBPoint & { value: number } => p.value !== null);
  if (valid.length < 2) return "stable";
  const pct = ((valid[0].value - valid[1].value) / valid[1].value) * 100;
  if (pct > 1) return "up";
  if (pct < -1) return "down";
  return "stable";
}

export async function fetchWorldBankData(): Promise<Map<string, WBPoint[]>> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) return cache.data;

  const entries = await Promise.all(
    Object.entries(COMMODITY_MAP).map(async ([id, mapping]) => {
      const points = await fetchIndicator(mapping.indicatorCode);
      return [id, points] as const;
    })
  );

  const data = new Map(entries.filter(([, pts]) => pts.length > 0));
  cache = { data, fetchedAt: Date.now() };
  console.log(`[WorldBank] Loaded real prices for: ${[...data.keys()].join(", ")}`);
  return data;
}

export function enrichCommodity(commodity: Commodity, wbPoints: WBPoint[]): Commodity {
  const mapping = COMMODITY_MAP[commodity.id];
  if (!mapping || wbPoints.length === 0) return commodity;

  const audPrices = wbPoints.map((p) => mapping.toAud(p.value as number));
  const priceHistory = wbPoints.map((p) => ({
    date: `${p.date}-01`,
    price: mapping.toAud(p.value as number),
  }));

  return {
    ...commodity,
    ...computeStats(audPrices),
    trend: deriveTrend(wbPoints),
    priceHistory,
  };
}
