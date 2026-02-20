/**
 * Form option lists for Farm Planning Advisor
 */

export const FARM_TYPE_OPTIONS = [
  { value: "mixed", label: "Mixed — Crops & Livestock" },
  { value: "crops", label: "Crops Only" },
  { value: "livestock", label: "Livestock Only" },
] as const;

export const CLIMATE_ZONE_OPTIONS = [
  { value: "tropical", label: "Tropical" },
  { value: "subtropical", label: "Subtropical" },
  { value: "temperate", label: "Temperate" },
  { value: "arid", label: "Arid / Semi-Arid" },
  { value: "mediterranean", label: "Mediterranean" },
  { value: "continental", label: "Continental" },
] as const;

export const SEASON_OPTIONS = [
  { value: "wet", label: "Wet Season" },
  { value: "dry", label: "Dry Season" },
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "autumn", label: "Autumn / Fall" },
  { value: "winter", label: "Winter" },
  { value: "year-round", label: "Year-Round" },
] as const;

export const WATER_AVAILABILITY_OPTIONS = [
  { value: "rain-fed", label: "Rain-Fed Only" },
  { value: "irrigated", label: "Irrigated" },
  { value: "both", label: "Both Available" },
] as const;

export const SOIL_TYPE_OPTIONS = [
  { value: "loamy", label: "Loamy (Best all-round)" },
  { value: "clay", label: "Clay" },
  { value: "sandy", label: "Sandy" },
  { value: "silt", label: "Silt" },
  { value: "peaty", label: "Peaty" },
  { value: "chalky", label: "Chalky" },
  { value: "saline", label: "Saline" },
] as const;

export const BUDGET_LEVEL_OPTIONS = [
  { value: "low", label: "Low — Minimal capital" },
  { value: "medium", label: "Medium — Moderate investment" },
  { value: "high", label: "High — Full investment ready" },
] as const;
