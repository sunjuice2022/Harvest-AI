/** Agent-specific types for the Weather Agent. */

import { AlertType, AlertSeverity } from '@agrisense/shared';

export interface WeatherAgentToolInput {
  userId: string;
  lat: number;
  lng: number;
}

export interface AlertRecommendation {
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  recommendation: string;
}

export interface ForecastSummary {
  currentTemp: number;
  maxTemp: number;
  minTemp: number;
  totalRainMm: number;
  consecutiveDryDays: number;
}
