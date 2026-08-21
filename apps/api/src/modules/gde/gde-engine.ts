import type {
  GdeCandidateInput,
  GdeCandidateMetrics,
  GdeCompanyModel,
  GdeFilterStatus,
  GdeRules
} from "@investai/shared";

export const DEFAULT_GDE_RULES: GdeRules = {
  version: "GDE-1.0.0",
  minDataCompleteness: 0.8,
  minYearsAvailable: 5,
  cyclicalMinYearsAvailable: 7,
  minAverageDailyLiquidity63d: 2_000_000,
  liquidityPercentileFloor: 0.2,
  minimumEntryScore: 70,
  maintenanceScore: 55,
  maintenanceRank: 30,
  targetHoldings: 15,
  minimumHoldings: 12,
  maxCompanyWeight: 0.08,
  maxSectorWeight: 0.25,
  maxIncomeSharePerCompany: 0.12,
  maxTopFiveIncomeShare: 0.45,
  scoreWeights: {
    dividendSafety: 35,
    businessQuality: 25,
    persistenceGrowth: 20,
    valuation: 15,
    liquidityMarket: 5
  }
};

export type GdeNormalizedDividend = {
  sustainableDpsGross: number;
  sustainableDpsNet: number;
  normalizedDividendYieldGross: number;
  normalizedDividendYieldNet: number;
  bindingConstraint:
    | "recurring_dividend"
    | "earnings_payout"
    | "cash_payout";
};

export type GdeFilterResult = {
  status: GdeFilterStatus;
  rejectionReasons: string[];
  quarantineReasons: string[];
  liquidityFloor: number;
};

export type GdeBlockScores = {
  dividendSafety: number;
  businessQuality: number;
  persistenceGrowth: number;
  valuation: number;
  liquidityMarket: number;
};

export type GdeCandidateResult = {
  ticker: string;
  sector: string;
  model: GdeCompanyModel;
  asOfDate: string;
  filter: GdeFilterResult;
  normalizedDividend: GdeNormalizedDividend;
  comparisonGroup: string;
  blockScores: GdeBlockScores | null;
  score: number | null;
  metricCoverage: number;
  rank: number | null;
  entryEligible: boolean;
};

export type GdePortfolioPosition = {
  ticker: string;
  sector: string;
  rank: number;
  score: number;
  weight: number;
  normalizedDividendYieldNet: number;
  projectedIncomeShare: number;
};

export type GdePortfolioResult = {
  status: "ready" | "partial" | "insufficient_universe" | "requires_review";
  rulesVersion: string;
  positions: GdePortfolioPosition[];
  unallocatedCashWeight: number;
  sectorWeights: Record<string, number>;
  topFiveIncomeShare: number;
  violations: string[];
};

type MetricDirection = "higher" | "lower";
type DerivedMetricKey =
  | keyof GdeCandidateMetrics
  | "normalizedDividendYieldNet"
  | "dividendPaymentPersistence"
  | "averageDailyLiquidity63d";

type MetricSpec = {
  key: DerivedMetricKey;
  direction: MetricDirection;
};

type CandidateContext = {
  input: GdeCandidateInput;
  filter: GdeFilterResult;
  normalizedDividend: GdeNormalizedDividend;
};

const round = (value: number, digits = 4) => {
  const multiplier = 10 ** digits;
  return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
};

const nonNull = (value: number | null | undefined): value is number =>
  value !== null && value !== undefined && Number.isFinite(value);

function quantile(values: number[], probability: number): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const position = (sorted.length - 1) * probability;
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.ceil(position);
  const lower = sorted[lowerIndex] ?? 0;
  const upper = sorted[upperIndex] ?? lower;

  if (lowerIndex === upperIndex) {
    return lower;
  }

  return lower + (upper - lower) * (position - lowerIndex);
}

function percentileRank(values: number[], target: number): number {
  if (values.length <= 1) {
    return 0.5;
  }

  const sorted = [...values].sort((left, right) => left - right);
  let firstIndex = -1;
  let lastIndex = -1;

  for (let index = 0; index < sorted.length; index += 1) {
    if (sorted[index] === target) {
      if (firstIndex === -1) {
        firstIndex = index;
      }
      lastIndex = index;
    }
  }

  if (firstIndex < 0 || lastIndex < 0) {
    const lowerCount = sorted.filter((value) => value < target).length;
    return lowerCount / (sorted.length - 1);
  }

  return ((firstIndex + lastIndex) / 2) / (sorted.length - 1);
}

