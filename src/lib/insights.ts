import { METHODS, type MethodId, type ShopPeriod } from '../data/methods';
import {
  COMPARISON_MONTHS,
  dailyOngoing,
  periodBreakdown,
  type CalculatorInputs,
  type PeriodBreakdown,
} from './brewing-cost';
import { crossoverBetweenMethods } from './crossover';
import { formatUsd } from './format';

export interface MethodResult {
  methodId: MethodId;
  label: string;
  breakdown: PeriodBreakdown;
  rank: number;
}

export interface CrossoverInsight {
  upfrontCheaperId: MethodId;
  longTermCheaperId: MethodId;
  upfrontCheaperLabel: string;
  longTermCheaperLabel: string;
  years: number;
  months: number;
  cost: number;
  endSavings: number;
  fewerShopDrinksPerMonth: number;
}

export interface HeroInsight {
  variant: 'crossover' | 'savings';
  crossover: CrossoverInsight | null;
  cheapest: MethodResult;
  mostExpensive: MethodResult;
  totalSavings: number;
  annualSavings: number;
  shopSavings: number;
}

function shopDrinksPerMonth(shopDrinks: number, shopPeriod: ShopPeriod): number {
  return shopPeriod === 'month' ? shopDrinks : (shopDrinks * 52) / 12;
}

export function formatYearApprox(years: number): string {
  const rounded = Math.round(years * 10) / 10;
  if (rounded === 1) {
    return '~1 year';
  }
  return `~${rounded} years`;
}

export function buildMethodResults(
  methodIds: MethodId[],
  inputs: CalculatorInputs,
  months: number = COMPARISON_MONTHS,
): MethodResult[] {
  const results = methodIds.map((methodId) => ({
    methodId,
    label: METHODS[methodId].label,
    breakdown: periodBreakdown(methodId, inputs, months),
    rank: 0,
  }));

  const ranked = [...results].sort((a, b) => a.breakdown.total - b.breakdown.total);
  ranked.forEach((result, index) => {
    result.rank = index + 1;
  });

  return results.map((result) => ({
    ...result,
    rank: ranked.find((r) => r.methodId === result.methodId)!.rank,
  }));
}

export function findPrimaryCrossover(
  methodIds: MethodId[],
  inputs: CalculatorInputs,
): CrossoverInsight | null {
  let best: CrossoverInsight | null = null;

  for (let i = 0; i < methodIds.length; i++) {
    for (let j = i + 1; j < methodIds.length; j++) {
      const a = methodIds[i]!;
      const b = methodIds[j]!;

      const machineA = inputs.methodInputs[a].machineCost;
      const machineB = inputs.methodInputs[b].machineCost;
      const dailyA = dailyOngoing(a, inputs);
      const dailyB = dailyOngoing(b, inputs);

      if (machineA === machineB || dailyA === dailyB) {
        continue;
      }

      const upfrontCheaperId = machineA < machineB ? a : b;
      const longTermCheaperId = machineA < machineB ? b : a;
      const upfrontDaily = dailyOngoing(upfrontCheaperId, inputs);
      const longTermDaily = dailyOngoing(longTermCheaperId, inputs);

      if (upfrontDaily <= longTermDaily) {
        continue;
      }

      const crossover = crossoverBetweenMethods(
        inputs.methodInputs[upfrontCheaperId].machineCost,
        upfrontDaily,
        inputs.methodInputs[longTermCheaperId].machineCost,
        longTermDaily,
      );

      if (!crossover) {
        continue;
      }

      const endUpfront = periodBreakdown(upfrontCheaperId, inputs).total;
      const endLongTerm = periodBreakdown(longTermCheaperId, inputs).total;
      const upfrontShop = shopDrinksPerMonth(
        inputs.methodInputs[upfrontCheaperId].shopDrinks,
        inputs.methodInputs[upfrontCheaperId].shopPeriod,
      );
      const longTermShop = shopDrinksPerMonth(
        inputs.methodInputs[longTermCheaperId].shopDrinks,
        inputs.methodInputs[longTermCheaperId].shopPeriod,
      );

      const insight: CrossoverInsight = {
        upfrontCheaperId,
        longTermCheaperId,
        upfrontCheaperLabel: METHODS[upfrontCheaperId].label,
        longTermCheaperLabel: METHODS[longTermCheaperId].label,
        years: crossover.years,
        months: crossover.months,
        cost: crossover.cost,
        endSavings: endUpfront - endLongTerm,
        fewerShopDrinksPerMonth: Math.max(0, upfrontShop - longTermShop),
      };

      if (!best || crossover.months < best.months) {
        best = insight;
      }
    }
  }

  return best;
}

export function buildHeroInsight(
  methodIds: MethodId[],
  inputs: CalculatorInputs,
): HeroInsight {
  const results = buildMethodResults(methodIds, inputs);
  const sorted = [...results].sort((a, b) => a.breakdown.total - b.breakdown.total);
  const cheapest = sorted[0]!;
  const mostExpensive = sorted[sorted.length - 1]!;
  const crossover = findPrimaryCrossover(methodIds, inputs);
  const comparisonYears = COMPARISON_MONTHS / 12;

  const totalSavings = mostExpensive.breakdown.total - cheapest.breakdown.total;
  const annualSavings = totalSavings / comparisonYears;
  const shopSavings =
    mostExpensive.breakdown.shop - cheapest.breakdown.shop;

  return {
    variant: crossover ? 'crossover' : 'savings',
    crossover,
    cheapest,
    mostExpensive,
    totalSavings,
    annualSavings,
    shopSavings,
  };
}

export function heroInsightCopy(insight: HeroInsight): string {
  const periodLabel = `${COMPARISON_MONTHS / 12}-year comparison`;

  if (insight.variant === 'crossover' && insight.crossover) {
    const { crossover } = insight;
    const yearLabel = formatYearApprox(crossover.years);
    const savings = formatUsd(crossover.endSavings);
    const shopNote =
      crossover.fewerShopDrinksPerMonth > 0
        ? `, and you would buy about ${Math.round(crossover.fewerShopDrinksPerMonth)} fewer shop drinks per month`
        : '';

    return `${crossover.longTermCheaperLabel} pays for its higher machine cost after ${yearLabel}, then saves ${savings} by the end of the ${periodLabel}${shopNote}.`;
  }

  const total = formatUsd(insight.totalSavings);
  const annual = formatUsd(insight.annualSavings);
  const shop = formatUsd(insight.shopSavings);

  return `Switching from ${insight.mostExpensive.label} to ${insight.cheapest.label} saves about ${total} over the ${periodLabel} (${annual} per year), including ${shop} less on shop drinks.`;
}
