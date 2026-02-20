/**
 * PollyService — text-to-speech via Amazon Polly (Neural voices)
 * Maps app language codes to the best Polly neural voice for each language.
 */

import {
  PollyClient,
  SynthesizeSpeechCommand,
  DescribeVoicesCommand,
  type Engine,
  type LanguageCode,
  type VoiceId,
} from "@aws-sdk/client-polly";

export interface PollyVoiceInfo {
  id: string;
  name: string;
  gender: string;
  engine: "neural" | "standard";
}

interface VoiceConfig {
  voiceId: VoiceId;
  languageCode: LanguageCode;
  engine: Engine;
}

/** Best neural voice per app language code (BCP-47 → Polly voice). */
const VOICE_MAP: Record<string, VoiceConfig> = {
  "en-AU": { voiceId: "Olivia",  languageCode: "en-AU",  engine: "neural"   },
  "zh-CN": { voiceId: "Zhiyu",   languageCode: "cmn-CN", engine: "neural"   },
  "zh-HK": { voiceId: "Hiujin",  languageCode: "yue-CN", engine: "neural"   },
  "hi-IN": { voiceId: "Kajal",   languageCode: "hi-IN",  engine: "neural"   },
  "it-IT": { voiceId: "Bianca",  languageCode: "it-IT",  engine: "neural"   },
  "ar-AE": { voiceId: "Zeina",   languageCode: "arb",    engine: "standard" },
  "vi-VN": { voiceId: "Olivia",  languageCode: "en-AU",  engine: "neural"   }, // no vi-VN in Polly
};

const DEFAULT_VOICE: VoiceConfig = VOICE_MAP["en-AU"];

/** Polly hard limit for plain text input. */
const MAX_TEXT_CHARS = 2_900;

export class PollyService {
  private readonly client: PollyClient;

  constructor(config: { region?: string } = {}) {
    this.client = new PollyClient({
      region: config.region ?? process.env.AWS_REGION ?? "ap-southeast-2",
    });
  }

  async synthesizeSpeech(
    text: string,
    appLanguageCode: string,
    override?: { voiceId: string; engine: "neural" | "standard" },
  ): Promise<Buffer> {
    const defaultVoice = VOICE_MAP[appLanguageCode] ?? DEFAULT_VOICE;
    const safeText = text.length > MAX_TEXT_CHARS ? text.slice(0, MAX_TEXT_CHARS) : text;

    const command = new SynthesizeSpeechCommand({
      Text: safeText,
      TextType: "text",
      OutputFormat: "mp3",
      VoiceId: (override?.voiceId ?? defaultVoice.voiceId) as VoiceId,
      LanguageCode: defaultVoice.languageCode,
      Engine: (override?.engine ?? defaultVoice.engine) as Engine,
    });

    const response = await this.client.send(command);

    if (!response.AudioStream) {
      throw new Error("Polly returned no audio stream");
    }

    const chunks: Uint8Array[] = [];
    for await (const chunk of response.AudioStream as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  async listVoices(appLanguageCode: string): Promise<PollyVoiceInfo[]> {
    const defaultVoice = VOICE_MAP[appLanguageCode] ?? DEFAULT_VOICE;
    const command = new DescribeVoicesCommand({
      LanguageCode: defaultVoice.languageCode,
    });
    const response = await this.client.send(command);
    return (response.Voices ?? []).map((v) => ({
      id: v.Id ?? "",
      name: v.Name ?? "",
      gender: v.Gender ?? "Female",
      engine: (v.SupportedEngines ?? []).includes("neural")
        ? ("neural" as const)
        : ("standard" as const),
    }));
  }
}
