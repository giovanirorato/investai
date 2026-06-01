import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import type { CompanyImportData } from "../types.js";

function toNumber(value?: string): number | undefined {
  if (!value || value.trim() === "" || value === "-") return undefined;

  return Number(
    value
      .replace(/\./g, "")
      .replace(",", ".")
      .replace("%", "")
      .trim()
  );
}

export function loadStatusInvestCsv(): CompanyImportData[] {
  const csvPath = path.resolve(
    "apps/api/src/modules/integrations/providers/statusinvest.csv"
  );

  const file = fs.readFileSync(csvPath, "utf-8");

  const rows = parse(file, {
    columns: true,
    delimiter: ";",
    skip_empty_lines: true,
    trim: true
  });

  return rows.map((row: any) => ({
    ticker: row.TICKER,
    market: "B3",
    currentPrice: toNumber(row.PRECO),
    earningsPerShare: toNumber(row.LPA),
    peRatio: toNumber(row["P/L"])
  }));
}