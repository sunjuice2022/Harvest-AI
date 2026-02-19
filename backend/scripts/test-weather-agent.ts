/**
 * Local test script: validates the weather agent pipeline without AWS infrastructure.
 * Uses real OpenWeather API, mocks DynamoDB and SNS so no AWS credentials needed.
 * When BEDROCK_MODEL_ID is set, uses real AWS Bedrock instead of the mock.
 *
 * Usage:
 *   cd backend
 *   npm run test:local
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { WeatherService } from '../src/services/weather/weather.service.js';
import { WeatherBedrockService } from '../src/services/weather/weatherBedrock.service.js';
import { WeatherNotificationService } from '../src/services/weather/weatherNotification.service.js';
import { WeatherAgentTools } from '../src/agents/weather/weather.tools.js';
import { WeatherAgent } from '../src/agents/weather/weather.agent.js';
import type { WeatherAlertRepository } from '../src/repositories/weather/weatherAlert.repository.js';
import type { CreateAlertInput } from '../src/services/weather/weather.types.js';
import type { AlertRecommendation } from '../src/agents/weather/weather.types.js';
import type { WeatherForecast } from '@agrisense/shared';

loadEnvFile();

const apiKey = process.env['WEATHER_API_KEY'];
const apiBaseUrl = process.env['WEATHER_API_BASE_URL'] ?? 'https://api.openweathermap.org/data/3.0';

if (!apiKey) {
  console.error('❌  WEATHER_API_KEY is not set in .env');
  process.exit(1);
}

const mockRepository = {
  async createAlert(input: CreateAlertInput): Promise<string> {
    const id = `mock-${Date.now()}`;
    console.log(`  💾  [Mock DynamoDB] Saved alert: [${input.severity.toUpperCase()}] ${input.type} → ${id}`);
    return id;
  },
  async listActiveAlerts() { return []; },
  async acknowledgeAlert() {},
} as unknown as WeatherAlertRepository;

const snsTopicArn = process.env['SNS_ALERT_TOPIC_ARN'];

const mockNotificationService = {
  async sendAlertNotifications(alerts: AlertRecommendation[]): Promise<void> {
    for (const alert of alerts) {
      console.log(`  📧  [Mock SNS Email] Subject: [AgriSense] ${alert.severity.toUpperCase()} Weather Alert`);
      console.log(`       Body: ${alert.message}`);
      console.log(`  📱  [Mock SNS SMS]   ${alert.message}`);
    }
  },
  async subscribeEmail(email: string) {
    console.log(`  📧  [Mock SNS] Subscribed email: ${email} (pending confirmation)`);
    return { subscriptionArn: 'pending confirmation', pendingConfirmation: true };
  },
  async subscribePhone(phone: string) {
    console.log(`  📱  [Mock SNS] Subscribed phone: ${phone}`);
    return { subscriptionArn: `arn:aws:sns:mock:WeatherAlerts:mock-sub`, pendingConfirmation: false };
  },
} as unknown as WeatherNotificationService;

const notificationService: WeatherNotificationService = snsTopicArn
  ? new WeatherNotificationService({ topicArn: snsTopicArn })
  : mockNotificationService;

const weatherService = new WeatherService({
  apiBaseUrl,
  apiKey,
  highTempThreshold: Number(process.env['WEATHER_HIGH_TEMP'] ?? 35),
  lowTempThreshold: Number(process.env['WEATHER_LOW_TEMP'] ?? 5),
  pollIntervalMinutes: 30,
});

const bedrockModelId = process.env['BEDROCK_MODEL_ID'];
const bedrockRegion = process.env['AWS_REGION'] ?? 'ap-southeast-2';

const mockBedrockService = {
  async enrichRecommendations(alerts: AlertRecommendation[], forecast: WeatherForecast): Promise<AlertRecommendation[]> {
    console.log(`  🤖  [Mock Bedrock] Generating recommendations for ${alerts.length} alert(s)...`);
    return alerts.map((alert) => ({
      ...alert,
      recommendation: `[Mock] Based on ${forecast.current.temperature}°C: ${alert.recommendation}`,
    }));
  },
  async generateDailyAdvisory(forecast: WeatherForecast, lat: number): Promise<string> {
    const season = lat < 0 ? 'Summer' : 'Winter';
    console.log(`  🌾  [Mock Bedrock] Generating daily advisory for ${season}...`);
    return `[Mock] ${season} advisory: With ${forecast.current.temperature}°C and ${forecast.current.condition} conditions, today is suitable for general field work.`;
  },
} as unknown as WeatherBedrockService;

const bedrockService: WeatherBedrockService = bedrockModelId
  ? new WeatherBedrockService({ modelId: bedrockModelId, region: bedrockRegion })
  : mockBedrockService;

const agentTools = new WeatherAgentTools(weatherService, mockRepository, notificationService, bedrockService);
const agent = new WeatherAgent(agentTools);

const lat = Number(process.env['DEFAULT_FARM_LAT'] ?? -37.8136);
const lng = Number(process.env['DEFAULT_FARM_LNG'] ?? 144.9631);

console.log('\n🌾  AgriSense Weather Agent — Local Integration Test');
console.log('═'.repeat(52));
console.log(`📍  Location : lat=${lat}, lng=${lng}`);
console.log(`🔑  API Key  : ${apiKey.slice(0, 8)}...`);
console.log(`🌡   High threshold : ${process.env['WEATHER_HIGH_TEMP'] ?? 35}°C`);
console.log(`❄️   Low threshold  : ${process.env['WEATHER_LOW_TEMP'] ?? 5}°C`);
console.log(`🤖  Bedrock        : ${bedrockModelId ? `REAL (${bedrockModelId})` : 'Mock'}`);
console.log(`📬  SNS            : ${snsTopicArn ? 'REAL' : 'Mock'}`);
console.log('─'.repeat(52));
console.log('⏳  Fetching live forecast from OpenWeather API...\n');

async function main(): Promise<void> {
  await agent.runWeatherCycle({ userId: 'local-test-user', lat, lng });

  console.log('\n' + '─'.repeat(52));
  console.log('🌾  Testing daily advisory (no-alert scenario)...\n');
  const rawForecast = await weatherService.fetchForecast({ lat, lng });
  const forecast = weatherService.parseForecast(rawForecast);
  const advisory = await bedrockService.generateDailyAdvisory(forecast, lat);
  console.log(`  📋  Advisory: ${advisory}`);

  console.log('\n' + '─'.repeat(52));
  console.log('📬  Testing SNS subscription...\n');
  const testEmail = process.env['TEST_SUBSCRIBE_EMAIL'];
  if (testEmail) {
    const emailResult = await notificationService.subscribeEmail(testEmail);
    if (emailResult.pendingConfirmation) {
      console.log(`  📧  Subscribed ${testEmail} — check inbox to confirm (pending confirmation)`);
    } else {
      console.log(`  📧  Subscribed ${testEmail} → ARN: ${emailResult.subscriptionArn}`);
    }
  } else {
    console.log('  ℹ️   Set TEST_SUBSCRIBE_EMAIL=you@email.com in .env to test real email subscription');
    await notificationService.subscribeEmail('test@example.com');
  }

  console.log('\n' + '═'.repeat(52));
  console.log('✅  Agent cycle completed. Backend pipeline is working.\n');
}

main().catch((err: Error) => {
  console.error('\n❌  Agent cycle failed:', err.message);
  process.exit(1);
});

function loadEnvFile(): void {
  const envPath = resolve(__dirname, '../../.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key && !(key in process.env)) process.env[key] = value;
  }
}
