/**
 * Lambda handlers for market prices — GET /api/market-prices and POST /api/market-prices/insight
 */

import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import type { MarketInsightRequest, Commodity, MarketPricesResponse } from '@harvest-ai/shared';
import { MarketPriceService } from '../../services/market-price/marketPrice.service';
import { fetchWorldBankData, enrichCommodity, WB_COMMODITY_IDS } from '../../services/market-price/worldBank.service';
import {
  APIGatewayProxyEvent, APIGatewayProxyResult,
  successResponse, errorResponse,
} from '../../types/api/apiGateway.types';

const BASE_COMMODITIES: Commodity[] = [
  { id: 'wheat',   name: 'Wheat',   emoji: '🌾', category: 'grains',     unit: 'MT',  currency: 'AUD', currentPrice: 0, priceChange24h: 0, priceChangePct: 0, trend: 'stable', monthlyHigh: 0, monthlyLow: 0, averagePrice: 0, isFeatured: true,  priceHistory: [] },
  { id: 'maize',   name: 'Maize',   emoji: '🌽', category: 'grains',     unit: 'MT',  currency: 'AUD', currentPrice: 0, priceChange24h: 0, priceChangePct: 0, trend: 'stable', monthlyHigh: 0, monthlyLow: 0, averagePrice: 0, isFeatured: true,  priceHistory: [] },
  { id: 'rice',    name: 'Rice',    emoji: '🍚', category: 'grains',     unit: 'MT',  currency: 'AUD', currentPrice: 0, priceChange24h: 0, priceChangePct: 0, trend: 'stable', monthlyHigh: 0, monthlyLow: 0, averagePrice: 0, isFeatured: false, priceHistory: [] },
  { id: 'beef',    name: 'Beef',    emoji: '🥩', category: 'livestock',  unit: 'kg',  currency: 'AUD', currentPrice: 0, priceChange24h: 0, priceChangePct: 0, trend: 'stable', monthlyHigh: 0, monthlyLow: 0, averagePrice: 0, isFeatured: true,  priceHistory: [] },
  { id: 'bananas', name: 'Bananas', emoji: '🍌', category: 'fruits',     unit: 'kg',  currency: 'AUD', currentPrice: 0, priceChange24h: 0, priceChangePct: 0, trend: 'stable', monthlyHigh: 0, monthlyLow: 0, averagePrice: 0, isFeatured: false, priceHistory: [] },
  { id: 'cotton',  name: 'Cotton',  emoji: '🌿', category: 'cash-crops', unit: 'kg',  currency: 'AUD', currentPrice: 0, priceChange24h: 0, priceChangePct: 0, trend: 'stable', monthlyHigh: 0, monthlyLow: 0, averagePrice: 0, isFeatured: true,  priceHistory: [] },
];

/** GET /api/market-prices — returns live commodity prices from World Bank */
export async function getMarketPrices(_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const wbData = await fetchWorldBankData();
    const commodities = BASE_COMMODITIES.map((c) => {
      const points = wbData.get(c.id);
      return points ? enrichCommodity(c, points) : c;
    });
    const response: MarketPricesResponse = { commodities, lastUpdated: new Date().toISOString() };
    return successResponse(response);
  } catch (error) {
    console.error('[getMarketPrices] error:', error);
    return errorResponse(500, 'Failed to fetch market prices');
  }
}

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
