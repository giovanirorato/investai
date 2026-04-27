import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const companies = [
  {
    ticker: "BBAS3",
    name: "Banco do Brasil",
    sector: "Financeiro",
    market: "B3",
    currentPrice: "28.50",
    earningsPerShare: "4.0600",
    peRatio: "7.02",
    revenue: "380000000000.00",
    ebitda: "0.00",
    netIncome: "35000000000.00",
    debt: "0.00",
    history: ["22.10", "24.80", "28.50"]
  },
  {
    ticker: "PETR4",
    name: "Petrobras PN",
    sector: "Energia",
    market: "B3",
    currentPrice: "39.20",
    earningsPerShare: "5.1200",
    peRatio: "7.66",
    revenue: "510000000000.00",
    ebitda: "260000000000.00",
    netIncome: "124000000000.00",
    debt: "290000000000.00",
    history: ["27.40", "32.10", "39.20"]
  },
  {
    ticker: "VALE3",
    name: "Vale",
    sector: "Mineracao",
    market: "B3",
    currentPrice: "61.75",
    earningsPerShare: "6.1800",
    peRatio: "9.99",
    revenue: "210000000000.00",
    ebitda: "98000000000.00",
    netIncome: "43000000000.00",
    debt: "84000000000.00",
    history: ["70.20", "66.10", "61.75"]
  },
  {
    ticker: "WEGE3",
    name: "WEG",
    sector: "Industria",
    market: "B3",
    currentPrice: "38.90",
    earningsPerShare: "1.5200",
    peRatio: "25.59",
    revenue: "33000000000.00",
    ebitda: "7100000000.00",
    netIncome: "5800000000.00",
    debt: "4200000000.00",
    history: ["31.30", "36.40", "38.90"]
  },
  {
    ticker: "ITUB4",
    name: "Itau Unibanco PN",
    sector: "Financeiro",
    market: "B3",
    currentPrice: "33.40",
    earningsPerShare: "3.6500",
    peRatio: "9.15",
    revenue: "290000000000.00",
    ebitda: "0.00",
    netIncome: "36000000000.00",
    debt: "0.00",
    history: ["25.90", "29.70", "33.40"]
  }
];

async function main() {
  await prisma.recommendation.deleteMany();
  await prisma.valuationResult.deleteMany();
  await prisma.analysisResult.deleteMany();
  await prisma.analysisRequest.deleteMany();
  await prisma.historicalSeries.deleteMany();
  await prisma.financialSnapshot.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.company.deleteMany();

  for (const company of companies) {
    await prisma.company.create({
      data: {
        ticker: company.ticker,
        name: company.name,
        sector: company.sector,
        market: company.market,
        financialSnapshots: {
          create: {
            referenceDate: new Date("2026-03-31T00:00:00.000Z"),
            currentPrice: company.currentPrice,
            earningsPerShare: company.earningsPerShare,
            peRatio: company.peRatio,
            revenue: company.revenue,
            ebitda: company.ebitda,
            netIncome: company.netIncome,
            debt: company.debt,
            source: "seed-local"
          }
        },
        historicalSeries: {
          create: company.history.map((value, index) => ({
            metric: "currentPrice",
            period: new Date(Date.UTC(2024 + index, 11, 31)),
            value,
            source: "seed-local"
          }))
        }
      }
    });
  }

  await prisma.userProfile.createMany({
    data: [
      {
        type: "investidor-individual",
        riskTolerance: "medium",
        objective: "crescimento com risco moderado",
        investmentHorizon: "longo prazo"
      },
      {
        type: "analista",
        riskTolerance: "high",
        objective: "comparar oportunidades de valorizacao",
        investmentHorizon: "medio prazo"
      }
    ]
  });

  console.log(`Seed concluido com ${companies.length} empresas.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
