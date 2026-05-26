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
  const llmResponse = await completeJson({
    systemPrompt:
      "Voce redige recomendacoes do InvestAI. Responda somente JSON valido. Nao altere o recommendationType e nao invente numeros.",
    userPrompt: JSON.stringify({
      expectedShape: {
        summary: "string",
        nextAction: "string"
      },
      recommendationType: input.recommendationType,
      objective: input.objective,
      confidenceLevel: input.confidenceLevel,
      context: input.context
    })
  });

  const parsed = RecommendationTextSchema.safeParse(llmResponse);

  if (parsed.success) {
    return parsed.data;
  }

  return fallbackRecommendationText(
    input.recommendationType,
    input.objective,
    input.confidenceLevel
  );
}
