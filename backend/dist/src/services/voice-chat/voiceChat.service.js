/**
 * VoiceChatService — general agricultural AI chatbot via Amazon Bedrock (PRD §4.5)
 */
import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
const MODEL_ID = "au.anthropic.claude-sonnet-4-6";
const SYSTEM_PROMPT = `You are AgriSense, an AI agricultural assistant for Australian farmers.
Answer questions about crops, livestock, weather, pests, diseases, soil, irrigation, and market prices.
Be concise and practical. Keep responses to 2-3 sentences unless more detail is needed.`;
const LANGUAGE_NAMES = {
    "en-AU": "Australian English",
    "zh-CN": "Simplified Chinese (Mandarin)",
    "zh-HK": "Traditional Chinese (Cantonese)",
    "vi-VN": "Vietnamese",
    "hi-IN": "Hindi",
    "it-IT": "Italian",
    "ar-SA": "Arabic",
};
export class VoiceChatService {
    constructor(config = {}) {
        this.client = new BedrockRuntimeClient({
            region: config.region ?? process.env.AWS_REGION ?? "ap-southeast-2",
        });
    }
    async chat(message, history = [], language = "en-AU") {
        const langName = LANGUAGE_NAMES[language] ?? "English";
        const command = new ConverseCommand({
            modelId: MODEL_ID,
            system: [{ text: `${SYSTEM_PROMPT}\n\nRespond in ${langName}.` }],
            messages: [
                ...history.map((h) => ({ role: h.role, content: [{ text: h.content }] })),
                { role: "user", content: [{ text: message }] },
            ],
            inferenceConfig: { maxTokens: 512 },
        });
        const response = await this.client.send(command);
        const block = response.output?.message?.content?.[0];
        if (!block || !("text" in block))
            throw new Error("No text in AI response");
        return block.text;
    }
}
//# sourceMappingURL=voiceChat.service.js.map