/**
 * Mock voice transcription for local development (non-Transcribe mode)
 */
export function mockTranscribeAudio(_audioBuffer, _languageCode) {
    return "What is wrong with my tomato plants?";
}
export function mockVoiceChat(_message) {
    return "This is a mock response. Set USE_REAL_BEDROCK=true in backend/.env to get real AI answers from Claude.";
}
//# sourceMappingURL=voice.mock.js.map