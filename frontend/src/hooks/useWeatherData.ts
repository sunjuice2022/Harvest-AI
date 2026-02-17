/** Custom hook for fetching weather forecast and alerts, with auto-polling. */

import { useState, useEffect, useCallback } from 'react';
import { WeatherForecast, WeatherAlert } from '@agrisense/shared';
import {
  fetchWeatherForecast,
  fetchWeatherAlerts,
  acknowledgeWeatherAlert,
} from '../services/weather.service.js';
import { UseWeatherDataResult } from '../types/weather.types.js';
import { WEATHER_POLL_INTERVAL_MS } from '../constants/weather.constants.js';

interface WeatherLocation {
  lat: number;
  lng: number;
}

export function useWeatherData(location: WeatherLocation | null): UseWeatherDataResult {
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWeatherData = useCallback(async () => {
    if (!location) return;

    try {
      setError(null);
      const [forecastResponse, alertsResponse] = await Promise.all([
        fetchWeatherForecast(location.lat, location.lng),
        fetchWeatherAlerts(),
      ]);
      setForecast(forecastResponse.forecast);
      setAlerts(alertsResponse.alerts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load weather data');
    } finally {
      setIsLoading(false);
    }
  }, [location]);

  useEffect(() => {
    void loadWeatherData();
    const interval = setInterval(() => void loadWeatherData(), WEATHER_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadWeatherData]);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    await acknowledgeWeatherAlert(alertId);
    setAlerts((prev) => prev.filter((a) => a.alertId !== alertId));
  }, []);

  return {
    forecast,
    alerts,
    isLoading,
    error,
    refetch: () => void loadWeatherData(),
    acknowledgeAlert,
  };
}
