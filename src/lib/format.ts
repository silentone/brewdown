/** Grams in one avoirdupois pound (internal storage unit for bulk coffee). */
export const GRAMS_PER_POUND = 453.592;

/** Average days per calendar month (365 / 12). */
export const DAYS_PER_MONTH = 365 / 12;

/** Fixed comparison horizon for the cost chart. */
export const COMPARISON_MONTHS = 60;

export function costPerGramFromLb(costPerLb: number): number {
  return costPerLb / GRAMS_PER_POUND;
}

export function formatUsd(amount: number, fractionDigits = 0): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}
