import { describe, expect, it } from 'vitest';
import { createDefaultCalculatorInputs } from './brewing-cost';
import {
  validateCalculatorInputs,
  validateFullCalculator,
  validateSelectedMethods,
} from './validation';

describe('validateSelectedMethods', () => {
  it('rejects zero methods', () => {
    expect(validateSelectedMethods([])).toBe(false);
  });

  it('accepts one method', () => {
    expect(validateSelectedMethods(['pods'])).toBe(true);
  });

  it('accepts two or more methods', () => {
    expect(validateSelectedMethods(['pods', 'bean_to_cup'])).toBe(true);
  });
});

describe('validateCalculatorInputs', () => {
  const defaults = createDefaultCalculatorInputs();

  it('fails when no methods are selected', () => {
    const result = validateCalculatorInputs({
      cupsPerDay: defaults.cupsPerDay,
      pricePerShopDrink: defaults.pricePerShopDrink,
      selectedMethodIds: [],
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Select at least one brewing method.');
  });

  it('passes with one selected method', () => {
    const result = validateCalculatorInputs({
      cupsPerDay: defaults.cupsPerDay,
      pricePerShopDrink: defaults.pricePerShopDrink,
      selectedMethodIds: ['pods'],
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});

describe('validateFullCalculator', () => {
  const defaults = createDefaultCalculatorInputs();

  it('passes with one selected method and valid inputs', () => {
    const result = validateFullCalculator({
      cupsPerDay: defaults.cupsPerDay,
      pricePerShopDrink: defaults.pricePerShopDrink,
      selectedMethodIds: ['pods'],
      methodInputs: defaults.methodInputs,
    });

    expect(result.valid).toBe(true);
  });
});
