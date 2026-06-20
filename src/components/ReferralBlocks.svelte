<script lang="ts">
  import { Card } from 'svelte-ux';
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

          <div class="grid gap-3 sm:grid-cols-3">
            {#each group.links as link (link.id)}
              <Card classes={cardClasses} class="min-w-0">
                {#snippet contents()}
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener sponsored"
                    class="text-sm font-medium text-brand underline decoration-brand/30 underline-offset-2 hover:text-brand-deep"
                  >
                    {link.label}
                  </a>
                {/snippet}
              </Card>
            {/each}
          </div>
        </section>
      {/each}
    </div>
  </div>
{/if}
