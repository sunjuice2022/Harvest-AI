/** Weather dashboard — two-column layout with location picker, current conditions, alerts and advisory. */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWeatherData } from '../hooks/useWeatherData.js';
import { WeatherCard } from '../components/weather/WeatherCard.js';
import { subscribeToWeatherAlerts } from '../services/weather.service.js';
import type { WeatherAlert, WeatherForecastDay } from '@harvest-ai/shared';
import styles from './WeatherPage.module.css';

interface LocationEntry {
  name: string;
  state: string;
  lat: number;
  lng: number;
}

const LOCATIONS: LocationEntry[] = [
  // NSW
  { name: 'Sydney',        state: 'NSW', lat: -33.8688, lng: 151.2093 },
  { name: 'Newcastle',     state: 'NSW', lat: -32.9283, lng: 151.7817 },
  { name: 'Wollongong',    state: 'NSW', lat: -34.4278, lng: 150.8931 },
  { name: 'Dubbo',         state: 'NSW', lat: -32.2569, lng: 148.6011 },
  { name: 'Wagga Wagga',   state: 'NSW', lat: -35.1082, lng: 147.3598 },
  { name: 'Tamworth',      state: 'NSW', lat: -31.0927, lng: 150.9320 },
  { name: 'Orange',        state: 'NSW', lat: -33.2832, lng: 149.1000 },
  { name: 'Albury',        state: 'NSW', lat: -36.0737, lng: 146.9135 },
  // VIC
  { name: 'Melbourne',     state: 'VIC', lat: -37.8136, lng: 144.9631 },
  { name: 'Geelong',       state: 'VIC', lat: -38.1499, lng: 144.3617 },
  { name: 'Ballarat',      state: 'VIC', lat: -37.5622, lng: 143.8503 },
  { name: 'Bendigo',       state: 'VIC', lat: -36.7570, lng: 144.2794 },
  { name: 'Shepparton',    state: 'VIC', lat: -36.3800, lng: 145.3978 },
  { name: 'Wodonga',       state: 'VIC', lat: -36.1218, lng: 146.8881 },
  { name: 'Mildura',       state: 'VIC', lat: -34.1885, lng: 142.1625 },
  // QLD
  { name: 'Brisbane',      state: 'QLD', lat: -27.4698, lng: 153.0251 },
  { name: 'Gold Coast',    state: 'QLD', lat: -28.0167, lng: 153.4000 },
  { name: 'Cairns',        state: 'QLD', lat: -16.9186, lng: 145.7781 },
  { name: 'Townsville',    state: 'QLD', lat: -19.2590, lng: 146.8169 },
  { name: 'Toowoomba',     state: 'QLD', lat: -27.5598, lng: 151.9507 },
  { name: 'Rockhampton',   state: 'QLD', lat: -23.3791, lng: 150.5100 },
  { name: 'Mackay',        state: 'QLD', lat: -21.1411, lng: 149.1861 },
  { name: 'Bundaberg',     state: 'QLD', lat: -24.8661, lng: 152.3489 },
  // WA
  { name: 'Perth',         state: 'WA',  lat: -31.9505, lng: 115.8605 },
  { name: 'Bunbury',       state: 'WA',  lat: -33.3271, lng: 115.6414 },
  { name: 'Albany',        state: 'WA',  lat: -35.0269, lng: 117.8837 },
  { name: 'Geraldton',     state: 'WA',  lat: -28.7774, lng: 114.6149 },
  // SA
  { name: 'Adelaide',      state: 'SA',  lat: -34.9285, lng: 138.6007 },
  { name: 'Mount Gambier', state: 'SA',  lat: -37.8290, lng: 140.7824 },
  { name: 'Port Augusta',  state: 'SA',  lat: -32.4936, lng: 137.7758 },
  // TAS
  { name: 'Hobart',        state: 'TAS', lat: -42.8821, lng: 147.3272 },
  { name: 'Launceston',    state: 'TAS', lat: -41.4545, lng: 147.1460 },
  // NT
  { name: 'Darwin',        state: 'NT',  lat: -12.4634, lng: 130.8456 },
  { name: 'Alice Springs', state: 'NT',  lat: -23.6980, lng: 133.8807 },
  // ACT
  { name: 'Canberra',      state: 'ACT', lat: -35.2809, lng: 149.1300 },
];

const STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT'] as const;

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

function rainOutlook(days: WeatherForecastDay[]): string {
  const totalRain = days.reduce((sum, d) => sum + d.rainMm, 0);
  const rainyDays = days.filter((d) => d.rainMm > 1);
  if (totalRain < 1) return 'No significant rainfall is expected across the week — maintain your irrigation schedule to compensate for dry conditions and prevent moisture stress in crops.';
  if (rainyDays.length >= 4) {
    return `Rain is forecast on ${rainyDays.length} of 7 days (~${Math.round(totalRain)} mm total) — delay any spray or fertiliser applications and check drainage in low-lying paddocks to prevent waterlogging.`;
  }
  const names = rainyDays.map((d) => dayLabel(d.date)).join(', ');
  return `Rain is expected on ${names} (~${Math.round(totalRain)} mm total), which should provide helpful soil moisture. Plan field operations around these days to minimise disruption.`;
}

function frostRisk(days: WeatherForecastDay[]): string {
  const frostDays = days.filter((d) => d.tempLow < 4);
  if (frostDays.length === 0) return '';
  const names = frostDays.map((d) => dayLabel(d.date)).join(' and ');
  return `Frost risk is elevated on ${names} — protect sensitive seedlings, young transplants, and frost-susceptible crops overnight with covers or irrigation frost protection.`;
}

function bestOperatingDay(days: WeatherForecastDay[]): string {
  const suitable = days
    .filter((d) => d.rainMm < 1 && d.windSpeed < 6 && d.tempHigh < 33)
    .sort((a, b) => a.windSpeed - b.windSpeed);
  if (suitable.length === 0) return '';
  return `${dayLabel(suitable[0]!.date)} looks to be the most favourable window for spray applications, harvesting, or any precision field operations requiring calm, dry conditions.`;
}

function irrigationAdvice(totalRain: number): string {
  if (totalRain < 5) return 'With minimal rainfall forecast, soil moisture deficit is likely to widen — review irrigation schedules and prioritise water-sensitive crops and any recently transplanted stock.';
  if (totalRain > 50) return 'Significant rainfall may saturate soils — hold off on heavy machinery to avoid compaction, and monitor low-lying paddocks for waterlogging and root disease.';
  return 'Rainfall totals are moderate — supplement with irrigation only where soil moisture monitoring indicates a deficit, particularly for shallow-rooted crops.';
}

function buildWeatherOutlook(days: WeatherForecastDay[]): string {
  if (days.length === 0) return '';
  const maxTemp = Math.max(...days.map((d) => d.tempHigh));
  const minTemp = Math.min(...days.map((d) => d.tempLow));
  const avgHumidity = Math.round(days.reduce((sum, d) => sum + d.humidity, 0) / days.length);
  const avgWind = Math.round(days.reduce((sum, d) => sum + d.windSpeed, 0) / days.length);
  const totalRain = days.reduce((sum, d) => sum + d.rainMm, 0);

  const parts: string[] = [
    `Temperatures will range ${Math.round(minTemp)}–${Math.round(maxTemp)}°C across the week.`,
    rainOutlook(days),
  ];
  const frost = frostRisk(days);
  if (frost) parts.push(frost);
  if (maxTemp > 35) parts.push('Heat stress conditions are likely on peak days — ensure livestock have adequate shade and water, and schedule intensive field work for the early morning hours before temperatures climb.');
  if (avgHumidity > 75) parts.push(`Average humidity is elevated at ${avgHumidity}% this week, increasing fungal disease pressure — inspect crops more frequently, ensure good airflow in sheltered paddocks, and consider preventive fungicide applications on susceptible varieties.`);
  if (avgWind > 8) parts.push('Persistent elevated winds will hinder spray operations and accelerate topsoil moisture loss — prioritise any chemical or fertiliser applications during the calmest morning windows.');
  const bestDay = bestOperatingDay(days);
  if (bestDay) parts.push(bestDay);
  parts.push(irrigationAdvice(totalRain));
  return parts.join(' ');
}

