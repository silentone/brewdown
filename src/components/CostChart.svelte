<script lang="ts">
  import { onMount } from 'svelte';
  import { curveMonotoneX } from 'd3-shape';
  import { Circle, LineChart, Point, Text } from 'layerchart';
  import { METHODS, type MethodId } from '../data/methods';
  import { chartColorsForMethods } from '../lib/chart-colors';
  import {
    COMPARISON_MONTHS,
    cumulativeBrewingCostSeries,
    type CalculatorInputs,
  } from '../lib/brewing-cost';
  import { findPrimaryCrossover, formatYearApprox } from '../lib/insights';
  import { formatUsd } from '../lib/format';

  const axisLabelProps = {
    fill: 'var(--ink-2)',
    stroke: 'none',
    strokeWidth: 0,
    class: '!stroke-none ![stroke-width:0] font-normal',
  };

  interface Props {
    selectedMethodIds: MethodId[];
    inputs: CalculatorInputs;
  }

  let { selectedMethodIds, inputs }: Props = $props();

  let chartReady = $state(false);

  onMount(() => {
    chartReady = true;
  });

  const sortedMethodIds = $derived(
    [...selectedMethodIds].sort((a, b) => a.localeCompare(b)),
  );

  const colors = $derived(chartColorsForMethods(sortedMethodIds));

  const series = $derived(
    sortedMethodIds.map((methodId) => ({
      key: methodId,
      label: METHODS[methodId].label,
      data: cumulativeBrewingCostSeries(methodId, inputs).map((point) => ({
        month: point.month,
        cost: point.cost,
      })),
      value: 'cost' as const,
      color: colors[methodId],
      props: {
        tweened: false,
        draw: false,
        curve: curveMonotoneX,
        strokeWidth: 2.5,
      },
    })),
  );

  const crossover = $derived(findPrimaryCrossover(sortedMethodIds, inputs));

  const crossoverLabel = $derived(
    crossover
      ? `${crossover.longTermCheaperLabel} overtakes ${crossover.upfrontCheaperLabel} after ${formatYearApprox(crossover.years)}`
      : null,
  );

  function formatMonthAxis(month: number): string {
    return String(month);
  }

  function formatCostAxis(value: number): string {
    return formatUsd(value);
  }
</script>

<div class="space-y-3">
  {#if crossoverLabel}
    <p
      class="rounded-md border border-brand/20 bg-brand-soft px-3 py-2 text-sm text-ink-2"
      aria-live="polite"
    >
      <span class="font-medium text-ink">{crossoverLabel}</span>
      <span class="text-ink-3">
        {' '}
        ({formatUsd(crossover?.cost ?? 0)} at crossover)
      </span>
    </p>
  {/if}

  <div
    class="brewdown-chart w-full rounded-md border border-[var(--line)] bg-white p-2"
    role="img"
    aria-label="Cumulative brewing cost chart across selected methods"
  >
    {#if chartReady}
    <div class="h-72 min-h-[240px]">
    <LineChart
      data={[]}
      x="month"
      y="cost"
      {series}
      xDomain={[0, COMPARISON_MONTHS]}
      legend={false}
      grid={{ x: false, y: true }}
      rule={false}
      props={{
        spline: { tweened: false, draw: false, curve: curveMonotoneX },
        xAxis: {
          label: 'Months',
          format: formatMonthAxis,
          ticks: [0, 12, 24, 36, 48, 60],
          tickLabelProps: axisLabelProps,
          labelProps: axisLabelProps,
        },
        yAxis: {
          label: 'Cumulative cost',
          format: formatCostAxis,
          tickLabelProps: axisLabelProps,
          labelProps: axisLabelProps,
        },
        grid: {
          class: '[&_line]:stroke-[var(--chart-grid)]',
        },
      }}
      padding={{ top: 12, right: 12, bottom: 28, left: 56 }}
    >
      {#snippet aboveMarks()}
        {#if crossover}
          <Point d={{ month: crossover.months, cost: crossover.cost }} let:x let:y>
            <Circle
              {x}
              {y}
              r={6}
              fill="var(--brand-soft)"
              stroke="var(--chart-crossover)"
              strokeWidth={2}
            />
            <Text
              value="×"
              {x}
              y={y - 14}
              textAnchor="middle"
              fill="var(--ink)"
              stroke="none"
              strokeWidth={0}
              class="!stroke-none text-[10px] font-bold"
            />
          </Point>
        {/if}
      {/snippet}
    </LineChart>
    </div>

    <div
      class="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 px-1 text-xs text-ink-2"
      aria-label="Chart series legend"
    >
      {#each series as item (item.key)}
        <div class="flex items-center gap-1.5">
          <span
            class="inline-block h-3 w-3 shrink-0 rounded-full"
            style:background-color={item.color}
            aria-hidden="true"
          ></span>
          <span>{item.label}</span>
        </div>
      {/each}
    </div>
    {:else}
      <div class="flex h-full items-center justify-center text-sm text-ink-3">
        Loading chart…
      </div>
    {/if}
  </div>

  <p class="text-xs text-ink-3">
    Cumulative brewing cost includes upfront machine cost at the start, plus ongoing home and shop
    costs over time.
  </p>
</div>
