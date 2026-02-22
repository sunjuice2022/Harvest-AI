/** Lambda handlers for weather alerts — EventBridge scheduled polling and REST alert endpoints. */

import { APIGatewayProxyHandler, ScheduledHandler } from 'aws-lambda';
import { WeatherService } from '../../services/weather/weather.service.js';
import { WeatherAlertRepository } from '../../repositories/weather/weatherAlert.repository.js';
import { WeatherAgent } from '../../agents/weather/weather.agent.js';
import { WeatherAgentTools } from '../../agents/weather/weather.tools.js';
import { WeatherNotificationService } from '../../services/weather/weatherNotification.service.js';
import { WeatherBedrockService } from '../../services/weather/weatherBedrock.service.js';
import { formatApiResponse, formatApiError, ValidationError } from '../../utils/apiResponse.util.js';
import { requireEnv, optionalEnv } from '../../utils/env.util.js';
import { GetAlertsResponse, AcknowledgeAlertResponse } from '@harvest-ai/shared';

const alertRepository = new WeatherAlertRepository();
const weatherService = new WeatherService({
  apiBaseUrl: requireEnv('WEATHER_API_BASE_URL'),
  apiKey: requireEnv('WEATHER_API_KEY'),
  highTempThreshold: Number(optionalEnv('WEATHER_HIGH_TEMP', '35')),
  lowTempThreshold: Number(optionalEnv('WEATHER_LOW_TEMP', '5')),
  pollIntervalMinutes: Number(optionalEnv('WEATHER_POLL_INTERVAL', '30')),
});

function buildNotificationService(): WeatherNotificationService | undefined {
  const topicArn = process.env['SNS_ALERT_TOPIC_ARN'];
  if (!topicArn) return undefined;
  const phoneNumber = process.env['ALERT_PHONE_NUMBER'];
  return new WeatherNotificationService({
    topicArn,
    ...(phoneNumber ? { phoneNumber } : {}),
  });
}

function buildBedrockService(): WeatherBedrockService | undefined {
  const modelId = process.env['BEDROCK_MODEL_ID'];
  if (!modelId) return undefined;
  return new WeatherBedrockService({
    modelId,
    region: optionalEnv('AWS_REGION', 'us-east-1'),
  });
}

const agentTools = new WeatherAgentTools(
  weatherService,
  alertRepository,
  buildNotificationService(),
  buildBedrockService()
);
const weatherAgent = new WeatherAgent(agentTools);

/** EventBridge scheduled handler — runs every 30 minutes to poll weather and create alerts. */
export const scheduledPollHandler: ScheduledHandler = async (event) => {
  console.info('[weatherAlert] Scheduled poll triggered', { event });

  const userId = requireEnv('SYSTEM_POLLING_USER_ID');
  const lat = Number(requireEnv('DEFAULT_FARM_LAT'));
  const lng = Number(requireEnv('DEFAULT_FARM_LNG'));

  await weatherAgent.runWeatherCycle({ userId, lat, lng });
};

/** GET /api/weather/alerts — returns active alerts for the authenticated user. */
export const listAlertsHandler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = extractUserId(event.requestContext.authorizer, event.headers);
    const alerts = await alertRepository.listActiveAlerts(userId);

    const response: GetAlertsResponse = { alerts };
    return formatApiResponse(200, response);
  } catch (error) {
    return formatApiError(error);
  }
};

/** PUT /api/weather/alerts/{alertId}/acknowledge — dismisses an alert for the authenticated user. */
export const acknowledgeAlertHandler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = extractUserId(event.requestContext.authorizer, event.headers);
    const alertId = event.pathParameters?.['alertId'];

    if (!alertId) {
      throw new ValidationError('Path parameter alertId is required');
    }

    await alertRepository.acknowledgeAlert(alertId, userId);

    const response: AcknowledgeAlertResponse = { alertId, acknowledged: true };
    return formatApiResponse(200, response);
  } catch (error) {
    return formatApiError(error);
  }
};

function extractUserId(
  authorizer: Record<string, unknown> | null | undefined,
  headers: Record<string, string | undefined> = {},
): string {
  const claims = authorizer?.['claims'] as Record<string, unknown> | undefined;
  const sub = claims?.['sub'];
  if (typeof sub === 'string' && sub) return sub;
  const headerUserId = headers['x-user-id'];
  if (typeof headerUserId === 'string' && headerUserId) return headerUserId;
  throw new ValidationError('Unauthorized: missing user identity');
}
