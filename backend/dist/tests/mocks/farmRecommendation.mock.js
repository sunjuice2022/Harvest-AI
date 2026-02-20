/**
 * Mock farm recommendations for local development (no Bedrock required)
 */
const MOCK_CROPS = [
    {
        cropName: "Maize",
        cropEmoji: "🌽",
        suitabilityScore: 93,
        estimatedYieldPerHectare: "6-8 tons",
        growingPeriodDays: 120,
        marketDemand: "high",
        reasons: [
            "Adapts well to most climates and soil types",
            "Staple food with consistently strong market demand",
            "Dual-use: food crop and livestock feed",
        ],
    },
    {
        cropName: "Soybean",
        cropEmoji: "🫘",
        suitabilityScore: 88,
        estimatedYieldPerHectare: "2-3.5 tons",
        growingPeriodDays: 90,
        marketDemand: "high",
        reasons: [
            "High protein crop with global export demand",
            "Fixes nitrogen — improves soil for next crop",
            "Used as livestock feed, reducing feed import costs",
        ],
    },
    {
        cropName: "Sweet Potato",
        cropEmoji: "🍠",
        suitabilityScore: 82,
        estimatedYieldPerHectare: "10-15 tons",
        growingPeriodDays: 105,
        marketDemand: "medium",
        reasons: [
            "High yield with low water requirements",
            "Drought tolerant — ideal for rain-fed farms",
            "Rising health food demand in urban markets",
        ],
    },
    {
        cropName: "Wheat",
        cropEmoji: "🌾",
        suitabilityScore: 76,
        estimatedYieldPerHectare: "3-5 tons",
        growingPeriodDays: 150,
        marketDemand: "high",
        reasons: [
            "Global staple with stable long-term demand",
            "Good storability reduces post-harvest loss",
            "Strong government price support in many regions",
        ],
    },
    {
        cropName: "Leafy Vegetables",
        cropEmoji: "🥬",
        suitabilityScore: 71,
        estimatedYieldPerHectare: "8-12 tons",
        growingPeriodDays: 45,
        marketDemand: "medium",
        reasons: [
            "Fast turnaround — 3-4 harvest cycles per season",
            "High value per kilogram at local markets",
            "Low capital investment to get started",
        ],
    },
];
const MOCK_LIVESTOCK = [
    {
        animalName: "Layer Hens",
        animalEmoji: "🐔",
        suitabilityScore: 94,
        primaryOutput: "eggs",
        productionTimeline: "Eggs from week 18 — daily production, year-round",
        marketDemand: "high",
        reasons: [
            "Critical egg supply shortage following avian flu outbreaks globally",
            "Low startup cost with fast return on investment",
            "Daily income stream — eggs sell every market day",
        ],
    },
    {
        animalName: "Beef Cattle",
        animalEmoji: "🐄",
        suitabilityScore: 87,
        primaryOutput: "beef",
        productionTimeline: "18-24 months to market weight",
        marketDemand: "high",
        reasons: [
            "Beef prices surging as global herd rebuilding lags demand",
            "Entry now positions farm ahead of supply recovery peak",
            "Byproducts (manure) improve soil fertility for crop farms",
        ],
    },
    {
        animalName: "Dairy Goats",
        animalEmoji: "🐐",
        suitabilityScore: 83,
        primaryOutput: "milk",
        productionTimeline: "Daily milk from month 2 post-kidding",
        marketDemand: "medium",
        reasons: [
            "Lower land and feed requirements than dairy cows",
            "Growing artisan cheese and specialty dairy market",
            "Hardy breed — adapts well to challenging climates",
        ],
    },
    {
        animalName: "Pigs",
        animalEmoji: "🐷",
        suitabilityScore: 78,
        primaryOutput: "pork",
        productionTimeline: "Market weight in 5-6 months",
        marketDemand: "medium",
        reasons: [
            "Efficient feed conversion — low grain input per kg output",
            "Can be fed farm by-products, reducing feed costs",
            "Strong local pork demand in most markets",
        ],
    },
    {
        animalName: "Broiler Chickens",
        animalEmoji: "🍗",
        suitabilityScore: 74,
        primaryOutput: "meat",
        productionTimeline: "Market weight at 6-7 weeks",
        marketDemand: "medium",
        reasons: [
            "Fastest livestock cycle — 6-7 rounds per year possible",
            "High consumer demand for affordable protein",
            "Can share infrastructure with layer hen operation",
        ],
    },
];
function filterByFarmType(farmType) {
    return {
        cropRecommendations: farmType !== "livestock" ? MOCK_CROPS : [],
        livestockRecommendations: farmType !== "crops" ? MOCK_LIVESTOCK : [],
    };
}
export function mockFarmRecommendation(request) {
    const { cropRecommendations, livestockRecommendations } = filterByFarmType(request.farmType);
    return {
        cropRecommendations,
        livestockRecommendations,
        marketInsight: "Egg supply remains critically tight following avian flu outbreaks across Asia, Europe, and the Americas — layer hen farming is showing the highest short-term ROI of any livestock category. Beef prices continue to climb as herd rebuilding efforts lag consumer demand; farmers entering beef cattle production now are positioned ahead of the next supply peak.",
    };
}
//# sourceMappingURL=farmRecommendation.mock.js.map