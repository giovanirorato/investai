import type { AnalysisStatus, ConfidenceLevel, FinancialSnapshot } from "@investai/shared";
import { roundTo } from "../../shared/numbers.js";

export const TARGET_PE_BY_SECTOR: Record<string, number> = {
  financeiro: 8,
  energia: 10,
  mineracao: 9,
  industria: 14,
  varejo: 12,
  tecnologia: 18,
  outro: 10
};

export type ValuationInput = {
  sector: string;
  snapshot: FinancialSnapshot | null;
};

export type ValuationOutcome = {
  status: AnalysisStatus;
  confidenceLevel: ConfidenceLevel;
  fairPrice: number | null;
  upsidePct: number | null;
  targetPeRatio: number | null;
  method: "earnings_multiple";
  rationaleSummary: string;
  assumptions: Record<string, unknown>;
};

export function calculateValuation(input: ValuationInput): ValuationOutcome {
  const targetPeRatio = getTargetPeRatio(input.sector);
  const currentPrice = input.snapshot?.currentPrice ?? null;
  const earningsPerShare = input.snapshot?.earningsPerShare ?? null;
  const missingFields = [
    currentPrice === null ? "currentPrice" : null,
    earningsPerShare === null ? "earningsPerShare" : null
  ].filter((field): field is string => field !== null);

  if (
    currentPrice === null ||
    earningsPerShare === null ||
    earningsPerShare === 0 ||
    currentPrice === 0
  ) {
    return {
      status: "partial",
      confidenceLevel: "low",
      fairPrice: null,
      upsidePct: null,
      targetPeRatio,
      method: "earnings_multiple",
      rationaleSummary:
        "Valuation parcial: faltam dados criticos de preco atual ou lucro por acao.",
      assumptions: {
        method: "earnings_multiple",
        targetPeRatio,
        sector: input.sector,
        missingFields
      }
    };
  }

  const fairPrice = roundTo(earningsPerShare * targetPeRatio, 2);
  const upsidePct = roundTo((fairPrice - currentPrice) / currentPrice, 4);
  const confidenceLevel = input.snapshot?.source ? "medium" : "low";

  return {
    status: "completed",
    confidenceLevel,
    fairPrice,
    upsidePct,
    targetPeRatio,
    method: "earnings_multiple",
    rationaleSummary: `Preco justo calculado por lucro por acao multiplicado pelo P/L alvo setorial de ${targetPeRatio}.`,
    assumptions: {
      method: "earnings_multiple",
      targetPeRatio,
      sector: input.sector,
      currentPrice,
      earningsPerShare
    }
  };
}

function getTargetPeRatio(sector: string) {
  const key = sector
    .trim()
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return TARGET_PE_BY_SECTOR[key] ?? 10;
}
