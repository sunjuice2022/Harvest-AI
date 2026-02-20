/** Frontend-specific type extensions for the Weather domain. */

export type { WeatherAlert, WeatherForecast, WeatherForecastDay, AlertType, AlertSeverity } from '@agrisense/shared';

export interface UseWeatherDataResult {
  forecast: import('@agrisense/shared').WeatherForecast | null;
  alerts: import('@agrisense/shared').WeatherAlert[];
  advisory: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  acknowledgeAlert: (alertId: string) => Promise<void>;
}
