import type { MethodId } from '../data/methods';

/** CSS custom properties for chart series, aligned with design/tokens.css */
export const CHART_COLOR_VARS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
] as const;

export function chartColorForIndex(index: number): string {
  return CHART_COLOR_VARS[index % CHART_COLOR_VARS.length]!;
}

export function chartColorsForMethods(methodIds: MethodId[]): Record<MethodId, string> {
  const colors = {} as Record<MethodId, string>;
  methodIds.forEach((id, index) => {
    colors[id] = chartColorForIndex(index);
  });
  return colors;
}
