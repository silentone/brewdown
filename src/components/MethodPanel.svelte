<script lang="ts">
  import { Collapse, ToggleGroup, ToggleOption } from 'svelte-ux';
  import NumericField from './NumericField.svelte';
  import {
    applyBulkGearPreset,
    applyPodStylePreset,
    BULK_GEAR_PRESET_IDS,
    BULK_GEAR_PRESETS,
    METHODS,
    POD_STYLE_PRESET_IDS,
    POD_STYLE_PRESETS,
    type BulkGearPreset,
    type MethodId,
    type MethodInputValues,
    type PodStylePreset,
    type ShopPeriod,
  } from '../data/methods';
  import {
    collapseClasses,
    fieldClasses,
    advancedOptionsFieldClasses,
    inlineShopPeriodToggleClasses,
    toggleGroupClasses,
  } from '../lib/svelte-ux-classes';

  interface Props {
    methodId: MethodId;
    values: MethodInputValues;
    open?: boolean;
    showAdvancedOptions?: boolean;
    onValuesChange: (values: MethodInputValues) => void;
    onToggle?: (methodId: MethodId, open: boolean) => void;
  }

  let {
    methodId,
    values,
    open = false,
    showAdvancedOptions = false,
    onValuesChange,
    onToggle,
  }: Props = $props();

  const method = $derived(METHODS[methodId]);

  const machineLabel = $derived(
    methodId === 'manual_espresso'
      ? 'Machine cost (includes grinder)'
      : 'Machine cost',
  );

  const ingredientLabel = $derived(
    method.ingredientModel === 'pods' ? 'Cost per pod' : 'Coffee cost ($/lb)',
  );

  const pairedRowLabelClass = 'sm:min-h-[2.5rem] sm:flex sm:items-end leading-tight';

  const rowOneNeedsPairedLabels = $derived(methodId === 'manual_espresso');

  const rowTwoNeedsPairedLabels = $derived(
    showAdvancedOptions &&
      (method.fieldVisibility.includes('gramsPerCup') ||
        method.fieldVisibility.includes('podsPerCup')),
  );

  const rowOneFieldClasses = $derived({
    ...fieldClasses,
    label: rowOneNeedsPairedLabels
      ? `${fieldClasses.label} ${pairedRowLabelClass}`
      : fieldClasses.label,
  });

  const rowTwoFieldClasses = $derived({
    ...fieldClasses,
    label: rowTwoNeedsPairedLabels
      ? `${fieldClasses.label} ${pairedRowLabelClass}`
      : fieldClasses.label,
  });

  function patch(next: Partial<MethodInputValues>) {
    onValuesChange({ ...values, ...next });
  }

  function handleGearPresetChange(preset: BulkGearPreset) {
    patch(applyBulkGearPreset(preset, values.shopPeriod));
  }

  function handlePodStyleChange(style: PodStylePreset) {
    patch(applyPodStylePreset(style, values.shopPeriod));
  }

  function handleCollapseChange(event: CustomEvent<{ open: boolean }>) {
    onToggle?.(methodId, event.detail.open);
  }
</script>

<Collapse
  {open}
  name={method.label}
  classes={collapseClasses}
  on:change={handleCollapseChange}
