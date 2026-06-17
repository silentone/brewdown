<script lang="ts">
  import { Card, TextField } from 'svelte-ux';
  import {
    DEFAULT_SELECTED_METHODS,
    createDefaultMethodInputsMap,
    type MethodId,
    type MethodInputValues,
  } from '../data/methods';
  import {
    type CalculatorInputs,
    createDefaultCalculatorInputs,
  } from '../lib/brewing-cost';
  import { cardClasses, advancedOptionsFieldClasses, fieldClasses } from '../lib/svelte-ux-classes';
  import { validateFullCalculator } from '../lib/validation';
  import BreakdownTable from './BreakdownTable.svelte';
  import CostChart from './CostChart.svelte';
  import GlobalInputs from './GlobalInputs.svelte';
  import MethodPanel from './MethodPanel.svelte';
  import SummaryCards from './SummaryCards.svelte';

  const DEBOUNCE_MS = 300;

  export type CalculatorState = {
    cupsPerDay: number;
    pricePerShopDrink: number;
    selectedMethodIds: MethodId[];
    methodInputs: Record<MethodId, MethodInputValues>;
  };

  function createInitialState(): CalculatorState {
    const defaults = createDefaultCalculatorInputs();
    return {
      cupsPerDay: defaults.cupsPerDay,
      pricePerShopDrink: defaults.pricePerShopDrink,
      selectedMethodIds: [...DEFAULT_SELECTED_METHODS],
      methodInputs: defaults.methodInputs,
    };
  }

  let cupsPerDay = $state(createInitialState().cupsPerDay);
  let pricePerShopDrink = $state(createInitialState().pricePerShopDrink);
  let selectedMethodIds = $state<MethodId[]>([...DEFAULT_SELECTED_METHODS]);
  let methodInputs = $state<Record<MethodId, MethodInputValues>>(
    createDefaultMethodInputsMap(),
  );

  let committedInputs = $state<CalculatorInputs>(createDefaultCalculatorInputs());
  let isUpdating = $state(false);
  let openPanels = $state<Partial<Record<MethodId, boolean>>>({
    pods: true,
    bean_to_cup: true,
  });
  let showAdvancedOptions = $state(false);

  const liveValidation = $derived(
    validateFullCalculator({
      cupsPerDay,
      pricePerShopDrink,
      selectedMethodIds,
      methodInputs,
    }),
  );

  const committedValidation = $derived(
    validateFullCalculator({
      cupsPerDay: committedInputs.cupsPerDay,
      pricePerShopDrink: committedInputs.pricePerShopDrink,
      selectedMethodIds,
      methodInputs: committedInputs.methodInputs,
    }),
  );

  const selectedMethods = $derived(
    selectedMethodIds.slice().sort((a, b) => a.localeCompare(b)),
  );

  $effect(() => {
    cupsPerDay;
    pricePerShopDrink;
    selectedMethodIds;
    methodInputs;

    isUpdating = true;
    const timer = setTimeout(() => {
      committedInputs = {
        cupsPerDay,
        pricePerShopDrink,
        methodInputs: $state.snapshot(methodInputs),
      };
      isUpdating = false;
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
    };
  });

  function handlePanelToggle(methodId: MethodId, open: boolean) {
    openPanels = { ...openPanels, [methodId]: open };
  }

  function updateMethodValues(methodId: MethodId, values: MethodInputValues) {
    methodInputs = { ...methodInputs, [methodId]: values };
  }
</script>

<section class="mx-auto max-w-container px-[var(--gutter)] pb-16">
  <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
    <Card classes={cardClasses} class="min-w-0">
      {#snippet contents()}
        <div class="space-y-6">
        <p class="font-mono text-xs uppercase tracking-wide text-ink-3">
          Inputs · Compare methods
        </p>

        <GlobalInputs
          bind:cupsPerDay
          bind:selectedMethodIds
          bind:showAdvancedOptions
          errors={liveValidation.errors}
        />

        <div>
          <p class="mb-3 font-mono text-xs uppercase tracking-wide text-ink-3">
            Per-method settings
          </p>
          <div class="space-y-3">
            {#each selectedMethods as methodId (methodId)}
              <MethodPanel
                {methodId}
                values={methodInputs[methodId]}
                onValuesChange={(values) => updateMethodValues(methodId, values)}
                open={openPanels[methodId] ?? false}
                onToggle={handlePanelToggle}
                {showAdvancedOptions}
              />
            {/each}
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div
            class={[advancedOptionsFieldClasses.root, !showAdvancedOptions && advancedOptionsFieldClasses.hidden]}
            aria-hidden={!showAdvancedOptions}
            inert={!showAdvancedOptions}
          >
            <TextField
              label="Average shop drink price"
              type="currency"
              bind:value={pricePerShopDrink}
              min={0}
              disabled={!showAdvancedOptions}
              classes={fieldClasses}
            />
          </div>
        </div>
        </div>
      {/snippet}
    </Card>

    <Card classes={cardClasses} class="min-w-0">
      {#snippet contents()}
        <div class="space-y-5">
        <div class="flex items-center justify-between gap-3">
          <p class="font-mono text-xs uppercase tracking-wide text-ink-3">
            Results · Cumulative brewing cost
          </p>
          {#if isUpdating}
            <span class="text-xs text-ink-3" aria-live="polite">Updating…</span>
          {/if}
        </div>

        {#if !committedValidation.valid}
          <p class="text-sm text-ink-2">
            Adjust the inputs on the left. Results update automatically once values are valid.
          </p>
        {:else}
          <CostChart selectedMethodIds={selectedMethods} inputs={committedInputs} />

          <SummaryCards selectedMethodIds={selectedMethods} inputs={committedInputs} />

          <div>
            <p class="mb-3 font-mono text-xs uppercase tracking-wide text-ink-3">
              Cost breakdown
            </p>
            <BreakdownTable selectedMethodIds={selectedMethods} inputs={committedInputs} />
          </div>
        {/if}
        </div>
      {/snippet}
    </Card>
  </div>
</section>
