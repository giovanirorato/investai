import { prisma } from "../../shared/prisma.js";
import { loadStatusInvestCsv } from "./providers/statusinvest-provider.js";
import { getBrapiCompanyData } from "./providers/brapi-provider.js";
import { getFundamentusCompanyData } from "./providers/fundamentus-provider.js";
import { mergeCompanyData } from "./merge/company-merger.js";
import type { CompanyImportData } from "./types.js";

const TEST_MODE = false;
const TEST_LIMIT = 617;

const TEST_TICKERS: CompanyImportData[] = [
  { ticker: "PETR4", market: "B3" },
  { ticker: "MGLU3", market: "B3" },
  { ticker: "VALE3", market: "B3" },
  { ticker: "ITUB4", market: "B3" }
];

async function main() {
  const companiesFromCsv = loadStatusInvestCsv();

  const companies = TEST_MODE
    ? TEST_TICKERS
    : companiesFromCsv.slice(0, TEST_LIMIT);

  let imported = 0;
  let failed = 0;

  for (const company of companies) {
    try {
      const brapiData = await getBrapiCompanyData(company.ticker);

      const fundamentusData = await getFundamentusCompanyData(
        company.ticker
      );

      const merged = mergeCompanyData(
        company,
        brapiData,
        fundamentusData
      );

      const savedCompany = await prisma.company.upsert({
        where: {
          ticker: merged.ticker
        },
        update: {
          name: merged.name ?? merged.ticker,
          sector: merged.sector ?? "Nao informado",
          market: merged.market ?? "B3"
        },
        create: {
          ticker: merged.ticker,
          name: merged.name ?? merged.ticker,
          sector: merged.sector ?? "Nao informado",
          market: merged.market ?? "B3"
        }
      });

      await prisma.financialSnapshot.deleteMany({
        where: {
          companyId: savedCompany.id
        }
      });

      await prisma.financialSnapshot.create({
        data: {
          companyId: savedCompany.id,
          referenceDate: new Date(),
          currentPrice: merged.currentPrice?.toString(),
          earningsPerShare: merged.earningsPerShare?.toString(),
          peRatio: merged.peRatio?.toString(),
          revenue: merged.revenue?.toString(),
          ebitda: merged.ebitda?.toString(),
          netIncome: merged.netIncome?.toString(),
          debt: merged.debt?.toString(),
          source: "statusinvest+brapi+fundamentus"
        }
      });

      if (merged.history?.length) {
        await prisma.historicalSeries.deleteMany({
          where: {
            companyId: savedCompany.id,
            metric: "currentPrice"
          }
        });

        await prisma.historicalSeries.createMany({
          data: merged.history.map((point) => ({
            companyId: savedCompany.id,
            metric: "currentPrice",
            period: point.date,
            value: point.value.toString(),
            source: "brapi"
          }))
        });
      }

      imported++;

      console.log(
        `${imported}/${companies.length} - ${merged.ticker} - ${merged.name}`
      );
    } catch (error) {
      failed++;

      console.error(
        `[ERRO] Falha ao importar ${company.ticker}`
      );
      console.error(error);
    }
  }

  console.log("Importação finalizada.");
  console.log(`Importadas: ${imported}`);
  console.log(`Falhas: ${failed}`);
  console.log(`Total processado: ${companies.length}`);
}

main()
  .catch((error) => {
    console.error("Erro geral na importação:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });