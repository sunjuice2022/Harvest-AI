/**
 * Lambda handler for POST /api/farm-recommendation
 */
import { FarmRecommendationService } from "../../services/farm-recommendation/farmRecommendation.service";
const farmRecommendationService = new FarmRecommendationService();
export async function farmRecommendation(event) {
    try {
        const userId = event.requestContext?.authorizer?.claims?.sub ?? event.headers["x-user-id"];
        if (!userId) {
            return errorResponse(401, "Unauthorized");
        }
        const request = JSON.parse(event.body ?? "{}");
        if (!request.farmType || !request.climateZone || !request.season) {
            return errorResponse(400, "Missing required fields: farmType, climateZone, season");
        }
        const result = await farmRecommendationService.recommendFarm(request);
        return successResponse(result);
    }
    catch (error) {
        console.error("Error in farmRecommendation handler:", error);
        return errorResponse(500, "Internal server error");
    }
}
function successResponse(data) {
    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };
}
function errorResponse(statusCode, message) {
    return {
        statusCode,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: message }),
    };
}
//# sourceMappingURL=farmRecommendation.handler.js.map