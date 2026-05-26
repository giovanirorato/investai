import type { Prisma } from "@prisma/client";
import type {
  CompanyDetailResponse,
  CompanySummary,
  FinancialSnapshot,
  HistoricalPoint
} from "@investai/shared";
import { decimalToNumber } from "../../shared/numbers.js";

export const companyDetailInclude = {
  financialSnapshots: {
    orderBy: {
      referenceDate: "desc"
    },
    take: 1
  },
  historicalSeries: {
    where: {
      metric: "currentPrice"
    },
    orderBy: {
      period: "asc"
    }
  }
} satisfies Prisma.CompanyInclude;

export type CompanyWithDetail = Prisma.CompanyGetPayload<{
  include: typeof companyDetailInclude;
}>;

export function mapCompanySummary(company: {
  id: string;
  ticker: string;
  name: string;
  sector: string;
  market: string;
}): CompanySummary {
  return {
    id: company.id,
    ticker: company.ticker,
    name: company.name,
    sector: company.sector,
    market: company.market
  };
}

export function mapCompanyDetail(company: CompanyWithDetail): CompanyDetailResponse {
  const snapshot = company.financialSnapshots[0];

  return {
    company: mapCompanySummary(company),
    financialSnapshot: snapshot ? mapFinancialSnapshot(snapshot) : null,
    historicalSeries: company.historicalSeries.map(mapHistoricalPoint)
  };
}

function mapFinancialSnapshot(
  snapshot: CompanyWithDetail["financialSnapshots"][number]
): FinancialSnapshot {
  return {
    referenceDate: snapshot.referenceDate.toISOString(),
    currentPrice: decimalToNumber(snapshot.currentPrice),
    earningsPerShare: decimalToNumber(snapshot.earningsPerShare),
    peRatio: decimalToNumber(snapshot.peRatio),
    revenue: decimalToNumber(snapshot.revenue),
    ebitda: decimalToNumber(snapshot.ebitda),
    netIncome: decimalToNumber(snapshot.netIncome),
    debt: decimalToNumber(snapshot.debt),
    source: snapshot.source
  };
}

function mapHistoricalPoint(
  historicalPoint: CompanyWithDetail["historicalSeries"][number]
): HistoricalPoint {
  return {
    metric: historicalPoint.metric,
    period: historicalPoint.period.toISOString(),
    value: decimalToNumber(historicalPoint.value) ?? 0,
    source: historicalPoint.source
  };
}
