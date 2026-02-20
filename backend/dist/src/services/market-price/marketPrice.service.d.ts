/**
 * Market Price Intelligence service — AI-powered sell/hold/buy signals
 */
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { MarketInsightRequest, MarketInsightResponse } from "@harvest-ai/shared";
export declare class MarketPriceService {
    private readonly bedrock;
    constructor(bedrock: BedrockRuntimeClient);
    getInsight(req: MarketInsightRequest, language?: string): Promise<MarketInsightResponse>;
    private buildUserMessage;
    private parseResponse;
    private buildDefaultResponse;
}
//# sourceMappingURL=marketPrice.service.d.ts.map