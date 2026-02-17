/**
 * Diagnosis service - handles crop analysis via Bedrock Claude
 */

import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { DIAGNOSIS_CONSTANTS } from "../../constants/diagnosis.constants";
import type { DiagnosisResult, ChatMessage } from "@agrisense/shared";

const SYSTEM_PROMPT_TEMPLATE = `You are an expert agricultural diagnostic AI assistant. Your role is to analyze crop images and text descriptions to identify:
1. Plant diseases and infections
2. Pest damage and infestations
3. Nutrient deficiencies (nitrogen, phosphorus, potassium, magnesium, etc.)
4. Abiotic stress (heat, drought, waterlogging, salt stress, etc.)

For each diagnosis, you MUST provide:
- Condition name
- Condition type (disease/pest/nutrient_deficiency/abiotic_stress)
- Confidence level (0-100%)
- Severity (info/warning/critical)
- Clear description
- Treatment recommendations (list of specific steps)
- Organic alternatives if available
- Prevention tips
- Affected crop types

Respond in valid JSON format only. If you cannot make a diagnosis, set confidence to 0 and explain in the description.

JSON format:
{
  "condition": "string",
  "conditionType": "disease|pest|nutrient_deficiency|abiotic_stress",
  "confidence": number,
  "severity": "info|warning|critical",
  "description": "string",
  "treatment": ["string"],
  "organicAlternatives": ["string"],
  "preventionTips": ["string"],
  "affectedPlants": ["string"],
  "escalatedToExpert": boolean
}`;

interface DiagnosisServiceConfig {
  region?: string;
}

interface BedrockMessageContent {
  type: "text" | "image";
  text?: string;
  source?: {
    type: "base64";
    media_type: string;
    data: string;
  };
}

interface BedrockResponse {
  content?: Array<{ text: string }>;
}

export class DiagnosisService {
  private bedrockClient: BedrockRuntimeClient;
  private modelId: string;

  constructor(config: DiagnosisServiceConfig = {}) {
    this.bedrockClient = new BedrockRuntimeClient({ region: config.region || process.env.AWS_REGION });
    this.modelId = DIAGNOSIS_CONSTANTS.BEDROCK_MODEL_ID;
  }

  async diagnoseCrop(message: string, imageBase64?: string, conversationHistory?: ChatMessage[]): Promise<DiagnosisResult> {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(message, conversationHistory);

    const requestBody = {
      anthropic_version: "bedrock-2023-06-01",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: "user" as const,
          content: this.buildMessageContent(message, imageBase64),
        },
      ],
    };

    const command = new InvokeModelCommand({
      modelId: this.modelId,
      contentType: "application/json",
      body: JSON.stringify(requestBody),
    });

    const response = await this.bedrockClient.send(command);
    const responseText = JSON.parse(new TextDecoder().decode(response.body));

    return this.parseBedrockResponse(responseText as BedrockResponse, message);
  }

  private buildSystemPrompt(): string {
    return SYSTEM_PROMPT_TEMPLATE;
  }

  private buildUserPrompt(message: string, _conversationHistory?: ChatMessage[]): string {
    return message;
  }

  private buildMessageContent(message: string, imageBase64?: string): BedrockMessageContent[] {
    const content: BedrockMessageContent[] = [];

    if (imageBase64) {
      content.push({
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: "image/jpeg",
          data: imageBase64,
        },
      });
    }

    content.push({
      type: "text" as const,
      text: message,
    });

    return content;
  }

  private parseBedrockResponse(response: BedrockResponse, userMessage: string): DiagnosisResult {
    try {
      const content = response.content?.[0]?.text || String(response.content);
      const parsed = this.extractJsonFromResponse(content);

      if (!parsed || !parsed.condition || parsed.confidence === undefined) {
        return this.getDefaultDiagnosis(userMessage);
      }

      return this.buildDiagnosisResult(parsed);
    } catch (error) {
      console.error("Error parsing Bedrock response:", error);
      return this.getDefaultDiagnosis(userMessage);
    }
  }

  private extractJsonFromResponse(content: string): Record<string, unknown> | null {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    try {
      return JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  private buildDiagnosisResult(parsed: Record<string, unknown>): DiagnosisResult {
    const confidence = Math.min(100, Math.max(0, Number(parsed.confidence)));

    return {
      condition: String(parsed.condition),
      conditionType: (parsed.conditionType as string) || "disease",
      confidence,
      severity: (parsed.severity as "info" | "warning" | "critical") || this.severityFromConfidence(confidence),
      description: String(parsed.description) || "Diagnosis complete",
      treatment: Array.isArray(parsed.treatment) ? (parsed.treatment as string[]) : [],
      organicAlternatives: Array.isArray(parsed.organicAlternatives) ? (parsed.organicAlternatives as string[]) : undefined,
      preventionTips: Array.isArray(parsed.preventionTips) ? (parsed.preventionTips as string[]) : undefined,
      affectedPlants: Array.isArray(parsed.affectedPlants) ? (parsed.affectedPlants as string[]) : undefined,
      escalatedToExpert: confidence < 60,
    };
  }

  private severityFromConfidence(confidence: number): "info" | "warning" | "critical" {
    if (confidence < 40) return "info";
    if (confidence < 70) return "warning";
    return "critical";
  }

  private getDefaultDiagnosis(message: string): DiagnosisResult {
    return {
      condition: "Unidentified",
      conditionType: "disease",
      confidence: 0,
      severity: "info",
      description: `Unable to provide a reliable diagnosis for: "${message}". Please provide a clearer image or more detailed description.`,
      treatment: ["Consult a local agronomist or agricultural extension officer"],
      escalatedToExpert: true,
    };
  }
}
