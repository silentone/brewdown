<script lang="ts">
  import { Card, Switch } from 'svelte-ux';
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
  import { cardClasses, moreOptionsSwitchClasses } from '../lib/svelte-ux-classes';
  import { validateFullCalculator } from '../lib/validation';
  import { buildMethodResults } from '../lib/insights';
  import CostChart from './CostChart.svelte';
  import GlobalInputs from './GlobalInputs.svelte';
  import MethodPanel from './MethodPanel.svelte';
  import MobileChartBar from './MobileChartBar.svelte';
  import ReferralBlocks from './ReferralBlocks.svelte';
  import SummaryCards from './SummaryCards.svelte';

  interface Props {
    showAffiliates?: boolean;
  }

  let { showAffiliates = true }: Props = $props();

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
  let recommendationsSectionEl = $state<HTMLElement | null>(null);
  let breakdownSectionEl = $state<HTMLElement | null>(null);

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
    committedValidation.valid && selectedMethods.length >= 2,
  );
  const showDesktopAffiliates = $derived(
    showAffiliates && committedValidation.valid && selectedMethodIds.length > 0,
  );

  $effect(() => {
    cupsPerDay;
    pricePerShopDrink;
    selectedMethodIds;
    methodInputs;

    isUpdating = true;
    const timer = setTimeout(() => {
      const committedMethodInputs = $state.snapshot(methodInputs);
      committedInputs = {
        cupsPerDay,
        pricePerShopDrink,
        methodInputs: committedMethodInputs,
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
    const isSelectedBefore = selectedMethodIds.includes(methodId);

    if (isSelectedBefore) {
      selectedMethodIds = selectedMethodIds.filter((id) => id !== methodId);
    } else {
      selectedMethodIds = [...selectedMethodIds, methodId];
      openPanels = { ...openPanels, [methodId]: true };
    }
  }
</script>

<section
  class={[
    'mx-auto max-w-container px-[var(--gutter)] lg:pb-16',
    showMobileBar ? 'pb-24' : 'pb-16',
  ]}
>
  <div
    class={[
      'grid gap-8 lg:items-start',
      showDesktopAffiliates
        ? 'lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,0.5fr)]'
        : 'lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]',
    ]}
  >
    <Card classes={cardClasses} class="min-w-0">
      {#snippet contents()}
        <div class="space-y-6">
        <p class="font-mono text-xs uppercase tracking-wide text-ink-3">
          Inputs · Compare brewing methods
        </p>

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

        <GlobalInputs
          bind:cupsPerDay
          bind:pricePerShopDrink
          {showAdvancedOptions}
          errors={liveValidation.errors}
        />

        <div>
          <div class="mb-3 flex items-center justify-between gap-3">
            <p class="font-mono text-xs uppercase tracking-wide text-ink-3">
              Per-method settings
            </p>
            <div class="flex shrink-0 items-center gap-2">
              <label for="more-options-switch" class="cursor-pointer text-xs text-ink-3">
                More options
              </label>
              <Switch
                id="more-options-switch"
                bind:checked={showAdvancedOptions}
                size="sm"
                classes={moreOptionsSwitchClasses}
              />
            </div>
          </div>
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
        </div>
      {/snippet}
    </Card>

    <Card classes={cardClasses} class="min-w-0">
      {#snippet contents()}
        <div class="space-y-5">
        {#if selectedMethodIds.length === 0}
          <div class="flex items-center justify-between gap-3">
            <p class="font-mono text-xs uppercase tracking-wide text-ink-3">
              Results · Cumulative brewing cost
            </p>
          </div>
          <p class="text-sm text-brand-deep">
            Select at least one method to see brewing cost results.
          </p>
        {:else if !committedValidation.valid}
          <div class="flex items-center justify-between gap-3">
            <p class="font-mono text-xs uppercase tracking-wide text-ink-3">
              Results · Cumulative brewing cost
            </p>
          </div>
          <p class="text-sm text-ink-2">
            Adjust the inputs on the left. Results update automatically once values are valid.
          </p>
        {:else}
          <div id="brewdown-chart" bind:this={chartSectionEl} class="space-y-5">
            <div class="flex items-center justify-between gap-3">
              <p class="font-mono text-xs uppercase tracking-wide text-ink-3">
                Results · Cumulative brewing cost
              </p>
              {#if isUpdating}
                <span class="text-xs text-ink-3" aria-live="polite">Updating…</span>
              {/if}
            </div>

            <CostChart selectedMethodIds={selectedMethods} inputs={committedInputs} />
          </div>

          {#if showDesktopAffiliates}
            <div class="lg:hidden">
              <ReferralBlocks
                selectedMethodIds={selectedMethods}
                inputs={committedInputs}
                bind:sectionEl={recommendationsSectionEl}
              />
            </div>
          {/if}

          <div id="brewdown-breakdown" bind:this={breakdownSectionEl}>
            <SummaryCards selectedMethodIds={selectedMethods} inputs={committedInputs} />
          </div>
        {/if}
        </div>
      {/snippet}
    </Card>

    {#if showDesktopAffiliates}
      <Card classes={cardClasses} class="hidden min-w-0 self-start lg:sticky lg:top-6 lg:block">
        {#snippet contents()}
          <ReferralBlocks
            selectedMethodIds={selectedMethods}
            inputs={committedInputs}
          />
        {/snippet}
      </Card>
    {/if}
  </div>

  <MobileChartBar
    results={methodResults}
    chartEl={chartSectionEl}
    recommendationsEl={recommendationsSectionEl}
    breakdownEl={breakdownSectionEl}
    enabled={committedValidation.valid && selectedMethods.length >= 2}
  />
</section>
