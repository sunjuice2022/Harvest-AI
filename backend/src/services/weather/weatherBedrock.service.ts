/** Bedrock service for the Weather Agent — calls Claude to generate AI-powered recommendations. */

import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { WeatherForecast } from '@harvest-ai/shared';
import { AlertRecommendation } from '../../agents/weather/weather.types.js';
import { WEATHER_AGENT_SYSTEM_PROMPT } from '../../agents/weather/weather.prompts.js';

export interface BedrockConfig {
  modelId: string;
  region: string;
}

export class WeatherBedrockService {
  private readonly client: BedrockRuntimeClient;

  constructor(
    private readonly config: BedrockConfig,
    bedrockClient?: BedrockRuntimeClient
  ) {
    this.client = bedrockClient ?? new BedrockRuntimeClient({ region: config.region });
  }

  async enrichRecommendations(
    alerts: AlertRecommendation[],
    forecast: WeatherForecast
  ): Promise<AlertRecommendation[]> {
    return Promise.all(alerts.map((alert) => this.enrichSingleAlert(alert, forecast)));
  }

  async generateDailyAdvisory(forecast: WeatherForecast, lat: number): Promise<string> {
    const season = detectSeason(lat);
    try {
      return await this.callClaudeForAdvisory(forecast, season);
    } catch (err) {
      console.warn('[WeatherBedrockService] Advisory generation failed, using fallback', err);
      return buildFallbackAdvisory(forecast, season);
    }
  }

  private async enrichSingleAlert(
    alert: AlertRecommendation,
    forecast: WeatherForecast
  ): Promise<AlertRecommendation> {
    try {
      const recommendation = await this.callClaude(alert, forecast);
      return { ...alert, recommendation };
    } catch (err) {
      console.warn('[WeatherBedrockService] Bedrock call failed, using template recommendation', err);
      return alert;
    }
  }

  private async callClaude(alert: AlertRecommendation, forecast: WeatherForecast): Promise<string> {
    const response = await this.client.send(
      new ConverseCommand({
        modelId: this.config.modelId,
        system: [{ text: WEATHER_AGENT_SYSTEM_PROMPT }],
        messages: [{ role: 'user', content: [{ text: buildAlertPrompt(alert, forecast) }] }],
        inferenceConfig: { maxTokens: 150, temperature: 0.7 },
      })
    );

    const block = response.output?.message?.content?.[0];
    const text = block && 'text' in block ? block.text : null;
    if (!text) throw new Error('Empty response from Bedrock');
    return text.trim();
  }

  private async callClaudeForAdvisory(forecast: WeatherForecast, season: string): Promise<string> {
    const response = await this.client.send(
      new ConverseCommand({
        modelId: this.config.modelId,
        system: [{ text: WEATHER_AGENT_SYSTEM_PROMPT }],
        messages: [{ role: 'user', content: [{ text: buildAdvisoryPrompt(forecast, season) }] }],
        inferenceConfig: { maxTokens: 100, temperature: 0.7 },
      })
    );

    const block = response.output?.message?.content?.[0];
    const text = block && 'text' in block ? block.text : null;
    if (!text) throw new Error('Empty response from Bedrock');
    return text.trim();
  }
}

function detectSeason(lat: number): string {
  const month = new Date().getMonth();
  const northern = ['Winter', 'Winter', 'Spring', 'Spring', 'Spring', 'Summer', 'Summer', 'Summer', 'Autumn', 'Autumn', 'Autumn', 'Winter'];
  const southern = ['Summer', 'Summer', 'Autumn', 'Autumn', 'Autumn', 'Winter', 'Winter', 'Winter', 'Spring', 'Spring', 'Spring', 'Summer'];
  return (lat >= 0 ? northern : southern)[month];
}

function buildAlertPrompt(alert: AlertRecommendation, forecast: WeatherForecast): string {
  const maxTemp = Math.max(...forecast.days.map((d) => d.tempHigh));
  const totalRain = forecast.days.reduce((sum, d) => sum + d.rainMm, 0);
  return [
    `Alert: ${alert.type} (${alert.severity}) — ${alert.message}`,
    `Current: ${forecast.current.temperature}°C, feels like ${forecast.current.feelsLike}°C, humidity ${forecast.current.humidity}%, wind ${forecast.current.windSpeed}km/h`,
    `7-day outlook: max ${maxTemp}°C, total rainfall ${totalRain}mm`,
    `Generate a 1-2 sentence actionable recommendation for a farmer.`,
  ].join('\n');
}

function buildAdvisoryPrompt(forecast: WeatherForecast, season: string): string {
  const { current } = forecast;
  const maxTemp = Math.max(...forecast.days.map((d) => d.tempHigh));
  const totalRain = forecast.days.reduce((sum, d) => sum + d.rainMm, 0);
  return [
    `Season: ${season}`,
    `Current: ${current.temperature}°C (feels like ${current.feelsLike}°C), humidity ${current.humidity}%, wind ${current.windSpeed}km/h, ${current.condition}`,
    `7-day outlook: max ${maxTemp}°C, total rainfall ${totalRain}mm`,
    `No active weather alerts. Respond with ONLY a 1-2 sentence daily farming advisory (no labels, no headers) covering what activities are suitable or should be avoided today given the season and conditions.`,
  ].join('\n');
}

function buildFallbackAdvisory(forecast: WeatherForecast, season: string): string {
  return `Conditions are suitable for general ${season.toLowerCase()} farming activities. Current temperature of ${forecast.current.temperature}°C and ${forecast.current.condition} weather allow for standard outdoor work.`;
}
