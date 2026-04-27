-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('queued', 'processing', 'partial', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "ConfidenceLevel" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "RecommendationType" AS ENUM ('buy', 'monitor', 'avoid');

-- CreateEnum
CREATE TYPE "RiskTolerance" AS ENUM ('low', 'medium', 'high');

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "riskTolerance" "RiskTolerance" NOT NULL,
    "objective" TEXT,
    "investmentHorizon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialSnapshot" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "referenceDate" TIMESTAMP(3) NOT NULL,
    "currentPrice" DECIMAL(12,2),
    "earningsPerShare" DECIMAL(12,4),
    "peRatio" DECIMAL(10,2),
    "revenue" DECIMAL(18,2),
    "ebitda" DECIMAL(18,2),
    "netIncome" DECIMAL(18,2),
    "debt" DECIMAL(18,2),
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoricalSeries" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "period" TIMESTAMP(3) NOT NULL,
    "value" DECIMAL(18,4) NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoricalSeries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisRequest" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userProfileId" TEXT,
    "requestedBy" TEXT,
    "objective" TEXT,
    "status" "AnalysisStatus" NOT NULL DEFAULT 'queued',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalysisRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisResult" (
    "id" TEXT NOT NULL,
    "analysisRequestId" TEXT NOT NULL,
    "classificationSummary" TEXT NOT NULL,
    "confidenceLevel" "ConfidenceLevel" NOT NULL,
    "modelVersion" TEXT,
    "dataSources" JSONB,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalysisResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValuationResult" (
    "id" TEXT NOT NULL,
    "analysisResultId" TEXT NOT NULL,
    "fairPrice" DECIMAL(12,2) NOT NULL,
    "upsidePct" DECIMAL(8,4) NOT NULL,
    "targetPeRatio" DECIMAL(8,2),
    "method" TEXT NOT NULL,
    "rationaleSummary" TEXT NOT NULL,
    "assumptions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ValuationResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "analysisResultId" TEXT NOT NULL,
    "userProfileId" TEXT,
    "recommendationType" "RecommendationType" NOT NULL,
    "summary" TEXT NOT NULL,
    "nextAction" TEXT NOT NULL,
    "objective" TEXT,
    "confidenceLevel" "ConfidenceLevel",
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_ticker_key" ON "Company"("ticker");

-- CreateIndex
CREATE INDEX "Company_ticker_idx" ON "Company"("ticker");

-- CreateIndex
CREATE INDEX "Company_sector_idx" ON "Company"("sector");

-- CreateIndex
CREATE INDEX "FinancialSnapshot_companyId_referenceDate_idx" ON "FinancialSnapshot"("companyId", "referenceDate");

-- CreateIndex
CREATE INDEX "HistoricalSeries_companyId_metric_period_idx" ON "HistoricalSeries"("companyId", "metric", "period");

-- CreateIndex
CREATE INDEX "AnalysisRequest_companyId_status_idx" ON "AnalysisRequest"("companyId", "status");

-- CreateIndex
CREATE INDEX "AnalysisRequest_userProfileId_idx" ON "AnalysisRequest"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "AnalysisResult_analysisRequestId_key" ON "AnalysisResult"("analysisRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "ValuationResult_analysisResultId_key" ON "ValuationResult"("analysisResultId");

-- CreateIndex
CREATE INDEX "Recommendation_analysisResultId_idx" ON "Recommendation"("analysisResultId");

-- CreateIndex
CREATE INDEX "Recommendation_userProfileId_idx" ON "Recommendation"("userProfileId");

-- AddForeignKey
ALTER TABLE "FinancialSnapshot" ADD CONSTRAINT "FinancialSnapshot_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricalSeries" ADD CONSTRAINT "HistoricalSeries_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisRequest" ADD CONSTRAINT "AnalysisRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisRequest" ADD CONSTRAINT "AnalysisRequest_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisResult" ADD CONSTRAINT "AnalysisResult_analysisRequestId_fkey" FOREIGN KEY ("analysisRequestId") REFERENCES "AnalysisRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValuationResult" ADD CONSTRAINT "ValuationResult_analysisResultId_fkey" FOREIGN KEY ("analysisResultId") REFERENCES "AnalysisResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_analysisResultId_fkey" FOREIGN KEY ("analysisResultId") REFERENCES "AnalysisResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
