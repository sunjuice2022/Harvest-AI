/** Backend domain models for the Weather feature — internal types not exposed in the API contract. */

import { AlertSeverity, AlertType, GeoLocation } from '@agrisense/shared';

export interface WeatherConfig {
  apiBaseUrl: string;
  apiKey: string;
  highTempThreshold: number;
  lowTempThreshold: number;
  pollIntervalMinutes: number;
}

export interface OpenWeatherCurrentResponse {
  dt: number;
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  weather: OpenWeatherCondition[];
}

export interface OpenWeatherDailyResponse {
  dt: number;
  temp: { max: number; min: number };
  humidity: number;
  wind_speed: number;
  rain?: number;
  weather: OpenWeatherCondition[];
}

export interface OpenWeatherCondition {
  description: string;
  icon: string;
}

export interface OpenWeatherOneCallResponse {
  lat: number;
  lon: number;
  current: OpenWeatherCurrentResponse;
  daily: OpenWeatherDailyResponse[];
}

export interface AlertEvaluationInput {
  userId: string;
  location: GeoLocation;
  forecast: OpenWeatherOneCallResponse;
  highTempThreshold: number;
  lowTempThreshold: number;
}

export interface CreateAlertInput {
  userId: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  recommendation: string;
}
