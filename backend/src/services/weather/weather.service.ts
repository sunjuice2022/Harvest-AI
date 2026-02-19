/** Business logic for the Weather domain — forecast fetching and alert threshold evaluation. */

import { WeatherForecast, WeatherForecastDay, GeoLocation } from '@agrisense/shared';
import { OpenWeatherOneCallResponse } from './weather.dto.js';
import { WeatherConfig } from './weather.types.js';
import { AlertRecommendation } from '../../agents/weather/weather.types.js';
import { RECOMMENDATION_TEMPLATES } from '../../agents/weather/weather.prompts.js';
import { ALERT_THRESHOLDS, FORECAST_DAYS } from '../../constants/weather.constants.js';

export class WeatherServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

interface AlertThresholds {
  highTempThreshold: number;
  lowTempThreshold: number;
}

export class WeatherService {
  constructor(private readonly config: WeatherConfig) {}

  async fetchForecast(location: GeoLocation): Promise<OpenWeatherOneCallResponse> {
    const url = this.buildForecastUrl(location);
    const response = await fetch(url);

    if (!response.ok) {
      throw new WeatherServiceError(
        `Weather API returned ${response.status}`,
        'API_ERROR'
      );
    }

    return response.json() as Promise<OpenWeatherOneCallResponse>;
  }

  parseForecast(raw: OpenWeatherOneCallResponse): WeatherForecast {
    return {
      location: { lat: raw.lat, lng: raw.lon },
      current: {
        temperature: raw.current.temp,
        feelsLike: raw.current.feels_like,
        humidity: raw.current.humidity,
        windSpeed: raw.current.wind_speed,
        condition: raw.current.weather[0]?.description ?? '',
        icon: raw.current.weather[0]?.icon ?? '',
      },
      days: raw.daily.slice(0, FORECAST_DAYS).map((day) => this.parseForecastDay(day)),
      fetchedAt: new Date().toISOString(),
    };
  }

  evaluateAlertConditions(
    raw: OpenWeatherOneCallResponse,
    thresholds: AlertThresholds
  ): AlertRecommendation[] {
    const alerts: AlertRecommendation[] = [];
    const maxTemp = Math.max(...raw.daily.slice(0, 3).map((d) => d.temp.max));
    const minTemp = Math.min(...raw.daily.slice(0, 3).map((d) => d.temp.min));
    const rain24h = raw.daily[0]?.rain ?? 0;
    const dryDays = this.countConsecutiveDryDays(raw.daily);

    if (maxTemp > thresholds.highTempThreshold) {
      alerts.push(buildHighTempAlert(maxTemp));
    }
    if (minTemp < thresholds.lowTempThreshold) {
      alerts.push(buildLowTempAlert(minTemp));
    }
    if (rain24h > ALERT_THRESHOLDS.FLOOD_RAIN_MM_24H) {
      alerts.push(buildFloodAlert(rain24h));
    }
    if (dryDays >= ALERT_THRESHOLDS.DROUGHT_CONSECUTIVE_DRY_DAYS) {
      alerts.push(buildDroughtAlert(dryDays));
    }

    return alerts;
  }

  private parseForecastDay(day: OpenWeatherOneCallResponse['daily'][0]): WeatherForecastDay {
    return {
      date: new Date(day.dt * 1000).toISOString().split('T')[0] ?? '',
      tempHigh: day.temp.max,
      tempLow: day.temp.min,
      humidity: day.humidity,
      windSpeed: day.wind_speed,
      rainMm: day.rain ?? 0,
      condition: day.weather[0]?.description ?? '',
      icon: day.weather[0]?.icon ?? '',
    };
  }

  private countConsecutiveDryDays(daily: OpenWeatherOneCallResponse['daily']): number {
    let count = 0;
    for (const day of daily) {
      if ((day.rain ?? 0) < 1) count++;
      else break;
    }
    return count;
  }

  private buildForecastUrl(location: GeoLocation): string {
    const params = new URLSearchParams({
      lat: location.lat.toString(),
      lon: location.lng.toString(),
      exclude: 'minutely,hourly,alerts',
      units: 'metric',
      appid: this.config.apiKey,
    });
    return `${this.config.apiBaseUrl}/onecall?${params.toString()}`;
  }
}

function buildHighTempAlert(temp: number): AlertRecommendation {
  return {
    type: 'high_temp',
    severity: temp > 40 ? 'critical' : 'warning',
    message: `High temperature alert: ${temp}°C forecast`,
    recommendation: RECOMMENDATION_TEMPLATES.highTemp(temp, 'your crops'),
  };
}

function buildLowTempAlert(temp: number): AlertRecommendation {
  return {
    type: 'low_temp',
    severity: temp < 0 ? 'critical' : 'warning',
    message: `Low temperature alert: ${temp}°C forecast`,
    recommendation: RECOMMENDATION_TEMPLATES.lowTemp(temp, 'your crops'),
  };
}

function buildFloodAlert(rainMm: number): AlertRecommendation {
  return {
    type: 'flood',
    severity: rainMm > 100 ? 'critical' : 'warning',
    message: `Flood risk: ${rainMm}mm rainfall forecast in 24 hours`,
    recommendation: RECOMMENDATION_TEMPLATES.flood(rainMm),
  };
}

function buildDroughtAlert(dryDays: number): AlertRecommendation {
  return {
    type: 'drought',
    severity: dryDays > 14 ? 'critical' : 'warning',
    message: `Drought risk: ${dryDays} consecutive dry days detected`,
    recommendation: RECOMMENDATION_TEMPLATES.drought(dryDays),
  };
}
