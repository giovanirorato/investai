import type {
  GdeBacktestMetrics,
  GdeBacktestObservation,
  GdeBacktestRunInput
} from "@investai/shared";

export type GdeBacktestSeriesPoint = {
  date: string;
  value: number;
};

export type GdeBacktestCalculation = {
  metrics: GdeBacktestMetrics;
  realIncomeTtmSeries: GdeBacktestSeriesPoint[];
  realPortfolioValueSeries: GdeBacktestSeriesPoint[];
  warnings: string[];
};

const round = (value: number, digits = 6) => {
  const multiplier = 10 ** digits;
  return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
};

function monthDistance(firstDate: string, lastDate: string): number {
  const [firstYear = 0, firstMonth = 1] = firstDate
    .split("-")
    .map((value) => Number(value));
  const [lastYear = 0, lastMonth = 1] = lastDate
    .split("-")
    .map((value) => Number(value));

  return (lastYear - firstYear) * 12 + (lastMonth - firstMonth);
}

function maximumDrawdown(values: number[]): number {
  let peak = 0;
  let maximum = 0;

  for (const value of values) {
    if (value > peak) {
      peak = value;
    }
    if (peak > 0) {
      maximum = Math.max(maximum, (peak - value) / peak);
    }
  }

  return maximum;
}

function calculateHhi(values: Record<string, number>): number {
  const total = Object.values(values).reduce(
    (sum, value) => sum + Math.max(0, value),
    0
  );
  if (total <= 0) {
    return 0;
  }

  return Object.values(values).reduce((hhi, value) => {
    const share = Math.max(0, value) / total;
    return hhi + share ** 2;
  }, 0);
}

function aggregateIncomeBySector(
  incomeByTicker: Record<string, number>,
  sectorByTicker: Record<string, string>
): Record<string, number> {
  const incomeBySector: Record<string, number> = {};

  for (const [ticker, income] of Object.entries(incomeByTicker)) {
    const sector = sectorByTicker[ticker];
    if (!sector) {
      continue;
    }
    incomeBySector[sector] = (incomeBySector[sector] ?? 0) + income;
  }

  return incomeBySector;
}

function buildRealIncomeTtmSeries(
  observations: GdeBacktestObservation[]
): GdeBacktestSeriesPoint[] {
  const realMonthlyIncome = observations.map(
    (observation) => observation.netDividendIncome / observation.cpiIndex
  );
  const series: GdeBacktestSeriesPoint[] = [];

  for (let endIndex = 11; endIndex < observations.length; endIndex += 1) {
    let trailingIncome = 0;
    for (let index = endIndex - 11; index <= endIndex; index += 1) {
      trailingIncome += realMonthlyIncome[index] ?? 0;
    }

    const observation = observations[endIndex];
    if (observation) {
      series.push({
        date: observation.date,
        value: round(trailingIncome)
      });
    }
  }

  return series;
}

function buildRealPortfolioSeries(
  observations: GdeBacktestObservation[]
): GdeBacktestSeriesPoint[] {
  return observations.map((observation) => ({
    date: observation.date,
    value: round(observation.portfolioMarketValue / observation.cpiIndex)
  }));
}

function calculateRealIncomeCagr(
  series: GdeBacktestSeriesPoint[],
  warnings: string[]
): number {
  const first = series[0];
  const last = series[series.length - 1];
  if (!first || !last || first.value <= 0 || last.value <= 0) {
    warnings.push("real_income_cagr_unavailable");
    return 0;
  }

  const months = monthDistance(first.date, last.date);
  if (months <= 0) {
    warnings.push("real_income_cagr_insufficient_horizon");
    return 0;
  }

  return (last.value / first.value) ** (12 / months) - 1;
}

function calculateAnnualizedTurnover(
  observations: GdeBacktestObservation[],
  realPortfolioSeries: GdeBacktestSeriesPoint[],
  warnings: string[]
): number {
  const averageRealPortfolioValue =
    realPortfolioSeries.reduce((sum, point) => sum + point.value, 0) /
    realPortfolioSeries.length;
  if (averageRealPortfolioValue <= 0) {
    warnings.push("turnover_unavailable_without_portfolio_value");
    return 0;
  }

  const totalRealTradedNotional = observations.reduce(
    (sum, observation) =>
      sum + observation.tradedNotional / observation.cpiIndex,
    0
  );
  const rawTurnover = totalRealTradedNotional / averageRealPortfolioValue;

  return rawTurnover * (12 / observations.length);
}

export function calculateGdeBacktestMetrics(
  input: GdeBacktestRunInput
): GdeBacktestCalculation {
  const warnings: string[] = [];
  const observations = [...input.observations].sort((left, right) =>
    left.date.localeCompare(right.date)
  );
  const realIncomeTtmSeries = buildRealIncomeTtmSeries(observations);
  const realPortfolioValueSeries = buildRealPortfolioSeries(observations);
  const realIncomeCagr = calculateRealIncomeCagr(
    realIncomeTtmSeries,
    warnings
  );
  const incomeDrawdown = maximumDrawdown(
    realIncomeTtmSeries.map((point) => point.value)
  );
  const wealthDrawdown = maximumDrawdown(
    realPortfolioValueSeries.map((point) => point.value)
  );
  const turnover = calculateAnnualizedTurnover(
    observations,
    realPortfolioValueSeries,
    warnings
  );
  const falsePositiveRate =
    input.evaluatedSelectionCount > 0
      ? input.falsePositiveCount / input.evaluatedSelectionCount
      : 0;
  if (input.evaluatedSelectionCount === 0) {
    warnings.push("false_positive_rate_unavailable");
  }

  const incomeConcentrationHhi = calculateHhi(
    input.aggregateIncomeByTicker
  );
  const sectorConcentrationHhi = calculateHhi(
    aggregateIncomeBySector(
      input.aggregateIncomeByTicker,
      input.sectorByTicker
    )
  );
  if (Object.values(input.aggregateIncomeByTicker).every((value) => value <= 0)) {
    warnings.push("income_concentration_unavailable");
  }

  return {
    metrics: {
      realIncomeCagr: round(realIncomeCagr),
      incomeDrawdown: round(incomeDrawdown),
      wealthDrawdown: round(wealthDrawdown),
      turnover: round(turnover),
      falsePositiveRate: round(falsePositiveRate),
      incomeConcentrationHhi: round(incomeConcentrationHhi),
      sectorConcentrationHhi: round(sectorConcentrationHhi),
      windowsWon: input.windowsWon,
      windowsTotal: input.windowsTotal,
      complexityScore: input.complexityScore
    },
    realIncomeTtmSeries,
    realPortfolioValueSeries,
    warnings
  };
}
