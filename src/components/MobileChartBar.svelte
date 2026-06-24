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
    breakdownEl?: HTMLElement | null;
    enabled?: boolean;
  }

  let {
    results,
    chartEl,
    recommendationsEl = null,
    breakdownEl = null,
    enabled = true,
  }: Props = $props();

  let chartInView = $state(false);
  let recommendationsInView = $state(false);
  let breakdownInView = $state(false);

  type BarDisplay =
    | { kind: 'single'; shortLabel: string; total: number }
    | { kind: 'tie' }
    | { kind: 'savings'; shortLabel: string; difference: number; mostExpensiveLabel: string };

  const barDisplay = $derived.by((): BarDisplay | null => {
    const sorted = [...results].sort((a, b) => a.breakdown.total - b.breakdown.total);
    if (sorted.length === 0) {
      return null;
    }

    if (sorted.length === 1) {
      const result = sorted[0]!;
      return {
        kind: 'single',
        shortLabel: METHODS[result.methodId].shortLabel,
        total: result.breakdown.total,
      };
    }

    const cheapest = sorted[0]!;
    const mostExpensive = sorted[sorted.length - 1]!;
    const difference = mostExpensive.breakdown.total - cheapest.breakdown.total;

    if (difference <= 0) {
      return { kind: 'tie' };
    }

    return {
      kind: 'savings',
      shortLabel: METHODS[cheapest.methodId].shortLabel,
      difference,
      mostExpensiveLabel: METHODS[mostExpensive.methodId].shortLabel,
    };
  });

  const totalsCopy = $derived.by(() => {
    if (!barDisplay) {
      return '';
    }

    if (barDisplay.kind === 'single') {
      return `${barDisplay.shortLabel}: ${formatUsd(barDisplay.total)}`;
    }

    if (barDisplay.kind === 'tie') {
      return 'Same cost';
    }

    return `${barDisplay.shortLabel} costs ${formatUsd(barDisplay.difference)} less than ${barDisplay.mostExpensiveLabel}`;
  });

  const showRecommendationsCta = $derived(
    chartInView && recommendationsEl != null,
  );
  const showBreakdownCta = $derived(
    !chartInView && recommendationsInView && !breakdownInView && breakdownEl != null,
  );

  const ariaLabel = $derived(
    showRecommendationsCta
      ? 'See recommended machines for your comparison.'
      : showBreakdownCta
        ? 'View detailed cost breakdown for your comparison.'
        : `Compare totals: ${totalsCopy}. View chart.`,
  );

  const showBar = $derived(
    enabled &&
      barDisplay != null &&
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

  $effect(() => {
    const el = recommendationsEl;
    if (!el) {
      recommendationsInView = false;
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        recommendationsInView = entry?.isIntersecting ?? false;
      },
      { threshold: 0.25 },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  });

  $effect(() => {
    const el = breakdownEl;
    if (!el) {
      breakdownInView = false;
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        breakdownInView = entry?.isIntersecting ?? false;
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

    if (showBreakdownCta && breakdownEl) {
      scrollIntoView(breakdownEl);
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
      class="mobile-chart-bar flex w-full items-center justify-between gap-3 rounded-xl border border-brand/25 border-t border-brand/20 bg-brand-soft px-4 py-3 text-left shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
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
        <span class="min-w-0 truncate text-sm text-ink">
          {#if barDisplay?.kind === 'single'}
            <span class="font-medium">{barDisplay.shortLabel}:</span>
            {' '}
            <span class="font-bold font-mono">{formatUsd(barDisplay.total)}</span>
          {:else if barDisplay?.kind === 'tie'}
            <span class="font-medium">Same cost</span>
          {:else if barDisplay?.kind === 'savings'}
            <span class="font-medium">{barDisplay.shortLabel}</span>
            {' '}
            <span class="font-bold font-mono">{formatUsd(barDisplay.difference)}</span>
            {' '}
            <span class="font-medium">less</span>
          {/if}
        </span>
        <span
          class="flex shrink-0 items-center gap-1.5 rounded-full border border-brand/30 bg-white/80 px-2.5 py-1 font-mono text-xs uppercase tracking-wide text-brand-deep"
        >
          <Icon data={mdiChartLine} class="size-4 text-brand" />
          {showBreakdownCta ? 'View cost breakdown' : 'View chart'}
        </span>
      {/if}
    </button>
  </div>
{/if}
