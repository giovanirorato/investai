import { z } from "zod";
import { ConfidenceLevelSchema } from "./analysis.js";

export const RecommendationTypeSchema = z.enum(["buy", "monitor", "avoid"]);

export const RiskToleranceSchema = z.enum(["low", "medium", "high"]);

export const CreateRecommendationRequestSchema = z
  .object({
    analysisRequestId: z.string().min(1),
    userProfileId: z.string().min(1).optional(),
    objective: z.string().trim().min(1).optional()
  })
  .refine((value) => value.userProfileId || value.objective, {
    message: "userProfileId ou objective e obrigatorio"
  });

export const RecommendationResponseSchema = z.object({
  id: z.string(),
  recommendationType: RecommendationTypeSchema,
  summary: z.string(),
  nextAction: z.string(),
  objective: z.string().nullable(),
  confidenceLevel: ConfidenceLevelSchema.nullable(),
  generatedAt: z.string()
});

export type RecommendationType = z.infer<typeof RecommendationTypeSchema>;
export type RiskTolerance = z.infer<typeof RiskToleranceSchema>;
export type CreateRecommendationRequest = z.infer<
  typeof CreateRecommendationRequestSchema
>;
export type RecommendationResponse = z.infer<typeof RecommendationResponseSchema>;
