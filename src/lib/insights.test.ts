import { describe, expect, it } from 'vitest';
import { createDefaultCalculatorInputs } from './brewing-cost';
import {
  buildHeroInsight,
  findPrimaryCrossover,
  formatYearApprox,
  heroInsightCopy,
  shouldShowHeroInsight,
  totalCostDifferencePercent,
} from './insights';

describe('insights', () => {
  const inputs = createDefaultCalculatorInputs();

  it('finds pods vs bean-to-cup crossover for default scenario', () => {
    const crossover = findPrimaryCrossover(['pods', 'bean_to_cup'], inputs);

    expect(crossover).not.toBeNull();
    expect(crossover!.upfrontCheaperId).toBe('pods');
    expect(crossover!.longTermCheaperId).toBe('bean_to_cup');
    expect(crossover!.years).toBeGreaterThan(0.5);
    expect(crossover!.years).toBeLessThanOrEqual(3);
  });

  it('prefers crossover hero copy when lines cross', () => {
    const hero = buildHeroInsight(['pods', 'bean_to_cup'], inputs);
    const copy = heroInsightCopy(hero);

    expect(hero.variant).toBe('crossover');
    expect(copy).toContain('Bean-to-cup');
    expect(copy).toContain('pays for its higher machine cost');
    expect(copy).toContain('per year in ongoing costs');
    expect(copy).toContain('fewer coffee shop drinks per month');
    expect(copy).not.toContain('5-year');
  });

  it('formats approximate years for display', () => {
    expect(formatYearApprox(2.34)).toBe('~2.3 years');
    expect(formatYearApprox(1)).toBe('~1 year');
  });

  it('hides hero insight when total cost spread is under 10%', () => {
    const hero = buildHeroInsight(['pods', 'bean_to_cup'], inputs);
    const closeTotals = {
      ...hero,
      variant: 'savings' as const,
      crossover: null,
      cheapest: {
        ...hero.cheapest,
        breakdown: { ...hero.cheapest.breakdown, total: 10_000 },
      },
      mostExpensive: {
        ...hero.mostExpensive,
        breakdown: { ...hero.mostExpensive.breakdown, total: 10_500 },
      },
    };

    expect(totalCostDifferencePercent(10_000, 10_500)).toBeLessThan(10);
    expect(shouldShowHeroInsight(closeTotals)).toBe(false);
  });

  it('shows hero insight when total cost spread is at least 10%', () => {
    const hero = buildHeroInsight(['pods', 'bean_to_cup'], inputs);

    expect(totalCostDifferencePercent(hero.cheapest.breakdown.total, hero.mostExpensive.breakdown.total)).toBeGreaterThanOrEqual(10);
    expect(shouldShowHeroInsight(hero)).toBe(true);
  });

  it('uses single-method hero copy without comparison language', () => {
    const hero = buildHeroInsight(['pods'], inputs);
    const copy = heroInsightCopy(hero);

    expect(hero.variant).toBe('single');
    expect(hero.crossover).toBeNull();
    expect(copy).toContain('Pre-packaged pods');
    expect(copy).toContain('costs about');
    expect(copy).toContain('per year in ongoing');
    expect(copy).toContain('on coffee shop drinks');
    expect(copy).not.toContain('Switching from');
    expect(copy).not.toContain('5-year');
  });
});
