import type { BulkGearPreset, MethodId, MethodInputValues } from './methods';
import { METHODS } from './methods';
import type { CalculatorInputs } from '../lib/brewing-cost';
import { buildMethodResults } from '../lib/insights';

export interface AffiliateLink {
  id: string;
  label: string;
  url: string;
  image: string;
  highlight: string;
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

/** Product picks with affiliate URLs, local thumbnails, and review-derived highlights. */
export const AFFILIATE_PRESETS: Record<string, AffiliateLink[]> = {
  bean_to_cup: [
    {
      id: 'bean-to-cup-budget',
      label: 'Philips 3300 LatteGo',
      url: 'https://amzn.to/40iuZvK',
      image: '/affiliates/bean-to-cup-budget.webp',
      highlight: 'One-touch lattes and easy cleanup.',
    },
    {
      id: 'bean-to-cup-mid',
      label: 'Jura E4',
      url: 'https://a.co/d/01XWVlZc',
      image: '/affiliates/bean-to-cup-mid.webp',
      highlight: 'Consistent espresso and simple, no-fuss operation.',
    },
    {
      id: 'bean-to-cup-premium',
      label: "De'Longhi Eletta Explore",
      url: 'https://a.co/d/09NcYNE9',
      image: '/affiliates/bean-to-cup-premium.webp',
      highlight: 'Cold brew and specialty drinks stand out.',
    },
  ],
  manual_espresso: [
    {
      id: 'manual-espresso-budget',
      label: "De'Longhi La Specialista Arte Evo",
      url: 'https://a.co/d/093cyUiV',
      image: '/affiliates/manual-espresso-budget.webp',
      highlight: 'Built-in grinding and guided dosing help beginners pull solid shots.',
    },
    {
      id: 'manual-espresso-mid',
      label: 'Breville Barista Touch',
      url: 'https://a.co/d/0j2aL4yf',
      image: '/affiliates/manual-espresso-mid.webp',
      highlight: 'Touchscreen workflows and auto milk texturing.',
    },
    {
      id: 'manual-espresso-premium',
      label: 'Ascaso Steel Duo',
      url: 'https://a.co/d/08nHb8XW',
      image: '/affiliates/manual-espresso-premium.webp',
      highlight: 'Dual boilers and compact build earn nods from the home-barista crowd.',
    },
  ],
  'bulk_brew:drip': [
    {
      id: 'bulk-drip-budget',
      label: 'Ninja 12-Cup Programmable',
      url: 'https://a.co/d/0iIhry37',
      image: '/affiliates/bulk-drip-budget.webp',
      highlight: 'Programmable batches and reliable output for busy kitchens.',
    },
    {
      id: 'bulk-drip-mid',
      label: 'OXO Brew 9 cup',
      url: 'https://a.co/d/0eS3uRUY',
      image: '/affiliates/bulk-drip-mid.webp',
      highlight: 'SCA-certified brewing great extraction.',
    },
    {
      id: 'bulk-drip-premium',
      label: 'Ratio Four',
      url: 'https://a.co/d/04cr1Hb8',
      image: '/affiliates/bulk-drip-premium.webp',
      highlight: 'One-button simplicity with pour-over-style clarity in the cup.',
    },
  ],
  'bulk_brew:french_press': [
    {
      id: 'bulk-french-press-budget',
      label: 'Bodum Java',
      url: 'https://a.co/d/09WxSvq7',
      image: '/affiliates/bulk-french-press-budget.webp',
      highlight: 'Affordable, straightforward and durable.',
    },
    {
      id: 'bulk-french-press-mid',
      label: 'Bodum Chambord',
      url: 'https://a.co/d/05gw5ZCH',
      image: '/affiliates/bulk-french-press-mid.webp',
      highlight: 'Classic design and sturdy mesh filter.',
    },
    {
      id: 'bulk-french-press-premium',
      label: 'Espro Light P3',
      url: 'https://a.co/d/0fnJOalx',
      image: '/affiliates/bulk-french-press-premium.webp',
      highlight: 'Double micro-filter keeps cups clean without losing body.',
    },
  ],
  'bulk_brew:pour_over': [
    {
      id: 'bulk-pour-over-budget',
      label: 'Kalita Wave',
      url: 'https://a.co/d/0brQ3wUm',
      image: '/affiliates/bulk-pour-over-budget.webp',
      highlight: 'Flat-bottom design for forgiving, repeatable brews.',
    },
    {
      id: 'bulk-pour-over-mid',
      label: 'Hario V-60',
      url: 'https://a.co/d/0cWqkv45',
      image: '/affiliates/bulk-pour-over-mid.webp',
      highlight: 'Bright, clean cups when you dial in grind and pour.',
    },
    {
      id: 'bulk-pour-over-premium',
      label: 'Chemex',
      url: 'https://a.co/d/08ppBPLd',
      image: '/affiliates/bulk-pour-over-premium.webp',
      highlight: 'Elegant brewer; exceptionally clear, tea-like cups.',
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
