import cors from "cors";
import express from "express";
import type { Prisma } from "@prisma/client";
import {
  CompanySearchQuerySchema,
  CreateAnalysisRequestSchema,
  CreateRecommendationRequestSchema
} from "@investai/shared";
import {
  createAndRunAnalysis,
  getAnalysisRequest
} from "./modules/analysis/analysis-service.js";
import {
  companyDetailInclude,
  mapCompanyDetail,
  mapCompanySummary
} from "./modules/companies/company-mapper.js";
import { createRecommendation } from "./modules/recommendations/recommendation-service.js";
import { env } from "./config/env.js";
import { ApiError, asyncHandler, errorHandler } from "./shared/http.js";
import { prisma } from "./shared/prisma.js";

const app = express();

app.use(
  cors({
    origin: env.WEB_ORIGIN
  })
);
app.use(express.json());

app.get("/", (_request, response) => {
  response.json({
    service: "investai-api",
    status: "ok",
    docs: "Consulte SPEC.md para o escopo do MVP."
  });
});

app.get("/health", (_request, response) => {
  response.json({
    service: "investai-api",
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

app.get(
  "/companies",
  asyncHandler(async (request, response) => {
    const query = CompanySearchQuerySchema.parse(request.query);

    const search = query.query?.trim() ?? "";

    const andFilters: Prisma.CompanyWhereInput[] = [];

    if (search.length > 0) {
      andFilters.push({
        OR: [
          {
            ticker: {
              contains: search,
              mode: "insensitive"
            }
          },
          {
            name: {
              contains: search,
              mode: "insensitive"
            }
          },
          {
            sector: {
              contains: search,
              mode: "insensitive"
            }
          }
        ]
      });
    }

    if (query.sector) {
      andFilters.push({
        sector: {
          contains: query.sector,
          mode: "insensitive"
        }
      });
    }

    const where: Prisma.CompanyWhereInput =
      andFilters.length > 0
        ? {
            AND: andFilters
          }
        : {};

    const companies = await prisma.company.findMany({
      where,
      orderBy: {
        ticker: "asc"
      },
      take: query.limit
    });

    response.json({
      items: companies.map(mapCompanySummary)
    });
  })
);

app.get(
  "/companies/:companyId",
  asyncHandler(async (request, response) => {
    const companyId = request.params.companyId;

    if (!companyId) {
      throw new ApiError(400, "VALIDATION_ERROR", "Identificador da empresa e obrigatorio.");
    }

    const company = await prisma.company.findUnique({
      where: {
        id: companyId
      },
      include: companyDetailInclude
    });

    if (!company) {
      throw new ApiError(404, "COMPANY_NOT_FOUND", "Empresa nao encontrada.", {
        companyId
      });
    }

    response.json(mapCompanyDetail(company));
  })
);

app.post(
  "/analysis-requests",
  asyncHandler(async (request, response) => {
    const payload = CreateAnalysisRequestSchema.parse(request.body);
    const result = await createAndRunAnalysis(payload);

    response.status(201).json({
      id: result.id,
      status: result.status
    });
  })
);

app.get(
  "/analysis-requests/:analysisRequestId",
  asyncHandler(async (request, response) => {
    const analysisRequestId = request.params.analysisRequestId;

    if (!analysisRequestId) {
      throw new ApiError(400, "VALIDATION_ERROR", "Identificador da analise e obrigatorio.");
    }

    response.json(await getAnalysisRequest(analysisRequestId));
  })
);

app.post(
  "/recommendations",
  asyncHandler(async (request, response) => {
    const payload = CreateRecommendationRequestSchema.parse(request.body);
    const recommendation = await createRecommendation(payload);

    response.status(201).json(recommendation);
  })
);

app.use(errorHandler);

const server = app.listen(env.API_PORT, () => {
  console.log(`InvestAI API rodando em http://localhost:${env.API_PORT}`);
});

function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
