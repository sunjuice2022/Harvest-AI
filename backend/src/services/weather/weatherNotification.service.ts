/** Notification service for weather alerts — sends email and SMS via AWS SNS. */

import { SNSClient, PublishCommand, SubscribeCommand } from '@aws-sdk/client-sns';
import { AlertRecommendation } from '../../agents/weather/weather.types.js';

export interface NotificationConfig {
  topicArn: string;
  phoneNumber?: string;
}

export interface SubscribeResult {
  subscriptionArn: string;
  pendingConfirmation: boolean;
}

export class WeatherNotificationService {
  private readonly client: SNSClient;

  constructor(
    private readonly config: NotificationConfig,
    snsClient?: SNSClient
  ) {
    this.client = snsClient ?? new SNSClient({});
  }

  async subscribeEmail(email: string): Promise<SubscribeResult> {
    const response = await this.client.send(new SubscribeCommand({
      TopicArn: this.config.topicArn,
      Protocol: 'email',
      Endpoint: email,
      ReturnSubscriptionArn: true,
    }));

    const arn = response.SubscriptionArn ?? '';
    return {
      subscriptionArn: arn,
      pendingConfirmation: arn === 'pending confirmation',
    };
  }

  async subscribePhone(phoneNumber: string): Promise<SubscribeResult> {
    const response = await this.client.send(new SubscribeCommand({
      TopicArn: this.config.topicArn,
      Protocol: 'sms',
      Endpoint: phoneNumber,
      ReturnSubscriptionArn: true,
    }));

    return {
      subscriptionArn: response.SubscriptionArn ?? '',
      pendingConfirmation: false,
    };
  }

  async sendAlertNotifications(alerts: AlertRecommendation[]): Promise<void> {
    for (const alert of alerts) {
      await this.publishAlert(alert);
    }
  }

  private async publishAlert(alert: AlertRecommendation): Promise<void> {
    const subject = `[Harvest AI] ${alert.severity.toUpperCase()} Weather Alert`;
    const message = `${alert.message}\n\nRecommendation: ${alert.recommendation}`;

    await this.client.send(new PublishCommand({
      TopicArn: this.config.topicArn,
      Subject: subject,
      Message: message,
    }));

    if (this.config.phoneNumber) {
      await this.client.send(new PublishCommand({
        PhoneNumber: this.config.phoneNumber,
        Message: `[Harvest AI] ${alert.message}`,
      }));
    }
  }
}
