/**
 * Handler for Market Price Intelligence endpoints
 */

import { Request, Response } from "express";
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { MarketInsightRequest } from "@harvest-ai/shared";
import { MarketPriceService } from "../../services/market-price/marketPrice.service";

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION ?? "ap-southeast-2",
});
const service = new MarketPriceService(bedrockClient);

export async function getMarketInsightHandler(
  req: Request,
  res: Response
): Promise<void> {
  const body = req.body as Partial<MarketInsightRequest>;

  if (
    !body.commodityId ||
    !body.commodityName ||
    body.currentPrice === undefined
  ) {
    res.status(400).json({
      error: "commodityId, commodityName and currentPrice are required",
    });
    return;
  }

  try {
    const insight = await service.getInsight(body as MarketInsightRequest);
    res.json(insight);
  } catch (err) {
    console.error("MarketPrice insight error:", err);
    res.status(500).json({ error: "Failed to generate market insight" });
  }
}
