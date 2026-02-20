/**
 * Voice transcription constants and language name mapping (PRD §4.5)
 */
import type { VoiceLanguageCode } from "@harvest-ai/shared";
export declare const VOICE_CONSTANTS: {
    readonly SAMPLE_RATE_HZ: 16000;
    readonly MEDIA_ENCODING: "ogg-opus";
    readonly MAX_AUDIO_SIZE_BYTES: number;
    readonly AUDIO_CHUNK_SIZE: 1024;
};
/** Human-readable language names injected into Claude system prompts */
export declare const LANGUAGE_NAMES: Record<VoiceLanguageCode, string>;
//# sourceMappingURL=voice.constants.d.ts.map