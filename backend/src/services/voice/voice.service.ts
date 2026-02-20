/**
 * Voice transcription service — converts audio to text via AWS Transcribe Streaming (PRD V-05, V-07)
 */

import {
  TranscribeStreamingClient,
  StartStreamTranscriptionCommand,
} from "@aws-sdk/client-transcribe-streaming";
import { VOICE_CONSTANTS } from "../../constants/voice.constants";

interface VoiceServiceConfig {
  region?: string;
}

export class VoiceService {
  private readonly client: TranscribeStreamingClient;

  constructor(config: VoiceServiceConfig = {}) {
    this.client = new TranscribeStreamingClient({
      region: config.region ?? process.env.AWS_REGION ?? "ap-southeast-2",
    });
  }

  async transcribeAudio(audioBuffer: Buffer, languageCode: string): Promise<string> {
    const audioStream = this.buildAudioStream(audioBuffer);

    const command = new StartStreamTranscriptionCommand({
      LanguageCode: languageCode,
      MediaSampleRateHertz: VOICE_CONSTANTS.SAMPLE_RATE_HZ,
      MediaEncoding: VOICE_CONSTANTS.MEDIA_ENCODING,
      AudioStream: audioStream,
    });

    const response = await this.client.send(command);
    return this.collectTranscript(response.TranscriptResultStream);
  }

  private async *buildAudioStream(buffer: Buffer): AsyncGenerator<{ AudioEvent: { AudioChunk: Uint8Array } }> {
    const chunkSize = VOICE_CONSTANTS.AUDIO_CHUNK_SIZE;
    for (let offset = 0; offset < buffer.length; offset += chunkSize) {
      yield { AudioEvent: { AudioChunk: buffer.subarray(offset, offset + chunkSize) } };
    }
  }

  private async collectTranscript(
    stream: AsyncIterable<{ TranscriptEvent?: { Transcript?: { Results?: Array<{ Alternatives?: Array<{ Transcript?: string }>; IsPartial?: boolean }> } } }> | undefined,
  ): Promise<string> {
    if (!stream) return "";
    const parts: string[] = [];

    for await (const event of stream) {
      const results = event.TranscriptEvent?.Transcript?.Results ?? [];
      for (const result of results) {
        if (!result.IsPartial) {
          const text = result.Alternatives?.[0]?.Transcript ?? "";
          if (text) parts.push(text);
        }
      }
    }

    return parts.join(" ").trim();
  }
}
