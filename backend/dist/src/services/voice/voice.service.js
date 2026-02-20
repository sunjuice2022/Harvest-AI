/**
 * Voice transcription service — converts audio to text via AWS Transcribe Streaming (PRD V-05, V-07)
 */
import { TranscribeStreamingClient, StartStreamTranscriptionCommand, } from "@aws-sdk/client-transcribe-streaming";
import { VOICE_CONSTANTS } from "../../constants/voice.constants";
export class VoiceService {
    constructor(config = {}) {
        this.client = new TranscribeStreamingClient({
            region: config.region ?? process.env.AWS_REGION ?? "ap-southeast-2",
        });
    }
    async transcribeAudio(audioBuffer, languageCode) {
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
    async *buildAudioStream(buffer) {
        const chunkSize = VOICE_CONSTANTS.AUDIO_CHUNK_SIZE;
        for (let offset = 0; offset < buffer.length; offset += chunkSize) {
            yield { AudioEvent: { AudioChunk: buffer.subarray(offset, offset + chunkSize) } };
        }
    }
    async collectTranscript(stream) {
        if (!stream)
            return "";
        const parts = [];
        for await (const event of stream) {
            const results = event.TranscriptEvent?.Transcript?.Results ?? [];
            for (const result of results) {
                if (!result.IsPartial) {
                    const text = result.Alternatives?.[0]?.Transcript ?? "";
                    if (text)
                        parts.push(text);
                }
            }
        }
        return parts.join(" ").trim();
    }
}
//# sourceMappingURL=voice.service.js.map