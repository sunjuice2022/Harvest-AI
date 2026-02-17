/**
 * Diagnosis service - handles crop analysis via Bedrock Claude
 */
import type { DiagnosisResult, ChatMessage } from "@agrisense/shared";
interface DiagnosisServiceConfig {
    region?: string;
}
export declare class DiagnosisService {
    private bedrockClient;
    private modelId;
    constructor(config?: DiagnosisServiceConfig);
    diagnoseCrop(message: string, imageBase64?: string, conversationHistory?: ChatMessage[]): Promise<DiagnosisResult>;
    private buildSystemPrompt;
    private buildUserPrompt;
    private buildMessageContent;
    private parseBedrockResponse;
    private severityFromConfidence;
    private getDefaultDiagnosis;
}
export {};
//# sourceMappingURL=diagnosis.service.d.ts.map