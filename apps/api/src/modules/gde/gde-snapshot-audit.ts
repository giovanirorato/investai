import type {
  GdePortfolioSnapshot,
  GdeSnapshotAudit,
  GdeSnapshotPosition
} from "@investai/shared";

export type GdeSnapshotAuditPolicy = {
  declaredTotalTolerancePct: number;
  declaredTotalToleranceAbsolute: number;
  marketValueCoverageWeight: number;
  averagePriceCoverageWeight: number;
};

export const DEFAULT_GDE_SNAPSHOT_AUDIT_POLICY: GdeSnapshotAuditPolicy = {
  declaredTotalTolerancePct: 0.005,
  declaredTotalToleranceAbsolute: 1,
  marketValueCoverageWeight: 0.7,
  averagePriceCoverageWeight: 0.3
};

const round = (value: number, digits = 4) => {
  const multiplier = 10 ** digits;
  return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
};

function resolvedMarketValue(position: GdeSnapshotPosition): number | null {
  if (position.marketValue !== null) {
    return position.marketValue;
  }
  if (position.marketPrice !== null) {
    return position.quantity * position.marketPrice;
  }
  return null;
}

function duplicateSymbols(positions: GdeSnapshotPosition[]): string[] {
  const counts = new Map<string, number>();
  for (const position of positions) {
    counts.set(position.symbol, (counts.get(position.symbol) ?? 0) + 1);
  }

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([symbol]) => symbol)
    .sort();
}

export function auditGdePortfolioSnapshot(
  snapshot: GdePortfolioSnapshot,
  policy: GdeSnapshotAuditPolicy = DEFAULT_GDE_SNAPSHOT_AUDIT_POLICY
): GdeSnapshotAudit {
  const resolvedValues = snapshot.positions.map(resolvedMarketValue);
  const missingMarketValueSymbols = snapshot.positions
    .filter((_, index) => resolvedValues[index] === null)
    .map((position) => position.symbol)
    .sort();
  const valuedPositionCount = resolvedValues.filter(
    (value): value is number => value !== null
  ).length;
  const averagePriceCount = snapshot.positions.filter(
    (position) => position.averagePrice !== null
  ).length;
  const totalMarketValue = resolvedValues.reduce<number>(
    (total, value) => total + (value ?? 0),
    0
  );
  const marketValueCoverage = valuedPositionCount / snapshot.positions.length;
  const averagePriceCoverage = averagePriceCount / snapshot.positions.length;
  const dataCompleteness =
    marketValueCoverage * policy.marketValueCoverageWeight +
    averagePriceCoverage * policy.averagePriceCoverageWeight;
  const duplicates = duplicateSymbols(snapshot.positions);
  const reconciliationDifference =
    snapshot.declaredTotalMarketValue === null
      ? null
      : totalMarketValue - snapshot.declaredTotalMarketValue;
  const warnings = [...snapshot.importWarnings];

  for (const symbol of duplicates) {
    warnings.push(`duplicate_symbol:${symbol}`);
  }
  for (const symbol of missingMarketValueSymbols) {
    warnings.push(`missing_market_value:${symbol}`);
  }

  if (
    reconciliationDifference !== null &&
    snapshot.declaredTotalMarketValue !== null
  ) {
    const tolerance = Math.max(
      policy.declaredTotalToleranceAbsolute,
      snapshot.declaredTotalMarketValue * policy.declaredTotalTolerancePct
    );
    if (Math.abs(reconciliationDifference) > tolerance) {
      warnings.push("declared_total_mismatch");
    }
  }

  let status: GdeSnapshotAudit["status"] = "valid";
  if (valuedPositionCount === 0 || totalMarketValue <= 0) {
    status = "invalid";
  } else if (warnings.length > 0 || dataCompleteness < 1) {
    status = "partial";
  }

  return {
    snapshotId: snapshot.id,
    status,
    positionCount: snapshot.positions.length,
    totalMarketValue: round(totalMarketValue, 2),
    dataCompleteness: round(dataCompleteness, 4),
    duplicateSymbols: duplicates,
    missingMarketValueSymbols,
    reconciliationDifference:
      reconciliationDifference === null
        ? null
        : round(reconciliationDifference, 2),
    warnings
  };
}
