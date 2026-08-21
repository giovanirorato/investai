import type { GdePortfolioSnapshot } from "@investai/shared";
import { describe, expect, it } from "vitest";
import { auditGdePortfolioSnapshot } from "../src/modules/gde/gde-snapshot-audit.js";

function snapshot(
  overrides: Partial<GdePortfolioSnapshot> = {}
): GdePortfolioSnapshot {
  return {
    id: "snapshot-2026-04-19",
    observedAt: "2026-04-19T09:58:32.000-03:00",
    importedAt: "2026-08-21T12:00:00.000Z",
    sourceFile: "posicao-2026-04-19-09-58-32.xlsx",
    sourceSha256: null,
    positions: [
      {
        symbol: "AAAA3",
        assetClass: "equity_br",
        quantity: 100,
        averagePrice: 9,
        marketPrice: 10,
        marketValue: null,
        sourceRow: 2
      },
      {
        symbol: "BBBB3",
        assetClass: "equity_br",
        quantity: 50,
        averagePrice: 18,
        marketPrice: null,
        marketValue: 1_000,
        sourceRow: 3
      }
    ],
    importWarnings: [],
    declaredTotalMarketValue: 2_000,
    ...overrides
  };
}

describe("GDE snapshot audit", () => {
  it("reconciles explicit and inferred market values", () => {
    const audit = auditGdePortfolioSnapshot(snapshot());

    expect(audit.status).toBe("valid");
    expect(audit.totalMarketValue).toBe(2_000);
    expect(audit.dataCompleteness).toBe(1);
    expect(audit.reconciliationDifference).toBe(0);
    expect(audit.warnings).toEqual([]);
  });

  it("surfaces duplicate rows and missing values without inventing data", () => {
    const audit = auditGdePortfolioSnapshot(
      snapshot({
        positions: [
          {
            symbol: "AAAA3",
            assetClass: "equity_br",
            quantity: 100,
            averagePrice: 9,
            marketPrice: 10,
            marketValue: null,
            sourceRow: 2
          },
          {
            symbol: "AAAA3",
            assetClass: "equity_br",
            quantity: 50,
            averagePrice: null,
            marketPrice: null,
            marketValue: null,
            sourceRow: 3
          }
        ],
        declaredTotalMarketValue: 1_500
      })
    );

    expect(audit.status).toBe("partial");
    expect(audit.duplicateSymbols).toEqual(["AAAA3"]);
    expect(audit.missingMarketValueSymbols).toEqual(["AAAA3"]);
    expect(audit.warnings).toContain("duplicate_symbol:AAAA3");
    expect(audit.warnings).toContain("missing_market_value:AAAA3");
    expect(audit.warnings).toContain("declared_total_mismatch");
    expect(audit.totalMarketValue).toBe(1_000);
  });

  it("marks a snapshot invalid when no position can be valued", () => {
    const audit = auditGdePortfolioSnapshot(
      snapshot({
        positions: [
          {
            symbol: "AAAA3",
            assetClass: "equity_br",
            quantity: 100,
            averagePrice: 9,
            marketPrice: null,
            marketValue: null,
            sourceRow: 2
          }
        ],
        declaredTotalMarketValue: null
      })
    );

    expect(audit.status).toBe("invalid");
    expect(audit.totalMarketValue).toBe(0);
    expect(audit.missingMarketValueSymbols).toEqual(["AAAA3"]);
  });
});
