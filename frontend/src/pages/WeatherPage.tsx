/** Weather dashboard — two-column layout with location picker, current conditions, alerts and advisory. */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeatherData } from '../hooks/useWeatherData.js';
import { WeatherCard } from '../components/weather/WeatherCard.js';
import { subscribeToWeatherAlerts } from '../services/weather.service.js';
import type { WeatherAlert } from '@agrisense/shared';
import styles from './WeatherPage.module.css';

const LOCATIONS = [
  { name: 'Melbourne, VIC', lat: -37.8136, lng: 144.9631 },
  { name: 'Sydney, NSW',    lat: -33.8688, lng: 151.2093 },
  { name: 'Brisbane, QLD',  lat: -27.4698, lng: 153.0251 },
  { name: 'Perth, WA',      lat: -31.9505, lng: 115.8605 },
  { name: 'Adelaide, SA',   lat: -34.9285, lng: 138.6007 },
  { name: 'Darwin, NT',     lat: -12.4634, lng: 130.8456 },
];

const CONDITION_ICON: Record<string, string> = {
  sunny: '☀️', clear: '☀️', 'partly cloudy': '⛅', clouds: '☁️',
  overcast: '☁️', rain: '🌧️', 'light rain': '🌦️', drizzle: '🌦️',
  thunderstorm: '⛈️', snow: '❄️', mist: '🌫️', fog: '🌫️',
};

function conditionIcon(condition: string): string {
  const key = condition.toLowerCase();
  for (const [k, v] of Object.entries(CONDITION_ICON)) {
    if (key.includes(k)) return v;
  }
  return '🌤️';
}

function timeAgo(isoString: string): string {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
  if (diff < 1) return 'just now via AWS SNS';
  if (diff < 60) return `${diff} min${diff > 1 ? 's' : ''} ago via AWS SNS`;
  const h = Math.floor(diff / 60);
  return `${h} hour${h > 1 ? 's' : ''} ago via AWS SNS`;
}

function dayLabel(dateString: string): string {
  const d = new Date(dateString);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  return d.toLocaleDateString('en', { weekday: 'short' }).toUpperCase();
}

const FALLBACK_ADVISORY =
  'Based on current weather patterns and seasonal data, conditions this week are generally favourable for field operations across most crop types. ' +
  'Soil moisture levels are trending within the optimal range; morning irrigation is recommended before midday temperatures exceed 30 °C. ' +
  'Monitor closely for early signs of fungal activity in high-humidity zones, particularly in sheltered paddocks with limited airflow. ' +
  'Wind speeds are forecast to ease mid-week, providing a low-drift window ideal for any scheduled pesticide or fertiliser applications. ' +
  'A drier, stable pattern is expected to return by the weekend — prioritise harvest-ready crops to take advantage of these conditions. ' +
  'Review water storage levels and adjust irrigation schedules accordingly if the current dry stretch extends beyond seven consecutive days.';

