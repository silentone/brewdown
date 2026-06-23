<script lang="ts">
  import type { MethodId } from '../data/methods';
  import { resolveAffiliateGroups } from '../data/affiliates';
  import type { CalculatorInputs } from '../lib/brewing-cost';
  import { cardClasses } from '../lib/svelte-ux-classes';

  interface Props {
    selectedMethodIds: MethodId[];
    inputs: CalculatorInputs;
    sectionEl?: HTMLElement | null;
  }

  let {
    selectedMethodIds,
    inputs,
    sectionEl = $bindable(null),
  }: Props = $props();

  const groups = $derived(
    resolveAffiliateGroups({
      selectedMethodIds,
      inputs,
    }),
  );
</script>

{#if groups.length > 0}
  <div bind:this={sectionEl} id="brewdown-recommendations" class="space-y-5">
    <div>
      <p class="font-mono text-xs uppercase tracking-wide text-ink-3">Recommended machines</p>
      <p class="mt-1 text-sm text-ink-2">
        Recommended picks for your comparison. We may earn a commission on purchases.
      </p>
    </div>

    <div class="space-y-6">
      {#each groups as group, index (group.methodId)}
        <section class="space-y-3">
          {#if index > 0}
            <hr class="border-ink-4/40" />
          {/if}

          <div>
            <p class="text-sm font-medium text-ink-1">{group.label}</p>
          </div>

          <div class="grid grid-cols-1 gap-3">
            {#each group.links as link (link.id)}
              <a
                href={link.url}
                target="_blank"
                rel="noopener sponsored"
                class="{cardClasses.root} group flex min-w-0 flex-col overflow-hidden transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
              >
                <img
                  src={link.image}
                  alt=""
                  width="500"
                  height="500"
                  loading="lazy"
                  decoding="async"
                  class="aspect-square w-full bg-white object-contain p-3"
                />
                <div class="flex flex-1 flex-col gap-1.5 p-4">
                  <p class="text-sm font-medium text-ink">{link.label}</p>
                  <p class="line-clamp-2 text-xs leading-relaxed text-ink-2" title={link.highlight}>
                    {link.highlight}
                  </p>
                  <span
                    class="mt-auto pt-2 text-sm font-medium text-brand underline decoration-brand/30 underline-offset-2 group-hover:text-brand-deep"
                  >
                    Check price
                  </span>
                </div>
              </a>
            {/each}
          </div>
        </section>
      {/each}
    </div>
  </div>
{/if}
