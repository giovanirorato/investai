import type {
  GdeCandidateInput,
  GdeCandidateMetrics,
  GdeDividendNormalizationInput,
  GdeRules
} from "@investai/shared";
import { describe, expect, it } from "vitest";
import {
  buildGdePortfolio,
  DEFAULT_GDE_RULES,
  normalizeDividend,
  rankGdeUniverse,
  type GdeCandidateResult
} from "../src/modules/gde/gde-engine.js";

type CandidateOverrides = Partial<
  Omit<GdeCandidateInput, "ticker" | "metrics" | "dividendNormalization">
> & {
  metrics?: Partial<GdeCandidateMetrics>;
  dividendNormalization?: Partial<GdeDividendNormalizationInput>;
};

const baseMetrics: GdeCandidateMetrics = {
  payoutAdjusted: 0.55,
  payoutCash: 0.6,
  dividendCoverage: 1.6,
  netDebtEbitda: 1.2,
  interestCoverage: 5,
  cashConversion: 0.85,
  capitalAdequacy: null,
  assetQuality: null,
  solvencyMargin: null,
  combinedRatio: null,
  profitability: 0.14,
  marginStability: 0.7,
  earningsStability: 0.75,
  shareDilution5y: 0,
  dividendCuts5y: 0,
  dividendGrowthReal5y: 0.04,
  earningsCashGrowthReal5y: 0.05,
  earningsYield: 0.08,
  freeCashFlowYield: 0.07,
  valuationVsHistory: 0.55,
  momentum12mEx1m: 0.04
};

const baseDividendNormalization: GdeDividendNormalizationInput = {
  price: 20,
  medianRecurringDpsReal: 1.2,
  medianAdjustedEpsReal: 3,
  medianFreeCashFlowPerShareReal: 2.5,
  payoutCap: 0.6,
  cashPayoutCap: 0.7,
  effectiveTaxRate: 0
};

function makeCandidate(
  ticker: string,
  overrides: CandidateOverrides = {}
): GdeCandidateInput {
  const { metrics, dividendNormalization, ...topLevel } = overrides;

  return {
    ticker,
    sector: "Industrials",
    model: "non_financial",
    asOfDate: "2026-04-19",
    financialsPublishedAt: "2026-03-31",
    marketDataObservedAt: "2026-04-17",
    dataSources: ["test-fixture"],
    dataCompleteness: 1,
    yearsAvailable: 8,
    averageDailyLiquidity63d: 20_000_000,
    listedAndTradable: true,
    suspended: false,
    recoveryOrInsolvency: false,
    negativeEquityStructural: false,
    governanceSevereFlag: false,
    adverseAuditOpinion: false,
    relatedPartySevereFlag: false,
    profitPositiveYears5: 5,
    operatingCashFlowPositiveYears5: 5,
    dividendPayingYears5: 5,
    newDividendPolicyVerified: false,
    interestCoverageTrendDeteriorating: false,
    debtFundedDividends: false,
    capitalAdequacyOk: null,
    sectorSpecificSolvencyOk: null,
    dividendNormalization: {
      ...baseDividendNormalization,
      ...dividendNormalization
    },
    metrics: {
      ...baseMetrics,
      ...metrics
    },
    ...topLevel
  };
}

function rankedCandidate(
  ticker: string,
  sector: string,
  rank: number,
  normalizedDividendYieldNet: number
): GdeCandidateResult {
  return {
    ticker,
    sector,
    model: "non_financial",
    asOfDate: "2026-04-19",
    filter: {
      status: "eligible",
      rejectionReasons: [],
      quarantineReasons: [],
      liquidityFloor: 2_000_000
    },
    normalizedDividend: {
      sustainableDpsGross: 1,
      sustainableDpsNet: 1,
      normalizedDividendYieldGross: normalizedDividendYieldNet,
      normalizedDividendYieldNet,
      bindingConstraint: "recurring_dividend"
    },
    comparisonGroup: `sector:${sector}`,
    blockScores: {
      dividendSafety: 30,
      businessQuality: 22,
      persistenceGrowth: 17,
      valuation: 12,
      liquidityMarket: 4
    },
    score: 85 - rank,
    metricCoverage: 1,
    rank,
    entryEligible: true
  };
}

