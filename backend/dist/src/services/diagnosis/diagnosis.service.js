/**
 * Diagnosis service - handles crop analysis via Bedrock Claude
 */
import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import { DIAGNOSIS_CONSTANTS } from "../../constants/diagnosis.constants";
import { LANGUAGE_NAMES } from "../../constants/voice.constants";
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
export class DiagnosisService {
    constructor(config = {}) {
        this.bedrockClient = new BedrockRuntimeClient({ region: config.region ?? process.env.AWS_REGION ?? "ap-southeast-2" });
        this.modelId = DIAGNOSIS_CONSTANTS.BEDROCK_MODEL_ID;
    }
    async diagnoseCrop(message, imageBase64, _conversationHistory, language = "en-AU") {
        const languageName = LANGUAGE_NAMES[language] ?? "English";
        const systemPrompt = `${SYSTEM_PROMPT_TEMPLATE}\n\nRespond in ${languageName}. All text fields (description, treatment, organicAlternatives, preventionTips) must be in ${languageName}. Keep JSON keys in English.`;
        const command = new ConverseCommand({
            modelId: this.modelId,
            system: [{ text: systemPrompt }],
            messages: [{ role: "user", content: this.buildConverseContent(message, imageBase64) }],
            inferenceConfig: { maxTokens: 1024 },
        });
        const response = await this.bedrockClient.send(command);
        const firstBlock = response.output?.message?.content?.[0];
        const text = (firstBlock && "text" in firstBlock) ? firstBlock.text : "";
        return this.parseResponseText(text, message);
    }
    buildConverseContent(message, imageBase64) {
        const content = [];
        if (imageBase64) {
            content.push({ image: { format: "jpeg", source: { bytes: Buffer.from(imageBase64, "base64") } } });
        }
        content.push({ text: message });
        return content;
    }
    parseResponseText(text, userMessage) {
        try {
            const parsed = this.extractJsonFromResponse(text);
            if (!parsed || !parsed.condition || parsed.confidence === undefined) {
                return this.getDefaultDiagnosis(userMessage);
            }
            return this.buildDiagnosisResult(parsed);
        }
        catch (error) {
            console.error("Error parsing Bedrock response:", error);
            return this.getDefaultDiagnosis(userMessage);
        }
    }
    extractJsonFromResponse(content) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch)
            return null;
        try {
            return JSON.parse(jsonMatch[0]);
        }
        catch {
            return null;
        }
    }
    buildDiagnosisResult(parsed) {
        const confidence = Math.min(100, Math.max(0, Number(parsed.confidence)));
        return {
            condition: String(parsed.condition),
            conditionType: (["disease", "pest", "nutrient_deficiency", "abiotic_stress"].includes(parsed.conditionType) ? parsed.conditionType : "disease"),
            confidence,
            severity: parsed.severity || this.severityFromConfidence(confidence),
            description: String(parsed.description) || "Diagnosis complete",
            treatment: Array.isArray(parsed.treatment) ? parsed.treatment : [],
            organicAlternatives: Array.isArray(parsed.organicAlternatives) ? parsed.organicAlternatives : undefined,
            preventionTips: Array.isArray(parsed.preventionTips) ? parsed.preventionTips : undefined,
            affectedPlants: Array.isArray(parsed.affectedPlants) ? parsed.affectedPlants : undefined,
            escalatedToExpert: confidence < 60,
        };
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