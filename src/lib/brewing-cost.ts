import {
  createDefaultMethodInputsMap,
  DEFAULT_SELECTED_METHODS,
  METHODS,
  type IngredientModel,
  type MethodId,
  type MethodInputValues,
  type ShopPeriod,
} from '../data/methods';
import { crossoverBetweenMethods } from './crossover';
import {
  COMPARISON_MONTHS,
  DAYS_PER_MONTH,
  costPerGramFromLb,
} from './format';

export {
  COMPARISON_MONTHS,
  DAYS_PER_MONTH,
  GRAMS_PER_POUND,
} from './format';

export type { ShopPeriod };

export interface GlobalCalculatorInputs {
  cupsPerDay: number;
  pricePerShopDrink: number;
}

export interface CalculatorInputs extends GlobalCalculatorInputs {
  methodInputs: Record<MethodId, MethodInputValues>;
}

export interface PeriodBreakdown {
  machine: number;
  home: number;
  shop: number;
  total: number;
  costPerDrink: number | null;
}

export interface ChartPoint {
  month: number;
  cost: number;
}

export interface MethodSeries {
  methodId: MethodId;
  points: ChartPoint[];
}

function daysAtMonth(month: number): number {
  return month * DAYS_PER_MONTH;
}

function shopDrinksPerYear(
  shopDrinks: number,
  shopPeriod: ShopPeriod,
): number {
  return shopPeriod === 'week' ? shopDrinks * 52 : shopDrinks * 12;
}

function shopDailyCost(
  shopDrinks: number,
  pricePerShopDrink: number,
  shopPeriod: ShopPeriod,
): number {
  if (shopPeriod === 'week') {
    return (shopDrinks * pricePerShopDrink) / 7;
  }
  return (shopDrinks * pricePerShopDrink) / DAYS_PER_MONTH;
}

function consumablesDailyCost(annualConsumables: number): number {
  return annualConsumables / 365;
}

function bulkIngredientDailyCost(
  cupsPerDay: number,
  gramsPerCup: number,
  costPerLb: number,
): number {
  const costPerGram = costPerGramFromLb(costPerLb);
  return cupsPerDay * gramsPerCup * costPerGram;
}

function podsIngredientDailyCost(
  cupsPerDay: number,
  podsPerCup: number,
  costPerPod: number,
): number {
  return cupsPerDay * podsPerCup * costPerPod;
}

function homeDailyCost(
  methodId: MethodId,
  cupsPerDay: number,
  methodInputs: MethodInputValues,
): number {
  const model: IngredientModel = METHODS[methodId].ingredientModel;

  const ingredientDaily =
    model === 'pods'
      ? podsIngredientDailyCost(
          cupsPerDay,
          methodInputs.podsPerCup,
          methodInputs.ingredientCost,
        )
      : bulkIngredientDailyCost(
          cupsPerDay,
          methodInputs.gramsPerCup,
          methodInputs.ingredientCost,
        );

  return ingredientDaily + consumablesDailyCost(methodInputs.annualConsumables);
}

export function ingredientCostPerDay(
  methodId: MethodId,
  cupsPerDay: number,
  methodInputs: MethodInputValues,
): number {
  const model = METHODS[methodId].ingredientModel;

  if (model === 'pods') {
    return podsIngredientDailyCost(
      cupsPerDay,
      methodInputs.podsPerCup,
      methodInputs.ingredientCost,
    );
  }

  return bulkIngredientDailyCost(
    cupsPerDay,
    methodInputs.gramsPerCup,
    methodInputs.ingredientCost,
  );
}

export function shopCostPerDay(
  methodId: MethodId,
  inputs: CalculatorInputs,
): number {
  const methodInputs = inputs.methodInputs[methodId];
  return shopDailyCost(
    methodInputs.shopDrinks,
    inputs.pricePerShopDrink,
    methodInputs.shopPeriod,
  );
}

