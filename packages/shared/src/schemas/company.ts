import { z } from "zod";

export const CompanySummarySchema = z.object({
  id: z.string(),
  ticker: z.string(),
  name: z.string(),
  sector: z.string(),
  market: z.string()
});

export type CompanySummary = z.infer<typeof CompanySummarySchema>;
