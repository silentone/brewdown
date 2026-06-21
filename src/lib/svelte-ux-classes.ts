/** Shared Svelte UX class overrides themed to Brewdown tokens. */
export const fieldClasses = {
  root: 'gap-1.5',
  container:
    'rounded-md border border-[var(--line)] bg-white shadow-sm focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20',
  label:
    'text-sm font-medium text-ink-2 group-hover:text-ink-2 group-focus-within:text-ink-2 group-hover:group-focus-within:text-ink-2',
  input: 'text-ink placeholder:text-ink-3 !overflow-visible whitespace-nowrap',
  error: 'text-sm text-brand-deep',
} as const;

export type FieldClasses = typeof fieldClasses;

export const cardClasses = {
  root: 'rounded-lg border border-[var(--line)] bg-paper-2 shadow-md',
  content: 'p-5 md:p-6',
} as const;

export const checkboxClasses = {
  root: 'gap-2.5',
  checkbox: 'border-ink-3 bg-white text-brand peer-checked:border-brand peer-checked:bg-brand',
  label: 'text-sm text-ink-2',
} as const;

export const methodPillCheckboxClasses = {
  root: 'method-pill-checkbox',
  checkbox: 'method-pill-checkbox__box',
  label: 'method-pill-checkbox__label',
  icon: 'method-pill-checkbox__icon',
} as const;

export const collapseClasses = {
  root: 'rounded-md border border-[var(--line)] bg-white',
  trigger: 'flex-1 font-medium text-ink',
  content: 'border-t border-[var(--line)] px-4 py-4',
  icon: 'text-ink-3',
} as const;

export const moreOptionsSwitchClasses = {
  switch:
    'border-[var(--line)] bg-ink-2 data-[checked=true]:border-brand data-[checked=true]:bg-brand',
  toggle: 'bg-white',
} as const;

export const advancedOptionsFieldClasses = {
  root: 'advanced-options-field',
  inner: 'advanced-options-field__inner',
  hidden: 'advanced-options-field--hidden',
} as const;

export const toggleGroupClasses = {
  root: 'w-full',
  options: 'grid overflow-hidden rounded-md border border-[var(--line)] bg-white',
  option: 'px-3 py-2 text-sm font-medium',
  label:
    'text-ink-2 transition-colors hover:text-ink [&.selected]:bg-brand-soft [&.selected]:font-medium [&.selected]:text-brand-deep [&:not(:first-child)]:border-l [&:not(:first-child)]:border-[var(--line)]',
  indicator: 'hidden',
} as const;

export const inlineShopPeriodToggleClasses = {
  root: '',
  options: 'flex overflow-hidden rounded-md border border-[var(--line)] bg-white',
  option: 'px-1.5 py-0.5 text-xs font-medium',
  label:
    'text-ink-2 transition-colors hover:text-ink [&.selected]:bg-brand-soft [&.selected]:font-medium [&.selected]:text-brand-deep [&:not(:first-child)]:border-l [&:not(:first-child)]:border-[var(--line)]',
  indicator: 'hidden',
} as const;

export const selectFieldClasses = {
  root: 'gap-1.5',
  field: fieldClasses,
  option: 'text-ink',
  selected: 'bg-brand-soft text-brand-deep',
} as const;
