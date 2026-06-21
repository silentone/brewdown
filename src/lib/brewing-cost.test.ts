import { describe, expect, it } from 'vitest';
import {
  applyBulkGearPreset,
  applyPodStylePreset,
  createDefaultMethodInputs,
  createDefaultMethodInputsMap,
  METHODS,
} from '../data/methods';
import {
  COMPARISON_MONTHS,
  cumulativeBrewingCost,
  cumulativeBrewingCostSeries,
  crossoverMonth,
  crossoverYear,
  createDefaultCalculatorInputs,
  dailyOngoing,
  ingredientCostPerDay,
  periodBreakdown,
  shopCostPerDay,
  shopSpendOverPeriod,
  type CalculatorInputs,
} from './brewing-cost';
import { crossoverBetweenMethods } from './crossover';
import { costPerGramFromLb, DAYS_PER_MONTH } from './format';

function defaultInputs(): CalculatorInputs {
  return createDefaultCalculatorInputs();
}

describe('methods config', () => {
  it('defines all four v1 methods with bulk or pods ingredient model', () => {
    expect(Object.keys(METHODS)).toHaveLength(4);
    expect(METHODS.pods.ingredientModel).toBe('pods');
    expect(METHODS.bean_to_cup.ingredientModel).toBe('bulk');
    expect(METHODS.bulk_brew.ingredientModel).toBe('bulk');
  });

  it('bulk_brew with french_press gear preset matches former french_press defaults', () => {
    const bulk = {
      ...createDefaultMethodInputs('bulk_brew'),
      ...applyBulkGearPreset('french_press'),
    };
    expect(bulk.machineCost).toBe(28);
    expect(bulk.ingredientCost).toBe(11);
    expect(bulk.shopDrinks).toBe(2);
    expect(bulk.gearPreset).toBe('french_press');
  });

  it('applyBulkGearPreset pour_over sets machine $55 and ingredient $12/lb', () => {
    const preset = applyBulkGearPreset('pour_over');
    expect(preset.machineCost).toBe(55);
    expect(preset.ingredientCost).toBe(12);
    expect(preset.gearPreset).toBe('pour_over');
    expect(preset.gramsPerCup).toBe(14);
  });

  it('applyBulkGearPreset uses defaultGramsPerCup from preset', () => {
    expect(applyBulkGearPreset('drip').gramsPerCup).toBe(14);
    expect(applyBulkGearPreset('french_press').gramsPerCup).toBe(15);
    expect(applyBulkGearPreset('pour_over').gramsPerCup).toBe(14);
  });

  it('podStyle nespresso applies nespresso defaults', () => {
    const pods = {
      ...createDefaultMethodInputs('pods'),
      ...applyPodStylePreset('nespresso'),
    };
    expect(pods.machineCost).toBe(180);
    expect(pods.ingredientCost).toBe(0.75);
    expect(pods.podStyle).toBe('nespresso');
  });

  it('uses Appendix A defaults for pods', () => {
    const pods = createDefaultMethodInputs('pods');
    expect(pods.machineCost).toBe(METHODS.pods.defaultMachineCost);
    expect(pods.ingredientCost).toBe(METHODS.pods.defaultIngredientCost);
    expect(pods.podsPerCup).toBe(1);
    expect(pods.shopPeriod).toBe('month');
    expect(pods.shopDrinks).toBe(METHODS.pods.defaultShopDrinksPerMonth);
  });

  it('uses Appendix A defaults for bean-to-cup', () => {
    const bean = createDefaultMethodInputs('bean_to_cup');
    expect(bean.machineCost).toBe(METHODS.bean_to_cup.defaultMachineCost);
    expect(bean.ingredientCost).toBe(METHODS.bean_to_cup.defaultIngredientCost);
    expect(bean.gramsPerCup).toBe(METHODS.bean_to_cup.defaultGramsPerCup);
    expect(bean.shopPeriod).toBe('month');
    expect(bean.shopDrinks).toBe(METHODS.bean_to_cup.defaultShopDrinksPerMonth);
  });

  it('assigns lower default coffee shop drinks to bean-to-cup than pods (hook 2)', () => {
    expect(METHODS.bean_to_cup.defaultShopDrinksPerMonth).toBeLessThan(
      METHODS.pods.defaultShopDrinksPerMonth,
    );
  });
});

describe('ingredient and shop daily costs', () => {
  it('computes bulk ingredient cost from $/lb via grams per cup', () => {
    const inputs = defaultInputs();
    const bean = inputs.methodInputs.bean_to_cup;

    const expected =
      inputs.cupsPerDay *
      bean.gramsPerCup *
      costPerGramFromLb(bean.ingredientCost);

    expect(
      ingredientCostPerDay('bean_to_cup', inputs.cupsPerDay, bean),
    ).toBeCloseTo(expected, 5);
  });

  it('computes pod ingredient cost as cups × pods × $/pod', () => {
    const inputs = defaultInputs();
    const pods = inputs.methodInputs.pods;

    expect(ingredientCostPerDay('pods', inputs.cupsPerDay, pods)).toBe(
      inputs.cupsPerDay * pods.podsPerCup * pods.ingredientCost,
    );
  });

  it('converts monthly coffee shop drinks to daily cost', () => {
    const inputs = defaultInputs();
    inputs.methodInputs.pods.shopPeriod = 'month';
    inputs.methodInputs.pods.shopDrinks = 12;
    const expected = (12 * inputs.pricePerShopDrink) / DAYS_PER_MONTH;

    expect(shopCostPerDay('pods', inputs)).toBeCloseTo(expected, 5);
  });

  it('converts weekly coffee shop drinks to daily cost', () => {
    const inputs = defaultInputs();
    inputs.methodInputs.pods.shopPeriod = 'week';
    inputs.methodInputs.pods.shopDrinks = 3;

    expect(shopCostPerDay('pods', inputs)).toBeCloseTo(
      (3 * inputs.pricePerShopDrink) / 7,
      5,
    );
  });
});

