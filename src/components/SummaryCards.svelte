<script lang="ts">
  import { Card } from 'svelte-ux';
  import type { MethodId } from '../data/methods';
  import { chartColorsForMethods } from '../lib/chart-colors';
  import { COMPARISON_MONTHS, type CalculatorInputs } from '../lib/brewing-cost';
  import {
    buildHeroInsight,
    buildMethodResults,
    heroInsightCopy,
    shouldShowHeroInsight,
    type MethodResult,
  } from '../lib/insights';
  import { formatUsd } from '../lib/format';
  import { cardClasses } from '../lib/svelte-ux-classes';

  interface Props {
    selectedMethodIds: MethodId[];
    inputs: CalculatorInputs;
  }

  let { selectedMethodIds, inputs }: Props = $props();

  const sortedMethodIds = $derived(
    [...selectedMethodIds].sort((a, b) => a.localeCompare(b)),
  );

  const colors = $derived(chartColorsForMethods(sortedMethodIds));
  const results = $derived(buildMethodResults(sortedMethodIds, inputs));
  const hero = $derived(buildHeroInsight(sortedMethodIds, inputs));
  const heroCopy = $derived(heroInsightCopy(hero));
  const showKeyInsight = $derived(shouldShowHeroInsight(hero));
  const comparisonYears = COMPARISON_MONTHS / 12;
  const showRank = $derived(results.length > 1);

  function chipBorderColor(result: MethodResult): string {
    return colors[result.methodId];
  }
</script>

<div class="space-y-5">
  {#if showKeyInsight}
    <div
      class="rounded-lg border border-brand/25 bg-brand-soft px-4 py-4 md:px-5"
      aria-live="polite"
    >
      <p class="font-mono text-xs uppercase tracking-wide text-brand-deep">Key insight</p>
      <p class="mt-2 text-base font-medium leading-relaxed text-ink md:text-lg">
        {heroCopy}
      </p>
    </div>
  {/if}

  <div>
    <p class="mb-3 font-mono text-xs uppercase tracking-wide text-ink-3">
      End of {comparisonYears}-year comparison
    </p>
    <div class="grid gap-3 sm:grid-cols-2">
      {#each results as result (result.methodId)}
        <div
          class="min-w-0 rounded-lg border-l-4 border-[var(--line)]"
          style:border-left-color={chipBorderColor(result)}
        >
          <Card classes={cardClasses} class="min-w-0 border-0 shadow-none">
            {#snippet contents()}
            <div class="space-y-3">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-medium text-ink">{result.label}</p>
                {#if showRank}
                  <p class="text-xs text-ink-3">Rank #{result.rank}</p>
                {/if}
              </div>
              {#if showRank}
                <span
                  class="rounded-sm bg-paper-3 px-2 py-0.5 font-mono text-xs text-ink-2"
                  style:color={chipBorderColor(result)}
                >
                  #{result.rank}
                </span>
              {/if}
            </div>

            <div>
              <p class="font-display text-3xl font-bold tracking-tight text-ink">
                {formatUsd(result.breakdown.total)}
              </p>
              <p class="text-xs text-ink-3">Total brewing cost</p>
            </div>

            <dl class="grid grid-cols-2 gap-2 text-sm">
              <div class="rounded-sm bg-white/70 px-2.5 py-2">
                <dt class="text-xs text-ink-3">Machine</dt>
                <dd class="font-mono text-ink">{formatUsd(result.breakdown.machine)}</dd>
              </div>
              <div class="rounded-sm bg-white/70 px-2.5 py-2">
                <dt class="text-xs text-ink-3">Home ongoing</dt>
                <dd class="font-mono text-ink">{formatUsd(result.breakdown.home)}</dd>
              </div>              
              <div class="rounded-sm bg-white/70 px-2.5 py-2">
                <dt class="text-xs text-ink-3">$/drink</dt>
                <dd class="font-mono text-ink">
                  {result.breakdown.costPerDrink === null
                    ? 'N/A'
                    : formatUsd(result.breakdown.costPerDrink, 2)}
                </dd>
              </div>
              <div class="rounded-sm bg-white/70 px-2.5 py-2">
                <dt class="text-xs text-ink-3">Shop ongoing</dt>
                <dd class="font-mono text-ink">{formatUsd(result.breakdown.shop)}</dd>
              </div>
            </dl>
            </div>
            {/snippet}
          </Card>
        </div>
      {/each}
    </div>
  </div>
</div>
