import { z } from "zod";

export const ErrorCodeSchema = z.enum([
  "VALIDATION_ERROR",
  "COMPANY_NOT_FOUND",
  "ANALYSIS_NOT_FOUND",
  "ANALYSIS_NOT_READY",
  "USER_PROFILE_NOT_FOUND",
  "INTERNAL_ERROR"
]);

export const ApiErrorResponseSchema = z.object({
  error: z.object({
    code: ErrorCodeSchema,
    message: z.string(),
    details: z.record(z.unknown()).optional()
  })
});

export type ErrorCode = z.infer<typeof ErrorCodeSchema>;
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
