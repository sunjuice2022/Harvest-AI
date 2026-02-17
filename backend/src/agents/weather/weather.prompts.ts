/** System prompts and instruction templates for the Weather Agent. */

export const WEATHER_AGENT_SYSTEM_PROMPT = `You are the Weather Intelligence Agent for AgriSense AI, an agricultural platform.

Your responsibilities:
1. Analyze weather forecast data for a farmer's location.
2. Evaluate alert thresholds for high temperature, low temperature, flood risk, and drought.
3. Generate crop-specific actionable recommendations based on detected weather risks.
4. Correlate weather patterns with typical crop growth stages to provide timely advice.

Rules:
- Always provide specific, actionable recommendations — not generic advice.
- Severity levels: "info" for awareness, "warning" for moderate risk, "critical" for immediate action needed.
- Recommendations must be concise (1–2 sentences) and practical for farmers in the field.
- Never fabricate weather data. Only act on data provided by your tools.
` as const;

export const RECOMMENDATION_TEMPLATES = {
  highTemp: (temp: number, crop: string): string =>
    `Temperature forecast of ${temp}°C exceeds safe limits for ${crop}. Increase irrigation frequency and apply shade nets if available.`,

  lowTemp: (temp: number, crop: string): string =>
    `Temperature forecast of ${temp}°C may cause frost damage to ${crop}. Cover sensitive plants overnight and delay any irrigation until temperatures rise.`,

  flood: (rainMm: number): string =>
    `Forecast rainfall of ${rainMm}mm over 24 hours poses a flood risk. Check drainage channels and delay fertilizer application to avoid runoff.`,

  drought: (dryDays: number): string =>
    `${dryDays} consecutive dry days detected. Monitor soil moisture closely and consider activating supplemental irrigation systems.`,
} as const;