export function normalizeDividend(
  input: GdeCandidateInput["dividendNormalization"]
): GdeNormalizedDividend {
  const constraints: Array<{
    key: GdeNormalizedDividend["bindingConstraint"];
    value: number;
  }> = [
    {
      key: "recurring_dividend",
      value: input.medianRecurringDpsReal
    },
    {
      key: "earnings_payout",
      value: input.payoutCap * input.medianAdjustedEpsReal
    }
  ];

  if (
    input.medianFreeCashFlowPerShareReal !== null &&
    input.cashPayoutCap !== null
  ) {
    constraints.push({
      key: "cash_payout",
      value: input.cashPayoutCap * input.medianFreeCashFlowPerShareReal
    });
  }

  const binding = constraints.reduce((lowest, current) =>
    current.value < lowest.value ? current : lowest
  );
  const sustainableDpsGross = Math.max(0, binding.value);
  const sustainableDpsNet =
    sustainableDpsGross * (1 - input.effectiveTaxRate);

  return {
    sustainableDpsGross: round(sustainableDpsGross, 6),
    sustainableDpsNet: round(sustainableDpsNet, 6),
    normalizedDividendYieldGross: round(
      sustainableDpsGross / input.price,
      6
    ),
    normalizedDividendYieldNet: round(
      sustainableDpsNet / input.price,
      6
    ),
    bindingConstraint: binding.key
  };
}

function calculateLiquidityFloor(
  candidates: GdeCandidateInput[],
  rules: GdeRules
): number {
  const marketFloor = quantile(
    candidates.map((candidate) => candidate.averageDailyLiquidity63d),
    rules.liquidityPercentileFloor
  );

  return Math.max(rules.minAverageDailyLiquidity63d, marketFloor);
}

function filterCandidate(
  candidate: GdeCandidateInput,
  liquidityFloor: number,
  rules: GdeRules
): GdeFilterResult {
  const rejectionReasons: string[] = [];
  const quarantineReasons: string[] = [];
  const requiredYears =
    candidate.model === "cyclical"
      ? rules.cyclicalMinYearsAvailable
      : rules.minYearsAvailable;

  if (candidate.financialsPublishedAt > candidate.asOfDate) {
    rejectionReasons.push("lookahead_financial_data");
  }
  if (candidate.marketDataObservedAt > candidate.asOfDate) {
    rejectionReasons.push("lookahead_market_data");
  }
  if (!candidate.listedAndTradable) {
    rejectionReasons.push("not_listed_or_tradable");
  }
  if (candidate.suspended) {
    rejectionReasons.push("trading_suspended");
  }
  if (candidate.recoveryOrInsolvency) {
    rejectionReasons.push("recovery_or_insolvency");
  }
  if (candidate.negativeEquityStructural) {
    rejectionReasons.push("structural_negative_equity");
  }
  if (candidate.dataCompleteness < rules.minDataCompleteness) {
    rejectionReasons.push("insufficient_data_completeness");
  }
  if (candidate.yearsAvailable < requiredYears) {
    rejectionReasons.push("insufficient_history");
  }
  if (candidate.averageDailyLiquidity63d < liquidityFloor) {
    rejectionReasons.push("insufficient_liquidity");
  }
  if (
    candidate.dividendPayingYears5 < 4 &&
    !candidate.newDividendPolicyVerified
  ) {
    rejectionReasons.push("insufficient_dividend_history");
  }
  if (candidate.debtFundedDividends) {
    rejectionReasons.push("debt_funded_dividends");
  }

  if (
    candidate.governanceSevereFlag ||
    candidate.adverseAuditOpinion ||
    candidate.relatedPartySevereFlag
  ) {
    quarantineReasons.push("material_governance_risk");
  }

  if (
    candidate.model === "non_financial" ||
    candidate.model === "utility"
  ) {
    if (candidate.profitPositiveYears5 < 4) {
      rejectionReasons.push("insufficient_profit_persistence");
    }
    if (candidate.operatingCashFlowPositiveYears5 < 4) {
      rejectionReasons.push("insufficient_cash_flow_persistence");
    }
    if (candidate.interestCoverageTrendDeteriorating) {
      quarantineReasons.push("deteriorating_interest_coverage");
    }
  }

  if (
    candidate.model === "cyclical" &&
    candidate.sectorSpecificSolvencyOk !== true
  ) {
    rejectionReasons.push("cycle_solvency_not_confirmed");
  }

  if (candidate.model === "bank") {
    if (candidate.profitPositiveYears5 < 4) {
      rejectionReasons.push("insufficient_profit_persistence");
    }
    if (candidate.capitalAdequacyOk === false) {
      rejectionReasons.push("capital_adequacy_failed");
    } else if (candidate.capitalAdequacyOk === null) {
      quarantineReasons.push("capital_adequacy_missing");
    }
  }

  if (candidate.model === "insurer") {
    if (candidate.profitPositiveYears5 < 4) {
      rejectionReasons.push("insufficient_profit_persistence");
    }
    if (candidate.sectorSpecificSolvencyOk === false) {
      rejectionReasons.push("solvency_failed");
    } else if (candidate.sectorSpecificSolvencyOk === null) {
      quarantineReasons.push("solvency_missing");
    }
  }

  let status: GdeFilterStatus = "eligible";
  if (rejectionReasons.length > 0) {
    status = "rejected";
  } else if (quarantineReasons.length > 0) {
    status = "quarantine";
  }

  return {
    status,
    rejectionReasons,
    quarantineReasons,
    liquidityFloor: round(liquidityFloor, 2)
  };
}

