/**
 * Diagnosis service - handles crop analysis via Bedrock Claude
 */
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { DIAGNOSIS_CONSTANTS } from "../../constants/diagnosis.constants";
export class DiagnosisService {
    constructor(config = {}) {
        this.bedrockClient = new BedrockRuntimeClient({ region: config.region || process.env.AWS_REGION });
        this.modelId = DIAGNOSIS_CONSTANTS.BEDROCK_MODEL_ID;
    }
    async diagnoseCrop(message, imageBase64, conversationHistory) {
        const systemPrompt = this.buildSystemPrompt();
        const userPrompt = this.buildUserPrompt(message, conversationHistory);
        const requestBody = {
            anthropic_version: "bedrock-2023-06-01",
            max_tokens: 1024,
            system: systemPrompt,
            messages: [
                {
                    role: "user",
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
        return this.parseBedrockResponse(responseText, message);
    }
    buildSystemPrompt() {
        return `You are an expert agricultural diagnostic AI assistant. Your role is to analyze crop images and text descriptions to identify:
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
    }
    buildUserPrompt(message, _conversationHistory) {
        return message;
    }
    buildMessageContent(message, imageBase64) {
        const content = [];
        if (imageBase64) {
            content.push({
                type: "image",
                source: {
                    type: "base64",
                    media_type: "image/jpeg",
                    data: imageBase64,
                },
            });
        }
        content.push({
            type: "text",
            text: message,
        });
        return content;
    }
    parseBedrockResponse(response, userMessage) {
        try {
            const content = response.content?.[0]?.text || String(response.content);
            // Extract JSON from response text
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                return this.getDefaultDiagnosis(userMessage);
            }
            // Parse and validate JSON structure
            const parsed = JSON.parse(jsonMatch[0]);
            // Validate required fields
            if (!parsed.condition || parsed.confidence === undefined) {
                return this.getDefaultDiagnosis(userMessage);
            }
            // Ensure confidence is 0-100
            const confidence = Math.min(100, Math.max(0, Number(parsed.confidence)));
            return {
                condition: String(parsed.condition),
                conditionType: parsed.conditionType || "disease",
                confidence,
                severity: parsed.severity || this.severityFromConfidence(confidence),
                description: String(parsed.description) || "Diagnosis complete",
                treatment: Array.isArray(parsed.treatment) ? parsed.treatment : [],
                organicAlternatives: Array.isArray(parsed.organicAlternatives) ? parsed.organicAlternatives : undefined,
                preventionTips: Array.isArray(parsed.preventionTips) ? parsed.preventionTips : undefined,
                affectedPlants: Array.isArray(parsed.affectedPlants) ? parsed.affectedPlants : undefined,
                escalatedToExpert: confidence < 60, // Auto-escalate low confidence
            };
        }
        catch (error) {
            console.error("Error parsing Bedrock response:", error);
            return this.getDefaultDiagnosis(userMessage);
        }
    }
    severityFromConfidence(confidence) {
        if (confidence < 40)
            return "info";
        if (confidence < 70)
            return "warning";
        return "critical";
    }
    getDefaultDiagnosis(message) {
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
//# sourceMappingURL=diagnosis.service.js.map