/** Horizontal scrollable 7-day weather forecast list. */

import { WeatherForecastDay } from '@agrisense/shared';
import styles from './ForecastList.module.css';

interface ForecastListProps {
  days: WeatherForecastDay[];
}

export function ForecastList({ days }: ForecastListProps): JSX.Element {
  return (
    <section aria-label="7-day weather forecast">
      <h2 className={styles.heading}>7-Day Forecast</h2>
      <div className={styles.list} role="list">
        {days.map((day) => (
          <ForecastDayCard key={day.date} day={day} />
        ))}
      </div>
    </section>
  );
}

interface ForecastDayCardProps {
  day: WeatherForecastDay;
}

function ForecastDayCard({ day }: ForecastDayCardProps): JSX.Element {
  const dayLabel = formatDayLabel(day.date);

  return (
    <div className={styles.card} role="listitem">
      <p className={styles.dayLabel}>{dayLabel}</p>
      <img
        src={`https://openweathermap.org/img/wn/${day.icon}.png`}
        alt={day.condition}
        className={styles.icon}
        width={40}
        height={40}
      />
      <p className={styles.tempHigh}>{Math.round(day.tempHigh)}°</p>
      <p className={styles.tempLow}>{Math.round(day.tempLow)}°</p>
      {day.rainMm > 0 && (
        <p className={styles.rain} aria-label={`${day.rainMm}mm rainfall`}>
          💧 {day.rainMm}mm
        </p>
      )}
    </div>
  );
}

function formatDayLabel(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();

  if (isToday) return 'Today';

  return date.toLocaleDateString('en', { weekday: 'short' });
}
