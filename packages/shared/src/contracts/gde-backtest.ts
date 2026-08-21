import { z } from "zod";

const IsoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const GdeBacktestObservationSchema = z.object({
  date: IsoDateSchema,
  netDividendIncome: z.number().nonnegative(),
  cpiIndex: z.number().positive(),
  portfolioMarketValue: z.number().nonnegative(),
  wealthIndexLevel: z.number().positive(),
  tradedNotional: z.number().nonnegative()
});

export const GdeBacktestRunInputSchema = z
  .object({
    observations: z.array(GdeBacktestObservationSchema).min(13),
    falsePositiveCount: z.number().int().nonnegative(),
    evaluatedSelectionCount: z.number().int().nonnegative(),
    aggregateIncomeByTicker: z.record(z.number().nonnegative()),
    sectorByTicker: z.record(z.string().trim().min(1)),
    windowsWon: z.number().int().nonnegative(),
    windowsTotal: z.number().int().positive(),
    complexityScore: z.number().nonnegative()
  })
  .superRefine((input, context) => {
    if (input.falsePositiveCount > input.evaluatedSelectionCount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["falsePositiveCount"],
        message:
          "falsePositiveCount nao pode exceder evaluatedSelectionCount"
      });
    }
    if (input.windowsWon > input.windowsTotal) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["windowsWon"],
        message: "windowsWon nao pode exceder windowsTotal"
      });
    }

    for (let index = 1; index < input.observations.length; index += 1) {
      const previous = input.observations[index - 1];
      const current = input.observations[index];
      if (previous && current && current.date <= previous.date) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["observations", index, "date"],
          message: "As observacoes devem estar em ordem cronologica estrita"
        });
      }
    }

    for (const ticker of Object.keys(input.aggregateIncomeByTicker)) {
      if (!input.sectorByTicker[ticker]) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["sectorByTicker", ticker],
          message: "Todo ticker com renda deve possuir setor"
        });
      }
    }
  });

export type GdeBacktestObservation = z.infer<
  typeof GdeBacktestObservationSchema
>;
export type GdeBacktestRunInput = z.infer<typeof GdeBacktestRunInputSchema>;
