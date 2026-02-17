/** Shared constants for the Weather domain used by both frontend and backend. */

export const WEATHER_DEFAULTS = {
  HIGH_TEMP_THRESHOLD: 35,
  LOW_TEMP_THRESHOLD: 5,
  FLOOD_RAIN_MM_THRESHOLD: 50,
  DROUGHT_DRY_DAYS_THRESHOLD: 7,
  FORECAST_DAYS: 7,
  POLL_INTERVAL_MINUTES: 30,
} as const;

export const WEATHER_API_ENDPOINTS = {
  FORECAST: '/api/weather/forecast',
  ALERTS: '/api/weather/alerts',
  ACKNOWLEDGE_ALERT: '/api/weather/alerts/:alertId/acknowledge',
} as const;
