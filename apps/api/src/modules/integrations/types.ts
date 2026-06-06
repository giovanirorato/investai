export interface CompanyImportData {
  ticker: string;
  name?: string;
  sector?: string;
  market?: string;
  currentPrice?: number;
  earningsPerShare?: number;
  peRatio?: number;
  revenue?: number;
  ebitda?: number;
  netIncome?: number;
  debt?: number;
  history?: number[];
}