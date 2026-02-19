/** Weather Agent definition — orchestrates forecast fetching, alert evaluation, and notification. */

import { WeatherAgentTools } from './weather.tools.js';
import { WeatherAgentToolInput } from './weather.types.js';
import { WEATHER_AGENT_SYSTEM_PROMPT } from './weather.prompts.js';

export class WeatherAgent {
  readonly systemPrompt = WEATHER_AGENT_SYSTEM_PROMPT;

  constructor(private readonly tools: WeatherAgentTools) {}

  async runWeatherCycle(input: WeatherAgentToolInput): Promise<void> {
    const { alerts, forecast } = await this.tools.fetchAndEvaluateWeather(input);

    if (alerts.length === 0) {
      console.info('[WeatherAgent] No alert conditions detected for user', input.userId);
      console.info('[WeatherAgent] Forecast fetched', { location: forecast.location, temperature: forecast.current.temperature });
      return;
    }

    const createdAlertIds = await this.tools.persistAlerts(input.userId, alerts);
    await this.tools.notifyAlerts(alerts);

    console.info('[WeatherAgent] Alerts created and notifications sent', {
      userId: input.userId,
      alertCount: createdAlertIds.length,
      alertIds: createdAlertIds,
    });
  }
}
