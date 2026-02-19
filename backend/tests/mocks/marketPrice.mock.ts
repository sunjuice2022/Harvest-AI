/**
 * Mock data for Market Price Intelligence — Australian market (AUD)
 */

import {
  Commodity,
  MarketInsightRequest,
  MarketInsightResponse,
  MarketPricesResponse,
} from "@harvest-ai/shared";

function makePriceHistory(
  base: number,
  volatility: number,
  trend: "up" | "down" | "stable"
): { date: string; price: number }[] {
  const history: { date: string; price: number }[] = [];
  const now = new Date("2026-02-19");
  let price = base * (trend === "up" ? 0.88 : trend === "down" ? 1.12 : 1.0);
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const drift = trend === "up" ? 0.004 : trend === "down" ? -0.004 : 0;
    const noise = (Math.random() * 2 - 1) * volatility;
    price = Math.max(price * (1 + drift) + noise, base * 0.5);
    history.push({
      date: d.toISOString().slice(0, 10),
      price: Math.round(price * 100) / 100,
    });
  }
  return history;
}

const RAW: Omit<Commodity, "priceHistory" | "monthlyHigh" | "monthlyLow" | "averagePrice">[] = [
  // Livestock — featured
  { id: "eggs", name: "Eggs", emoji: "🥚", category: "livestock", currentPrice: 7.5, unit: "dozen", currency: "AUD", priceChange24h: 0.22, priceChangePct: 3.0, trend: "up", isFeatured: true },
  { id: "beef", name: "Beef (Cattle)", emoji: "🥩", category: "livestock", currentPrice: 14.5, unit: "kg", currency: "AUD", priceChange24h: 0.18, priceChangePct: 1.3, trend: "up", isFeatured: true },
  // Grains — featured
  { id: "wheat", name: "Wheat", emoji: "🌾", category: "grains", currentPrice: 295, unit: "tonne", currency: "AUD", priceChange24h: 3.2, priceChangePct: 1.1, trend: "up", isFeatured: true },
  // Cash Crops — featured
  { id: "canola", name: "Canola", emoji: "🌻", category: "cash-crops", currentPrice: 685, unit: "tonne", currency: "AUD", priceChange24h: 9.5, priceChangePct: 1.4, trend: "up", isFeatured: true },
  // Grains
  { id: "barley", name: "Barley", emoji: "🌾", category: "grains", currentPrice: 235, unit: "tonne", currency: "AUD", priceChange24h: -1.5, priceChangePct: -0.6, trend: "stable", isFeatured: false },
  { id: "maize", name: "Maize", emoji: "🌽", category: "grains", currentPrice: 310, unit: "tonne", currency: "AUD", priceChange24h: 2.8, priceChangePct: 0.9, trend: "up", isFeatured: false },
  { id: "chickpeas", name: "Chickpeas", emoji: "🫘", category: "grains", currentPrice: 490, unit: "tonne", currency: "AUD", priceChange24h: -4.0, priceChangePct: -0.8, trend: "down", isFeatured: false },
  { id: "rice", name: "Rice", emoji: "🍚", category: "grains", currentPrice: 620, unit: "tonne", currency: "AUD", priceChange24h: -6.0, priceChangePct: -1.0, trend: "down", isFeatured: false },
  // Livestock
  { id: "pork", name: "Pork", emoji: "🐖", category: "livestock", currentPrice: 5.8, unit: "kg", currency: "AUD", priceChange24h: -0.06, priceChangePct: -1.0, trend: "down", isFeatured: false },
  { id: "chicken", name: "Chicken (Broiler)", emoji: "🐔", category: "livestock", currentPrice: 4.9, unit: "kg", currency: "AUD", priceChange24h: 0.04, priceChangePct: 0.8, trend: "stable", isFeatured: false },
  { id: "milk", name: "Dairy Milk", emoji: "🥛", category: "livestock", currentPrice: 0.72, unit: "litre", currency: "AUD", priceChange24h: 0.01, priceChangePct: 1.4, trend: "up", isFeatured: false },
  // Vegetables
  { id: "tomatoes", name: "Tomatoes", emoji: "🍅", category: "vegetables", currentPrice: 3.5, unit: "kg", currency: "AUD", priceChange24h: -0.2, priceChangePct: -5.4, trend: "down", isFeatured: false },
  { id: "onions", name: "Onions", emoji: "🧅", category: "vegetables", currentPrice: 1.8, unit: "kg", currency: "AUD", priceChange24h: 0.08, priceChangePct: 4.7, trend: "up", isFeatured: false },
  { id: "potatoes", name: "Potatoes", emoji: "🥔", category: "vegetables", currentPrice: 1.65, unit: "kg", currency: "AUD", priceChange24h: -0.02, priceChangePct: -1.2, trend: "down", isFeatured: false },
  { id: "sweet-potato", name: "Sweet Potato", emoji: "🍠", category: "vegetables", currentPrice: 2.4, unit: "kg", currency: "AUD", priceChange24h: 0.05, priceChangePct: 2.1, trend: "stable", isFeatured: false },
  { id: "spinach", name: "Spinach", emoji: "🥬", category: "vegetables", currentPrice: 4.2, unit: "kg", currency: "AUD", priceChange24h: 0.18, priceChangePct: 4.5, trend: "up", isFeatured: false },
  // Fruits
  { id: "bananas", name: "Bananas", emoji: "🍌", category: "fruits", currentPrice: 2.8, unit: "kg", currency: "AUD", priceChange24h: -0.1, priceChangePct: -3.4, trend: "down", isFeatured: false },
  { id: "mangoes", name: "Mangoes", emoji: "🥭", category: "fruits", currentPrice: 2.5, unit: "kg", currency: "AUD", priceChange24h: 0.08, priceChangePct: 3.3, trend: "up", isFeatured: false },
  { id: "avocado", name: "Avocado", emoji: "🥑", category: "fruits", currentPrice: 4.8, unit: "kg", currency: "AUD", priceChange24h: -0.2, priceChangePct: -4.0, trend: "down", isFeatured: false },
  // Cash Crops
  { id: "cotton", name: "Cotton", emoji: "🌸", category: "cash-crops", currentPrice: 3.2, unit: "kg", currency: "AUD", priceChange24h: -0.03, priceChangePct: -0.9, trend: "stable", isFeatured: false },
  { id: "sugarcane", name: "Sugarcane", emoji: "🎋", category: "cash-crops", currentPrice: 38, unit: "tonne", currency: "AUD", priceChange24h: 0.4, priceChangePct: 1.1, trend: "stable", isFeatured: false },
];

