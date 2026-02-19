/**
 * Shared types for Market Price Intelligence feature
 */
export type CommodityCategory = "grains" | "vegetables" | "fruits" | "livestock" | "cash-crops";
export type PriceTrend = "up" | "down" | "stable";
export type MarketRecommendation = "sell_now" | "hold" | "wait_to_buy";
export interface PricePoint {
    date: string;
    price: number;
}
export interface Commodity {
    id: string;
    name: string;
    emoji: string;
    category: CommodityCategory;
    currentPrice: number;
    unit: string;
    currency: string;
    priceChange24h: number;
    priceChangePct: number;
    trend: PriceTrend;
    monthlyHigh: number;
    monthlyLow: number;
    averagePrice: number;
    isFeatured: boolean;
    priceHistory: PricePoint[];
}
export interface MarketPricesResponse {
    commodities: Commodity[];
    lastUpdated: string;
}
export interface MarketInsightRequest {
    commodityId: string;
    commodityName: string;
    currentPrice: number;
    unit: string;
    currency: string;
    priceChangePct: number;
    trend: PriceTrend;
    monthlyHigh: number;
    monthlyLow: number;
    averagePrice: number;
}
export interface MarketInsightResponse {
    recommendation: MarketRecommendation;
    confidence: number;
    reasoning: string;
    priceTarget: number;
    timeframe: string;
}
//# sourceMappingURL=marketPrice.types.d.ts.map