/**
 * Farm recommendation service — crop and livestock recommendations via Bedrock Claude
 */
import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import { FARM_RECOMMENDATION_CONSTANTS } from "../../constants/farmRecommendation.constants";
import { LANGUAGE_NAMES } from "../../constants/voice.constants";
const SYSTEM_PROMPT = `You are an expert agricultural planning advisor helping farmers in all regions plan profitable, sustainable farms.

Given the farmer's conditions, recommend the most suitable crops and/or livestock.

For EACH crop recommendation provide:
- cropName, cropEmoji, suitabilityScore (0-100), estimatedYieldPerHectare (e.g. "4-6 tons"), growingPeriodDays (number), marketDemand ("low"|"medium"|"high"), reasons (array of exactly 3 short strings)

For EACH livestock recommendation provide:
- animalName, animalEmoji, suitabilityScore (0-100), primaryOutput (e.g. "eggs", "beef", "milk", "pork", "wool"), productionTimeline (e.g. "Eggs from week 18, year-round"), marketDemand ("low"|"medium"|"high"), reasons (array of exactly 3 short strings)

Include poultry (layer hens, broilers, ducks), cattle (beef, dairy), pigs, goats, sheep, and aquaculture where appropriate.
Base marketDemand on actual current global and regional supply/demand conditions for each specific crop or animal.

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
export class FarmRecommendationService {
    constructor(config = {}) {
        this.client = new BedrockRuntimeClient({ region: config.region ?? process.env.AWS_REGION ?? "ap-southeast-2" });
        this.modelId = FARM_RECOMMENDATION_CONSTANTS.BEDROCK_MODEL_ID;
    }
    async recommendFarm(request, language = "en-AU") {
        const languageName = LANGUAGE_NAMES[language] ?? "English";
        const systemPrompt = `${SYSTEM_PROMPT}\n\nRespond in ${languageName}. All text fields (cropName, animalName, reasons, marketInsight) must be in ${languageName}. Keep JSON keys in English.`;
        const command = new ConverseCommand({
            modelId: this.modelId,
            system: [{ text: systemPrompt }],
            messages: [{ role: "user", content: [{ text: this.buildUserMessage(request) }] }],
            inferenceConfig: { maxTokens: FARM_RECOMMENDATION_CONSTANTS.MAX_TOKENS },
        });
        const response = await this.client.send(command);
        const firstBlock = response.output?.message?.content?.[0];
        const text = firstBlock && "text" in firstBlock ? (firstBlock.text ?? "") : "";
        return this.parseResponse(text, request);
    }
    buildUserMessage(request) {
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
    parseResponse(text, request) {
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch)
                return this.buildDefaultResponse(request.farmType);
            const parsed = JSON.parse(jsonMatch[0]);
            const hasValidShape = Array.isArray(parsed.cropRecommendations) &&
                Array.isArray(parsed.livestockRecommendations);
            return hasValidShape ? parsed : this.buildDefaultResponse(request.farmType);
        }
        catch {
            return this.buildDefaultResponse(request.farmType);
        }
    }
    buildDefaultResponse(farmType) {
        return {
            cropRecommendations: farmType !== "livestock" ? [this.buildDefaultCrop()] : [],
            livestockRecommendations: farmType !== "crops" ? [this.buildDefaultLivestock()] : [],
            marketInsight: "Unable to generate recommendations at this time. Please try again shortly.",
        };
    }
    buildDefaultCrop() {
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
    buildDefaultLivestock() {
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
//# sourceMappingURL=farmRecommendation.service.js.map