const VOLATILITY: Record<string, number> = {
  eggs: 0.15, beef: 0.22, wheat: 5.0, canola: 12.0, barley: 4.0, maize: 5.5,
  chickpeas: 7.0, rice: 8.0, pork: 0.08, chicken: 0.06, milk: 0.01,
  tomatoes: 0.18, onions: 0.1, potatoes: 0.04, "sweet-potato": 0.06,
  spinach: 0.15, bananas: 0.1, mangoes: 0.1, avocado: 0.2,
  cotton: 0.05, sugarcane: 0.6,
};

function buildCommodity(raw: (typeof RAW)[number]): Commodity {
  const history = makePriceHistory(raw.currentPrice, VOLATILITY[raw.id] ?? 1, raw.trend);
  const prices = history.map((p) => p.price);
  return {
    ...raw,
    priceHistory: history,
    monthlyHigh: Math.max(...prices),
    monthlyLow: Math.min(...prices),
    averagePrice:
      Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100,
  };
}

const COMMODITIES: Commodity[] = RAW.map(buildCommodity);

export function mockGetMarketPrices(): MarketPricesResponse {
  return {
    commodities: COMMODITIES,
    lastUpdated: new Date().toISOString(),
  };
}

export function mockGetMarketInsight(
  req: MarketInsightRequest
): MarketInsightResponse {
  const aboveAvg = req.currentPrice > req.averagePrice;
  const nearHigh = req.currentPrice >= req.monthlyHigh * 0.95;

  if (nearHigh || req.priceChangePct > 3) {
    return {
      recommendation: "sell_now",
      confidence: 85,
      reasoning: `${req.commodityName} is trading near its 30-day high with strong upward momentum (+${req.priceChangePct.toFixed(1)}%). Australian market conditions suggest locking in profits now before a potential pullback.`,
      priceTarget: req.monthlyHigh,
      timeframe: "3-7 days",
    };
  }
  if (!aboveAvg && req.trend === "down") {
    return {
      recommendation: "wait_to_buy",
      confidence: 78,
      reasoning: `${req.commodityName} is below its 30-day average and trending downward on the Australian market. Waiting for a floor before purchasing or holding stock may improve your margins.`,
      priceTarget: req.monthlyLow,
      timeframe: "7-14 days",
    };
  }
  return {
    recommendation: "hold",
    confidence: 72,
    reasoning: `${req.commodityName} is trading near its 30-day average with stable conditions in the Australian market. No strong directional signal — holding current stock is the prudent strategy.`,
    priceTarget: req.averagePrice,
    timeframe: "14-21 days",
  };
}