const FALLBACK_ADVISORY =
  'Based on current weather patterns and seasonal data, conditions this week are generally favourable for field operations across most crop types. ' +
  'Soil moisture levels are trending within the optimal range; morning irrigation is recommended before midday temperatures exceed 30 °C. ' +
  'Monitor closely for early signs of fungal activity in high-humidity zones, particularly in sheltered paddocks with limited airflow. ' +
  'Wind speeds are forecast to ease mid-week, providing a low-drift window ideal for any scheduled pesticide or fertiliser applications. ' +
  'A drier, stable pattern is expected to return by the weekend — prioritise harvest-ready crops to take advantage of these conditions. ' +
  'Review water storage levels and adjust irrigation schedules accordingly if the current dry stretch extends beyond seven consecutive days.';

export function WeatherPage() {
  const [locationIdx, setLocationIdx] = useState(0);
  const [acknowledged, setAcknowledged] = useState(false);
  const location = LOCATIONS[locationIdx]!;
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
      {/* Page header */}
      <header className={styles.pageHeader}>
        <Link to="/" className={styles.backLink}>← Home</Link>
        <h1 className={styles.pageTitle}>🌦️ Smart Weather &amp; Alerts</h1>
      </header>

      {/* Location selector */}
      <div className={styles.locationBar}>
        <label htmlFor="location-select" className={styles.locationLabel}>📍 Location</label>
        <select
          id="location-select"
          className={styles.locationSelect}
          value={locationIdx}
          onChange={(e) => { setLocationIdx(Number(e.target.value)); setAcknowledged(false); }}
        >
          {STATES.map((state) => (
            <optgroup key={state} label={state}>
              {LOCATIONS.map((loc, i) =>
                loc.state === state
                  ? <option key={i} value={i}>{loc.name}</option>
                  : null
              )}
            </optgroup>
          ))}
        </select>
        <span className={styles.locationDisplay}>
          {location.name}, {location.state}
        </span>
      </div>

      <div className={styles.columns}>
        {/* ── LEFT PANEL ── */}
        <div className={styles.leftPanel}>
          <div>
            <div className={styles.panelHeader}>
              <span style={{ fontSize: '14px' }}>⚙️</span>
              <span className={styles.panelLabel}>Weather Agent Status</span>
            </div>
            <WeatherCard
              current={forecast.current}
              locationName={`${location.name}, ${location.state}`}
            />
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

            {/* 7-day weather outlook derived from forecast data */}
            <div className={styles.weatherOutlook}>
              <p className={styles.weatherOutlookLabel}>📅 7-Day Weather Outlook</p>
              <p className={styles.weatherOutlookText}>{buildWeatherOutlook(forecast.days)}</p>
            </div>

            <div className={styles.advisoryActions}>
              <button
                className={acknowledged ? styles.btnAcknowledged : styles.btnOutline}
                disabled={acknowledged}
                onClick={() => setAcknowledged(true)}
              >
                {acknowledged ? '✓ Acknowledged' : 'Acknowledge'}
              </button>
              <Link to="/farm-recommendation" className={styles.btnPrimary}>
                Adjust Schedule →
              </Link>
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

function AlertCard({ alert, onDismiss }: { alert: WeatherAlert; onDismiss: (id: string) => void }) {
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

function AlertSubscribeForm() {
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
