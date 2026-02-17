/** Backend constants for the Weather domain. */

export const WEATHER_TABLE_NAME = process.env.DYNAMODB_WEATHER_ALERTS_TABLE ?? 'WeatherAlerts';

export const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/3.0';

export const ALERT_THRESHOLDS = {
  HIGH_TEMP_CELSIUS: 35,
  LOW_TEMP_CELSIUS: 5,
  FLOOD_RAIN_MM_24H: 50,
  DROUGHT_CONSECUTIVE_DRY_DAYS: 7,
} as const;

export const FORECAST_DAYS = 7;
