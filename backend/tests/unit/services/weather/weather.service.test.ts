/** Unit tests for WeatherService — forecast parsing and alert threshold evaluation. */

import { WeatherService } from '../../../../src/services/weather/weather.service.js';
import { OpenWeatherOneCallResponse } from '../../../../src/models/weather.types.js';

const TEST_CONFIG = {
  apiBaseUrl: 'https://api.openweathermap.org/data/3.0',
  apiKey: 'test-key',
  highTempThreshold: 35,
  lowTempThreshold: 5,
  pollIntervalMinutes: 30,
};

function buildMockForecast(overrides: Partial<OpenWeatherOneCallResponse> = {}): OpenWeatherOneCallResponse {
  return {
    lat: -37.8136,
    lon: 144.9631,
    current: {
      dt: 1700000000,
      temp: 22,
      feels_like: 21,
      humidity: 65,
      wind_speed: 10,
      weather: [{ description: 'clear sky', icon: '01d' }],
    },
    daily: Array.from({ length: 7 }, (_, i) => ({
      dt: 1700000000 + i * 86400,
      temp: { max: 25, min: 15 },
      humidity: 60,
      wind_speed: 8,
      rain: 0,
      weather: [{ description: 'sunny', icon: '01d' }],
    })),
    ...overrides,
  };
}

describe('WeatherService', () => {
  let service: WeatherService;

  beforeEach(() => {
    service = new WeatherService(TEST_CONFIG);
  });

  describe('parseForecast', () => {
    it('should parse current conditions from raw API response', () => {
      const raw = buildMockForecast();

      const result = service.parseForecast(raw);

      expect(result.current.temperature).toBe(22);
      expect(result.current.humidity).toBe(65);
      expect(result.location).toEqual({ lat: -37.8136, lng: 144.9631 });
    });

    it('should return exactly 7 forecast days', () => {
      const raw = buildMockForecast();

      const result = service.parseForecast(raw);

      expect(result.days).toHaveLength(7);
    });

    it('should map rain to 0 when not present in daily data', () => {
      const raw = buildMockForecast();

      const result = service.parseForecast(raw);

      expect(result.days[0]?.rainMm).toBe(0);
    });
  });

  describe('evaluateAlertConditions', () => {
    it('should return no alerts when conditions are within thresholds', () => {
      const raw = buildMockForecast();

      const alerts = service.evaluateAlertConditions(raw, {
        highTempThreshold: 35,
        lowTempThreshold: 5,
      });

      expect(alerts).toHaveLength(0);
    });

    it('should return a high_temp alert when max temp exceeds threshold', () => {
      const raw = buildMockForecast({
        daily: Array.from({ length: 7 }, (_, i) => ({
          dt: 1700000000 + i * 86400,
          temp: { max: 38, min: 20 },
          humidity: 40,
          wind_speed: 5,
          rain: 0,
          weather: [{ description: 'hot', icon: '01d' }],
        })),
      });

      const alerts = service.evaluateAlertConditions(raw, {
        highTempThreshold: 35,
        lowTempThreshold: 5,
      });

      expect(alerts.some((a) => a.type === 'high_temp')).toBe(true);
    });

    it('should return a low_temp alert when min temp falls below threshold', () => {
      const raw = buildMockForecast({
        daily: Array.from({ length: 7 }, (_, i) => ({
          dt: 1700000000 + i * 86400,
          temp: { max: 10, min: 2 },
          humidity: 80,
          wind_speed: 15,
          rain: 0,
          weather: [{ description: 'cold', icon: '13d' }],
        })),
      });

      const alerts = service.evaluateAlertConditions(raw, {
        highTempThreshold: 35,
        lowTempThreshold: 5,
      });

      expect(alerts.some((a) => a.type === 'low_temp')).toBe(true);
    });

    it('should return a flood alert when 24h rainfall exceeds 50mm', () => {
      const raw = buildMockForecast({
        daily: Array.from({ length: 7 }, (_, i) => ({
          dt: 1700000000 + i * 86400,
          temp: { max: 20, min: 15 },
          humidity: 95,
          wind_speed: 20,
          rain: i === 0 ? 75 : 2,
          weather: [{ description: 'heavy rain', icon: '10d' }],
        })),
      });

      const alerts = service.evaluateAlertConditions(raw, {
        highTempThreshold: 35,
        lowTempThreshold: 5,
      });

      expect(alerts.some((a) => a.type === 'flood')).toBe(true);
    });

    it('should return a drought alert when 7+ consecutive dry days are detected', () => {
      const raw = buildMockForecast();

      const alerts = service.evaluateAlertConditions(raw, {
        highTempThreshold: 35,
        lowTempThreshold: 5,
      });

      expect(alerts.some((a) => a.type === 'drought')).toBe(true);
    });

    it('should set severity to critical when temperature exceeds 40°C', () => {
      const raw = buildMockForecast({
        daily: Array.from({ length: 7 }, (_, i) => ({
          dt: 1700000000 + i * 86400,
          temp: { max: 42, min: 25 },
          humidity: 20,
          wind_speed: 5,
          rain: 0,
          weather: [{ description: 'extreme heat', icon: '01d' }],
        })),
      });

      const alerts = service.evaluateAlertConditions(raw, {
        highTempThreshold: 35,
        lowTempThreshold: 5,
      });

      const highTempAlert = alerts.find((a) => a.type === 'high_temp');
      expect(highTempAlert?.severity).toBe('critical');
    });
  });
});
