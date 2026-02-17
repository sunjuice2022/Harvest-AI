/** Frontend constants for the Weather domain. */

export const WEATHER_POLL_INTERVAL_MS = 5 * 60 * 1000;

export const ALERT_SEVERITY_COLORS: Record<string, string> = {
  info: 'var(--color-info)',
  warning: 'var(--color-warning)',
  critical: 'var(--color-error)',
};

export const ALERT_TYPE_LABELS: Record<string, string> = {
  high_temp: 'High Temperature',
  low_temp: 'Low Temperature',
  flood: 'Flood Risk',
  drought: 'Drought Risk',
};
