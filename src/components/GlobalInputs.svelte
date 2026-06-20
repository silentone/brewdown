<script lang="ts">
  import NumericField from './NumericField.svelte';
  import { advancedOptionsFieldClasses, fieldClasses } from '../lib/svelte-ux-classes';

  interface Props {
    cupsPerDay: number;
    pricePerShopDrink: number;
    showAdvancedOptions?: boolean;
    errors?: string[];
  }

  let {
    cupsPerDay = $bindable(),
    pricePerShopDrink = $bindable(),
    showAdvancedOptions = false,
    errors = [],
  }: Props = $props();
</script>

<div class="space-y-5">
  <div class="grid gap-4 sm:grid-cols-2">
    <NumericField
      label="Coffee drinks at home per day"
      bind:value={cupsPerDay}
      classes={fieldClasses}
    />
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

  {#if errors.length > 0}
    <div
      class="rounded-md border border-brand/30 bg-brand-soft px-4 py-3"
      role="alert"
      aria-live="polite"
    >
      <p class="text-sm font-medium text-brand-deep">Fix these inputs to update results:</p>
      <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-2">
        {#each errors as error (error)}
          <li>{error}</li>
        {/each}
      </ul>
    </div>
  {/if}
</div>
