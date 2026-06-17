<script lang="ts">
  import { mdiChevronDown } from '@mdi/js';
  import { Checkbox, Icon, TextField } from 'svelte-ux';
  import {
    METHOD_IDS,
    METHODS,
    type MethodId,
  } from '../data/methods';
  import {
    advancedOptionsToggleClasses,
    checkboxClasses,
    fieldClasses,
  } from '../lib/svelte-ux-classes';

  interface Props {
    cupsPerDay: number;
    selectedMethodIds: MethodId[];
    showAdvancedOptions?: boolean;
    errors?: string[];
  }

  let {
    cupsPerDay = $bindable(),
    selectedMethodIds = $bindable(),
    showAdvancedOptions = $bindable(false),
    errors = [],
  }: Props = $props();

  const methodOptions = METHOD_IDS.map((id) => ({
    id,
    label: METHODS[id].label,
  }));

  function canDeselect(methodId: MethodId): boolean {
    return selectedMethodIds.length > 2 || !selectedMethodIds.includes(methodId);
  }
</script>

<div class="space-y-5">
  <TextField
    label="Home drinks per day"
    type="decimal"
    bind:value={cupsPerDay}
    step={0.5}
    min={0.5}
    hint="Home-brewed cups, shared across all methods."
    classes={fieldClasses}
  />

  <div>
    <p class="mb-1 text-sm font-medium text-ink-2">Methods to compare</p>
    <p class="mb-2 text-xs text-ink-3">Select at least two brewing methods.</p>
    <ul class="space-y-2.5" role="group" aria-label="Brewing methods">
      {#each methodOptions as method (method.id)}
        <li>
          <Checkbox
            value={method.id}
            bind:group={selectedMethodIds}
            disabled={!canDeselect(method.id)}
            classes={checkboxClasses}
          >
            {method.label}
          </Checkbox>
        </li>
      {/each}
    </ul>
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