function safetyMetrics(model: GdeCompanyModel): MetricSpec[] {
  switch (model) {
    case "bank":
      return [
        { key: "payoutAdjusted", direction: "lower" },
        { key: "dividendCoverage", direction: "higher" },
        { key: "capitalAdequacy", direction: "higher" },
        { key: "assetQuality", direction: "higher" },
        { key: "earningsStability", direction: "higher" }
      ];
    case "insurer":
      return [
        { key: "payoutAdjusted", direction: "lower" },
        { key: "dividendCoverage", direction: "higher" },
        { key: "solvencyMargin", direction: "higher" },
        { key: "combinedRatio", direction: "lower" },
        { key: "earningsStability", direction: "higher" }
      ];
    case "cyclical":
      return [
        { key: "payoutAdjusted", direction: "lower" },
        { key: "dividendCoverage", direction: "higher" },
        { key: "netDebtEbitda", direction: "lower" },
        { key: "interestCoverage", direction: "higher" },
        { key: "earningsStability", direction: "higher" }
      ];
    default:
      return [
        { key: "payoutAdjusted", direction: "lower" },
        { key: "payoutCash", direction: "lower" },
        { key: "dividendCoverage", direction: "higher" },
        { key: "netDebtEbitda", direction: "lower" },
        { key: "interestCoverage", direction: "higher" },
        { key: "cashConversion", direction: "higher" }
      ];
  }
}

function qualityMetrics(model: GdeCompanyModel): MetricSpec[] {
  if (model === "bank") {
    return [
      { key: "profitability", direction: "higher" },
      { key: "earningsStability", direction: "higher" },
      { key: "assetQuality", direction: "higher" },
      { key: "shareDilution5y", direction: "lower" }
    ];
  }

  if (model === "insurer") {
    return [
      { key: "profitability", direction: "higher" },
      { key: "earningsStability", direction: "higher" },
      { key: "combinedRatio", direction: "lower" },
      { key: "shareDilution5y", direction: "lower" }
    ];
  }

  return [
    { key: "profitability", direction: "higher" },
    { key: "marginStability", direction: "higher" },
    { key: "cashConversion", direction: "higher" },
    { key: "shareDilution5y", direction: "lower" }
  ];
}

const persistenceMetrics: MetricSpec[] = [
  { key: "dividendPaymentPersistence", direction: "higher" },
  { key: "dividendCuts5y", direction: "lower" },
  { key: "dividendGrowthReal5y", direction: "higher" },
  { key: "earningsCashGrowthReal5y", direction: "higher" }
];

function valuationMetrics(model: GdeCompanyModel): MetricSpec[] {
  const metrics: MetricSpec[] = [
    { key: "normalizedDividendYieldNet", direction: "higher" },
    { key: "earningsYield", direction: "higher" },
    { key: "valuationVsHistory", direction: "higher" }
  ];

  if (model !== "bank" && model !== "insurer") {
    metrics.push({ key: "freeCashFlowYield", direction: "higher" });
  }

  return metrics;
}

const liquidityMarketMetrics: MetricSpec[] = [
  { key: "averageDailyLiquidity63d", direction: "higher" },
  { key: "momentum12mEx1m", direction: "higher" }
];

