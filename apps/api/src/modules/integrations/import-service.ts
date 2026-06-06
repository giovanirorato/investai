import { loadStatusInvestCsv } from "./providers/statusinvest-provider.js";
import { prisma } from "../../shared/prisma.js";

const companies = loadStatusInvestCsv();

for (const company of companies) {
  await prisma.company.upsert({
    where: {
      ticker: company.ticker
    },
    update: {
      market: company.market ?? "B3"
    },
    create: {
      ticker: company.ticker,
      name: company.name ?? company.ticker,
      sector: company.sector ?? "Nao informado",
      market: company.market ?? "B3"
    }
  });
}

console.log(`Empresas importadas/atualizadas: ${companies.length}`);

await prisma.$disconnect();