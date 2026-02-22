/** Frontend-specific type extensions for the Weather domain. */

export type { WeatherAlert, WeatherForecast, WeatherForecastDay, AlertType, AlertSeverity } from '@harvest-ai/shared';

export interface UseWeatherDataResult {
  forecast: import('@harvest-ai/shared').WeatherForecast | null;
  alerts: import('@harvest-ai/shared').WeatherAlert[];
  advisory: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  acknowledgeAlert: (alertId: string) => Promise<void>;
}
