/** Tool definitions for the Weather Agent — functions the agent can invoke. */

import { WeatherService } from '../../services/weather/weather.service.js';
import { WeatherAlertRepository } from '../../repositories/weather/weatherAlert.repository.js';
import { WeatherAgentToolInput, AlertRecommendation } from './weather.types.js';
import { ALERT_THRESHOLDS } from '../../constants/weather.constants.js';

export class WeatherAgentTools {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly alertRepository: WeatherAlertRepository
  ) {}

  async fetchAndEvaluateWeather(input: WeatherAgentToolInput): Promise<AlertRecommendation[]> {
    const forecast = await this.weatherService.fetchForecast({
      lat: input.lat,
      lng: input.lng,
    });

    return this.weatherService.evaluateAlertConditions(forecast, {
      highTempThreshold: ALERT_THRESHOLDS.HIGH_TEMP_CELSIUS,
      lowTempThreshold: ALERT_THRESHOLDS.LOW_TEMP_CELSIUS,
    });
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
}
