/**
 * Data Transfer Objects (DTOs) for the Weather Service.
 * Contains external API contracts (OpenWeather) and service-specific inputs.
 */

import { GeoLocation } from '@agrisense/shared';

export interface OpenWeatherCondition {
  description: string;
  icon: string;
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