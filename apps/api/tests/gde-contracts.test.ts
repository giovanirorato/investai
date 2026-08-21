import {
  GdeBacktestMetricsSchema,
  GdePortfolioSnapshotSchema,
  GdeRulesSchema
} from "@investai/shared";
import { describe, expect, it } from "vitest";
import { DEFAULT_GDE_RULES } from "../src/modules/gde/gde-engine.js";

describe("GDE shared contracts", () => {
  it("accepts the champion rules", () => {
    const result = GdeRulesSchema.safeParse(DEFAULT_GDE_RULES);

    expect(result.success).toBe(true);
  });

  it("rejects a minimum portfolio larger than the target", () => {
    const result = GdeRulesSchema.safeParse({
      ...DEFAULT_GDE_RULES,
      minimumHoldings: 16,
      targetHoldings: 15
    });

    expect(result.success).toBe(false);
  });

  it("rejects more winning windows than evaluated windows", () => {
    const result = GdeBacktestMetricsSchema.safeParse({
      realIncomeCagr: 0.04,
      incomeDrawdown: 0.15,
      wealthDrawdown: 0.35,
      turnover: 0.12,
      falsePositiveRate: 0.2,
      incomeConcentrationHhi: 0.12,
      sectorConcentrationHhi: 0.18,
      windowsWon: 7,
      windowsTotal: 6,
      complexityScore: 1
    });

    expect(result.success).toBe(false);
  });

  it("accepts the Brazilian timezone offset in snapshot timestamps", () => {
    const result = GdePortfolioSnapshotSchema.safeParse({
      id: "snapshot-2026-04-19",
      observedAt: "2026-04-19T09:58:32.000-03:00",
      importedAt: "2026-08-21T12:00:00.000Z",
      sourceFile: "posicao-2026-04-19-09-58-32.xlsx",
      sourceSha256: null,
      positions: [
        {
          symbol: "pomo3",
          assetClass: "equity_br",
          quantity: 100,
          averagePrice: 3.92,
          marketPrice: 5.58,
          marketValue: 558,
          sourceRow: 2
        }
      ],
      importWarnings: [],
      declaredTotalMarketValue: 558
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.positions[0]?.symbol).toBe("POMO3");
    }
  });
});
