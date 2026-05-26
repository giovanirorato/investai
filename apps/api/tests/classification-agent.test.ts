import { describe, expect, it } from "vitest";
import type { ClassificationInput } from "../src/modules/agents/classification-agent.js";
import {
  RULE_FALLBACK_MODEL_VERSION,
  classifyCompany
} from "../src/modules/agents/classification-agent.js";

const input: ClassificationInput = {
  company: {
    id: "cmp_001",
    ticker: "BBAS3",
    name: "Banco do Brasil",
    sector: "Financeiro",
    market: "B3"
  },
  snapshot: {
    referenceDate: "2026-03-31T00:00:00.000Z",
    currentPrice: 28.5,
    earningsPerShare: 4.06,
    peRatio: 7.02,
    revenue: 380000000000,
    ebitda: 0,
    netIncome: 35000000000,
    debt: 0,
    source: "seed-local"
  },
  valuation: {
    status: "completed",
    confidenceLevel: "medium",
    fairPrice: 32.48,
    upsidePct: 0.1396,
    targetPeRatio: 8,
    method: "earnings_multiple",
    rationaleSummary: "Preco justo calculado.",
    assumptions: {}
  }
};

describe("classifyCompany", () => {
  it("uses fallback when LLM is unavailable", async () => {
    const result = await classifyCompany(input, async () => null);

    expect(result.modelVersion).toBe(RULE_FALLBACK_MODEL_VERSION);
    expect(result.classificationSummary).toContain("Banco do Brasil");
  });

  it("uses fallback when LLM returns invalid JSON shape", async () => {
    const result = await classifyCompany(input, async () => ({
      text: "invalid"
    }));

    expect(result.modelVersion).toBe(RULE_FALLBACK_MODEL_VERSION);
    expect(result.confidenceLevel).toBe("medium");
  });
});
