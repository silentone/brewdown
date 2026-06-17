<script lang="ts">
  import { Collapse, TextField, ToggleGroup, ToggleOption } from 'svelte-ux';
  import {
    METHODS,
    type MethodId,
    type MethodInputValues,
    type ShopPeriod,
  } from '../data/methods';
  import {
    collapseClasses,
    fieldClasses,
    advancedOptionsFieldClasses,
    inlineShopPeriodToggleClasses,
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

  const method = METHODS[methodId];

  const machineLabel = $derived(
    methodId === 'manual_espresso'
      ? 'Machine cost (includes grinder)'
      : 'Machine cost (upfront)',
  );

  const ingredientLabel = $derived(
    method.ingredientModel === 'pods' ? 'Cost per pod / capsule' : 'Coffee cost ($/lb)',
  );

  function patch(next: Partial<MethodInputValues>) {
    onValuesChange({ ...values, ...next });
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
    <div class="grid gap-4 sm:grid-cols-2">
      <TextField
        label={machineLabel}
        type="decimal"
        value={values.machineCost}
        on:change={(event) => patch({ machineCost: Number(event.detail.value ?? 0) })}
        min={0}
        step={1}
        classes={fieldClasses}
      />

      <TextField
        label={ingredientLabel}
        type="decimal"
        value={values.ingredientCost}
        on:change={(event) => patch({ ingredientCost: Number(event.detail.value ?? 0) })}
        min={0}
        step={method.ingredientModel === 'pods' ? 0.01 : 0.5}
        classes={fieldClasses}
      />
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <TextField
        label="Shop drinks"
        type="decimal"
        value={values.shopDrinks}
        on:change={(event) => patch({ shopDrinks: Number(event.detail.value ?? 0) })}
        min={0}
        step={1}
        hint="Better home setups often mean fewer shop visits. Adjust if needed."
        classes={fieldClasses}
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
      </TextField>

      {#if method.fieldVisibility.includes('gramsPerCup')}
        <div
          class={[advancedOptionsFieldClasses.root, !showAdvancedOptions && advancedOptionsFieldClasses.hidden]}
          aria-hidden={!showAdvancedOptions}
          inert={!showAdvancedOptions}
        >
          <TextField
            label="Grams per cup"
            type="decimal"
            value={values.gramsPerCup}
            on:change={(event) => patch({ gramsPerCup: Number(event.detail.value ?? 0) })}
            min={1}
            step={1}
            hint="Typical range: 12 to 18g for most brews."
            disabled={!showAdvancedOptions}
            classes={fieldClasses}
          />
        </div>
      {:else if method.fieldVisibility.includes('podsPerCup')}
        <div
          class={[advancedOptionsFieldClasses.root, !showAdvancedOptions && advancedOptionsFieldClasses.hidden]}
          aria-hidden={!showAdvancedOptions}
          inert={!showAdvancedOptions}
        >
          <TextField
            label="Pods per cup"
            type="decimal"
            value={values.podsPerCup}
            on:change={(event) => patch({ podsPerCup: Number(event.detail.value ?? 0) })}
            min={1}
            step={1}
            disabled={!showAdvancedOptions}
            classes={fieldClasses}
          />
        </div>
      {/if}
    </div>
  </div>
</Collapse>
