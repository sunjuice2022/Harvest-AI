/**
 * Farm recommendation service — crop and livestock recommendations via Bedrock Claude
 */

import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import { FARM_RECOMMENDATION_CONSTANTS } from "../../constants/farmRecommendation.constants";
import type {
  FarmRecommendationRequest,
  FarmRecommendationResponse,
  CropRecommendation,
  LivestockRecommendation,
} from "@harvest-ai/shared";

const SYSTEM_PROMPT = `You are an expert agricultural planning advisor helping farmers in all regions plan profitable, sustainable farms.

Given the farmer's conditions, recommend the most suitable crops and/or livestock.

For EACH crop recommendation provide:
- cropName, cropEmoji, suitabilityScore (0-100), estimatedYieldPerHectare (e.g. "4-6 tons"), growingPeriodDays (number), marketDemand ("low"|"medium"|"high"), reasons (array of exactly 3 short strings)

For EACH livestock recommendation provide:
- animalName, animalEmoji, suitabilityScore (0-100), primaryOutput (e.g. "eggs", "beef", "milk", "pork", "wool"), productionTimeline (e.g. "Eggs from week 18, year-round"), marketDemand ("low"|"medium"|"high"), reasons (array of exactly 3 short strings)

Include poultry (layer hens, broilers, ducks), cattle (beef, dairy), pigs, goats, sheep, and aquaculture where appropriate.
Factor in recent global supply shortages — eggs and beef have faced critical shortages due to disease outbreaks and poor planning. Reflect this accurately in marketDemand.

Rules:
- farmType "crops" → empty livestockRecommendations array
- farmType "livestock" → empty cropRecommendations array
- farmType "mixed" → up to 5 crops AND up to 5 livestock

Respond ONLY with valid JSON, no markdown fences:
{
  "cropRecommendations": [],
  "livestockRecommendations": [],
  "marketInsight": "2-3 sentences on current market conditions and the biggest opportunity for this farmer"
}`;

interface ServiceConfig {
  region?: string;
}

export class FarmRecommendationService {
  private readonly client: BedrockRuntimeClient;
  private readonly modelId: string;

  constructor(config: ServiceConfig = {}) {
    this.client = new BedrockRuntimeClient({ region: config.region ?? process.env.AWS_REGION });
    this.modelId = FARM_RECOMMENDATION_CONSTANTS.BEDROCK_MODEL_ID;
  }

  async recommendFarm(request: FarmRecommendationRequest): Promise<FarmRecommendationResponse> {
    const command = new ConverseCommand({
      modelId: this.modelId,
      system: [{ text: SYSTEM_PROMPT }],
      messages: [{ role: "user", content: [{ text: this.buildUserMessage(request) }] }],
      inferenceConfig: { maxTokens: FARM_RECOMMENDATION_CONSTANTS.MAX_TOKENS },
    });

    const response = await this.client.send(command);
    const firstBlock = response.output?.message?.content?.[0];
    const text = firstBlock && "text" in firstBlock ? (firstBlock.text ?? "") : "";
    return this.parseResponse(text, request);
  }

  private buildUserMessage(request: FarmRecommendationRequest): string {
    return [
      `Farm Type: ${request.farmType}`,
      `Climate Zone: ${request.climateZone}`,
      `Current Season: ${request.season}`,
      `Water Availability: ${request.waterAvailability}`,
      `Soil Type: ${request.soilType}`,
      `Budget Level: ${request.budgetLevel}`,
      "",
      "Rank recommendations by suitability score, highest first.",
    ].join("\n");
  }

  private parseResponse(
    text: string,
    request: FarmRecommendationRequest,
  ): FarmRecommendationResponse {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return this.buildDefaultResponse(request.farmType);

      const parsed = JSON.parse(jsonMatch[0]) as FarmRecommendationResponse;
      const hasValidShape =
        Array.isArray(parsed.cropRecommendations) &&
        Array.isArray(parsed.livestockRecommendations);

      return hasValidShape ? parsed : this.buildDefaultResponse(request.farmType);
    } catch {
      return this.buildDefaultResponse(request.farmType);
    }
  }

  private buildDefaultResponse(farmType: string): FarmRecommendationResponse {
    return {
      cropRecommendations: farmType !== "livestock" ? [this.buildDefaultCrop()] : [],
      livestockRecommendations: farmType !== "crops" ? [this.buildDefaultLivestock()] : [],
      marketInsight:
        "Unable to generate recommendations at this time. Please try again shortly.",
    };
  }

  private buildDefaultCrop(): CropRecommendation {
    return {
      cropName: "Maize",
      cropEmoji: "🌽",
      suitabilityScore: 75,
      estimatedYieldPerHectare: "4-6 tons",
      growingPeriodDays: 90,
      marketDemand: "high",
      reasons: ["Widely adaptable to most climates", "Strong staple market demand", "Low input cost"],
    };
  }

  private buildDefaultLivestock(): LivestockRecommendation {
    return {
      animalName: "Layer Hens",
      animalEmoji: "🐔",
      suitabilityScore: 80,
      primaryOutput: "eggs",
      productionTimeline: "Eggs from week 18, year-round daily production",
      marketDemand: "high",
      reasons: ["Critical egg supply shortage globally", "Low startup cost", "Year-round income stream"],
    };
  }
}
