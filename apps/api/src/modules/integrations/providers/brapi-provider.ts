import type { CompanyImportData } from "../types.js";

type BrapiHistoricalPrice = {
  date: number;
  close?: number;
  adjustedClose?: number;
};

type BrapiQuoteResult = {
  symbol: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  priceEarnings?: number;
  earningsPerShare?: number;
  sector?: string;

  summaryProfile?: {
    sector?: string;
    sectorDisp?: string;
    industry?: string;
    industryDisp?: string;
    longBusinessSummary?: string;
    website?: string;
  };

  historicalDataPrice?: BrapiHistoricalPrice[];
};

type BrapiQuoteResponse = {
  results?: BrapiQuoteResult[];
};

function getBrapiToken(): string | undefined {
  return process.env.BRAPI_API_KEY;
}

export async function getBrapiCompanyData(
  ticker: string
): Promise<Partial<CompanyImportData>> {
  try {
    const url = new URL(`https://brapi.dev/api/quote/${ticker}`);

    url.searchParams.set("modules", "summaryProfile");
    url.searchParams.set("range", "3mo");
    url.searchParams.set("interval", "1d");

    const token = getBrapiToken();

    if (token) {
      url.searchParams.set("token", token);
    }

    const response = await fetch(url);

    if (!response.ok) {
      console.warn(
        `[Brapi] Falha ao buscar ${ticker}: ${response.status} ${response.statusText}`
      );

      return { ticker };
    }

    const data = (await response.json()) as BrapiQuoteResponse;
    const result = data.results?.[0];

    if (!result) {
      console.warn(`[Brapi] Nenhum resultado encontrado para ${ticker}`);
      return { ticker };
    }

    const history =
      result.historicalDataPrice
        ?.map((item) => {
          const value = item.adjustedClose ?? item.close;

          if (typeof value !== "number") {
            return null;
          }

          return {
            date: new Date(item.date * 1000),
            value
          };
        })
        .filter(
          (
            item
          ): item is {
            date: Date;
            value: number;
          } => item !== null
        ) ?? [];

    return {
      ticker: result.symbol ?? ticker,
      name: result.longName ?? result.shortName ?? ticker,
      sector:
        result.summaryProfile?.sectorDisp ??
        result.summaryProfile?.sector ??
        result.sector,
      market: "B3",
      currentPrice: result.regularMarketPrice,
      earningsPerShare: result.earningsPerShare,
      peRatio: result.priceEarnings,
      history
    };
  } catch (error) {
    console.error(`[Brapi] Erro inesperado ao buscar ${ticker}`, error);
    return { ticker };
  }
}