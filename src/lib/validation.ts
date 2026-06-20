import { METHODS, type MethodId, type MethodInputValues } from '../data/methods';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function isValidNumber(value: number): boolean {
  return Number.isFinite(value);
}

export function validateCupsPerDay(cupsPerDay: number): boolean {
  return isValidNumber(cupsPerDay) && cupsPerDay > 0;
}

export function validateNonNegative(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

export function validateSelectedMethods(selectedMethodIds: MethodId[]): boolean {
  return selectedMethodIds.length >= 1;
}

export function validateCalculatorInputs(input: {
  cupsPerDay: number;
  pricePerShopDrink: number;
  selectedMethodIds: MethodId[];
}): ValidationResult {
  const errors: string[] = [];

  if (!validateCupsPerDay(input.cupsPerDay)) {
    errors.push('Cups per day must be greater than zero.');
  }

  if (!validateNonNegative(input.pricePerShopDrink)) {
    errors.push('Shop drink price must be zero or greater.');
  }

  if (!validateSelectedMethods(input.selectedMethodIds)) {
    errors.push('Select at least one brewing method.');
  }

  return { valid: errors.length === 0, errors };
}

export function validateMethodInputValues(
  methodId: MethodId,
  values: MethodInputValues,
): string[] {
  const errors: string[] = [];
  const label = METHODS[methodId].label;

  if (!validateNonNegative(values.machineCost)) {
    errors.push(`${label}: Machine cost must be zero or greater.`);
  }

  if (!validateNonNegative(values.ingredientCost)) {
    errors.push(`${label}: Ingredient cost must be zero or greater.`);
  }

  if (!validateNonNegative(values.shopDrinks)) {
    errors.push(`${label}: Drinks purchased at coffee shops must be zero or greater.`);
  }

  if (methodId === 'pods') {
    if (!validateNonNegative(values.podsPerCup) || values.podsPerCup <= 0) {
      errors.push(`${label}: Pods per cup must be greater than zero.`);
    }
  } else if (!validateNonNegative(values.gramsPerCup) || values.gramsPerCup <= 0) {
    errors.push(`${label}: Grams per cup must be greater than zero.`);
  }

  return errors;
}

export function validateFullCalculator(input: {
  cupsPerDay: number;
  pricePerShopDrink: number;
  selectedMethodIds: MethodId[];
  methodInputs: Record<MethodId, MethodInputValues>;
}): ValidationResult {
  const base = validateCalculatorInputs(input);
  const errors = [...base.errors];

  for (const methodId of input.selectedMethodIds) {
    errors.push(...validateMethodInputValues(methodId, input.methodInputs[methodId]));
  }

  return { valid: errors.length === 0, errors };
}
