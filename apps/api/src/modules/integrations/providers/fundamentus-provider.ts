import * as cheerio from "cheerio";
import iconv from "iconv-lite";
import type { CompanyImportData } from "../types.js";

function parseBrazilianNumber(value?: string): number | undefined {
  if (!value) return undefined;

  const cleaned = value
    .replace(/\./g, "")
    .replace(",", ".")
    .replace("%", "")
    .trim();

  const number = Number(cleaned);

  return Number.isNaN(number) ? undefined : number;
}

export async function getFundamentusCompanyData(
  ticker: string
): Promise<Partial<CompanyImportData>> {
  try {
    const response = await fetch(
      `https://www.fundamentus.com.br/detalhes.php?papel=${ticker}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      }
    );

    if (!response.ok) {
      console.warn(`[Fundamentus] Falha ao buscar ${ticker}: ${response.status}`);
      return { ticker };
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const html = iconv.decode(buffer, "iso-8859-1");
    const $ = cheerio.load(html);

    const data: Record<string, string> = {};

    $("td.label").each((_, element) => {
      const label = $(element)
          .text()
          .replace(/\?/g, "")
          .trim();

      const value = $(element)
          .next("td.data")
          .text()
          .trim();

      if (label && value) {
          data[label] = value;
      }
    });

    return {
        ticker,

        revenue:
            parseBrazilianNumber(data["Receita Líquida"]) ??
            parseBrazilianNumber(data["Receita"]),

        ebitda:
            parseBrazilianNumber(data["EBITDA"]) ??
            parseBrazilianNumber(data["EBIT"]),

        netIncome:
            parseBrazilianNumber(data["Lucro Líquido"]),

        debt:
            parseBrazilianNumber(data["Dív. Líquida"]) ??
            parseBrazilianNumber(data["Dív. Bruta"]) ??
            parseBrazilianNumber(data["Dív Líq / Patrim"])
    };
  } catch (error) {
    console.error(`[Fundamentus] Erro ao buscar ${ticker}`, error);
    return { ticker };
  }
}