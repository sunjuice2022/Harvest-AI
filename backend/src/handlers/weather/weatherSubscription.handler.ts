/** Lambda handler for weather alert subscriptions — subscribe email or phone to SNS alerts. */

import { APIGatewayProxyHandler } from 'aws-lambda';
import { WeatherNotificationService } from '../../services/weather/weatherNotification.service.js';
import { formatApiResponse, formatApiError, ValidationError } from '../../utils/apiResponse.util.js';
import { requireEnv } from '../../utils/env.util.js';
import { SubscribeNotificationRequest, SubscribeNotificationResponse } from '@agrisense/shared';

const notificationService = new WeatherNotificationService({
  topicArn: requireEnv('SNS_ALERT_TOPIC_ARN'),
});

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = parseBody(event.body);
    const response = await subscribe(body);
    return formatApiResponse(200, response);
  } catch (error) {
    return formatApiError(error);
  }
};

async function subscribe(body: SubscribeNotificationRequest): Promise<SubscribeNotificationResponse> {
  if (!body.email && !body.phone) {
    throw new ValidationError('At least one of email or phone is required');
  }

  const response: SubscribeNotificationResponse = {};

  if (body.email) {
    response.email = await notificationService.subscribeEmail(body.email);
  }

  if (body.phone) {
    response.phone = await notificationService.subscribePhone(body.phone);
  }

  return response;
}

function parseBody(raw: string | null): SubscribeNotificationRequest {
  if (!raw) throw new ValidationError('Request body is required');
  try {
    return JSON.parse(raw) as SubscribeNotificationRequest;
  } catch {
    throw new ValidationError('Invalid JSON in request body');
  }
}
