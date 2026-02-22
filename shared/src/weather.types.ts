/** Shared API contract types for the Weather domain used by both frontend and backend. */

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface WeatherForecastDay {
  date: string;
  tempHigh: number;
  tempLow: number;
  humidity: number;
  windSpeed: number;
  rainMm: number;
  condition: string;
  icon: string;
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
}

export interface WeatherForecast {
  location: GeoLocation;
  current: CurrentWeather;
  days: WeatherForecastDay[];
  fetchedAt: string;
}

export type AlertType = 'high_temp' | 'low_temp' | 'flood' | 'drought';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface WeatherAlert {
  alertId: string;
  userId: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  recommendation: string;
  acknowledged: boolean;
  createdAt: string;
}

export interface GetForecastRequest {
  lat: number;
  lng: number;
}

export interface GetForecastResponse {
  forecast: WeatherForecast;
  advisory?: string;
}

export interface GetAlertsResponse {
  alerts: WeatherAlert[];
}

export interface AcknowledgeAlertResponse {
  alertId: string;
  acknowledged: boolean;
}

export interface SubscribeNotificationRequest {
  email?: string;
  phone?: string;
  userId: string;
}

export interface WeatherSubscriptionResult {
  subscriptionArn: string;
  pendingConfirmation: boolean;
}

export interface SubscribeNotificationResponse {
  email?: WeatherSubscriptionResult;
  phone?: WeatherSubscriptionResult;
}