function metricValue(
  context: CandidateContext,
  key: DerivedMetricKey
): number | null {
  if (key === "normalizedDividendYieldNet") {
    return context.normalizedDividend.normalizedDividendYieldNet;
  }
  if (key === "dividendPaymentPersistence") {
    return context.input.dividendPayingYears5 / 5;
  }
  if (key === "averageDailyLiquidity63d") {
    return context.input.averageDailyLiquidity63d;
  }

  const value = context.input.metrics[key as keyof GdeCandidateMetrics];
  return nonNull(value) ? value : null;
}

function comparisonPeers(
  context: CandidateContext,
  eligible: CandidateContext[]
): { label: string; peers: CandidateContext[] } {
  const sectorPeers = eligible.filter(
    (peer) => peer.input.sector === context.input.sector
  );
  if (sectorPeers.length >= 3) {
    return { label: `sector:${context.input.sector}`, peers: sectorPeers };
  }

  const modelPeers = eligible.filter(
    (peer) => peer.input.model === context.input.model
  );
  if (modelPeers.length >= 3) {
    return { label: `model:${context.input.model}`, peers: modelPeers };
  }

  return { label: "eligible_universe", peers: eligible };
}

function scoreBlock(
  context: CandidateContext,
  peers: CandidateContext[],
  specs: MetricSpec[],
  weight: number
): { score: number; present: number; total: number } {
  let percentileSum = 0;
  let present = 0;

  for (const spec of specs) {
    const currentValue = metricValue(context, spec.key);
    if (currentValue === null) {
      continue;
    }

    const peerValues = peers
      .map((peer) => metricValue(peer, spec.key))
      .filter(nonNull);
    if (peerValues.length === 0) {
      continue;
    }

    const rawPercentile = percentileRank(peerValues, currentValue);
    percentileSum +=
      spec.direction === "higher" ? rawPercentile : 1 - rawPercentile;
    present += 1;
  }

  if (present === 0) {
    return { score: 0, present: 0, total: specs.length };
  }

  return {
    score: round(
      weight * (percentileSum / present) * (present / specs.length),
      4
    ),
    present,
    total: specs.length
  };
}

export function rankGdeUniverse(
  candidates: GdeCandidateInput[],
  rules: GdeRules = DEFAULT_GDE_RULES
): GdeCandidateResult[] {
  const liquidityFloor = calculateLiquidityFloor(candidates, rules);
  const contexts: CandidateContext[] = candidates.map((input) => ({
    input,
    filter: filterCandidate(input, liquidityFloor, rules),
    normalizedDividend: normalizeDividend(input.dividendNormalization)
  }));
  const eligible = contexts.filter(
    (context) => context.filter.status === "eligible"
  );

  const results = contexts.map<GdeCandidateResult>((context) => {
    if (context.filter.status !== "eligible") {
      return {
        ticker: context.input.ticker,
        sector: context.input.sector,
        model: context.input.model,
        asOfDate: context.input.asOfDate,
        filter: context.filter,
        normalizedDividend: context.normalizedDividend,
        comparisonGroup: "not_scored",
        blockScores: null,
        score: null,
        metricCoverage: 0,
        rank: null,
        entryEligible: false
      };
    }

    const comparison = comparisonPeers(context, eligible);
    const safety = scoreBlock(
      context,
      comparison.peers,
      safetyMetrics(context.input.model),
      rules.scoreWeights.dividendSafety
    );
    const quality = scoreBlock(
      context,
      comparison.peers,
      qualityMetrics(context.input.model),
      rules.scoreWeights.businessQuality
    );
    const persistence = scoreBlock(
      context,
      comparison.peers,
      persistenceMetrics,
      rules.scoreWeights.persistenceGrowth
    );
    const valuation = scoreBlock(
      context,
      comparison.peers,
      valuationMetrics(context.input.model),
      rules.scoreWeights.valuation
    );
    const liquidityMarket = scoreBlock(
      context,
      comparison.peers,
      liquidityMarketMetrics,
      rules.scoreWeights.liquidityMarket
    );
    const score = round(
      safety.score +
        quality.score +
        persistence.score +
        valuation.score +
        liquidityMarket.score,
      2
    );
    const present =
      safety.present +
      quality.present +
      persistence.present +
      valuation.present +
      liquidityMarket.present;
    const total =
      safety.total +
      quality.total +
      persistence.total +
      valuation.total +
      liquidityMarket.total;

    return {
      ticker: context.input.ticker,
      sector: context.input.sector,
      model: context.input.model,
      asOfDate: context.input.asOfDate,
      filter: context.filter,
      normalizedDividend: context.normalizedDividend,
      comparisonGroup: comparison.label,
      blockScores: {
        dividendSafety: safety.score,
        businessQuality: quality.score,
        persistenceGrowth: persistence.score,
        valuation: valuation.score,
        liquidityMarket: liquidityMarket.score
      },
      score,
      metricCoverage: total > 0 ? round(present / total, 4) : 0,
      rank: null,
      entryEligible: score >= rules.minimumEntryScore
    };
  });

  const ranked = results
    .filter((result) => result.score !== null)
    .sort((left, right) => {
      const scoreDifference = (right.score ?? 0) - (left.score ?? 0);
      return scoreDifference !== 0
        ? scoreDifference
        : left.ticker.localeCompare(right.ticker);
    });

  ranked.forEach((result, index) => {
    result.rank = index + 1;
  });

  return results.sort((left, right) => {
    if (left.rank === null && right.rank === null) {
      return left.ticker.localeCompare(right.ticker);
    }
    if (left.rank === null) {
      return 1;
    }
    if (right.rank === null) {
      return -1;
    }
    return left.rank - right.rank;
  });
}

