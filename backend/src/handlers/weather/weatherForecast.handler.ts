/** Lambda handler for on-demand weather forecast — thin entry point, no business logic. */

import { APIGatewayProxyHandler } from 'aws-lambda';
import { WeatherService } from '../../services/weather/weather.service.js';
import { WeatherBedrockService } from '../../services/weather/weatherBedrock.service.js';
import { formatApiResponse, formatApiError, ValidationError } from '../../utils/apiResponse.util.js';
import { requireEnv, optionalEnv } from '../../utils/env.util.js';
import { GetForecastResponse } from '@agrisense/shared';

const weatherService = new WeatherService({
  apiBaseUrl: requireEnv('WEATHER_API_BASE_URL'),
  apiKey: requireEnv('WEATHER_API_KEY'),
  highTempThreshold: Number(optionalEnv('WEATHER_HIGH_TEMP', '35')),
  lowTempThreshold: Number(optionalEnv('WEATHER_LOW_TEMP', '5')),
  pollIntervalMinutes: Number(optionalEnv('WEATHER_POLL_INTERVAL', '30')),
});

function buildBedrockService(): WeatherBedrockService | undefined {
  const modelId = optionalEnv('BEDROCK_MODEL_ID', '');
  if (!modelId) return undefined;
  return new WeatherBedrockService({ modelId, region: optionalEnv('AWS_REGION', 'us-east-1') });
}

const bedrockService = buildBedrockService();

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const location = parseLocationFromQuery(event.queryStringParameters);
    const rawForecast = await weatherService.fetchForecast(location);
    const forecast = weatherService.parseForecast(rawForecast);

    const advisory = await bedrockService?.generateDailyAdvisory(forecast, location.lat);
    const response: GetForecastResponse = { forecast, ...(advisory ? { advisory } : {}) };
    return formatApiResponse(200, response);
  } catch (error) {
    return formatApiError(error);
  }
};

function parseLocationFromQuery(
  params: Record<string, string | undefined> | null
): { lat: number; lng: number } {
  const lat = Number(params?.['lat']);
  const lng = Number(params?.['lng']);

  if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
    throw new ValidationError('Query parameters lat and lng are required and must be valid numbers');
  }

  return { lat, lng };
}
