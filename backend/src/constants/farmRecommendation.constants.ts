/**
 * Constants for Farm Planning Advisor feature
 */

export const FARM_RECOMMENDATION_CONSTANTS = {
  BEDROCK_MODEL_ID: "anthropic.claude-3-5-sonnet-20241022-v2:0",
  MAX_CROP_RECOMMENDATIONS: 5,
  MAX_LIVESTOCK_RECOMMENDATIONS: 5,
  MAX_TOKENS: 2048,
} as const;
