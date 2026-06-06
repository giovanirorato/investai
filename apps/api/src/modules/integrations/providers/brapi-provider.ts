import type { CompanyImportData } from "../types.js";

type BrapiQuoteResult = {
  symbol: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  sector?: string;
  historicalDataPrice?: Array<{
    date: number;
    close?: number;
  }>;
};

type BrapiQuoteResponse = {
  results?: BrapiQuoteResult[];
};

function getBrapiToken(): string | undefined {
  return process.env.BRAPI_API_KEY;
}

function buildHeaders(): HeadersInit {
  const token = getBrapiToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`
  };
}

export async function getBrapiCompanyData(
  ticker: string
): Promise<Partial<CompanyImportData>> {
  const url = new URL(`https://brapi.dev/api/quote/${ticker}`);

  url.searchParams.set("range", "1y");
  url.searchParams.set("interval", "1mo");

  const response = await fetch(url, {
    headers: buildHeaders()
  });

  if (!response.ok) {
    console.warn(
      `[Brapi] Falha ao buscar ${ticker}: ${response.status} ${response.statusText}`
    );

    return {
      ticker
    };
  }

  const data = (await response.json()) as BrapiQuoteResponse;
  const result = data.results?.[0];

  if (!result) {
    console.warn(`[Brapi] Nenhum resultado encontrado para ${ticker}`);

    return {
      ticker
    };
  }

  const history =
    result.historicalDataPrice
      ?.map((item) => item.close)
      .filter((value): value is number => typeof value === "number") ?? [];

  return {
    ticker: result.symbol ?? ticker,
    name: result.longName ?? result.shortName ?? ticker,
    sector: result.sector,
    market: "B3",
    currentPrice: result.regularMarketPrice,
    history
  };
}