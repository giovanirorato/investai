import { describe, expect, it } from "vitest";
import {
  decideRecommendation,
  fallbackRecommendationText
} from "../src/modules/recommendations/recommendation-rules.js";

describe("recommendation rules", () => {
  it("returns buy for material upside with medium confidence", () => {
    expect(
      decideRecommendation({
        upsidePct: 0.18,
        confidenceLevel: "medium"
      })
    ).toBe("buy");
  });

  it("returns monitor for material upside with low confidence", () => {
    expect(
      decideRecommendation({
        upsidePct: 0.18,
        confidenceLevel: "low"
      })
    ).toBe("monitor");
  });

  it("returns monitor for neutral upside", () => {
    expect(
      decideRecommendation({
        upsidePct: 0.04,
        confidenceLevel: "high"
      })
    ).toBe("monitor");
  });

  it("returns avoid for negative upside or missing critical valuation", () => {
    expect(
      decideRecommendation({
        upsidePct: -0.08,
        confidenceLevel: "high"
      })
    ).toBe("avoid");
    expect(
      decideRecommendation({
        upsidePct: null,
        confidenceLevel: "low"
      })
    ).toBe("avoid");
  });

  it("builds fallback text without an LLM", () => {
    const text = fallbackRecommendationText(
      "monitor",
      "crescimento com risco moderado",
      "medium"
    );

    expect(text.summary).toContain("Monitorar");
    expect(text.nextAction.length).toBeGreaterThan(12);
  });
});
