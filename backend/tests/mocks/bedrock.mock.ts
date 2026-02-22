import type { DiagnosisResult } from "@harvest-ai/shared";

export async function mockDiagnoseCrop(
  message: string,
  _imageBase64?: string
): Promise<DiagnosisResult> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const normalizedMessage = message.toLowerCase();

  // Tomato disease example
  if (normalizedMessage.includes("tomato") && (normalizedMessage.includes("yellow") || normalizedMessage.includes("spot"))) {
    return {
      condition: "Early Blight",
      conditionType: "disease",
      confidence: 92,
      severity: "warning",
      description:
        "Early Blight (Alternaria solani) is a fungal disease that primarily affects tomato leaves. It starts as small brown spots with concentric rings, gradually enlarging and causing leaf yellowing and defoliation.",
      treatment: [
        "Apply fungicide spray (Chlorothalonil or Copper fungicide)",
        "Remove infected leaves from bottom 12 inches of plant",
        "Improve air circulation and reduce leaf wetness",
        "Water at soil level, avoid wetting foliage",
      ],
      organicAlternatives: ["Neem oil spray every 7 days", "Copper sulfate solution"],
      preventionTips: [
        "Use mulch to prevent soil splash",
        "Space plants 24-36 inches apart",
        "Stake and prune for airflow",
        "Crop rotation (avoid nightshade family)",
      ],
      affectedPlants: ["Tomato", "Potato", "Eggplant"],
      escalatedToExpert: false,
    };
  }

  // Powdery mildew
  if (normalizedMessage.includes("white powder") || normalizedMessage.includes("powdery")) {
    return {
      condition: "Powdery Mildew",
      conditionType: "disease",
      confidence: 88,
      severity: "warning",
      description:
        "Powdery mildew is a fungal infection characterized by white powdery coating on leaves. It affects photosynthesis and can cause leaf curling.",
      treatment: [
        "Spray with sulfur dust or damp sulfur",
        "Apply potassium bicarbonate (Milstop)",
        "Use horticultural oil spray",
      ],
      organicAlternatives: ["Baking soda spray (1 tbsp per gallon)", "Milk spray (1 part milk to 9 parts water)"],
      preventionTips: [
        "Ensure good airflow",
        "Water early morning at soil level",
        "Keep humidity below 50%",
      ],
      affectedPlants: ["Cucumber", "Squash", "Tomato", "Grape"],
      escalatedToExpert: false,
    };
  }

  // Nutrient deficiency
  if (normalizedMessage.includes("yellow leaf") || normalizedMessage.includes("pale")) {
    return {
      condition: "Nitrogen Deficiency",
      conditionType: "nutrient_deficiency",
      confidence: 85,
      severity: "info",
      description:
        "Nitrogen deficiency causes yellowing of lower leaves first, progressing upward. Leaves may drop prematurely.",
      treatment: [
        "Apply nitrogen fertilizer (urea 46-0-0 at 2 tbsp per gallon)",
        "Use compost or manure (3 inches top dressing)",
        "Apply fish emulsion every 2 weeks",
      ],
      organicAlternatives: ["Composted manure", "Alfalfa meal", "Blood meal"],
      preventionTips: [
        "Maintain soil pH 6.0-7.0",
        "Incorporate organic matter before planting",
        "Mulch to retain moisture",
      ],
      affectedPlants: ["All crops"],
      escalatedToExpert: false,
    };
  }

  // Default low confidence response
  return {
    condition: "Unidentified Condition",
    conditionType: "pest",
    confidence: 28,
    severity: "info",
    description: `Unable to identify the condition from your description: "${message}". Please provide more details such as leaf color, spots, or plant type.`,
    treatment: [
      "Take clearer photos from multiple angles",
      "Describe affected areas in detail",
      "Provide plant type and location",
      "Contact local extension office",
    ],
    organicAlternatives: [],
    preventionTips: [],
    affectedPlants: [],
    escalatedToExpert: true,
  };
}
