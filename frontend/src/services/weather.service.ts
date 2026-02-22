/** API client for the Weather domain — all HTTP calls to the backend weather endpoints. */

import { GetForecastResponse, GetAlertsResponse, AcknowledgeAlertResponse } from '@harvest-ai/shared';
import { WEATHER_API_ENDPOINTS } from '@harvest-ai/shared';

const API_BASE_URL = (import.meta.env['VITE_API_BASE_URL'] as string | undefined) ?? '';

export interface SubscribeRequest {
  email?: string;
  phone?: string;
}

export interface SubscribeResponse {
  subscriptionArn: string;
  pendingConfirmation: boolean;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchWeatherForecast(lat: number, lng: number): Promise<GetForecastResponse> {
  const params = new URLSearchParams({ lat: lat.toString(), lng: lng.toString() });
  return apiFetch<GetForecastResponse>(`${WEATHER_API_ENDPOINTS.FORECAST}?${params.toString()}`);
}

export async function fetchWeatherAlerts(): Promise<GetAlertsResponse> {
  return apiFetch<GetAlertsResponse>(WEATHER_API_ENDPOINTS.ALERTS);
}

export async function acknowledgeWeatherAlert(alertId: string): Promise<AcknowledgeAlertResponse> {
  const path = WEATHER_API_ENDPOINTS.ACKNOWLEDGE_ALERT.replace(':alertId', alertId);
  return apiFetch<AcknowledgeAlertResponse>(path, { method: 'PUT' });
}

export async function subscribeToWeatherAlerts(request: SubscribeRequest): Promise<SubscribeResponse> {
  return apiFetch<SubscribeResponse>('/api/weather/subscribe', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}
