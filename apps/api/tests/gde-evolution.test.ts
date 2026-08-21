import type {
  GdeBacktestMetrics,
  GdeExperimentContract
} from "@investai/shared";
import { describe, expect, it } from "vitest";
import { evaluateGdeChallenger } from "../src/modules/gde/gde-evolution.js";

const contract: GdeExperimentContract = {
  id: "gde-exp-001",
  createdAt: "2026-08-21T12:00:00.000Z",
  component: "scoring",
  problem: "Armadilhas de dividendos elevam falsos positivos.",
  hypothesis:
    "Aumentar a importância da cobertura por caixa reduzirá falsos positivos.",
  changeApplied:
    "Transferir cinco pontos do DY para segurança do dividendo.",
  expectedResult:
    "Reduzir falsos positivos sem comprometer o crescimento real da renda.",
  validationMetric: "CAGR da renda real e taxa de falsos positivos.",
  regressionRisk: "Selecionar empresas excessivamente caras.",
  validationWindow: "Cinco janelas walk-forward e carteira-sombra.",
  decisionCriteria:
    "Promover somente com objetivo primário e todos os guardrails aprovados.",
  status: "running"
};

const champion: GdeBacktestMetrics = {
  realIncomeCagr: 0.04,
  incomeDrawdown: 0.15,
  wealthDrawdown: 0.35,
  turnover: 0.12,
  falsePositiveRate: 0.2,
  incomeConcentrationHhi: 0.12,
  sectorConcentrationHhi: 0.18,
  windowsWon: 0,
  windowsTotal: 6,
  complexityScore: 1
};

function metrics(
  overrides: Partial<GdeBacktestMetrics>
): GdeBacktestMetrics {
  return { ...champion, ...overrides };
}

describe("GDE champion/challenger governance", () => {
  it("promotes only when the primary objective and all guardrails pass", () => {
    const evaluation = evaluateGdeChallenger(
      contract,
      champion,
      metrics({
        realIncomeCagr: 0.047,
        incomeDrawdown: 0.14,
        wealthDrawdown: 0.36,
        turnover: 0.18,
        falsePositiveRate: 0.17,
        incomeConcentrationHhi: 0.115,
        sectorConcentrationHhi: 0.175,
        windowsWon: 5,
        windowsTotal: 6,
        complexityScore: 2
      })
    );

    expect(evaluation.decision).toBe("promote");
    expect(evaluation.primaryCriterionPassed).toBe(true);
    expect(evaluation.checks.every((check) => check.passed)).toBe(true);
    expect(evaluation.regressionSignals).toEqual([]);
  });

  it("rolls back when income and risk deteriorate", () => {
    const evaluation = evaluateGdeChallenger(
      contract,
      champion,
      metrics({
        realIncomeCagr: 0.034,
        incomeDrawdown: 0.19,
        wealthDrawdown: 0.4,
        turnover: 0.25,
        falsePositiveRate: 0.24,
        incomeConcentrationHhi: 0.15,
        sectorConcentrationHhi: 0.21,
        windowsWon: 2,
        windowsTotal: 6,
        complexityScore: 3
      })
    );

    expect(evaluation.decision).toBe("rollback");
    expect(evaluation.regressionSignals).toContain(
      "renda_real_menor_e_drawdown_de_renda_maior"
    );
    expect(evaluation.regressionSignals).toContain(
      "drawdown_patrimonial_acima_do_limite"
    );
  });

  it("keeps an inconclusive challenger in observation", () => {
    const evaluation = evaluateGdeChallenger(
      contract,
      champion,
      metrics({
        realIncomeCagr: 0.043,
        windowsWon: 5,
        windowsTotal: 6
      })
    );

    expect(evaluation.decision).toBe("observe");
    expect(evaluation.primaryCriterionPassed).toBe(false);
    expect(evaluation.regressionSignals).toEqual([]);
  });

  it("maintains the champion when there is no material change", () => {
    const evaluation = evaluateGdeChallenger(
      contract,
      champion,
      metrics({
        windowsWon: 4,
        windowsTotal: 6
      })
    );

    expect(evaluation.decision).toBe("maintain");
    expect(evaluation.primaryCriterionPassed).toBe(false);
    expect(evaluation.regressionSignals).toEqual([]);
  });
});
