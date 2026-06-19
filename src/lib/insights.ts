import { METHODS, type MethodId, type ShopPeriod } from '../data/methods';
import {
  COMPARISON_MONTHS,
  dailyOngoing,
  periodBreakdown,
  shopCostPerDay,
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
  annualOngoingSavings: number;
  fewerShopDrinksPerMonth: number;
}

export interface HeroInsight {
  variant: 'single' | 'crossover' | 'savings';
  crossover: CrossoverInsight | null;
  cheapest: MethodResult;
  mostExpensive: MethodResult;
  annualOngoingCost: number;
  annualSavings: number;
  annualShopSavings: number;
}

/** Minimum spread between cheapest and most expensive total brewing cost to show key insight. */
export const MIN_INSIGHT_COST_DIFFERENCE_PERCENT = 20;

export function totalCostDifferencePercent(cheapestTotal: number, mostExpensiveTotal: number): number {
  if (mostExpensiveTotal <= 0) {
    return 0;
  }

  return ((mostExpensiveTotal - cheapestTotal) / mostExpensiveTotal) * 100;
}

export function shouldShowHeroInsight(hero: HeroInsight): boolean {
  if (hero.variant === 'single') {
    return true;
  }

  return (
    totalCostDifferencePercent(
      hero.cheapest.breakdown.total,
      hero.mostExpensive.breakdown.total,
    ) >= MIN_INSIGHT_COST_DIFFERENCE_PERCENT
  );
}

function annualOngoingCost(methodId: MethodId, inputs: CalculatorInputs): number {
  return dailyOngoing(methodId, inputs) * 365;
}

function annualShopCost(methodId: MethodId, inputs: CalculatorInputs): number {
  return shopCostPerDay(methodId, inputs) * 365;
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

      const upfrontShop = shopDrinksPerMonth(
        inputs.methodInputs[upfrontCheaperId].shopDrinks,
        inputs.methodInputs[upfrontCheaperId].shopPeriod,
      );
      const longTermShop = shopDrinksPerMonth(
        inputs.methodInputs[longTermCheaperId].shopDrinks,
        inputs.methodInputs[longTermCheaperId].shopPeriod,
      );
      const annualOngoingSavings =
        annualOngoingCost(upfrontCheaperId, inputs) -
        annualOngoingCost(longTermCheaperId, inputs);

      const insight: CrossoverInsight = {
        upfrontCheaperId,
        longTermCheaperId,
        upfrontCheaperLabel: METHODS[upfrontCheaperId].label,
        longTermCheaperLabel: METHODS[longTermCheaperId].label,
        years: crossover.years,
        months: crossover.months,
        cost: crossover.cost,
        annualOngoingSavings,
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

  if (methodIds.length === 1) {
    return {
      variant: 'single',
      crossover: null,
      cheapest,
      mostExpensive: cheapest,
      annualOngoingCost: annualOngoingCost(cheapest.methodId, inputs),
      annualSavings: 0,
      annualShopSavings: annualShopCost(cheapest.methodId, inputs),
    };
  }

  const crossover = findPrimaryCrossover(methodIds, inputs);
  const annualSavings =
    annualOngoingCost(mostExpensive.methodId, inputs) -
    annualOngoingCost(cheapest.methodId, inputs);
  const annualShopSavings =
    annualShopCost(mostExpensive.methodId, inputs) -
    annualShopCost(cheapest.methodId, inputs);

  return {
    variant: crossover ? 'crossover' : 'savings',
    crossover,
    cheapest,
    mostExpensive,
    annualOngoingCost: annualOngoingCost(cheapest.methodId, inputs),
    annualSavings,
    annualShopSavings,
  };
}

export function heroInsightCopy(insight: HeroInsight): string {
  if (insight.variant === 'single') {
    const annual = formatUsd(insight.annualOngoingCost);
    const shop = formatUsd(insight.annualShopSavings);

    return `${insight.cheapest.label} costs about ${annual} per year in ongoing home and shop spending, including ${shop} on shop drinks.`;
  }

  if (insight.variant === 'crossover' && insight.crossover) {
    const { crossover } = insight;
    const yearLabel = formatYearApprox(crossover.years);
    const savings = formatUsd(crossover.annualOngoingSavings);
    const shopNote =
      crossover.fewerShopDrinksPerMonth > 0
        ? `, and you would buy about ${Math.round(crossover.fewerShopDrinksPerMonth)} fewer shop drinks per month`
        : '';

    return `${crossover.longTermCheaperLabel} pays for its higher machine cost after ${yearLabel}, then saves ${savings} per year in ongoing costs${shopNote}.`;
  }

  const annual = formatUsd(insight.annualSavings);
  const shop = formatUsd(insight.annualShopSavings);

  return `Switching from ${insight.mostExpensive.label} to ${insight.cheapest.label} saves about ${annual} per year in ongoing costs, including ${shop} less on shop drinks.`;
}
