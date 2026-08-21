import { z } from "zod";

const IsoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const OptionalMetricSchema = z.number().finite().nullable().optional();

export const GdeCompanyModelSchema = z.enum([
  "non_financial",
  "bank",
  "insurer",
  "utility",
  "cyclical"
]);

export const GdeFilterStatusSchema = z.enum([
  "eligible",
  "quarantine",
  "rejected"
]);

export const GdeComponentSchema = z.enum([
  "universe",
  "data_quality",
  "filters",
  "dividend_normalization",
  "scoring",
  "portfolio_construction",
  "buy_rules",
  "sell_rules",
  "rebalancing",
  "risk",
  "tax",
  "validation",
  "reporting"
]);

export const GdeEvolutionDecisionSchema = z.enum([
  "promote",
  "observe",
  "rollback",
  "maintain"
]);

export const GdeScoreWeightsSchema = z
  .object({
    dividendSafety: z.number().nonnegative(),
    businessQuality: z.number().nonnegative(),
    persistenceGrowth: z.number().nonnegative(),
    valuation: z.number().nonnegative(),
    liquidityMarket: z.number().nonnegative()
  })
  .refine(
    (weights) =>
      Math.abs(
        weights.dividendSafety +
          weights.businessQuality +
          weights.persistenceGrowth +
          weights.valuation +
          weights.liquidityMarket -
          100
      ) < 0.000001,
    { message: "Os pesos do GDE devem somar 100" }
  );

export const GdeRulesSchema = z.object({
  version: z.string().trim().min(1),
  minDataCompleteness: z.number().min(0).max(1),
  minYearsAvailable: z.number().int().positive(),
  cyclicalMinYearsAvailable: z.number().int().positive(),
  minAverageDailyLiquidity63d: z.number().nonnegative(),
  liquidityPercentileFloor: z.number().min(0).max(1),
  minimumEntryScore: z.number().min(0).max(100),
  maintenanceScore: z.number().min(0).max(100),
  maintenanceRank: z.number().int().positive(),
  targetHoldings: z.number().int().positive(),
  minimumHoldings: z.number().int().positive(),
  maxCompanyWeight: z.number().min(0).max(1),
  maxSectorWeight: z.number().min(0).max(1),
  maxIncomeSharePerCompany: z.number().min(0).max(1),
  maxTopFiveIncomeShare: z.number().min(0).max(1),
  scoreWeights: GdeScoreWeightsSchema
});

export const GdeDividendNormalizationInputSchema = z.object({
  price: z.number().positive(),
  medianRecurringDpsReal: z.number().nonnegative(),
  medianAdjustedEpsReal: z.number().nonnegative(),
  medianFreeCashFlowPerShareReal: z.number().nonnegative().nullable(),
  payoutCap: z.number().min(0).max(1),
  cashPayoutCap: z.number().min(0).max(1).nullable(),
  effectiveTaxRate: z.number().min(0).max(1)
});

export const GdeCandidateMetricsSchema = z.object({
  payoutAdjusted: OptionalMetricSchema,
  payoutCash: OptionalMetricSchema,
  dividendCoverage: OptionalMetricSchema,
  netDebtEbitda: OptionalMetricSchema,
  interestCoverage: OptionalMetricSchema,
  cashConversion: OptionalMetricSchema,
  capitalAdequacy: OptionalMetricSchema,
  assetQuality: OptionalMetricSchema,
  solvencyMargin: OptionalMetricSchema,
  combinedRatio: OptionalMetricSchema,
  profitability: OptionalMetricSchema,
  marginStability: OptionalMetricSchema,
  earningsStability: OptionalMetricSchema,
  shareDilution5y: OptionalMetricSchema,
  dividendCuts5y: OptionalMetricSchema,
  dividendGrowthReal5y: OptionalMetricSchema,
  earningsCashGrowthReal5y: OptionalMetricSchema,
  earningsYield: OptionalMetricSchema,
  freeCashFlowYield: OptionalMetricSchema,
  valuationVsHistory: OptionalMetricSchema,
  momentum12mEx1m: OptionalMetricSchema
});

