<script lang="ts">
  import { mdiChartLine, mdiChevronDown } from '@mdi/js';
  import { Icon } from 'svelte-ux';
  import { METHODS } from '../data/methods';
  import { formatUsd } from '../lib/format';
  import type { MethodResult } from '../lib/insights';

  interface Props {
    results: MethodResult[];
    chartEl: HTMLElement | null;
    recommendationsEl?: HTMLElement | null;
    enabled?: boolean;
  }

  let {
    results,
    chartEl,
    recommendationsEl = null,
    enabled = true,
  }: Props = $props();

  let chartInView = $state(false);

  const barTotals = $derived.by(() => {
    const sorted = [...results].sort((a, b) => a.breakdown.total - b.breakdown.total);
    if (sorted.length === 0) {
      return [];
    }

    const cheapest = sorted[0]!;
    const mostExpensive = sorted[sorted.length - 1]!;

    if (cheapest.methodId === mostExpensive.methodId) {
      return [cheapest];
    }

    return [cheapest, mostExpensive];
  });

  const totalsCopy = $derived(
    barTotals
      .map(
        (result) =>
          `${METHODS[result.methodId].shortLabel}: ${formatUsd(result.breakdown.total)}`,
      )
      .join(', '),
  );

  const showRecommendationsCta = $derived(
    chartInView && recommendationsEl != null,
  );

  const ariaLabel = $derived(
    showRecommendationsCta
      ? 'See recommended machines for your comparison.'
      : `Compare totals: ${totalsCopy}. View chart.`,
  );

  const showBar = $derived(
    enabled &&
      barTotals.length > 0 &&
      (!chartInView || recommendationsEl != null),
  );

  $effect(() => {
    const el = chartEl;
    if (!el) {
      chartInView = false;
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        chartInView = entry?.isIntersecting ?? false;
      },
      { threshold: 0.25 },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  });

  function scrollIntoView(el: HTMLElement) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }

  function handleBarClick() {
    if (showRecommendationsCta && recommendationsEl) {
      scrollIntoView(recommendationsEl);
      return;
    }

    if (chartEl) {
      scrollIntoView(chartEl);
    }
  }
</script>

{#if showBar}
  <div
    class="fixed bottom-0 inset-x-0 z-50 px-[var(--gutter)] pb-[max(12px,env(safe-area-inset-bottom))] lg:hidden"
  >
    <button
      type="button"
      class="flex w-full items-center justify-between gap-3 rounded-xl border border-brand/25 border-t border-brand/20 bg-brand-soft px-4 py-3 text-left shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
      aria-label={ariaLabel}
      onclick={handleBarClick}
    >
      {#if showRecommendationsCta}
        <span class="min-w-0 truncate text-sm font-medium text-ink">
          See recommendations
        </span>
        <span
          class="flex shrink-0 items-center gap-1.5 rounded-full border border-brand/30 bg-white/80 px-2.5 py-1 font-mono text-xs uppercase tracking-wide text-brand-deep"
        >
          <Icon data={mdiChevronDown} class="size-4 text-brand" />
          View picks
        </span>
      {:else}
        <span class="flex min-w-0 truncate gap-x-3 text-sm text-ink">
          {#each barTotals as result (result.methodId)}
            <span class="shrink-0">
              <span class="font-medium">{METHODS[result.methodId].shortLabel}:</span>
              {' '}
              <span class="font-bold font-mono">{formatUsd(result.breakdown.total)}</span>
            </span>
          {/each}
        </span>
        <span
          class="flex shrink-0 items-center gap-1.5 rounded-full border border-brand/30 bg-white/80 px-2.5 py-1 font-mono text-xs uppercase tracking-wide text-brand-deep"
        >
          <Icon data={mdiChartLine} class="size-4 text-brand" />
          View chart
        </span>
      {/if}
    </button>
  </div>
{/if}
