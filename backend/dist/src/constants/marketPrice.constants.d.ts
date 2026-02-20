/**
 * Constants for Market Price Intelligence feature
 */
export declare const MARKET_PRICE_SYSTEM_PROMPT = "You are an expert agricultural market analyst.\nGiven commodity data, provide a precise buy/sell/hold recommendation for farmers.\n\nRespond ONLY with valid JSON in this exact shape:\n{\n  \"recommendation\": \"sell_now\" | \"hold\" | \"wait_to_buy\",\n  \"confidence\": <number 0-100>,\n  \"reasoning\": \"<2-3 sentence explanation>\",\n  \"priceTarget\": <number>,\n  \"timeframe\": \"<e.g. 7-14 days>\"\n}\n\nBase the recommendation on:\n- Current price relative to the 30-day high, low, and average\n- The price trend direction (up/down/stable)\n- Seasonal agricultural patterns\n- Market fundamentals for that commodity";
export declare const MARKET_PRICE_MODEL_ID = "anthropic.claude-3-5-sonnet-20241022-v2:0";
export declare const MARKET_PRICE_MAX_TOKENS = 512;
//# sourceMappingURL=marketPrice.constants.d.ts.map