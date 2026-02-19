/**
 * Market Price Intelligence service — AI-powered sell/hold/buy signals
 */

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import {
  MarketInsightRequest,
  MarketInsightResponse,
  MarketRecommendation,
} from "@harvest-ai/shared";
import {
  MARKET_PRICE_SYSTEM_PROMPT,
  MARKET_PRICE_MODEL_ID,
  MARKET_PRICE_MAX_TOKENS,
} from "../../constants/marketPrice.constants";

export class MarketPriceService {
  constructor(private readonly bedrock: BedrockRuntimeClient) {}

  async getInsight(req: MarketInsightRequest): Promise<MarketInsightResponse> {
    const userMessage = this.buildUserMessage(req);
    const body = JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: MARKET_PRICE_MAX_TOKENS,
      system: MARKET_PRICE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const command = new InvokeModelCommand({
      modelId: MARKET_PRICE_MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: Buffer.from(body),
    });

    const raw = await this.bedrock.send(command);
    const text = JSON.parse(new TextDecoder().decode(raw.body)).content[0].text;
    return this.parseResponse(text, req);
  }

  private buildUserMessage(req: MarketInsightRequest): string {
    return (
      `Commodity: ${req.commodityName}\n` +
      `Current price: ${req.currency ?? "USD"} ${req.currentPrice} / ${req.unit}\n` +
      `24h change: ${req.priceChangePct > 0 ? "+" : ""}${req.priceChangePct.toFixed(1)}%\n` +
      `Trend: ${req.trend}\n` +
      `30-day high: ${req.monthlyHigh} | low: ${req.monthlyLow} | avg: ${req.averagePrice}\n` +
      `Provide your market recommendation.`
    );
  }

  private parseResponse(
    text: string,
    req: MarketInsightRequest
  ): MarketInsightResponse {
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON found");
      return JSON.parse(match[0]) as MarketInsightResponse;
    } catch {
      return this.buildDefaultResponse(req);
    }
  }

  private buildDefaultResponse(
    req: MarketInsightRequest
  ): MarketInsightResponse {
    const aboveAvg = req.currentPrice > req.averagePrice;
    const recommendation: MarketRecommendation = aboveAvg
      ? "sell_now"
      : "wait_to_buy";
    return {
      recommendation,
      confidence: 60,
      reasoning: `${req.commodityName} is currently ${aboveAvg ? "above" : "below"} its 30-day average. Market conditions suggest a ${recommendation.replace("_", " ")} strategy.`,
      priceTarget: aboveAvg ? req.monthlyHigh : req.averagePrice,
      timeframe: "7-14 days",
    };
  }
}