export const GdeCandidateInputSchema = z.object({
  ticker: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{4,8}$/),
  sector: z.string().trim().min(1),
  model: GdeCompanyModelSchema,
  asOfDate: IsoDateSchema,
  financialsPublishedAt: IsoDateSchema,
  marketDataObservedAt: IsoDateSchema,
  dataSources: z.array(z.string().trim().min(1)).min(1),
  dataCompleteness: z.number().min(0).max(1),
  yearsAvailable: z.number().int().nonnegative(),
  averageDailyLiquidity63d: z.number().nonnegative(),
  listedAndTradable: z.boolean(),
  suspended: z.boolean(),
  recoveryOrInsolvency: z.boolean(),
  negativeEquityStructural: z.boolean(),
  governanceSevereFlag: z.boolean(),
  adverseAuditOpinion: z.boolean(),
  relatedPartySevereFlag: z.boolean(),
  profitPositiveYears5: z.number().int().min(0).max(5),
  operatingCashFlowPositiveYears5: z.number().int().min(0).max(5),
  dividendPayingYears5: z.number().int().min(0).max(5),
  newDividendPolicyVerified: z.boolean(),
  interestCoverageTrendDeteriorating: z.boolean(),
  debtFundedDividends: z.boolean(),
  capitalAdequacyOk: z.boolean().nullable(),
  sectorSpecificSolvencyOk: z.boolean().nullable(),
  dividendNormalization: GdeDividendNormalizationInputSchema,
  metrics: GdeCandidateMetricsSchema
});

export const GdeExperimentStatusSchema = z.enum([
  "proposed",
  "running",
  "validated",
  "rejected",
  "reverted"
]);

export const GdeExperimentContractSchema = z.object({
  id: z.string().trim().min(1),
  createdAt: z.string().datetime(),
  component: GdeComponentSchema,
  problem: z.string().trim().min(1),
  hypothesis: z.string().trim().min(1),
  changeApplied: z.string().trim().min(1),
  expectedResult: z.string().trim().min(1),
  validationMetric: z.string().trim().min(1),
  regressionRisk: z.string().trim().min(1),
  validationWindow: z.string().trim().min(1),
  decisionCriteria: z.string().trim().min(1),
  status: GdeExperimentStatusSchema
});

export const GdeBacktestMetricsSchema = z.object({
  realIncomeCagr: z.number().finite(),
  incomeDrawdown: z.number().min(0).max(1),
  wealthDrawdown: z.number().min(0).max(1),
  turnover: z.number().min(0),
  falsePositiveRate: z.number().min(0).max(1),
  incomeConcentrationHhi: z.number().min(0).max(1),
  sectorConcentrationHhi: z.number().min(0).max(1),
  windowsWon: z.number().int().nonnegative(),
  windowsTotal: z.number().int().positive(),
  complexityScore: z.number().nonnegative()
});

export type GdeCompanyModel = z.infer<typeof GdeCompanyModelSchema>;
export type GdeFilterStatus = z.infer<typeof GdeFilterStatusSchema>;
export type GdeComponent = z.infer<typeof GdeComponentSchema>;
export type GdeEvolutionDecision = z.infer<typeof GdeEvolutionDecisionSchema>;
export type GdeScoreWeights = z.infer<typeof GdeScoreWeightsSchema>;
export type GdeRules = z.infer<typeof GdeRulesSchema>;
export type GdeDividendNormalizationInput = z.infer<
  typeof GdeDividendNormalizationInputSchema
>;
export type GdeCandidateMetrics = z.infer<typeof GdeCandidateMetricsSchema>;
export type GdeCandidateInput = z.infer<typeof GdeCandidateInputSchema>;
export type GdeExperimentStatus = z.infer<typeof GdeExperimentStatusSchema>;
export type GdeExperimentContract = z.infer<typeof GdeExperimentContractSchema>;
export type GdeBacktestMetrics = z.infer<typeof GdeBacktestMetricsSchema>;
