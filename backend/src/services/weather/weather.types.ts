/**
 * Backend domain models for the Weather feature.
 */

import { AlertSeverity, AlertType } from '@agrisense/shared';

export interface WeatherConfig {
  apiBaseUrl: string;
  apiKey: string;
  highTempThreshold: number;
  lowTempThreshold: number;
  pollIntervalMinutes: number;
}

export interface CreateAlertInput {
  userId: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  recommendation: string;
}