/**
 * Lambda handler for POST /api/market-prices/insight
 */

import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import type { MarketInsightRequest } from '@harvest-ai/shared';
import { MarketPriceService } from '../../services/market-price/marketPrice.service';
import {
  APIGatewayProxyEvent, APIGatewayProxyResult,
  successResponse, errorResponse,
} from '../../types/api/apiGateway.types';

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION ?? 'ap-southeast-2',
});
const service = new MarketPriceService(bedrockClient);

export async function getMarketInsight(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const body = JSON.parse(event.body || '{}') as Partial<MarketInsightRequest>;
    if (!body.commodityId || !body.commodityName || body.currentPrice === undefined) {
      return errorResponse(400, 'commodityId, commodityName and currentPrice are required');
    }

    const insight = await service.getInsight(body as MarketInsightRequest);
    return successResponse(insight);
  } catch (error) {
    console.error('[getMarketInsight] error:', error);
    return errorResponse(500, 'Failed to generate market insight');
  }
}
