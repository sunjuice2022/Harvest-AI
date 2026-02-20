/**
 * Farm recommendation service — crop and livestock recommendations via Bedrock Claude
 */
import type { FarmRecommendationRequest, FarmRecommendationResponse } from "@harvest-ai/shared";
interface ServiceConfig {
    region?: string;
}
export declare class FarmRecommendationService {
    private readonly client;
    private readonly modelId;
    constructor(config?: ServiceConfig);
    recommendFarm(request: FarmRecommendationRequest, language?: string): Promise<FarmRecommendationResponse>;
    private buildUserMessage;
    private parseResponse;
    private buildDefaultResponse;
    private buildDefaultCrop;
    private buildDefaultLivestock;
}
export {};
//# sourceMappingURL=farmRecommendation.service.d.ts.map