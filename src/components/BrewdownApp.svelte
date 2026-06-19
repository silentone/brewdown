<script lang="ts">
  import { mdiChevronDown } from '@mdi/js';
  import { Card, Icon } from 'svelte-ux';
  import NumericField from './NumericField.svelte';
  import {
    DEFAULT_SELECTED_METHODS,
    METHOD_GROUPS,
    METHODS,
    createDefaultMethodInputsMap,
    type MethodId,
    type MethodInputValues,
  } from '../data/methods';
  import {
    type CalculatorInputs,
    createDefaultCalculatorInputs,
  } from '../lib/brewing-cost';
  import { cardClasses, advancedOptionsFieldClasses, advancedOptionsToggleClasses, fieldClasses } from '../lib/svelte-ux-classes';
  import { validateFullCalculator } from '../lib/validation';
  import { buildMethodResults } from '../lib/insights';
  import CostChart from './CostChart.svelte';
  import GlobalInputs from './GlobalInputs.svelte';
  import MethodPanel from './MethodPanel.svelte';
  import MobileChartBar from './MobileChartBar.svelte';
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
  let openPanels = $state<Partial<Record<MethodId, boolean>>>({});
  let showAdvancedOptions = $state(false);
  let chartSectionEl = $state<HTMLElement | null>(null);
  let chartInView = $state(false);

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

  const methodResults = $derived(buildMethodResults(selectedMethods, committedInputs));

  const showMobileBar = $derived(
    committedValidation.valid && selectedMethods.length >= 2 && !chartInView,
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

  function toggleMethod(methodId: MethodId) {
    if (selectedMethodIds.includes(methodId)) {
      selectedMethodIds = selectedMethodIds.filter((id) => id !== methodId);
      return;
    }

    selectedMethodIds = [...selectedMethodIds, methodId];
    openPanels = { ...openPanels, [methodId]: true };
  }
</script>

<section
  class={[
    'mx-auto max-w-container px-[var(--gutter)] lg:pb-16',
    showMobileBar ? 'pb-24' : 'pb-16',
  ]}
>
  <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
    <Card classes={cardClasses} class="min-w-0">
      {#snippet contents()}
        <div class="space-y-6">
        <p class="font-mono text-xs uppercase tracking-wide text-ink-3">
          Inputs · Compare methods
        </p>

        <GlobalInputs
          bind:cupsPerDay
          errors={liveValidation.errors}
        />

        <div>
          <p class="mb-1 text-sm font-medium text-ink-2">Methods to compare</p>
          {#if selectedMethodIds.length === 0}
            <p class="mb-2 text-xs text-brand-deep" aria-live="polite">
              Select at least one brewing method.
            </p>
          {:else if selectedMethodIds.length === 1}
            <p class="mb-2 text-xs text-brand-deep" aria-live="polite">
              Select at least two methods across any group.
            </p>
          {/if}
          <div class="space-y-3" role="group" aria-label="Brewing methods">
            {#each METHOD_GROUPS as group (group.id)}
              <div class="method-group">
                <p class="mb-1.5 text-xs font-medium text-ink-3">{group.label}</p>
                <div class="flex flex-wrap gap-2">
                  {#each group.methodIds as methodId (methodId)}
                    <button
                      type="button"
                      class="method-pill-checkbox"
                      aria-pressed={selectedMethodIds.includes(methodId)}
                      onclick={() => toggleMethod(methodId)}
                    >
                      <span class="method-pill-checkbox__label">{METHODS[methodId].label}</span>
                    </button>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        </div>

        <button
          type="button"
          class={advancedOptionsToggleClasses.button}
          aria-expanded={showAdvancedOptions}
          onclick={() => (showAdvancedOptions = !showAdvancedOptions)}
        >
          <span class={advancedOptionsToggleClasses.label}>Advanced options</span>
          <div
            data-open={showAdvancedOptions}
            class={advancedOptionsToggleClasses.icon}
          >
            <Icon data={mdiChevronDown} />
          </div>
        </button>

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
                open={openPanels[methodId] ?? true}
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
            <NumericField
              label="Average shop drink price"
              currency
              bind:value={pricePerShopDrink}
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

        {#if selectedMethodIds.length === 0}
          <p class="text-sm text-brand-deep">
            Select at least one method to see brewing cost results.
          </p>
        {:else if !committedValidation.valid}
          <p class="text-sm text-ink-2">
            Adjust the inputs on the left. Results update automatically once values are valid.
          </p>
        {:else}
          <div id="brewdown-chart" bind:this={chartSectionEl}>
            <CostChart selectedMethodIds={selectedMethods} inputs={committedInputs} />
          </div>

          <SummaryCards selectedMethodIds={selectedMethods} inputs={committedInputs} />
        {/if}
        </div>
      {/snippet}
    </Card>
  </div>

  <MobileChartBar
    results={methodResults}
    chartEl={chartSectionEl}
    enabled={committedValidation.valid && selectedMethods.length >= 2}
    bind:chartInView
  />
</section>
