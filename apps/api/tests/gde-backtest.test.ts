import {
  GdeBacktestRunInputSchema,
  type GdeBacktestObservation,
  type GdeBacktestRunInput
} from "@investai/shared";
import { describe, expect, it } from "vitest";
import { calculateGdeBacktestMetrics } from "../src/modules/gde/gde-backtest.js";

function monthlyObservations(): GdeBacktestObservation[] {
  const observations: GdeBacktestObservation[] = [];

  for (let index = 0; index < 24; index += 1) {
    const year = 2025 + Math.floor(index / 12);
    const month = (index % 12) + 1;
    observations.push({
      date: `${year}-${String(month).padStart(2, "0")}-28`,
      netDividendIncome: index < 12 ? 100 : 110,
      cpiIndex: 1,
      portfolioMarketValue: 1_000,
      wealthIndexLevel: index === 15 ? 800 : 1_000,
      tradedNotional: 10
    });
  }

  return observations;
}

function input(
  overrides: Partial<GdeBacktestRunInput> = {}
): GdeBacktestRunInput {
  return {
    observations: monthlyObservations(),
    falsePositiveCount: 2,
    evaluatedSelectionCount: 10,
    aggregateIncomeByTicker: {
      AAAA3: 600,
      BBBB3: 400
    },
    sectorByTicker: {
      AAAA3: "Sector A",
      BBBB3: "Sector B"
    },
    windowsWon: 4,
    windowsTotal: 6,
    complexityScore: 1,
    ...overrides
  };
}

describe("GDE backtest metrics", () => {
  it("calculates real income CAGR, drawdowns, turnover and concentration", () => {
    const result = calculateGdeBacktestMetrics(input());

    expect(result.metrics.realIncomeCagr).toBeCloseTo(0.1, 6);
    expect(result.metrics.incomeDrawdown).toBe(0);
    expect(result.metrics.wealthDrawdown).toBeCloseTo(0.2, 6);
    expect(result.metrics.turnover).toBeCloseTo(0.12, 6);
    expect(result.metrics.falsePositiveRate).toBeCloseTo(0.2, 6);
    expect(result.metrics.incomeConcentrationHhi).toBeCloseTo(0.52, 6);
    expect(result.metrics.sectorConcentrationHhi).toBeCloseTo(0.52, 6);
    expect(result.realIncomeTtmSeries).toHaveLength(13);
    expect(result.realWealthIndexSeries).toHaveLength(24);
    expect(result.warnings).toEqual([]);
  });

  it("deflates income, exposure and the flow-adjusted wealth index", () => {
    const observations = monthlyObservations().map((observation, index) => ({
      ...observation,
      cpiIndex: index < 12 ? 1 : 1.1,
      portfolioMarketValue: index < 12 ? 1_000 : 1_100,
      wealthIndexLevel: index < 12 ? 1_000 : 1_100
    }));
    const result = calculateGdeBacktestMetrics(input({ observations }));

    expect(result.realWealthIndexSeries.at(-1)?.value).toBeCloseTo(
      1_000,
      6
    );
    expect(result.metrics.wealthDrawdown).toBe(0);
  });

  it("rejects non-chronological observations at the contract boundary", () => {
    const observations = monthlyObservations();
    const first = observations[0];
    const second = observations[1];
    if (!first || !second) {
      throw new Error("Fixture mensal invalida");
    }
    observations[0] = second;
    observations[1] = first;

    const result = GdeBacktestRunInputSchema.safeParse(input({ observations }));

    expect(result.success).toBe(false);
  });

  it("rejects gaps in a series declared as monthly", () => {
    const observations = monthlyObservations();
    const june = observations[5];
    if (!june) {
      throw new Error("Fixture mensal invalida");
    }
    observations[5] = { ...june, date: "2025-07-28" };

    const result = GdeBacktestRunInputSchema.safeParse(input({ observations }));

    expect(result.success).toBe(false);
  });

  it("rejects income without a sector mapping", () => {
    const result = GdeBacktestRunInputSchema.safeParse(
      input({ sectorByTicker: { AAAA3: "Sector A" } })
    );

    expect(result.success).toBe(false);
  });
});
