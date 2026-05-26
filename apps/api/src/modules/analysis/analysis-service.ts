import type { Prisma } from "@prisma/client";
import type {
  AnalysisRequestDetailResponse,
  AnalysisStatus,
  CreateAnalysisRequest
} from "@investai/shared";
import { classifyCompany } from "../agents/classification-agent.js";
import {
  companyDetailInclude,
  mapCompanyDetail
} from "../companies/company-mapper.js";
import { calculateValuation } from "../valuation/valuation.js";
import { ApiError } from "../../shared/http.js";
import { decimalToNumber } from "../../shared/numbers.js";
import { prisma } from "../../shared/prisma.js";

const analysisRequestInclude = {
  analysisResult: {
    include: {
      valuationResult: true
    }
  }
} satisfies Prisma.AnalysisRequestInclude;

type AnalysisRequestWithResult = Prisma.AnalysisRequestGetPayload<{
  include: typeof analysisRequestInclude;
}>;

export async function createAndRunAnalysis(
  input: CreateAnalysisRequest
): Promise<AnalysisRequestDetailResponse> {
  const company = await prisma.company.findUnique({
    where: {
      id: input.companyId
    },
    include: companyDetailInclude
  });

  if (!company) {
    throw new ApiError(404, "COMPANY_NOT_FOUND", "Empresa nao encontrada.", {
      companyId: input.companyId
    });
  }

  if (input.userProfileId) {
    const userProfile = await prisma.userProfile.findUnique({
      where: {
        id: input.userProfileId
      }
    });

    if (!userProfile) {
      throw new ApiError(404, "USER_PROFILE_NOT_FOUND", "Perfil de usuario nao encontrado.", {
        userProfileId: input.userProfileId
      });
    }
  }

  const analysisRequest = await prisma.analysisRequest.create({
    data: {
      companyId: input.companyId,
      userProfileId: input.userProfileId,
      objective: input.objective,
      status: "queued"
    }
  });

  try {
    await prisma.analysisRequest.update({
      where: {
        id: analysisRequest.id
      },
      data: {
        status: "processing"
      }
    });

    const companyDetail = mapCompanyDetail(company);
    const valuation = calculateValuation({
      sector: company.sector,
      snapshot: companyDetail.financialSnapshot
    });
    const classification = await classifyCompany({
      company: companyDetail.company,
      snapshot: companyDetail.financialSnapshot,
      valuation
    });
    const confidenceLevel =
      valuation.status === "partial" ? "low" : classification.confidenceLevel;

    await prisma.analysisResult.create({
      data: {
        analysisRequestId: analysisRequest.id,
        classificationSummary: classification.classificationSummary,
        confidenceLevel,
        modelVersion: classification.modelVersion,
        dataSources: companyDetail.financialSnapshot
          ? [companyDetail.financialSnapshot.source]
          : [],
        valuationResult: {
          create: {
            fairPrice: valuation.fairPrice,
            upsidePct: valuation.upsidePct,
            targetPeRatio: valuation.targetPeRatio,
            method: valuation.method,
            rationaleSummary: valuation.rationaleSummary,
            assumptions: valuation.assumptions as Prisma.InputJsonObject
          }
        }
      }
    });

    const completedRequest = await prisma.analysisRequest.update({
      where: {
        id: analysisRequest.id
      },
      data: {
        status: valuation.status
      },
      include: analysisRequestInclude
    });

    return mapAnalysisRequest(completedRequest);
  } catch (error) {
    await prisma.analysisRequest
      .update({
        where: {
          id: analysisRequest.id
        },
        data: {
          status: "failed"
        }
      })
      .catch(() => undefined);

    throw error;
  }
}

export async function getAnalysisRequest(
  analysisRequestId: string
): Promise<AnalysisRequestDetailResponse> {
  const analysisRequest = await prisma.analysisRequest.findUnique({
    where: {
      id: analysisRequestId
    },
    include: analysisRequestInclude
  });

  if (!analysisRequest) {
    throw new ApiError(404, "ANALYSIS_NOT_FOUND", "Analise nao encontrada.", {
      analysisRequestId
    });
  }

  return mapAnalysisRequest(analysisRequest);
}

export function mapAnalysisRequest(
  analysisRequest: AnalysisRequestWithResult
): AnalysisRequestDetailResponse {
  const analysisResult = analysisRequest.analysisResult;
  const valuationResult = analysisResult?.valuationResult;

  return {
    id: analysisRequest.id,
    status: analysisRequest.status as AnalysisStatus,
    companyId: analysisRequest.companyId,
    requestedAt: analysisRequest.requestedAt.toISOString(),
    updatedAt: analysisRequest.updatedAt.toISOString(),
    analysisResult: analysisResult
      ? {
          classificationSummary: analysisResult.classificationSummary,
          confidenceLevel: analysisResult.confidenceLevel,
          modelVersion: analysisResult.modelVersion,
          dataSources: parseDataSources(analysisResult.dataSources),
          generatedAt: analysisResult.generatedAt.toISOString(),
          valuationResult: valuationResult
            ? {
                fairPrice: decimalToNumber(valuationResult.fairPrice),
                upsidePct: decimalToNumber(valuationResult.upsidePct),
                targetPeRatio: decimalToNumber(valuationResult.targetPeRatio),
                method: "earnings_multiple",
                rationaleSummary: valuationResult.rationaleSummary,
                assumptions: parseJsonRecord(valuationResult.assumptions)
              }
            : null
        }
      : null
  };
}

function parseDataSources(value: Prisma.JsonValue | null) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function parseJsonRecord(value: Prisma.JsonValue | null) {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return null;
  }

  return value as Record<string, unknown>;
}
