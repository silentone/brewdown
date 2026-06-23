<script lang="ts">
  import { fieldClasses, type FieldClasses } from '../lib/svelte-ux-classes';

  interface Props {
    label: string;
    value: number;
    hint?: string;
    disabled?: boolean;
    currency?: boolean;
  autofocus?: boolean;
    classes?: FieldClasses;
    onchange?: (value: number) => void;
    id?: string;
  }

  const generatedId = $props.id();

  let {
    label,
    value = $bindable(),
    hint = '',
    disabled = false,
    currency = false,
  autofocus = false,
    classes = fieldClasses,
    onchange,
    id = generatedId,
  }: Props = $props();

  let focused = $state(false);
  let draft = $state(String(value));

  const displayValue = $derived(focused ? draft : String(value));

  $effect(() => {
    if (!focused) {
      draft = String(value);
    }
  });

  function commit(next: number) {
    value = next;
    onchange?.(next);
  }

  function sanitize(raw: string): string {
    return raw.trim().replace(/[$,\s]/g, '');
  }

  function parseDecimal(raw: string): number | null {
    const cleaned = sanitize(raw);
    if (cleaned === '' || cleaned === '.' || cleaned === '-') return null;
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : null;
  }

  function handleInput(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const raw = input.value;
    draft = sanitize(raw);
    if (input.value !== draft) {
      input.value = draft;
    }
    const parsed = parseDecimal(draft);
    if (parsed !== null) {
      commit(parsed);
    }
  }

  function handleFocus() {
    focused = true;
    draft = String(value);
  }

  function handleBlur() {
    focused = false;
    const parsed = parseDecimal(draft);
    commit(parsed ?? 0);
    draft = String(value);
  }
</script>

<div
  class={[classes.root, 'group flex flex-col', disabled && 'pointer-events-none opacity-50']}
>
  <label for={id} class={[classes.label, 'cursor-default']}>
    {label}
  </label>

  <div class="flex-1">
    <div class={[classes.container, 'px-2']}>
      <div class="my-2 flex items-center gap-1">
        {#if currency}
          <span
            class="shrink-0 select-none pl-0.5 text-sm font-medium tabular-nums text-ink-3"
            aria-hidden="true"
          >
            $
          </span>
        {/if}

        <input
          {id}
          type="text"
          inputmode="decimal"
          autocomplete="off"
          {autofocus}
          {disabled}
          value={displayValue}
          oninput={handleInput}
          onfocus={handleFocus}
          onblur={handleBlur}
          class={[
            classes.input,
            'min-w-0 flex-1 border-none bg-transparent text-sm tabular-nums outline-none selection:bg-brand/20',
          ]}
        />

        <div class="flex shrink-0 items-center">
          <slot name="append" />
        </div>
      </div>
    </div>

    {#if hint}
      <p class="ml-2 text-xs text-ink-3">{hint}</p>
    {/if}
  </div>
</div>
