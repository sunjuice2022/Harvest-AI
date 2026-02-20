/**
 * Diagnosis service - handles crop analysis via Bedrock Claude
 */
import type { DiagnosisResult, ChatMessage } from "@harvest-ai/shared";
interface DiagnosisServiceConfig {
    region?: string;
}
export declare class DiagnosisService {
    private bedrockClient;
    private modelId;
    constructor(config?: DiagnosisServiceConfig);
    diagnoseCrop(message: string, imageBase64?: string, _conversationHistory?: ChatMessage[], language?: string): Promise<DiagnosisResult>;
    private buildConverseContent;
    private parseResponseText;
    private extractJsonFromResponse;
    private buildDiagnosisResult;
    private severityFromConfidence;
    private getDefaultDiagnosis;
}
export {};
//# sourceMappingURL=diagnosis.service.d.ts.map