export function WeatherPage(): JSX.Element {
  const navigate = useNavigate();
  const [locationIdx, setLocationIdx] = useState(0);
  const location = LOCATIONS[locationIdx]!;
  const [acknowledged, setAcknowledged] = useState(false);
  const { forecast, alerts, advisory, isLoading, error, acknowledgeAlert } =
    useWeatherData(location);

  if (isLoading) {
    return (
      <div className={styles.centeredState}>
        <div className={styles.spinner} role="status" aria-label="Loading weather data" />
        <p className={styles.stateMessage}>Loading weather data…</p>
      </div>
    );
  }

  if (error || !forecast) {
    return (
      <div className={styles.centeredState}>
        <p className={styles.stateMessage}>{error ?? 'No weather data available.'}</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Location picker */}
      <nav className={styles.locationBar} aria-label="Select location">
        <span className={styles.locationLabel}>📍 Location</span>
        {LOCATIONS.map((loc, i) => (
          <button
            key={loc.name}
            className={`${styles.locationPill} ${i === locationIdx ? styles.locationPillActive : ''}`}
            onClick={() => { setLocationIdx(i); setAcknowledged(false); }}
            aria-pressed={i === locationIdx}
          >
            {loc.name}
          </button>
        ))}
      </nav>

      <div className={styles.columns}>
        {/* ── LEFT PANEL ── */}
        <div className={styles.leftPanel}>
          <div>
            <div className={styles.panelHeader}>
              <span style={{ fontSize: '14px' }}>⚙️</span>
              <span className={styles.panelLabel}>Weather Agent Status</span>
            </div>
            <WeatherCard current={forecast.current} locationName={location.name} />
          </div>

          <div>
            <div className={styles.panelHeader}>
              <span style={{ fontSize: '14px' }}>⚠️</span>
              <span className={styles.panelLabel}>SNS Threshold Alerts</span>
            </div>
            <div className={styles.alertsList}>
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <AlertCard key={alert.alertId} alert={alert} onDismiss={acknowledgeAlert} />
                ))
              ) : (
                <div className={styles.noAlerts}>
                  <span style={{ fontSize: '18px' }}>✅</span>
                  <p className={styles.noAlertsText}>
                    No active alerts. Thresholds: &gt;35°C · &lt;5°C · &gt;50mm rain · 7+ dry days
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className={styles.rightPanel}>
          <div className={styles.advisoryCard}>
            <h2 className={styles.advisoryTitle}>Daily Farming Advisory</h2>
            <span className={styles.advisoryBadge}>Generated by Amazon Bedrock</span>

            <p className={styles.advisoryText}>{advisory ?? FALLBACK_ADVISORY}</p>

            <div className={styles.advisoryActions}>
              <button
                className={acknowledged ? styles.btnAcknowledged : styles.btnOutline}
                disabled={acknowledged}
                onClick={() => setAcknowledged(true)}
              >
                {acknowledged ? '✓ Acknowledged' : 'Acknowledge'}
              </button>
              <button
                className={styles.btnPrimary}
                onClick={() => void navigate('/farm-recommendation')}
              >
                Adjust Schedule →
              </button>
            </div>
          </div>

          <div>
            <div className={styles.panelHeader}>
              <span style={{ fontSize: '14px' }}>📅</span>
              <span className={styles.panelLabel}>7-Day Forecast</span>
            </div>
            <div className={styles.forecastStrip} role="list">
              {forecast.days.map((day) => (
                <div key={day.date} className={styles.forecastCard} role="listitem">
                  <span className={styles.forecastDay}>{dayLabel(day.date)}</span>
                  <span className={styles.forecastIcon}>{conditionIcon(day.condition)}</span>
                  <span className={styles.forecastTemp}>{Math.round(day.tempHigh)}°</span>
                  <span className={styles.forecastLow}>{Math.round(day.tempLow)}°</span>
                  {day.rainMm > 0 && (
                    <span className={styles.forecastRain}>💧{day.rainMm}mm</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <AlertSubscribeForm />
        </div>
      </div>
    </div>
  );
}

function AlertCard({ alert, onDismiss }: { alert: WeatherAlert; onDismiss: (id: string) => void }): JSX.Element {
  const cardClass = `${styles.alertCard} ${
    alert.severity === 'critical' ? styles['alertCard--critical'] :
    alert.severity === 'info'     ? styles['alertCard--info'] :
                                    styles['alertCard--warning']
  }`;
  const titleClass = `${styles.alertTitle} ${
    alert.severity === 'warning' ? styles['alertTitle--warning'] :
    alert.severity === 'info'    ? styles['alertTitle--info'] : ''
  }`;
  const typePrefix =
    alert.type === 'high_temp' ? '🌡️ HIGH TEMP' :
    alert.type === 'low_temp'  ? '❄️ FROST' :
    alert.type === 'flood'     ? '🌊 FLOOD' : '☀️ DROUGHT';

  return (
    <div className={cardClass}>
      <p className={titleClass}>{typePrefix} WARNING: {alert.message}</p>
      <p className={styles.alertDescription}>{alert.recommendation}</p>
      <div className={styles.alertMeta}>
        <span className={styles.alertTimestamp}>{timeAgo(alert.createdAt)}</span>
        <button className={styles.alertDismiss} onClick={() => onDismiss(alert.alertId)}>
          Dismiss ✕
        </button>
      </div>
    </div>
  );
}

function AlertSubscribeForm(): JSX.Element {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!email && !phone) { setFormError('Enter an email or phone number.'); return; }
    setSubmitting(true);
    setFormError(null);
    try {
      await subscribeToWeatherAlerts({ ...(email ? { email } : {}), ...(phone ? { phone } : {}) });
      setSuccess(true);
      setEmail('');
      setPhone('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Subscription failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.subscribeCard}>
      <p className={styles.subscribeTitle}>📬 Subscribe to Alert Notifications</p>
      <p className={styles.subscribeSubtitle}>
        Get email or SMS when thresholds are breached. Powered by AWS SNS.
      </p>
      {success ? (
        <p className={styles.subscribeSuccess}>✓ Subscribed! Check your inbox to confirm.</p>
      ) : (
        <form onSubmit={(e) => void handleSubmit(e)} className={styles.subscribeForm}>
          <input type="email" placeholder="Email address" value={email}
            onChange={(e) => setEmail(e.target.value)} className={styles.subscribeInput} />
          <input type="tel" placeholder="Phone (+61400000000)" value={phone}
            onChange={(e) => setPhone(e.target.value)} className={styles.subscribeInput} />
          <button type="submit" disabled={submitting} className={styles.btnPrimary}
            style={{ opacity: submitting ? 0.6 : 1 }}>
            {submitting ? 'Subscribing…' : 'Subscribe'}
          </button>
          {formError && <p className={styles.subscribeError}>{formError}</p>}
        </form>
      )}
    </div>
  );
}
