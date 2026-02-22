/** Tool definitions for the Weather Agent — functions the agent can invoke. */

import { WeatherForecast } from '@harvest-ai/shared';
import { WeatherService } from '../../services/weather/weather.service.js';
import { WeatherAlertRepository } from '../../repositories/weather/weatherAlert.repository.js';
import { WeatherNotificationService } from '../../services/weather/weatherNotification.service.js';
import { WeatherBedrockService } from '../../services/weather/weatherBedrock.service.js';
import { WeatherAgentToolInput, AlertRecommendation } from './weather.types.js';
import { ALERT_THRESHOLDS } from '../../constants/weather.constants.js';

export interface FetchWeatherResult {
  alerts: AlertRecommendation[];
  forecast: WeatherForecast;
}

export class WeatherAgentTools {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly alertRepository: WeatherAlertRepository,
    private readonly notificationService?: WeatherNotificationService,
    private readonly bedrockService?: WeatherBedrockService
  ) {}

  async fetchAndEvaluateWeather(input: WeatherAgentToolInput): Promise<FetchWeatherResult> {
    const rawForecast = await this.weatherService.fetchForecast({
      lat: input.lat,
      lng: input.lng,
    });

    const forecast = this.weatherService.parseForecast(rawForecast);
    const alerts = this.weatherService.evaluateAlertConditions(rawForecast, {
      highTempThreshold: ALERT_THRESHOLDS.HIGH_TEMP_CELSIUS,
      lowTempThreshold: ALERT_THRESHOLDS.LOW_TEMP_CELSIUS,
    });

    if (alerts.length === 0 || !this.bedrockService) return { alerts, forecast };

    const enrichedAlerts = await this.bedrockService.enrichRecommendations(alerts, forecast);
    return { alerts: enrichedAlerts, forecast };
  }

  async persistAlerts(userId: string, alerts: AlertRecommendation[]): Promise<string[]> {
    const createdIds: string[] = [];

    for (const alert of alerts) {
      const alertId = await this.alertRepository.createAlert({
        userId,
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        recommendation: alert.recommendation,
      });
      createdIds.push(alertId);
    }

    return createdIds;
  }

  async notifyAlerts(alerts: AlertRecommendation[]): Promise<void> {
    if (!this.notificationService) return;
    await this.notificationService.sendAlertNotifications(alerts);
  }
}
