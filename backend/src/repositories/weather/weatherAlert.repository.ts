/** DynamoDB repository for WeatherAlert records — all data access for the weather alerts table. */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { WeatherAlert } from '@agrisense/shared';
import { CreateAlertInput } from '../../services/weather/weather.types.js';
import { WEATHER_TABLE_NAME } from '../../constants/weather.constants.js';
import { randomUUID } from 'crypto';

export class WeatherAlertRepository {
  private readonly client: DynamoDBDocumentClient;

  constructor(dynamoClient?: DynamoDBClient) {
    const baseClient = dynamoClient ?? new DynamoDBClient({});
    this.client = DynamoDBDocumentClient.from(baseClient);
  }

  async createAlert(input: CreateAlertInput): Promise<string> {
    const alertId = randomUUID();
    const now = new Date().toISOString();

    await this.client.send(
      new PutCommand({
        TableName: WEATHER_TABLE_NAME,
        Item: {
          alertId,
          userId: input.userId,
          type: input.type,
          severity: input.severity,
          message: input.message,
          recommendation: input.recommendation,
          acknowledged: false,
          createdAt: now,
        },
      })
    );

    return alertId;
  }

  async listActiveAlerts(userId: string): Promise<WeatherAlert[]> {
    const result = await this.client.send(
      new QueryCommand({
        TableName: WEATHER_TABLE_NAME,
        KeyConditionExpression: 'userId = :userId',
        FilterExpression: 'acknowledged = :acknowledged',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':acknowledged': false,
        },
      })
    );

    return (result.Items ?? []) as WeatherAlert[];
  }

  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    await this.client.send(
      new UpdateCommand({
        TableName: WEATHER_TABLE_NAME,
        Key: { alertId, userId },
        UpdateExpression: 'SET acknowledged = :acknowledged',
        ExpressionAttributeValues: { ':acknowledged': true },
      })
    );
  }
}
