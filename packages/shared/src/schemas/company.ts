import { z } from "zod";

const NullableNumberSchema = z.number().nullable();

export const CompanySummarySchema = z.object({
  id: z.string(),
  ticker: z.string(),
  name: z.string(),
  sector: z.string(),
  market: z.string()
});

export const CompanySearchQuerySchema = z.object({
  query: z.string().trim().min(1, "query e obrigatorio"),
  sector: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10)
});

export const FinancialSnapshotSchema = z.object({
  referenceDate: z.string(),
  currentPrice: NullableNumberSchema,
  earningsPerShare: NullableNumberSchema,
  peRatio: NullableNumberSchema,
  revenue: NullableNumberSchema,
  ebitda: NullableNumberSchema,
  netIncome: NullableNumberSchema,
  debt: NullableNumberSchema,
  source: z.string()
});

export const HistoricalPointSchema = z.object({
  metric: z.string(),
  period: z.string(),
  value: z.number(),
  source: z.string()
});

export const CompanySearchResponseSchema = z.object({
  items: z.array(CompanySummarySchema)
});

export const CompanyDetailResponseSchema = z.object({
  company: CompanySummarySchema,
  financialSnapshot: FinancialSnapshotSchema.nullable(),
  historicalSeries: z.array(HistoricalPointSchema)
});

export type CompanySummary = z.infer<typeof CompanySummarySchema>;
export type CompanySearchQuery = z.infer<typeof CompanySearchQuerySchema>;
export type FinancialSnapshot = z.infer<typeof FinancialSnapshotSchema>;
export type HistoricalPoint = z.infer<typeof HistoricalPointSchema>;
export type CompanySearchResponse = z.infer<typeof CompanySearchResponseSchema>;
export type CompanyDetailResponse = z.infer<typeof CompanyDetailResponseSchema>;
