import type {
  GdeBacktestMetrics,
  GdeEvolutionDecision,
  GdeExperimentContract
} from "@investai/shared";

export type GdeEvaluationPolicy = {
  minimumRealIncomeCagrGain: number;
  incomeCagrTolerance: number;
  minimumIncomeDrawdownReduction: number;
  maximumWealthDrawdownRegression: number;
  maximumTurnoverIncrease: number;
  minimumWindowWinRate: number;
  maximumIncomeConcentrationRegression: number;
  maximumSectorConcentrationRegression: number;
  maximumFalsePositiveRateRegression: number;
  maximumComplexityIncreaseWithoutBenefit: number;
};

export const DEFAULT_GDE_EVALUATION_POLICY: GdeEvaluationPolicy = {
  minimumRealIncomeCagrGain: 0.005,
  incomeCagrTolerance: 0.001,
  minimumIncomeDrawdownReduction: 0.02,
  maximumWealthDrawdownRegression: 0.03,
  maximumTurnoverIncrease: 0.1,
  minimumWindowWinRate: 2 / 3,
  maximumIncomeConcentrationRegression: 0.01,
  maximumSectorConcentrationRegression: 0.01,
  maximumFalsePositiveRateRegression: 0.02,
  maximumComplexityIncreaseWithoutBenefit: 0
};

export type GdeEvaluationCheck = {
  name: string;
  passed: boolean;
  championValue: number;
  challengerValue: number;
  threshold: number;
  rationale: string;
};

export type GdeChallengerEvaluation = {
  experimentId: string;
  component: GdeExperimentContract["component"];
  decision: GdeEvolutionDecision;
  primaryCriterionPassed: boolean;
  windowWinRate: number;
  checks: GdeEvaluationCheck[];
  regressionSignals: string[];
  deltas: {
    realIncomeCagr: number;
    incomeDrawdown: number;
    wealthDrawdown: number;
    turnover: number;
    falsePositiveRate: number;
    incomeConcentrationHhi: number;
    sectorConcentrationHhi: number;
    complexityScore: number;
  };
  summary: string;
};

const round = (value: number, digits = 6) => {
  const multiplier = 10 ** digits;
  return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
};

function checkMaximum(
  name: string,
  championValue: number,
  challengerValue: number,
  maximumRegression: number,
  rationale: string
): GdeEvaluationCheck {
  return {
    name,
    passed: challengerValue <= championValue + maximumRegression,
    championValue,
    challengerValue,
    threshold: championValue + maximumRegression,
    rationale
  };
}

