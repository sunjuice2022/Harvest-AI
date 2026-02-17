/** Weather dashboard page — displays current conditions, 7-day forecast, and active alerts. */

import { useEffect, useState } from 'react';
import { useWeatherData } from '../hooks/useWeatherData.js';
import { WeatherCard } from '../components/weather/WeatherCard.js';
import { ForecastList } from '../components/weather/ForecastList.js';
import { AlertBanner } from '../components/weather/AlertBanner.js';
import styles from './HomePage.module.css';

interface DeviceLocation {
  lat: number;
  lng: number;
}

export default function HomePage(): JSX.Element {
  const [location, setLocation] = useState<DeviceLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => setLocationError('Unable to retrieve your location. Please update it in your profile.')
    );
  }, []);

  const { forecast, alerts, isLoading, error, acknowledgeAlert } = useWeatherData(location);

  if (!location && !locationError) {
    return <LoadingScreen message="Detecting your location..." />;
  }

  if (locationError) {
    return <ErrorScreen message={locationError} />;
  }

  if (isLoading) {
    return <LoadingScreen message="Loading weather data..." />;
  }

  if (error) {
    return <ErrorScreen message={error} />;
  }

  return (
    <main className={styles.page}>
      {alerts.length > 0 && (
        <section className={styles.alerts} aria-label="Active weather alerts">
          <h2 className={styles.sectionHeading}>Active Alerts</h2>
          {alerts.map((alert) => (
            <AlertBanner key={alert.alertId} alert={alert} onDismiss={acknowledgeAlert} />
          ))}
        </section>
      )}

      {forecast && (
        <>
          <section className={styles.current}>
            <WeatherCard current={forecast.current} />
          </section>
          <section className={styles.forecast}>
            <ForecastList days={forecast.days} />
          </section>
        </>
      )}
    </main>
  );
}

function LoadingScreen({ message }: { message: string }): JSX.Element {
  return (
    <div className={styles.centeredState} role="status" aria-live="polite">
      <div className={styles.spinner} aria-hidden="true" />
      <p className={styles.stateMessage}>{message}</p>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }): JSX.Element {
  return (
    <div className={styles.centeredState} role="alert">
      <p className={styles.stateMessage}>{message}</p>
    </div>
  );
}
