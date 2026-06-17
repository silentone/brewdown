<script lang="ts">
  import { METHODS, type MethodId } from '../data/methods';
  import { chartColorsForMethods } from '../lib/chart-colors';
  import { COMPARISON_MONTHS, periodBreakdown, type CalculatorInputs } from '../lib/brewing-cost';
  import { formatUsd } from '../lib/format';

  interface Props {
    selectedMethodIds: MethodId[];
    inputs: CalculatorInputs;
  }

  let { selectedMethodIds, inputs }: Props = $props();

  const sortedMethodIds = $derived(
    [...selectedMethodIds].sort((a, b) => a.localeCompare(b)),
  );

  const colors = $derived(chartColorsForMethods(sortedMethodIds));

  const rows = $derived(
    sortedMethodIds.map((methodId) => ({
      methodId,
      label: METHODS[methodId].label,
      breakdown: periodBreakdown(methodId, inputs, COMPARISON_MONTHS),
      color: colors[methodId],
    })),
  );
</script>

<div class="overflow-x-auto">
  <table class="w-full min-w-[640px] border-collapse text-sm">
    <caption class="sr-only">
      Brewing cost breakdown by method at the end of the {COMPARISON_MONTHS / 12}-year comparison
    </caption>
    <thead>
      <tr class="bg-paper-3 text-left text-xs uppercase tracking-wide text-ink-2">
        <th scope="col" class="rounded-tl-md px-4 py-3 font-medium">Method</th>
        <th scope="col" class="px-4 py-3 font-medium text-right">Machine</th>
        <th scope="col" class="px-4 py-3 font-medium text-right">Home</th>
        <th scope="col" class="px-4 py-3 font-medium text-right">Shop</th>
        <th scope="col" class="px-4 py-3 font-medium text-right">Total</th>
        <th scope="col" class="rounded-tr-md px-4 py-3 font-medium text-right">$/drink</th>
      </tr>
    </thead>
    <tbody>
      {#each rows as row (row.methodId)}
        <tr class="border-t border-[var(--line)] bg-white">
          <th scope="row" class="px-4 py-3 text-left font-medium text-ink">
            <span
              class="mr-2 inline-block h-2.5 w-2.5 rounded-full"
              style:background-color={row.color}
              aria-hidden="true"
            ></span>
            {row.label}
          </th>
          <td class="px-4 py-3 text-right font-mono text-ink-2">
            {formatUsd(row.breakdown.machine)}
          </td>
          <td class="px-4 py-3 text-right font-mono text-ink-2">
            {formatUsd(row.breakdown.home)}
          </td>
          <td class="px-4 py-3 text-right font-mono text-ink-2">
            {formatUsd(row.breakdown.shop)}
          </td>
          <td class="px-4 py-3 text-right font-mono font-medium text-ink">
            {formatUsd(row.breakdown.total)}
          </td>
          <td class="px-4 py-3 text-right font-mono text-ink-2">
            {row.breakdown.costPerDrink === null
              ? 'N/A'
              : formatUsd(row.breakdown.costPerDrink, 2)}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
