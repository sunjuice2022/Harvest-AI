/** Displays current weather conditions as a glassmorphism card. */

import { CurrentWeather } from '@agrisense/shared';
import styles from './WeatherCard.module.css';

interface WeatherCardProps {
  current: CurrentWeather;
  locationName?: string;
}

export function WeatherCard({ current, locationName }: WeatherCardProps): JSX.Element {
  return (
    <div className={styles.card} role="region" aria-label="Current weather conditions">
      {locationName && <p className={styles.location}>{locationName}</p>}
      <div className={styles.tempRow}>
        <span className={styles.temperature}>{Math.round(current.temperature)}°C</span>
        <img
          src={`https://openweathermap.org/img/wn/${current.icon}@2x.png`}
          alt={current.condition}
          className={styles.icon}
          width={64}
          height={64}
        />
      </div>
      <p className={styles.condition}>{current.condition}</p>
      <div className={styles.statsRow}>
        <WeatherStat label="Feels like" value={`${Math.round(current.feelsLike)}°C`} />
        <WeatherStat label="Humidity" value={`${current.humidity}%`} />
        <WeatherStat label="Wind" value={`${Math.round(current.windSpeed)} m/s`} />
      </div>
    </div>
  );
}

interface WeatherStatProps {
  label: string;
  value: string;
}

function WeatherStat({ label, value }: WeatherStatProps): JSX.Element {
  return (
    <div className={styles.stat}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
    </div>
  );
}
