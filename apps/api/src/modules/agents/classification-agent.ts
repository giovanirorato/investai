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
  console.log("🔍 classifyCompany chamada com empresa:", input.company.ticker);
  const llmResponse = await completeJson({
    systemPrompt:
      `Você é um analista financeiro. Analise empresas e responda APENAS com um objeto JSON válido. Não escreva nada além do JSON. O JSON deve conter exatamente estes dois campos: "classificationSummary" (string com no mínimo 12 caracteres) e "confidenceLevel" (string com um dos valores: "low", "medium" ou "high"). Não repita, copie ou reproduza os dados de entrada na resposta. Retorne somente o JSON, sem explicações, comentários, Markdown ou qualquer texto adicional.`,
    userPrompt: JSON.stringify({
      instruction: "Classifique essa empresa com base nos dados financeiros",
      company: {
        ticker: input.company.ticker,
        name: input.company.name,
        sector: input.company.sector
      },
      valuation: {
        fairPrice: input.valuation.fairPrice,
        upsidePct: input.valuation.upsidePct,
        confidenceLevel: input.valuation.confidenceLevel
      },
      task: "Retorne APENAS um objeto JSON contendo os campos classificationSummary e confidenceLevel. Não inclua explicações, comentários, texto adicional, Markdown ou qualquer outro conteúdo fora do JSON. O campo confidenceLevel deve conter apenas um dos seguintes valores: low, medium ou high."
    })
  });

  const parsed = ClassificationResponseSchema.safeParse(llmResponse);

  if (parsed.success) {
    console.log("✅ Resposta da IA validada com sucesso");
    return {
      classificationSummary: parsed.data.classificationSummary,
      confidenceLevel: parsed.data.confidenceLevel,
      modelVersion: openRouterModelVersion
    };
  }

  console.log("⚠️  Resposta da IA inválida:");
  console.log("   Recebido:", JSON.stringify(llmResponse, null, 2));
  console.log("   Erro de validação:", parsed.error.errors);
  return fallbackClassification(input);
}

export function fallbackClassification(input: ClassificationInput): ClassificationOutput {
  console.log("📋 Usando fallback local para classificação");
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
