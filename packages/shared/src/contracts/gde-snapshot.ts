import { z } from "zod";

export const GdeAssetClassSchema = z.enum([
  "equity_br",
  "fii",
  "fixed_income",
  "international",
  "crypto_alternatives",
  "cash",
  "other"
]);

export const GdeSnapshotPositionSchema = z.object({
  symbol: z.string().trim().min(1).transform((value) => value.toUpperCase()),
  assetClass: GdeAssetClassSchema,
  quantity: z.number().nonnegative(),
  averagePrice: z.number().nonnegative().nullable(),
  marketPrice: z.number().nonnegative().nullable(),
  marketValue: z.number().nonnegative().nullable(),
  sourceRow: z.number().int().positive(),
  rawLabel: z.string().trim().min(1).nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional()
});

export const GdePortfolioSnapshotSchema = z.object({
  id: z.string().trim().min(1),
  observedAt: z.string().datetime(),
  importedAt: z.string().datetime(),
  sourceFile: z.string().trim().min(1),
  sourceSha256: z
    .string()
    .regex(/^[a-f0-9]{64}$/)
    .nullable(),
  positions: z.array(GdeSnapshotPositionSchema).min(1),
  importWarnings: z.array(z.string()),
  declaredTotalMarketValue: z.number().nonnegative().nullable()
});

export const GdeSnapshotAuditStatusSchema = z.enum([
  "valid",
  "partial",
  "invalid"
]);

export const GdeSnapshotAuditSchema = z.object({
  snapshotId: z.string(),
  status: GdeSnapshotAuditStatusSchema,
  positionCount: z.number().int().nonnegative(),
  totalMarketValue: z.number().nonnegative(),
  dataCompleteness: z.number().min(0).max(1),
  duplicateSymbols: z.array(z.string()),
  missingMarketValueSymbols: z.array(z.string()),
  reconciliationDifference: z.number().nullable(),
  warnings: z.array(z.string())
});

export type GdeAssetClass = z.infer<typeof GdeAssetClassSchema>;
export type GdeSnapshotPosition = z.infer<typeof GdeSnapshotPositionSchema>;
export type GdePortfolioSnapshot = z.infer<typeof GdePortfolioSnapshotSchema>;
export type GdeSnapshotAuditStatus = z.infer<
  typeof GdeSnapshotAuditStatusSchema
>;
export type GdeSnapshotAudit = z.infer<typeof GdeSnapshotAuditSchema>;
