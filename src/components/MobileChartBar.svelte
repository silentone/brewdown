<script lang="ts">
  import { mdiChartLine } from '@mdi/js';
  import { Icon } from 'svelte-ux';
  import { METHODS } from '../data/methods';
  import { formatUsd } from '../lib/format';
  import type { MethodResult } from '../lib/insights';

  interface Props {
    results: MethodResult[];
    chartEl: HTMLElement | null;
    enabled?: boolean;
    chartInView?: boolean;
  }

  let {
    results,
    chartEl,
    enabled = true,
    chartInView = $bindable(false),
  }: Props = $props();

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

  const ariaLabel = $derived(
    `Compare totals: ${totalsCopy}. View chart.`,
  );

  const showBar = $derived(enabled && !chartInView && barTotals.length > 0);

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

  function scrollToChart() {
    if (!chartEl) {
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    chartEl.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }
</script>

{#if showBar}
  <div
    class="fixed bottom-0 inset-x-0 z-50 px-[var(--gutter)] pb-[max(12px,env(safe-area-inset-bottom))] lg:hidden"
  >
    <button
      type="button"
      class="flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--line-strong)] bg-paper/90 px-4 py-3 text-left shadow-md backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
      aria-label={ariaLabel}
      onclick={scrollToChart}
    >
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
        class="flex shrink-0 items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-ink-2"
      >
        <Icon data={mdiChartLine} class="size-4" />
        View chart
      </span>
    </button>
  </div>
{/if}
