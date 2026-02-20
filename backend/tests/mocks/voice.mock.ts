/**
 * Mock voice transcription for local development (non-Transcribe mode)
 */

export function mockTranscribeAudio(_audioBuffer: Buffer, _languageCode: string): string {
  return "What is wrong with my tomato plants?";
}

export function mockVoiceChat(_message: string): string {
  return "This is a mock response. Set USE_REAL_BEDROCK=true in backend/.env to get real AI answers from Claude.";
}