describe("GDE dividend normalization", () => {
  it("uses the most conservative sustainable dividend constraint", () => {
    const result = normalizeDividend({
      price: 20,
      medianRecurringDpsReal: 1.8,
      medianAdjustedEpsReal: 3,
      medianFreeCashFlowPerShareReal: 2,
      payoutCap: 0.5,
      cashPayoutCap: 0.6,
      effectiveTaxRate: 0.15
    });

    expect(result.bindingConstraint).toBe("cash_payout");
    expect(result.sustainableDpsGross).toBeCloseTo(1.2, 6);
    expect(result.sustainableDpsNet).toBeCloseTo(1.02, 6);
    expect(result.normalizedDividendYieldGross).toBeCloseTo(0.06, 6);
    expect(result.normalizedDividendYieldNet).toBeCloseTo(0.051, 6);
  });
});

describe("GDE point-in-time filters", () => {
  it("rejects financial information published after the decision date", () => {
    const universe = [
      makeCandidate("FUTR3", {
        financialsPublishedAt: "2026-04-20"
      }),
      makeCandidate("PEER3"),
      makeCandidate("BASE3")
    ];

    const result = rankGdeUniverse(universe).find(
      (candidate) => candidate.ticker === "FUTR3"
    );

    expect(result?.filter.status).toBe("rejected");
    expect(result?.filter.rejectionReasons).toContain(
      "lookahead_financial_data"
    );
    expect(result?.score).toBeNull();
  });

  it("quarantines material governance risk instead of hiding it in the score", () => {
    const universe = [
      makeCandidate("GOVR3", { governanceSevereFlag: true }),
      makeCandidate("PEER3"),
      makeCandidate("BASE3")
    ];

    const result = rankGdeUniverse(universe).find(
      (candidate) => candidate.ticker === "GOVR3"
    );

    expect(result?.filter.status).toBe("quarantine");
    expect(result?.filter.quarantineReasons).toContain(
      "material_governance_risk"
    );
    expect(result?.score).toBeNull();
  });
});

describe("GDE ranking", () => {
  it("does not let a high yield compensate for weak dividend safety and quality", () => {
    const quality = makeCandidate("QUAL3", {
      dividendNormalization: {
        price: 22,
        medianRecurringDpsReal: 1.1,
        medianAdjustedEpsReal: 3.4,
        medianFreeCashFlowPerShareReal: 3,
        payoutCap: 0.55,
        cashPayoutCap: 0.65
      },
      metrics: {
        payoutAdjusted: 0.42,
        payoutCash: 0.48,
        dividendCoverage: 2.2,
        netDebtEbitda: 0.4,
        interestCoverage: 9,
        cashConversion: 0.98,
        profitability: 0.2,
        marginStability: 0.92,
        earningsStability: 0.9,
        dividendCuts5y: 0,
        dividendGrowthReal5y: 0.07,
        earningsCashGrowthReal5y: 0.08,
        earningsYield: 0.075,
        freeCashFlowYield: 0.07,
        valuationVsHistory: 0.5,
        momentum12mEx1m: 0.06
      }
    });
    const middle = makeCandidate("MEDI3");
    const yieldTrap = makeCandidate("TRAP3", {
      dividendNormalization: {
        price: 10,
        medianRecurringDpsReal: 2,
        medianAdjustedEpsReal: 3,
        medianFreeCashFlowPerShareReal: 1,
        payoutCap: 0.9,
        cashPayoutCap: 1
      },
      metrics: {
        payoutAdjusted: 0.95,
        payoutCash: 1.2,
        dividendCoverage: 0.8,
        netDebtEbitda: 4,
        interestCoverage: 1.4,
        cashConversion: 0.45,
        profitability: 0.07,
        marginStability: 0.25,
        earningsStability: 0.2,
        dividendCuts5y: 2,
        dividendGrowthReal5y: 0.12,
        earningsCashGrowthReal5y: -0.08,
        earningsYield: 0.13,
        freeCashFlowYield: 0.04,
        valuationVsHistory: 0.8,
        momentum12mEx1m: -0.25
      }
    });

    const ranking = rankGdeUniverse([quality, middle, yieldTrap]);
    const qualityResult = ranking.find(
      (candidate) => candidate.ticker === "QUAL3"
    );
    const trapResult = ranking.find(
      (candidate) => candidate.ticker === "TRAP3"
    );

    expect(
      trapResult?.normalizedDividend.normalizedDividendYieldGross
    ).toBeGreaterThan(
      qualityResult?.normalizedDividend.normalizedDividendYieldGross ?? 0
    );
    expect(qualityResult?.score ?? 0).toBeGreaterThan(
      trapResult?.score ?? 0
    );
    expect(qualityResult?.rank ?? 99).toBeLessThan(trapResult?.rank ?? 99);
  });

  it("penalizes incomplete metric coverage rather than imputing favorable data", () => {
    const complete = makeCandidate("COMP3");
    const incomplete = makeCandidate("MISS3", {
      metrics: {
        payoutCash: null,
        interestCoverage: null,
        cashConversion: null,
        profitability: null,
        dividendGrowthReal5y: null,
        freeCashFlowYield: null,
        momentum12mEx1m: null
      }
    });
    const peer = makeCandidate("PEER3");

    const ranking = rankGdeUniverse([complete, incomplete, peer]);
    const completeResult = ranking.find(
      (candidate) => candidate.ticker === "COMP3"
    );
    const incompleteResult = ranking.find(
      (candidate) => candidate.ticker === "MISS3"
    );

    expect(completeResult?.metricCoverage ?? 0).toBeGreaterThan(
      incompleteResult?.metricCoverage ?? 1
    );
  });
});

