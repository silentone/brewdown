import { describe, expect, it } from 'vitest';
import { createDefaultCalculatorInputs } from './brewing-cost';
import {
  buildHeroInsight,
  findPrimaryCrossover,
  formatYearApprox,
  heroInsightCopy,
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
    expect(copy).toContain('fewer shop drinks per month');
  });

  it('formats approximate years for display', () => {
    expect(formatYearApprox(2.34)).toBe('~2.3 years');
    expect(formatYearApprox(1)).toBe('~1 year');
  });
});
