import { z } from "zod";
import type { CompanySummary, ConfidenceLevel, FinancialSnapshot } from "@investai/shared";
import type { ValuationOutcome } from "../valuation/valuation.js";
import {
  completeJsonWithOpenRouter,
  openRouterModelVersion,
  type JsonCompleter
} from "./openrouter.js";

export const RULE_FALLBACK_MODEL_VERSION = "rule-fallback-v1";

const ClassificationResponseSchema = z.object({
  classificationSummary: z.string().min(12),
  confidenceLevel: z.enum(["low", "medium", "high"])
});

export type ClassificationInput = {
  company: CompanySummary;
  snapshot: FinancialSnapshot | null;
  valuation: ValuationOutcome;
};

export type ClassificationOutput = {
  classificationSummary: string;
  confidenceLevel: ConfidenceLevel;
  modelVersion: string;
};

export async function classifyCompany(
  input: ClassificationInput,
  completeJson: JsonCompleter = completeJsonWithOpenRouter
): Promise<ClassificationOutput> {
  const llmResponse = await completeJson({
    systemPrompt:
      "Voce classifica empresas para o InvestAI. Responda somente JSON valido. Nao invente numeros. Use apenas os dados enviados.",
    userPrompt: JSON.stringify({
      expectedShape: {
        classificationSummary: "string",
        confidenceLevel: "low | medium | high"
      },
      company: input.company,
      snapshot: input.snapshot,
      valuation: input.valuation
    })
  });

  const parsed = ClassificationResponseSchema.safeParse(llmResponse);

  if (parsed.success) {
    return {
      classificationSummary: parsed.data.classificationSummary,
      confidenceLevel: parsed.data.confidenceLevel,
      modelVersion: openRouterModelVersion
    };
  }

  return fallbackClassification(input);
}

export function fallbackClassification(input: ClassificationInput): ClassificationOutput {
  const confidenceLevel = input.valuation.confidenceLevel;
  const valuationText =
    input.valuation.upsidePct === null
      ? "sem upside calculavel por ausencia de dados criticos"
      : `com upside calculado de ${(input.valuation.upsidePct * 100).toFixed(2)}%`;

  return {
    classificationSummary: `${input.company.name} (${input.company.ticker}) e uma empresa do setor ${input.company.sector}, ${valuationText}. A classificacao usa somente dados locais persistidos.`,
    confidenceLevel,
    modelVersion: RULE_FALLBACK_MODEL_VERSION
  };
}
