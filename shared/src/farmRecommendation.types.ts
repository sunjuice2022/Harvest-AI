/**
 * Shared types for Farm Planning Advisor feature
 */

export type MarketDemand = "low" | "medium" | "high";
export type FarmType = "crops" | "livestock" | "mixed";
export type ClimateZone =
  | "tropical"
  | "subtropical"
  | "temperate"
  | "arid"
  | "mediterranean"
  | "continental";
export type Season = "wet" | "dry" | "spring" | "summer" | "autumn" | "winter" | "year-round";
export type WaterAvailability = "irrigated" | "rain-fed" | "both";
export type SoilType = "sandy" | "clay" | "loamy" | "silt" | "peaty" | "chalky" | "saline";
export type BudgetLevel = "low" | "medium" | "high";

export interface CropRecommendation {
  cropName: string;
  cropEmoji: string;
  suitabilityScore: number; // 0-100
  estimatedYieldPerHectare: string;
  growingPeriodDays: number;
  marketDemand: MarketDemand;
  reasons: string[];
}

export interface LivestockRecommendation {
  animalName: string;
  animalEmoji: string;
  suitabilityScore: number; // 0-100
  primaryOutput: string; // "eggs" | "beef" | "milk" | "wool" | "pork" | "meat"
  productionTimeline: string;
  marketDemand: MarketDemand;
  reasons: string[];
}

export interface FarmRecommendationRequest {
  farmType: FarmType;
  climateZone: ClimateZone;
  season: Season;
  waterAvailability: WaterAvailability;
  soilType: SoilType;
  budgetLevel: BudgetLevel;
}

export interface FarmRecommendationResponse {
  cropRecommendations: CropRecommendation[];
  livestockRecommendations: LivestockRecommendation[];
  marketInsight: string;
}