describe("GDE portfolio construction", () => {
  it("respects the sector cap and leaves capital in cash when quality is insufficient", () => {
    const rules: GdeRules = {
      ...DEFAULT_GDE_RULES,
      targetHoldings: 4,
      minimumHoldings: 3,
      maximumEntryScore: undefined as never,
      minimumEntryScore: 0,
      maxCompanyWeight: 0.25,
      maxSectorWeight: 0.5,
      maxIncomeSharePerCompany: 1,
      maxTopFiveIncomeShare: 1
    };
    delete (rules as Partial<GdeRules> & { maximumEntryScore?: number })
      .maximumEntryScore;

    const portfolio = buildGdePortfolio(
      [
        rankedCandidate("SECA3", "Sector A", 1, 0.06),
        rankedCandidate("SECB3", "Sector A", 2, 0.06),
        rankedCandidate("SECC3", "Sector A", 3, 0.06),
        rankedCandidate("OTRA3", "Sector B", 4, 0.06),
        rankedCandidate("OTRB3", "Sector B", 5, 0.06)
      ],
      rules
    );

    expect(portfolio.positions).toHaveLength(4);
    expect(portfolio.positions.map((position) => position.ticker)).not.toContain(
      "SECC3"
    );
    expect(portfolio.sectorWeights["Sector A"]).toBeCloseTo(0.5, 6);
    expect(portfolio.unallocatedCashWeight).toBeCloseTo(0, 6);
    expect(portfolio.status).toBe("ready");
  });

  it("does not lower the score threshold merely to fill the target portfolio", () => {
    const rules: GdeRules = {
      ...DEFAULT_GDE_RULES,
      targetHoldings: 4,
      minimumHoldings: 3,
      maxCompanyWeight: 0.25,
      maxSectorWeight: 1,
      maxIncomeSharePerCompany: 1,
      maxTopFiveIncomeShare: 1
    };
    const first = rankedCandidate("ONEA3", "Sector A", 1, 0.05);
    const second = rankedCandidate("TWOB3", "Sector B", 2, 0.05);
    const rejected = {
      ...rankedCandidate("LOWQ3", "Sector C", 3, 0.05),
      entryEligible: false,
      score: 50
    };

    const portfolio = buildGdePortfolio([first, second, rejected], rules);

    expect(portfolio.positions).toHaveLength(2);
    expect(portfolio.unallocatedCashWeight).toBeCloseTo(0.5, 6);
    expect(portfolio.status).toBe("insufficient_universe");
  });
});
