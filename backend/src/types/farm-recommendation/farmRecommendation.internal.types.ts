/**
 * Internal types for Farm Planning Advisor — not exposed to frontend
 */

import type { CropRecommendation, LivestockRecommendation } from "@harvest-ai/shared";

export interface BedrockFarmResponse {
  cropRecommendations: CropRecommendation[];
  livestockRecommendations: LivestockRecommendation[];
  marketInsight: string;
}

export interface APIGatewayProxyEvent {
  body: string | null;
  headers: Record<string, string>;
  requestContext?: {
    authorizer?: {
      claims?: { sub?: string };
    };
  };
}

export interface APIGatewayProxyResult {
  statusCode: number;
  body: string;
  headers?: Record<string, string>;
}
