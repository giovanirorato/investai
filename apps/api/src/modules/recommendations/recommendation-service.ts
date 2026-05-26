import type { Prisma } from "@prisma/client";
import type {
  ConfidenceLevel,
  CreateRecommendationRequest,
  RecommendationResponse
} from "@investai/shared";
import { generateRecommendationText } from "../agents/recommendation-agent.js";
import {
  decideRecommendation,
  fallbackRecommendationText
} from "./recommendation-rules.js";
import { ApiError } from "../../shared/http.js";
import { decimalToNumber } from "../../shared/numbers.js";
import { prisma } from "../../shared/prisma.js";

const recommendationAnalysisInclude = {
  userProfile: true,
  analysisResult: {
    include: {
      valuationResult: true
    }
  }
} satisfies Prisma.AnalysisRequestInclude;

export async function createRecommendation(
  input: CreateRecommendationRequest
): Promise<RecommendationResponse> {
  const analysisRequest = await prisma.analysisRequest.findUnique({
    where: {
      id: input.analysisRequestId
    },
    include: recommendationAnalysisInclude
  });

  if (!analysisRequest) {
    throw new ApiError(404, "ANALYSIS_NOT_FOUND", "Analise nao encontrada.", {
      analysisRequestId: input.analysisRequestId
    });
  }

  const analysisResult = analysisRequest.analysisResult;
  const valuationResult = analysisResult?.valuationResult;

  if (!analysisResult || !valuationResult) {
    throw new ApiError(409, "ANALYSIS_NOT_READY", "Analise ainda nao possui resultado.", {
      analysisRequestId: input.analysisRequestId
    });
  }

  const userProfile = input.userProfileId
    ? await prisma.userProfile.findUnique({
        where: {
          id: input.userProfileId
        }
      })
    : analysisRequest.userProfile;

  if (input.userProfileId && !userProfile) {
    throw new ApiError(404, "USER_PROFILE_NOT_FOUND", "Perfil de usuario nao encontrado.", {
      userProfileId: input.userProfileId
    });
  }

  const confidenceLevel = analysisResult.confidenceLevel as ConfidenceLevel;
  const upsidePct = decimalToNumber(valuationResult.upsidePct);
  const objective = input.objective ?? userProfile?.objective ?? analysisRequest.objective ?? null;
  const recommendationType = decideRecommendation({
    upsidePct,
    confidenceLevel
  });
  const fallbackText = fallbackRecommendationText(
    recommendationType,
    objective,
    confidenceLevel
  );
  const generatedText = await generateRecommendationText({
    recommendationType,
    objective,
    confidenceLevel,
    context: {
      classificationSummary: analysisResult.classificationSummary,
      fairPrice: decimalToNumber(valuationResult.fairPrice),
      upsidePct,
      method: valuationResult.method,
      rationaleSummary: valuationResult.rationaleSummary,
      fallbackText
    }
  });

  const recommendation = await prisma.recommendation.create({
    data: {
      analysisResultId: analysisResult.id,
      userProfileId: userProfile?.id,
      recommendationType,
      summary: generatedText.summary,
      nextAction: generatedText.nextAction,
      objective,
      confidenceLevel
    }
  });

  return {
    id: recommendation.id,
    recommendationType: recommendation.recommendationType,
    summary: recommendation.summary,
    nextAction: recommendation.nextAction,
    objective: recommendation.objective,
    confidenceLevel: recommendation.confidenceLevel,
    generatedAt: recommendation.generatedAt.toISOString()
  };
}
