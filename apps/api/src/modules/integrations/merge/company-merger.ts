import type { CompanyImportData } from "../types.js";

export function mergeCompanyData(
  csv: Partial<CompanyImportData>,
  brapi: Partial<CompanyImportData>,
  fundamentus: Partial<CompanyImportData>
): CompanyImportData {
  return {
    ticker: csv.ticker ?? brapi.ticker ?? fundamentus.ticker ?? "",
    market: "B3",

    name: brapi.name ?? csv.name ?? csv.ticker ?? "Nao informado",
    sector: brapi.sector ?? csv.sector ?? "Nao informado",

    currentPrice: brapi.currentPrice ?? csv.currentPrice,
    earningsPerShare: brapi.earningsPerShare ?? csv.earningsPerShare,
    peRatio: brapi.peRatio ?? csv.peRatio,

    revenue: fundamentus.revenue ?? csv.revenue,
    ebitda: fundamentus.ebitda ?? csv.ebitda,
    netIncome: fundamentus.netIncome ?? csv.netIncome,
    debt: fundamentus.debt ?? csv.debt,

    history: brapi.history ?? csv.history ?? []
  };
}