>
  {#snippet trigger()}
    <div class="flex flex-1 items-center justify-between gap-3">
      <span>{method.label}</span>
      <span class="text-xs font-normal text-ink-3">
        {method.ingredientModel === 'pods' ? 'Pods' : 'Bulk'}
      </span>
    </div>
  {/snippet}

  <div class="space-y-4">
    {#if methodId === 'bulk_brew'}
      <div>
        <p class="mb-1.5 text-sm font-medium text-ink-2">Gear preset</p>
        <ToggleGroup
          value={values.gearPreset ?? 'drip'}
          on:change={(e) => {
            const v = e.detail.value as BulkGearPreset | null;
            if (v) handleGearPresetChange(v);
          }}
          variant="none"
          size="sm"
          rounded={false}
          classes={toggleGroupClasses}
        >
          {#each BULK_GEAR_PRESET_IDS as preset (preset)}
            <ToggleOption value={preset}>{BULK_GEAR_PRESETS[preset].label}</ToggleOption>
          {/each}
        </ToggleGroup>
      </div>
    {:else if methodId === 'pods'}
      <div>
        <p class="mb-1.5 text-sm font-medium text-ink-2">Pod style</p>
        <ToggleGroup
          value={values.podStyle ?? 'kcup'}
          on:change={(e) => {
            const v = e.detail.value as PodStylePreset | null;
            if (v) handlePodStyleChange(v);
          }}
          variant="none"
          size="sm"
          rounded={false}
          classes={toggleGroupClasses}
        >
          {#each POD_STYLE_PRESET_IDS as style (style)}
            <ToggleOption value={style}>{POD_STYLE_PRESETS[style].label}</ToggleOption>
          {/each}
        </ToggleGroup>
      </div>
    {/if}

    <div class="grid gap-4 sm:grid-cols-2">
      <NumericField
        label={machineLabel}
        currency
        value={values.machineCost}
        onchange={(machineCost) => patch({ machineCost })}
        classes={rowOneFieldClasses}
      />

      <NumericField
        label={ingredientLabel}
        currency
        value={values.ingredientCost}
        onchange={(ingredientCost) => patch({ ingredientCost })}
        classes={rowOneFieldClasses}
      />
    </div>

    <div class={['grid gap-4 sm:grid-cols-2', !showAdvancedOptions && 'max-lg:grid-cols-1 max-lg:gap-y-0']}>
      <NumericField
        label="Drinks purchased at coffee shops"
        value={values.shopDrinks}
        onchange={(shopDrinks) => patch({ shopDrinks })}
        hint="Better home setups often mean fewer shop visits. Adjust if needed."
        classes={rowTwoFieldClasses}
      >
        <div slot="append" class="flex shrink-0 items-center pl-1" on:click|stopPropagation role="none">
          <ToggleGroup
            value={values.shopPeriod}
            on:change={(e) => {
              const v = e.detail.value as ShopPeriod | null;
              if (v) patch({ shopPeriod: v });
            }}
            variant="none"
            size="xs"
            rounded={false}
            classes={inlineShopPeriodToggleClasses}
          >
            <ToggleOption value="week">wk</ToggleOption>
            <ToggleOption value="month">mo</ToggleOption>
          </ToggleGroup>
        </div>
      </NumericField>

      {#if method.fieldVisibility.includes('gramsPerCup')}
        <div
          class={[advancedOptionsFieldClasses.root, !showAdvancedOptions && advancedOptionsFieldClasses.hidden]}
          aria-hidden={!showAdvancedOptions}
          inert={!showAdvancedOptions}
        >
          <div class={advancedOptionsFieldClasses.inner}>
            <NumericField
              label="Grams per cup"
              value={values.gramsPerCup}
              onchange={(gramsPerCup) => patch({ gramsPerCup })}
              hint="Typical range: 10 - 20g for most 6oz brews."
              disabled={!showAdvancedOptions}
              classes={rowTwoFieldClasses}
            />
          </div>
        </div>
      {:else if method.fieldVisibility.includes('podsPerCup')}
        <div
          class={[advancedOptionsFieldClasses.root, !showAdvancedOptions && advancedOptionsFieldClasses.hidden]}
          aria-hidden={!showAdvancedOptions}
          inert={!showAdvancedOptions}
        >
          <div class={advancedOptionsFieldClasses.inner}>
            <NumericField
              label="Pods per cup"
              value={values.podsPerCup}
              onchange={(podsPerCup) => patch({ podsPerCup })}
              disabled={!showAdvancedOptions}
              classes={rowTwoFieldClasses}
            />
          </div>
        </div>
      {/if}
    </div>
  </div>
</Collapse>
