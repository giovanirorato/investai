import type { GdeRules } from "@investai/shared";
import {
  DEFAULT_GDE_RULES,
  type GdeCandidateResult
} from "./gde-engine.js";

export type GdeHoldingAction =
  | "eligible_to_enter"
  | "do_not_enter"
  | "hold"
  | "observe"
  | "review_exit"
  | "urgent_review"
  | "data_review";

export type GdeHoldingReviewInput = {
  candidate: GdeCandidateResult;
  currentlyHeld: boolean;
  consecutiveFailedReviewsIncludingCurrent: number;
};

export type GdeHoldingReviewResult = {
  ticker: string;
  action: GdeHoldingAction;
  reasons: string[];
  entryThreshold: number;
  maintenanceThreshold: number;
  maintenanceRank: number;
};

const DATA_INTEGRITY_REASONS = new Set([
  "lookahead_financial_data",
  "lookahead_market_data",
  "insufficient_data_completeness",
  "insufficient_history"
]);

const URGENT_REVIEW_REASONS = new Set([
  "recovery_or_insolvency",
  "structural_negative_equity",
  "debt_funded_dividends",
  "capital_adequacy_failed",
  "solvency_failed",
  "cycle_solvency_not_confirmed",
  "material_governance_risk"
]);

function matchingReasons(
  reasons: string[],
  reference: Set<string>
): string[] {
  return reasons.filter((reason) => reference.has(reason));
}

export function reviewGdeHolding(
  input: GdeHoldingReviewInput,
  rules: GdeRules = DEFAULT_GDE_RULES
): GdeHoldingReviewResult {
  const allFilterReasons = [
    ...input.candidate.filter.rejectionReasons,
    ...input.candidate.filter.quarantineReasons
  ];
  const dataIntegrityReasons = matchingReasons(
    allFilterReasons,
    DATA_INTEGRITY_REASONS
  );
  const urgentReasons = matchingReasons(
    allFilterReasons,
    URGENT_REVIEW_REASONS
  );
  const base = {
    ticker: input.candidate.ticker,
    entryThreshold: rules.minimumEntryScore,
    maintenanceThreshold: rules.maintenanceScore,
    maintenanceRank: rules.maintenanceRank
  };

  if (dataIntegrityReasons.length > 0) {
    return {
      ...base,
      action: "data_review",
      reasons: dataIntegrityReasons
    };
  }

  if (!input.currentlyHeld) {
    if (urgentReasons.length > 0) {
      return {
        ...base,
        action: "do_not_enter",
        reasons: urgentReasons
      };
    }

    const insideEntryRank =
      input.candidate.rank !== null &&
      input.candidate.rank <= rules.targetHoldings;
    if (
      input.candidate.filter.status === "eligible" &&
      input.candidate.entryEligible &&
      insideEntryRank
    ) {
      return {
        ...base,
        action: "eligible_to_enter",
        reasons: ["entry_score_and_rank_approved"]
      };
    }

    return {
      ...base,
      action: "do_not_enter",
      reasons:
        allFilterReasons.length > 0
          ? allFilterReasons
          : ["entry_score_or_rank_not_approved"]
    };
  }

  if (urgentReasons.length > 0) {
    return {
      ...base,
      action: "urgent_review",
      reasons: urgentReasons
    };
  }

  if (input.candidate.filter.status !== "eligible") {
    return {
      ...base,
      action: "review_exit",
      reasons:
        allFilterReasons.length > 0
          ? allFilterReasons
          : ["filter_not_eligible"]
    };
  }

  if (input.candidate.score === null || input.candidate.rank === null) {
    return {
      ...base,
      action: "data_review",
      reasons: ["score_or_rank_unavailable"]
    };
  }

  const maintenanceApproved =
    input.candidate.score >= rules.maintenanceScore &&
    input.candidate.rank <= rules.maintenanceRank;
  if (maintenanceApproved) {
    return {
      ...base,
      action: "hold",
      reasons: ["maintenance_zone_approved"]
    };
  }

  if (input.consecutiveFailedReviewsIncludingCurrent >= 2) {
    return {
      ...base,
      action: "review_exit",
      reasons: ["maintenance_zone_failed_twice"]
    };
  }

  return {
    ...base,
    action: "observe",
    reasons: ["first_maintenance_zone_failure"]
  };
}
