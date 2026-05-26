import { describe, expect, it } from "vitest";
import type { FinancialSnapshot } from "@investai/shared";
import { calculateValuation } from "../src/modules/valuation/valuation.js";

const completeSnapshot: FinancialSnapshot = {
  referenceDate: "2026-03-31T00:00:00.000Z",
  currentPrice: 28.5,
  earningsPerShare: 4.06,
  peRatio: 7.02,
  revenue: 380000000000,
  ebitda: 0,
  netIncome: 35000000000,
  debt: 0,
  source: "seed-local"
};

describe("calculateValuation", () => {
  it("returns completed valuation when price and EPS are present", () => {
    const valuation = calculateValuation({
      sector: "Financeiro",
      snapshot: completeSnapshot
    });

    expect(valuation.status).toBe("completed");
    expect(valuation.targetPeRatio).toBe(8);
    expect(valuation.fairPrice).toBe(32.48);
    expect(valuation.upsidePct).toBe(0.1396);
    expect(valuation.confidenceLevel).toBe("medium");
  });

  it("returns partial valuation when current price is missing", () => {
    const valuation = calculateValuation({
      sector: "Financeiro",
      snapshot: {
        ...completeSnapshot,
        currentPrice: null
      }
    });

    expect(valuation.status).toBe("partial");
    expect(valuation.confidenceLevel).toBe("low");
    expect(valuation.fairPrice).toBeNull();
    expect(valuation.upsidePct).toBeNull();
  });

  it("returns partial valuation when EPS is missing", () => {
    const valuation = calculateValuation({
      sector: "Financeiro",
      snapshot: {
        ...completeSnapshot,
        earningsPerShare: null
      }
    });

    expect(valuation.status).toBe("partial");
    expect(valuation.fairPrice).toBeNull();
    expect(valuation.upsidePct).toBeNull();
  });
});
