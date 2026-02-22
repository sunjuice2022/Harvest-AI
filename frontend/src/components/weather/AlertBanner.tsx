/** Dismissible alert banner card with severity color coding for weather alerts. */

import { WeatherAlert } from '@harvest-ai/shared';
import { ALERT_SEVERITY_COLORS, ALERT_TYPE_LABELS } from '../../constants/weather.constants.js';
import styles from './AlertBanner.module.css';

interface AlertBannerProps {
  alert: WeatherAlert;
  onDismiss: (alertId: string) => void;
}

export function AlertBanner({ alert, onDismiss }: AlertBannerProps) {
  const severityColor = ALERT_SEVERITY_COLORS[alert.severity] ?? 'var(--color-warning)';
  const typeLabel = ALERT_TYPE_LABELS[alert.type] ?? alert.type;

  return (
    <article
      className={styles.banner}
      style={{ borderLeftColor: severityColor }}
      role="alert"
      aria-live="polite"
    >
      <div className={styles.header}>
        <span className={styles.badge} style={{ backgroundColor: severityColor }}>
          {alert.severity.toUpperCase()}
        </span>
        <span className={styles.typeLabel}>{typeLabel}</span>
        <button
          className={styles.dismissButton}
          onClick={() => onDismiss(alert.alertId)}
          aria-label={`Dismiss ${typeLabel} alert`}
        >
          ✕
        </button>
      </div>
      <p className={styles.message}>{alert.message}</p>
      <p className={styles.recommendation}>{alert.recommendation}</p>
    </article>
  );
}
