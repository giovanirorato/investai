import { describe, expect, it } from "vitest";
import {
  type GdeCandidateResult
} from "../src/modules/gde/gde-engine.js";
import { reviewGdeHolding } from "../src/modules/gde/gde-holding-review.js";

function candidate(
  overrides: Partial<GdeCandidateResult> = {}
): GdeCandidateResult {
  return {
    ticker: "QUAL3",
    sector: "Industrials",
    model: "non_financial",
    asOfDate: "2026-04-19",
    filter: {
      status: "eligible",
      rejectionReasons: [],
      quarantineReasons: [],
      liquidityFloor: 2_000_000
    },
    normalizedDividend: {
      sustainableDpsGross: 1,
      sustainableDpsNet: 1,
      normalizedDividendYieldGross: 0.05,
      normalizedDividendYieldNet: 0.05,
      bindingConstraint: "recurring_dividend"
    },
    comparisonGroup: "sector:Industrials",
    blockScores: {
      dividendSafety: 30,
      businessQuality: 22,
      persistenceGrowth: 17,
      valuation: 12,
      liquidityMarket: 4
    },
    score: 85,
    metricCoverage: 1,
    rank: 5,
    entryEligible: true,
    ...overrides
  };
}

describe("GDE entry and holding review", () => {
  it("approves a new position only inside the entry score and rank zone", () => {
    const result = reviewGdeHolding({
      candidate: candidate(),
      currentlyHeld: false,
      consecutiveFailedReviewsIncludingCurrent: 0
    });

    expect(result.action).toBe("eligible_to_enter");
    expect(result.reasons).toEqual(["entry_score_and_rank_approved"]);
  });

  it("does not approve a new position outside the target rank", () => {
    const result = reviewGdeHolding({
      candidate: candidate({ rank: 20 }),
      currentlyHeld: false,
      consecutiveFailedReviewsIncludingCurrent: 0
    });

    expect(result.action).toBe("do_not_enter");
    expect(result.reasons).toEqual(["entry_score_or_rank_not_approved"]);
  });

  it("holds an existing position inside the wider maintenance zone", () => {
    const result = reviewGdeHolding({
      candidate: candidate({ score: 60, rank: 24, entryEligible: false }),
      currentlyHeld: true,
      consecutiveFailedReviewsIncludingCurrent: 0
    });

    expect(result.action).toBe("hold");
    expect(result.reasons).toEqual(["maintenance_zone_approved"]);
  });

  it("observes the first maintenance failure and reviews exit after the second", () => {
    const weakCandidate = candidate({
      score: 50,
      rank: 35,
      entryEligible: false
    });

    const firstReview = reviewGdeHolding({
      candidate: weakCandidate,
      currentlyHeld: true,
      consecutiveFailedReviewsIncludingCurrent: 1
    });
    const secondReview = reviewGdeHolding({
      candidate: weakCandidate,
      currentlyHeld: true,
      consecutiveFailedReviewsIncludingCurrent: 2
    });

    expect(firstReview.action).toBe("observe");
    expect(firstReview.reasons).toEqual(["first_maintenance_zone_failure"]);
    expect(secondReview.action).toBe("review_exit");
    expect(secondReview.reasons).toEqual([
      "maintenance_zone_failed_twice"
    ]);
  });

  it("opens an urgent review for a held company with an insolvency signal", () => {
    const result = reviewGdeHolding({
      candidate: candidate({
        filter: {
          status: "rejected",
          rejectionReasons: ["recovery_or_insolvency"],
          quarantineReasons: [],
          liquidityFloor: 2_000_000
        },
        score: null,
        rank: null,
        entryEligible: false
      }),
      currentlyHeld: true,
      consecutiveFailedReviewsIncludingCurrent: 1
    });

    expect(result.action).toBe("urgent_review");
    expect(result.reasons).toEqual(["recovery_or_insolvency"]);
  });

  it("blocks a new entry instead of issuing an exit action for an urgent signal", () => {
    const result = reviewGdeHolding({
      candidate: candidate({
        filter: {
          status: "rejected",
          rejectionReasons: ["debt_funded_dividends"],
          quarantineReasons: [],
          liquidityFloor: 2_000_000
        },
        score: null,
        rank: null,
        entryEligible: false
      }),
      currentlyHeld: false,
      consecutiveFailedReviewsIncludingCurrent: 0
    });

    expect(result.action).toBe("do_not_enter");
    expect(result.reasons).toEqual(["debt_funded_dividends"]);
  });

  it("routes look-ahead evidence to data review instead of an investment decision", () => {
    const result = reviewGdeHolding({
      candidate: candidate({
        filter: {
          status: "rejected",
          rejectionReasons: ["lookahead_financial_data"],
          quarantineReasons: [],
          liquidityFloor: 2_000_000
        },
        score: null,
        rank: null,
        entryEligible: false
      }),
      currentlyHeld: true,
      consecutiveFailedReviewsIncludingCurrent: 1
    });

    expect(result.action).toBe("data_review");
    expect(result.reasons).toEqual(["lookahead_financial_data"]);
  });
});
