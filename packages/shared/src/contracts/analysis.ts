import { z } from "zod";

export const AnalysisStatusSchema = z.enum([
  "queued",
  "processing",
  "partial",
  "completed",
  "failed"
]);

export const ConfidenceLevelSchema = z.enum(["low", "medium", "high"]);

export const CreateAnalysisRequestSchema = z.object({
  companyId: z.string().min(1),
  userProfileId: z.string().min(1).optional(),
  objective: z.string().trim().min(1).optional()
});

export const ValuationResultSchema = z.object({
  fairPrice: z.number().nullable(),
  upsidePct: z.number().nullable(),
  targetPeRatio: z.number().nullable(),
  method: z.literal("earnings_multiple"),
  rationaleSummary: z.string(),
  assumptions: z.record(z.unknown()).nullable()
});

export const AnalysisResultSchema = z.object({
  classificationSummary: z.string(),
  confidenceLevel: ConfidenceLevelSchema,
  modelVersion: z.string().nullable(),
  dataSources: z.array(z.string()),
  generatedAt: z.string(),
  valuationResult: ValuationResultSchema.nullable()
});

export const AnalysisRequestCreatedResponseSchema = z.object({
  id: z.string(),
  status: AnalysisStatusSchema
});

export const AnalysisRequestDetailResponseSchema = z.object({
  id: z.string(),
  status: AnalysisStatusSchema,
  companyId: z.string(),
  requestedAt: z.string(),
  updatedAt: z.string(),
  analysisResult: AnalysisResultSchema.nullable()
});

export type AnalysisStatus = z.infer<typeof AnalysisStatusSchema>;
export type ConfidenceLevel = z.infer<typeof ConfidenceLevelSchema>;
export type CreateAnalysisRequest = z.infer<typeof CreateAnalysisRequestSchema>;
export type ValuationResult = z.infer<typeof ValuationResultSchema>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
export type AnalysisRequestCreatedResponse = z.infer<
  typeof AnalysisRequestCreatedResponseSchema
>;
export type AnalysisRequestDetailResponse = z.infer<
  typeof AnalysisRequestDetailResponseSchema
>;