export function evaluateGdeChallenger(
  contract: GdeExperimentContract,
  champion: GdeBacktestMetrics,
  challenger: GdeBacktestMetrics,
  policy: GdeEvaluationPolicy = DEFAULT_GDE_EVALUATION_POLICY
): GdeChallengerEvaluation {
  const realIncomeCagrDelta =
    challenger.realIncomeCagr - champion.realIncomeCagr;
  const incomeDrawdownDelta =
    challenger.incomeDrawdown - champion.incomeDrawdown;
  const wealthDrawdownDelta =
    challenger.wealthDrawdown - champion.wealthDrawdown;
  const turnoverDelta = challenger.turnover - champion.turnover;
  const falsePositiveRateDelta =
    challenger.falsePositiveRate - champion.falsePositiveRate;
  const incomeConcentrationDelta =
    challenger.incomeConcentrationHhi - champion.incomeConcentrationHhi;
  const sectorConcentrationDelta =
    challenger.sectorConcentrationHhi - champion.sectorConcentrationHhi;
  const complexityDelta =
    challenger.complexityScore - champion.complexityScore;
  const windowWinRate =
    challenger.windowsTotal > 0
      ? challenger.windowsWon / challenger.windowsTotal
      : 0;

  const incomeGrowthPass =
    realIncomeCagrDelta >= policy.minimumRealIncomeCagrGain;
  const riskReductionPass =
    challenger.realIncomeCagr >=
      champion.realIncomeCagr - policy.incomeCagrTolerance &&
    -incomeDrawdownDelta >= policy.minimumIncomeDrawdownReduction;
  const primaryCriterionPassed = incomeGrowthPass || riskReductionPass;
  const measurableBenefit =
    realIncomeCagrDelta > policy.incomeCagrTolerance ||
    -incomeDrawdownDelta >= policy.minimumIncomeDrawdownReduction;

  const checks: GdeEvaluationCheck[] = [
    {
      name: "primary_objective",
      passed: primaryCriterionPassed,
      championValue: champion.realIncomeCagr,
      challengerValue: challenger.realIncomeCagr,
      threshold: incomeGrowthPass
        ? champion.realIncomeCagr + policy.minimumRealIncomeCagrGain
        : champion.realIncomeCagr - policy.incomeCagrTolerance,
      rationale:
        "Aumentar o CAGR da renda real ou reduzir materialmente o drawdown da renda sem sacrificar crescimento."
    },
    {
      name: "walk_forward_consistency",
      passed: windowWinRate >= policy.minimumWindowWinRate,
      championValue: 0,
      challengerValue: windowWinRate,
      threshold: policy.minimumWindowWinRate,
      rationale:
        "O challenger deve vencer ou empatar na maioria qualificada das janelas fora da amostra."
    },
    checkMaximum(
      "wealth_drawdown_guardrail",
      champion.wealthDrawdown,
      challenger.wealthDrawdown,
      policy.maximumWealthDrawdownRegression,
      "O drawdown patrimonial nao pode piorar alem da tolerancia definida."
    ),
    checkMaximum(
      "turnover_guardrail",
      champion.turnover,
      challenger.turnover,
      policy.maximumTurnoverIncrease,
      "Giro adicional exige beneficio liquido comprovado."
    ),
    checkMaximum(
      "false_positive_guardrail",
      champion.falsePositiveRate,
      challenger.falsePositiveRate,
      policy.maximumFalsePositiveRateRegression,
      "A mudanca nao pode elevar materialmente armadilhas de dividendos."
    ),
    checkMaximum(
      "income_concentration_guardrail",
      champion.incomeConcentrationHhi,
      challenger.incomeConcentrationHhi,
      policy.maximumIncomeConcentrationRegression,
      "A renda projetada nao pode ficar materialmente mais dependente de poucos pagadores."
    ),
    checkMaximum(
      "sector_concentration_guardrail",
      champion.sectorConcentrationHhi,
      challenger.sectorConcentrationHhi,
      policy.maximumSectorConcentrationRegression,
      "A mudanca nao pode aumentar materialmente a concentracao setorial."
    ),
    {
      name: "complexity_guardrail",
      passed:
        complexityDelta <= policy.maximumComplexityIncreaseWithoutBenefit ||
        measurableBenefit,
      championValue: champion.complexityScore,
      challengerValue: challenger.complexityScore,
      threshold:
        champion.complexityScore +
        policy.maximumComplexityIncreaseWithoutBenefit,
      rationale:
        "Complexidade adicional so e aceita quando melhora renda, risco ou previsibilidade de modo mensuravel."
    }
  ];

  const regressionSignals: string[] = [];
  if (
    realIncomeCagrDelta < -policy.incomeCagrTolerance &&
    incomeDrawdownDelta > 0
  ) {
    regressionSignals.push("renda_real_menor_e_drawdown_de_renda_maior");
  }
  if (wealthDrawdownDelta > policy.maximumWealthDrawdownRegression) {
    regressionSignals.push("drawdown_patrimonial_acima_do_limite");
  }
  if (
    turnoverDelta > policy.maximumTurnoverIncrease &&
    !measurableBenefit
  ) {
    regressionSignals.push("giro_maior_sem_beneficio_mensuravel");
  }
  if (
    falsePositiveRateDelta >
    policy.maximumFalsePositiveRateRegression
  ) {
    regressionSignals.push("taxa_de_falsos_positivos_maior");
  }
  if (
    incomeConcentrationDelta >
    policy.maximumIncomeConcentrationRegression
  ) {
    regressionSignals.push("concentracao_de_renda_maior");
  }
  if (
    sectorConcentrationDelta >
    policy.maximumSectorConcentrationRegression
  ) {
    regressionSignals.push("concentracao_setorial_maior");
  }
  if (
    complexityDelta > policy.maximumComplexityIncreaseWithoutBenefit &&
    !measurableBenefit
  ) {
    regressionSignals.push("complexidade_maior_sem_beneficio_mensuravel");
  }

  const allChecksPassed = checks.every((check) => check.passed);
  let decision: GdeEvolutionDecision;

  if (primaryCriterionPassed && allChecksPassed) {
    decision = "promote";
  } else if (regressionSignals.length > 0) {
    decision = "rollback";
  } else if (
    Math.abs(realIncomeCagrDelta) <= policy.incomeCagrTolerance &&
    Math.abs(incomeDrawdownDelta) < policy.minimumIncomeDrawdownReduction
  ) {
    decision = "maintain";
  } else {
    decision = "observe";
  }

  const summaryByDecision: Record<GdeEvolutionDecision, string> = {
    promote:
      "Promover o challenger: o objetivo primario e todos os guardrails foram atendidos.",
    observe:
      "Manter o challenger somente em carteira-sombra: ha sinal parcial, mas a evidencia ainda nao autoriza promocao.",
    rollback:
      "Reverter a alteracao: foi detectada regressao incompativel com o contrato da estrategia.",
    maintain:
      "Manter o champion atual: o challenger nao apresentou melhoria material nem regressao relevante."
  };

  return {
    experimentId: contract.id,
    component: contract.component,
    decision,
    primaryCriterionPassed,
    windowWinRate: round(windowWinRate),
    checks,
    regressionSignals,
    deltas: {
      realIncomeCagr: round(realIncomeCagrDelta),
      incomeDrawdown: round(incomeDrawdownDelta),
      wealthDrawdown: round(wealthDrawdownDelta),
      turnover: round(turnoverDelta),
      falsePositiveRate: round(falsePositiveRateDelta),
      incomeConcentrationHhi: round(incomeConcentrationDelta),
      sectorConcentrationHhi: round(sectorConcentrationDelta),
      complexityScore: round(complexityDelta)
    },
    summary: summaryByDecision[decision]
  };
}
