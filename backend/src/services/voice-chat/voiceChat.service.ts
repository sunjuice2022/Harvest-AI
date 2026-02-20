/**
 * VoiceChatService — general agricultural AI chatbot via Amazon Bedrock (PRD §4.5)
 */

import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

interface ServiceConfig { region?: string; }
export interface HistoryItem { role: "user" | "assistant"; content: string; }

const MODEL_ID = "au.anthropic.claude-sonnet-4-6";

const SYSTEM_PROMPT = `You are Juna, a friendly AI farm assistant and "neighbour in your pocket" for Australian farmers.
Answer questions about crops, livestock, weather, pests, diseases, soil, irrigation, and market prices.
Be warm, practical, and concise. Keep responses to 2-3 sentences unless more detail is needed.
Never refer to yourself as AgriSense or any other name — you are always Juna.`;

const LANGUAGE_NAMES: Record<string, string> = {
  "en-AU": "Australian English",
  "zh-CN": "Simplified Chinese (Mandarin)",
  "zh-HK": "Traditional Chinese (Cantonese)",
  "vi-VN": "Vietnamese",
  "hi-IN": "Hindi",
  "it-IT": "Italian",
  "ar-SA": "Arabic",
};

export class VoiceChatService {
  private client: BedrockRuntimeClient;

  constructor(config: ServiceConfig = {}) {
    this.client = new BedrockRuntimeClient({
      region: config.region ?? process.env.AWS_REGION ?? "ap-southeast-2",
    });
  }

  async chat(message: string, history: HistoryItem[] = [], language = "en-AU"): Promise<string> {
    const langName = LANGUAGE_NAMES[language] ?? "English";
    const command = new ConverseCommand({
      modelId: MODEL_ID,
      system: [{ text: `${SYSTEM_PROMPT}\n\nRespond in ${langName}.` }],
      messages: [
        ...history.map((h) => ({ role: h.role as "user" | "assistant", content: [{ text: h.content }] })),
        { role: "user" as const, content: [{ text: message }] },
      ],
      inferenceConfig: { maxTokens: 512 },
    });

    const response = await this.client.send(command);
    const block = response.output?.message?.content?.[0];
    if (!block || !("text" in block)) throw new Error("No text in AI response");
    return block.text;
  }
}
