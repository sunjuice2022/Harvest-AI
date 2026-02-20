/**
 * Voice transcription service — converts audio to text via AWS Transcribe Streaming (PRD V-05, V-07)
 */
interface VoiceServiceConfig {
    region?: string;
}
export declare class VoiceService {
    private readonly client;
    constructor(config?: VoiceServiceConfig);
    transcribeAudio(audioBuffer: Buffer, languageCode: string): Promise<string>;
    private buildAudioStream;
    private collectTranscript;
}
export {};
//# sourceMappingURL=voice.service.d.ts.map