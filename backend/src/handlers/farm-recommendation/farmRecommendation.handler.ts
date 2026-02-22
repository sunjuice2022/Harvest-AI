/**
 * Lambda handler for POST /api/farm-recommendation
 */

import type { FarmRecommendationRequest } from '@harvest-ai/shared';
import { FarmRecommendationService } from '../../services/farm-recommendation/farmRecommendation.service';
import {
  APIGatewayProxyEvent, APIGatewayProxyResult,
  successResponse, errorResponse, extractUserId,
} from '../../types/api/apiGateway.types';

const farmRecommendationService = new FarmRecommendationService();

export async function farmRecommendation(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  try {
    const userId = extractUserId(event);
    if (!userId) return errorResponse(401, 'Unauthorized');

    const request = JSON.parse(event.body ?? '{}') as FarmRecommendationRequest;
    if (!request.farmType || !request.climateZone || !request.season) {
      return errorResponse(400, 'Missing required fields: farmType, climateZone, season');
    }

    const result = await farmRecommendationService.recommendFarm(request);
    return successResponse(result);
  } catch (error) {
    console.error('[farmRecommendation] error:', error);
    return errorResponse(500, 'Internal server error');
  }
}