export function buildGdePortfolio(
  rankedCandidates: GdeCandidateResult[],
  rules: GdeRules = DEFAULT_GDE_RULES
): GdePortfolioResult {
  const targetWeight = Math.min(
    1 / rules.targetHoldings,
    rules.maxCompanyWeight
  );
  const selected: GdeCandidateResult[] = [];
  const sectorWeights: Record<string, number> = {};

  for (const candidate of rankedCandidates) {
    if (
      !candidate.entryEligible ||
      candidate.rank === null ||
      candidate.score === null
    ) {
      continue;
    }
    if (selected.length >= rules.targetHoldings) {
      break;
    }

    const currentSectorWeight = sectorWeights[candidate.sector] ?? 0;
    if (currentSectorWeight + targetWeight > rules.maxSectorWeight) {
      continue;
    }

    selected.push(candidate);
    sectorWeights[candidate.sector] = round(
      currentSectorWeight + targetWeight,
      6
    );
  }

  const projectedIncome = selected.map(
    (candidate) =>
      targetWeight * candidate.normalizedDividend.normalizedDividendYieldNet
  );
  const totalProjectedIncome = projectedIncome.reduce(
    (total, value) => total + value,
    0
  );
  const positions = selected.map<GdePortfolioPosition>((candidate, index) => ({
    ticker: candidate.ticker,
    sector: candidate.sector,
    rank: candidate.rank ?? 0,
    score: candidate.score ?? 0,
    weight: round(targetWeight, 6),
    normalizedDividendYieldNet:
      candidate.normalizedDividend.normalizedDividendYieldNet,
    projectedIncomeShare:
      totalProjectedIncome > 0
        ? round((projectedIncome[index] ?? 0) / totalProjectedIncome, 6)
        : 0
  }));
  const topFiveIncomeShare = round(
    [...positions]
      .sort(
        (left, right) =>
          right.projectedIncomeShare - left.projectedIncomeShare
      )
      .slice(0, 5)
      .reduce((total, position) => total + position.projectedIncomeShare, 0),
    6
  );
  const violations: string[] = [];

  for (const position of positions) {
    if (position.projectedIncomeShare > rules.maxIncomeSharePerCompany) {
      violations.push(`income_concentration:${position.ticker}`);
    }
  }
  if (topFiveIncomeShare > rules.maxTopFiveIncomeShare) {
    violations.push("top_five_income_concentration");
  }

  const allocatedWeight = positions.reduce(
    (total, position) => total + position.weight,
    0
  );
  const unallocatedCashWeight = round(Math.max(0, 1 - allocatedWeight), 6);

  let status: GdePortfolioResult["status"] = "ready";
  if (positions.length < rules.minimumHoldings) {
    status = "insufficient_universe";
  } else if (positions.length < rules.targetHoldings) {
    status = "partial";
  }
  if (violations.length > 0) {
    status = "requires_review";
  }

  return {
    status,
    rulesVersion: rules.version,
    positions,
    unallocatedCashWeight,
    sectorWeights,
    topFiveIncomeShare,
    violations
  };
}