describe('cumulative brewing cost', () => {
  it('starts at machine cost at month 0 (y-intercept)', () => {
    const inputs = defaultInputs();

    expect(cumulativeBrewingCost('pods', inputs, 0)).toBe(120);
    expect(cumulativeBrewingCost('bean_to_cup', inputs, 0)).toBe(800);
  });

  it('accrues daily ongoing linearly', () => {
    const inputs = defaultInputs();
    const days = 100;
    const ongoing = dailyOngoing('pods', inputs);

    expect(cumulativeBrewingCost('pods', inputs, days)).toBeCloseTo(
      120 + ongoing * days,
      5,
    );
  });

  it('produces 61 monthly points including month 0', () => {
    const inputs = defaultInputs();
    const series = cumulativeBrewingCostSeries('pods', inputs);

    expect(series).toHaveLength(COMPARISON_MONTHS + 1);
    expect(series[0]).toEqual({ month: 0, cost: 120 });
    expect(series[COMPARISON_MONTHS]!.month).toBe(COMPARISON_MONTHS);
  });
});

describe('default pods vs bean-to-cup crossover scenario', () => {
  const inputs = defaultInputs();

  it('has bean-to-cup higher upfront and lower daily slope than pods', () => {
    expect(inputs.methodInputs.bean_to_cup.machineCost).toBeGreaterThan(
      inputs.methodInputs.pods.machineCost,
    );
    expect(dailyOngoing('bean_to_cup', inputs)).toBeLessThan(
      dailyOngoing('pods', inputs),
    );
  });

  it('crosses within the 60-month chart horizon', () => {
    const crossover = crossoverYear('pods', 'bean_to_cup', inputs);
    expect(crossover).not.toBeNull();
    expect(crossover!).toBeGreaterThan(0);
    expect(crossover!).toBeLessThanOrEqual(5);
  });

  it('crosses in roughly years 1 to 3 for Appendix A defaults', () => {
    const crossover = crossoverYear('pods', 'bean_to_cup', inputs);
    expect(crossover).not.toBeNull();
    expect(crossover!).toBeGreaterThanOrEqual(0.5);
    expect(crossover!).toBeLessThanOrEqual(3);
  });

  it('bean-to-cup is cheaper than pods by month 60', () => {
    const days = COMPARISON_MONTHS * DAYS_PER_MONTH;
    const podsTotal = cumulativeBrewingCost('pods', inputs, days);
    const beanTotal = cumulativeBrewingCost('bean_to_cup', inputs, days);

    expect(beanTotal).toBeLessThan(podsTotal);
  });

  it('reports shop spend ~$2,600 less for bean-to-cup over 60 months (hook 2)', () => {
    const podsShop = shopSpendOverPeriod('pods', inputs);
    const beanShop = shopSpendOverPeriod('bean_to_cup', inputs);

    expect(podsShop - beanShop).toBeCloseTo(2607, 0);
  });

  it('matches crossover formula from spec §4.3', () => {
    const machineA = inputs.methodInputs.pods.machineCost;
    const machineB = inputs.methodInputs.bean_to_cup.machineCost;
    const dailyA = dailyOngoing('pods', inputs);
    const dailyB = dailyOngoing('bean_to_cup', inputs);

    const expectedYears = (machineB - machineA) / (365 * (dailyA - dailyB));
    expect(crossoverYear('pods', 'bean_to_cup', inputs)).toBeCloseTo(
      expectedYears,
      8,
    );
    expect(crossoverMonth('pods', 'bean_to_cup', inputs)).toBeCloseTo(
      expectedYears * 12,
      6,
    );
  });
});

describe('period breakdown', () => {
  it('splits machine, home, and shop at end of comparison', () => {
    const inputs = defaultInputs();
    const breakdown = periodBreakdown('bean_to_cup', inputs);

    expect(breakdown.machine).toBe(800);
    expect(breakdown.home).toBeGreaterThan(0);
    expect(breakdown.shop).toBeGreaterThan(0);
    expect(breakdown.total).toBeCloseTo(
      breakdown.machine + breakdown.home + breakdown.shop,
      5,
    );
    expect(breakdown.costPerDrink).not.toBeNull();
  });

  it('hides cost per drink below one month horizon', () => {
    const inputs = defaultInputs();
    const breakdown = periodBreakdown('pods', inputs, 0);

    expect(breakdown.costPerDrink).toBeNull();
  });
});

describe('crossover helper', () => {
  it('returns null when daily ongoing is equal', () => {
    expect(
      crossoverBetweenMethods(100, 2, 200, 2),
    ).toBeNull();
  });

  it('returns null when crossover is beyond horizon', () => {
    const result = crossoverBetweenMethods(0, 1, 10000, 0, 60);
    expect(result).toBeNull();
  });
});

describe('createDefaultMethodInputsMap', () => {
  it('provides defaults for every method id', () => {
    const map = createDefaultMethodInputsMap();
    for (const id of Object.keys(METHODS) as Array<keyof typeof METHODS>) {
      expect(map[id]).toBeDefined();
      expect(map[id].machineCost).toBeGreaterThanOrEqual(0);
    }
  });
});