export function dailyOngoing(
  methodId: MethodId,
  inputs: CalculatorInputs,
): number {
  const methodInputs = inputs.methodInputs[methodId];
  return (
    homeDailyCost(methodId, inputs.cupsPerDay, methodInputs) +
    shopCostPerDay(methodId, inputs)
  );
}

export function cumulativeBrewingCost(
  methodId: MethodId,
  inputs: CalculatorInputs,
  days: number,
): number {
  const machineCost = inputs.methodInputs[methodId].machineCost;
  const ongoing = dailyOngoing(methodId, inputs);
  return machineCost + ongoing * days;
}

export function cumulativeBrewingCostSeries(
  methodId: MethodId,
  inputs: CalculatorInputs,
  months: number = COMPARISON_MONTHS,
): ChartPoint[] {
  const points: ChartPoint[] = [];

  for (let month = 0; month <= months; month++) {
    points.push({
      month,
      cost: cumulativeBrewingCost(methodId, inputs, daysAtMonth(month)),
    });
  }

  return points;
}

export function crossoverYear(
  methodA: MethodId,
  methodB: MethodId,
  inputs: CalculatorInputs,
  horizonMonths: number = COMPARISON_MONTHS,
): number | null {
  const result = crossoverBetweenMethods(
    inputs.methodInputs[methodA].machineCost,
    dailyOngoing(methodA, inputs),
    inputs.methodInputs[methodB].machineCost,
    dailyOngoing(methodB, inputs),
    horizonMonths,
  );

  return result?.years ?? null;
}

export function crossoverMonth(
  methodA: MethodId,
  methodB: MethodId,
  inputs: CalculatorInputs,
  horizonMonths: number = COMPARISON_MONTHS,
): number | null {
  const years = crossoverYear(methodA, methodB, inputs, horizonMonths);
  return years === null ? null : years * 12;
}

export function costPerDrinkEquivalent(
  methodId: MethodId,
  inputs: CalculatorInputs,
  years: number,
): number | null {
  if (years < 1 / 12) {
    return null;
  }

  const methodInputs = inputs.methodInputs[methodId];
  const totalCost = cumulativeBrewingCost(
    methodId,
    inputs,
    years * 365,
  );

  const homeDrinks = inputs.cupsPerDay * 365 * years;
  const shopDrinks =
    shopDrinksPerYear(methodInputs.shopDrinks, methodInputs.shopPeriod) * years;
  const totalDrinks = homeDrinks + shopDrinks;

  if (totalDrinks <= 0) {
    return null;
  }

  return totalCost / totalDrinks;
}

export function periodBreakdown(
  methodId: MethodId,
  inputs: CalculatorInputs,
  months: number = COMPARISON_MONTHS,
): PeriodBreakdown {
  const methodInputs = inputs.methodInputs[methodId];
  const days = daysAtMonth(months);
  const machine = methodInputs.machineCost;
  const homeIngredient = ingredientCostPerDay(
    methodId,
    inputs.cupsPerDay,
    methodInputs,
  );
  const homeConsumables = consumablesDailyCost(methodInputs.annualConsumables);
  const home = (homeIngredient + homeConsumables) * days;
  const shop = shopCostPerDay(methodId, inputs) * days;
  const total = machine + home + shop;
  const years = months / 12;

  return {
    machine,
    home,
    shop,
    total,
    costPerDrink: costPerDrinkEquivalent(methodId, inputs, years),
  };
}

export function shopSpendOverPeriod(
  methodId: MethodId,
  inputs: CalculatorInputs,
  months: number = COMPARISON_MONTHS,
): number {
  return shopCostPerDay(methodId, inputs) * daysAtMonth(months);
}

export function createDefaultCalculatorInputs(): CalculatorInputs {
  return {
    cupsPerDay: 2,
    pricePerShopDrink: 5,
    methodInputs: createDefaultMethodInputsMap(),
  };
}
