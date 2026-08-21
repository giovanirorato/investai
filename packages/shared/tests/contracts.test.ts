import { describe, expect, it } from "vitest";
import {
  ApiErrorResponseSchema,
  CompanySearchQuerySchema,
  CreateRecommendationRequestSchema
} from "../src/index.js";

describe("shared contracts", () => {
  it("normalizes an empty company search for the initial company list", () => {
    const parsed = CompanySearchQuerySchema.parse({
      query: "   "
    });

    expect(parsed.query).toBe("");
  });

  it("applies the current default search limit", () => {
    const parsed = CompanySearchQuerySchema.parse({
      query: "BBAS3"
    });

    expect(parsed.limit).toBe(50);
  });

  it("requires objective or user profile for recommendation requests", () => {
    const parsed = CreateRecommendationRequestSchema.safeParse({
      analysisRequestId: "anr_001"
    });

    expect(parsed.success).toBe(false);
  });

  it("accepts the standard API error shape", () => {
    const parsed = ApiErrorResponseSchema.parse({
      error: {
        code: "COMPANY_NOT_FOUND",
        message: "Empresa nao encontrada."
      }
    });

    expect(parsed.error.code).toBe("COMPANY_NOT_FOUND");
  });
});
