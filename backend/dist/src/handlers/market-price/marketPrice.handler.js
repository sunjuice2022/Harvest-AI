/**
 * Handler for Market Price Intelligence endpoints
 */
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { MarketPriceService } from "../../services/market-price/marketPrice.service";
const bedrockClient = new BedrockRuntimeClient({
    region: process.env.AWS_REGION ?? "ap-southeast-2",
});
const service = new MarketPriceService(bedrockClient);
export async function getMarketInsightHandler(req, res) {
    const body = req.body;
    if (!body.commodityId ||
        !body.commodityName ||
        body.currentPrice === undefined) {
        res.status(400).json({
            error: "commodityId, commodityName and currentPrice are required",
        });
        return;
    }
    try {
        const insight = await service.getInsight(body);
        res.json(insight);
    }
    catch (err) {
        console.error("MarketPrice insight error:", err);
        res.status(500).json({ error: "Failed to generate market insight" });
    }
}
//# sourceMappingURL=marketPrice.handler.js.map