import { COMPARISON_MONTHS } from './format';

export interface CrossoverResult {
  /** Crossover time in fractional years from t = 0. */
  years: number;
  /** Crossover time in whole months (fractional). */
  months: number;
  /** Cumulative cost at crossover (both methods are equal). */
  cost: number;
}

/**
 * Solve machine_A + dailyA * 365 * Y = machine_B + dailyB * 365 * Y for Y.
 * Returns null when lines are parallel or crossover falls outside [0, horizon].
 */
export function crossoverBetweenMethods(
  machineCostA: number,
  dailyOngoingA: number,
  machineCostB: number,
  dailyOngoingB: number,
  horizonMonths: number = COMPARISON_MONTHS,
): CrossoverResult | null {
  const dailyDiff = dailyOngoingA - dailyOngoingB;
  if (dailyDiff === 0) {
    return null;
  }

  const crossoverYears =
    (machineCostB - machineCostA) / (365 * dailyDiff);

  if (!Number.isFinite(crossoverYears) || crossoverYears < 0) {
    return null;
  }

  const crossoverMonths = crossoverYears * 12;
  const horizonYears = horizonMonths / 12;

  if (crossoverMonths > horizonMonths) {
    return null;
  }

  const cost =
    machineCostA + dailyOngoingA * 365 * crossoverYears;

  return {
    years: crossoverYears,
    months: crossoverMonths,
    cost,
  };
}

export function isWithinChartHorizon(
  years: number,
  horizonMonths: number = COMPARISON_MONTHS,
): boolean {
  return years >= 0 && years <= horizonMonths / 12;
}
