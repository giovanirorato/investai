import { z } from "zod";
import type { ConfidenceLevel, RecommendationType } from "@investai/shared";
import {
  completeJsonWithOpenRouter,
  type JsonCompleter
} from "./openrouter.js";
import { fallbackRecommendationText } from "../recommendations/recommendation-rules.js";

const RecommendationTextSchema = z.object({
  summary: z.string().min(12),
  nextAction: z.string().min(8)
});

export type RecommendationTextInput = {
  recommendationType: RecommendationType;
  objective: string | null;
  confidenceLevel: ConfidenceLevel;
  context: Record<string, unknown>;
};

export async function generateRecommendationText(
  input: RecommendationTextInput,
  completeJson: JsonCompleter = completeJsonWithOpenRouter
) {
  console.log("✍️  generateRecommendationText chamada com tipo:", input.recommendationType);
  const llmResponse = await completeJson({
    systemPrompt:
      "You are an investment advisor. Generate investment recommendations. Respond ONLY with valid JSON. Do not write anything except the JSON object. The JSON must have exactly these two fields: summary (string, minimum 12 characters) and nextAction (string, minimum 8 characters). Do not invent numbers or change the recommendation signal. Answer in brazillian portuguese",
    userPrompt: JSON.stringify({
      instruction: "Generate recommendation text based on financial analysis",
      signal: input.recommendationType,
      confidence: input.confidenceLevel,
      objective: input.objective || "not specified",
      analysis: {
        upside: input.context.upsidePct,
        fairPrice: input.context.fairPrice,
        method: input.context.method
      },
      task: "Return ONLY JSON with summary and nextAction. Don't explain the signal, just provide clear text about it."
    })
  });

  const parsed = RecommendationTextSchema.safeParse(llmResponse);

  if (parsed.success) {
    console.log("✅ Texto de recomendação gerado pela IA");
    return parsed.data;
  }

  console.log("⚠️  Resposta da IA inválida:");
  console.log("   Recebido:", JSON.stringify(llmResponse, null, 2));
  console.log("   Erro de validação:", parsed.error.errors);
  return fallbackRecommendationText(
    input.recommendationType,
    input.objective,
    input.confidenceLevel
  );
}
