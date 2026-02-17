/**
 * Frontend-specific types for diagnosis domain
 */
export interface DiagnosisChatState {
    messages: Array<{
        id: string;
        text: string;
        timestamp: number;
        sender: "user" | "assistant";
    }>;
    isLoading: boolean;
    error: string | null;
}
//# sourceMappingURL=diagnosis.types.d.ts.map