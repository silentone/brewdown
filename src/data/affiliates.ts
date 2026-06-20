import type { BulkGearPreset, MethodId, MethodInputValues } from './methods';
import { METHODS } from './methods';
import type { CalculatorInputs } from '../lib/brewing-cost';
import { buildMethodResults } from '../lib/insights';

export interface AffiliateLink {
  id: string;
  label: string;
  url: string;
}

export type AffiliatePresetKey =
  | { methodId: 'bean_to_cup' }
  | { methodId: 'manual_espresso' }
  | { methodId: 'bulk_brew'; bulkGearPreset: BulkGearPreset };

export interface AffiliateMethodGroup {
  methodId: MethodId;
  label: string;
  rank: number;
  links: AffiliateLink[];
}

export interface ReferralContext {
  selectedMethodIds: MethodId[];
  inputs: CalculatorInputs;
}

/** Placeholder URLs until affiliate programs are chosen (SPEC §12.9). */
export const AFFILIATE_PRESETS: Record<string, AffiliateLink[]> = {
  bean_to_cup: [
    {
      id: 'bean-to-cup-budget',
      label: 'Philips 3300 LatteGo',
      url: 'https://amzn.to/40iuZvK',
    },
    {
      id: 'bean-to-cup-mid',
      label: 'Jura E4',
      url: 'https://a.co/d/01XWVlZc',
    },
    {
      id: 'bean-to-cup-premium',
      label: "De'Longhi Eletta Explore",
      url: 'https://a.co/d/09NcYNE9',
    },
  ],
  manual_espresso: [
    {
      id: 'manual-espresso-entry',
      label: "De'Longhi La Specialista Arte Evo",
      url: 'https://a.co/d/093cyUiV',
    },
    {
      id: 'manual-espresso-mid',
      label: 'Breville Barista Touch',
      url: 'https://a.co/d/0j2aL4yf',
    },
    {
      id: 'manual-espresso-premium',
      label: 'Ascaso Steel Duo',
      url: 'https://a.co/d/08nHb8XW',
    },
  ],
  'bulk_brew:drip': [
    {
      id: 'bulk-drip-budget',
      label: 'Ninja 12-Cup Programmable',
      url: 'https://a.co/d/0iIhry37',
    },
    {
      id: 'bulk-drip-mid',
      label: 'OXO Brew 9 cup',
      url: 'https://a.co/d/0eS3uRUY',
    },
    {
      id: 'bulk-drip-premium',
      label: 'Ratio Four',
      url: 'https://a.co/d/04cr1Hb8',
    },
  ],
  'bulk_brew:french_press': [
    {
      id: 'bulk-french-press-budget',
      label: 'Bodum Java',
      url: 'https://a.co/d/09WxSvq7',
    },
    {
      id: 'bulk-french-press-mid',
      label: 'Bodum Chambord',
      url: 'https://a.co/d/05gw5ZCH',
    },
    {
      id: 'bulk-french-press-premium',
      label: 'Espro Light P3',
      url: 'https://a.co/d/0fnJOalx',
    },
  ],
  'bulk_brew:pour_over': [
    {
      id: 'bulk-pour-over-budget',
      label: 'Kalita Wave',
      url: 'https://a.co/d/0brQ3wUm',
    },
    {
      id: 'bulk-pour-over-mid',
      label: 'Hario V-60',
      url: 'https://a.co/d/0cWqkv45',
    },
    {
      id: 'bulk-pour-over-premium',
      label: 'Chemex',
      url: 'https://a.co/d/08ppBPLd',
    },
  ],
};

function resolvePresetKey(
  methodId: MethodId,
  methodInputs: MethodInputValues,
): string | null {
  if (methodId === 'pods') {
    return null;
  }

  if (methodId === 'bulk_brew') {
    const preset = methodInputs.gearPreset ?? 'drip';
    return `bulk_brew:${preset}`;
  }

  return methodId;
}

/** Contextual affiliate groups for selected methods, ordered by cost rank. */
export function resolveAffiliateGroups(context: ReferralContext): AffiliateMethodGroup[] {
  const results = buildMethodResults(context.selectedMethodIds, context.inputs);
  const rankByMethod = new Map(results.map((result) => [result.methodId, result.rank]));

  const groups: AffiliateMethodGroup[] = [];

  for (const methodId of context.selectedMethodIds) {
    if (methodId === 'pods') {
      continue;
    }

    const presetKey = resolvePresetKey(methodId, context.inputs.methodInputs[methodId]);
    if (!presetKey) {
      continue;
    }

    const links = AFFILIATE_PRESETS[presetKey];
    if (!links || links.length === 0) {
      continue;
    }

    const rank = rankByMethod.get(methodId);
    if (rank === undefined) {
      continue;
    }

    groups.push({
      methodId,
      label: METHODS[methodId].label,
      rank,
      links,
    });
  }

  return groups.sort((a, b) => a.rank - b.rank);
}
