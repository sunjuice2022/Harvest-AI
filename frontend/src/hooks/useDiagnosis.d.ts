/**
 * useDiagnosis hook - manages diagnosis chat state and API interactions
 */
import type { ChatSession, DiagnosisResult } from "@agrisense/shared";
interface UseDiagnosisState {
    session: ChatSession | null;
    isLoading: boolean;
    error: string | null;
    uploadProgress: number;
}
interface UseDiagnosisActions {
    initializeSession: () => Promise<void>;
    sendMessage: (message: string, imageUrl?: string) => Promise<DiagnosisResult | null>;
    uploadPhoto: (file: File) => Promise<string>;
    loadSession: (sessionId: string) => Promise<void>;
    clearError: () => void;
}
export declare function useDiagnosis(): [UseDiagnosisState, UseDiagnosisActions];
export {};
//# sourceMappingURL=useDiagnosis.d.ts.map