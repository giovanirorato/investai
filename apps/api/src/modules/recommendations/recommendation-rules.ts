import type { ConfidenceLevel, RecommendationType } from "@investai/shared";

export type RecommendationRuleInput = {
  upsidePct: number | null;
  confidenceLevel: ConfidenceLevel;
};

export function decideRecommendation(input: RecommendationRuleInput): RecommendationType {
  if (input.upsidePct === null) {
    return "avoid";
  }

  if (input.upsidePct < -0.05) {
    return "avoid";
  }

  if (
    input.upsidePct >= 0.15 &&
    (input.confidenceLevel === "medium" || input.confidenceLevel === "high")
  ) {
    return "buy";
  }

  return "monitor";
}

export function fallbackRecommendationText(
  recommendationType: RecommendationType,
  objective: string | null,
  confidenceLevel: ConfidenceLevel
) {
  const objectiveText = objective
    ? ` considerando o objetivo "${objective}"`
    : " considerando o objetivo informado";

  if (recommendationType === "buy") {
    return {
      summary: `Comprar pode fazer sentido${objectiveText}, pois o upside calculado e relevante e a confianca esta ${confidenceLevel}.`,
      nextAction: "Revisar as premissas do valuation e comparar com empresas do mesmo setor."
    };
  }

  if (recommendationType === "avoid") {
    return {
      summary: `Evitar nova posicao agora${objectiveText}, pois o ativo nao apresenta margem suficiente ou faltam dados criticos.`,
      nextAction: "Aguardar dados financeiros completos antes de tomar decisao."
    };
  }

  return {
    summary: `Monitorar parece mais prudente${objectiveText}, pois o upside ou a confianca ainda nao justificam compra direta.`,
    nextAction: "Acompanhar novos resultados e recalcular o valuation quando houver dados atualizados."
  };
}
