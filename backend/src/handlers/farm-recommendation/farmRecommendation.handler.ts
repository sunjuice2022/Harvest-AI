/**
 * Lambda handler for POST /api/farm-recommendation
 */

import type { FarmRecommendationRequest } from "@harvest-ai/shared";
import { FarmRecommendationService } from "../../services/farm-recommendation/farmRecommendation.service";
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "../../types/farm-recommendation/farmRecommendation.internal.types";

const farmRecommendationService = new FarmRecommendationService();

export async function farmRecommendation(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  try {
    const userId =
      event.requestContext?.authorizer?.claims?.sub ?? event.headers["x-user-id"];

    if (!userId) {
      return errorResponse(401, "Unauthorized");
    }

    const request = JSON.parse(event.body ?? "{}") as FarmRecommendationRequest;

    if (!request.farmType || !request.climateZone || !request.season) {
      return errorResponse(400, "Missing required fields: farmType, climateZone, season");
    }

    const result = await farmRecommendationService.recommendFarm(request);
    return successResponse(result);
  } catch (error) {
    console.error("Error in farmRecommendation handler:", error);
    return errorResponse(500, "Internal server error");
  }
}

function successResponse(data: unknown): APIGatewayProxyResult {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
}

function errorResponse(statusCode: number, message: string): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ error: message }),
  };
}
