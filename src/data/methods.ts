export const METHOD_IDS = [
  'pods',
  'bean_to_cup',
  'bulk_brew',
  'manual_espresso',
] as const;

export type MethodId = (typeof METHOD_IDS)[number];

export type MethodCategory = 'one_touch' | 'bulk' | 'espresso';

export type IngredientModel = 'bulk' | 'pods';

export type ShopPeriod = 'week' | 'month';

export type FieldVisibility = 'gramsPerCup' | 'podsPerCup';

export const BULK_GEAR_PRESET_IDS = ['drip', 'french_press', 'pour_over'] as const;

export type BulkGearPreset = (typeof BULK_GEAR_PRESET_IDS)[number];

export const POD_STYLE_PRESET_IDS = ['kcup', 'nespresso'] as const;

export type PodStylePreset = (typeof POD_STYLE_PRESET_IDS)[number];

export interface BulkGearPresetDefinition {
  label: string;
  defaultMachineCost: number;
  defaultIngredientCost: number;
  defaultShopDrinksPerMonth: number;
  defaultGramsPerCup: number;
  defaultAnnualConsumables?: number;
}

export interface PodStylePresetDefinition {
  label: string;
  defaultMachineCost: number;
  defaultIngredientCost: number;
  defaultShopDrinksPerMonth: number;
}

export const BULK_GEAR_PRESETS: Record<BulkGearPreset, BulkGearPresetDefinition> = {
  drip: {
    label: 'Drip',
    defaultMachineCost: 120,
    defaultIngredientCost: 15.75,
    defaultGramsPerCup: 10,
    defaultShopDrinksPerMonth: 8,
  },
  french_press: {
    label: 'French press',
    defaultMachineCost: 30,
    defaultIngredientCost: 15.75,
    defaultGramsPerCup: 12,
    defaultShopDrinksPerMonth: 8,
  },
  pour_over: {
    label: 'Pour-over',
    defaultMachineCost: 40,
    defaultIngredientCost: 15.75,
    defaultGramsPerCup: 11,
    defaultShopDrinksPerMonth: 8,
    defaultAnnualConsumables: 0,
  },
};

export const POD_STYLE_PRESETS: Record<PodStylePreset, PodStylePresetDefinition> = {
  kcup: {
    label: 'K-Cup',
    defaultMachineCost: 120,
    defaultIngredientCost: 0.90,
    defaultShopDrinksPerMonth: 8,
  },
  nespresso: {
    label: 'Nespresso',
    defaultMachineCost: 180,
    defaultIngredientCost: 1.00,
    defaultShopDrinksPerMonth: 8,
  },
};

export interface MethodGroup {
  id: string;
  label: string;
  methodIds: MethodId[];
}

export const METHOD_GROUPS: MethodGroup[] = [
  {
    id: 'one_touch',
    label: 'One-touch convenience',
    methodIds: ['pods', 'bean_to_cup'],
  },
  {
    id: 'bulk',
    label: 'Bulk home brewing',
    methodIds: ['bulk_brew'],
  },
  {
    id: 'espresso',
    label: 'Espresso',
    methodIds: ['manual_espresso'],
  },
];

export interface MethodDefinition {
  id: MethodId;
  label: string;
  shortLabel: string;
  category: MethodCategory;
  ingredientModel: IngredientModel;
  defaultGramsPerCup: number;
  defaultIngredientCost: number;
  defaultMachineCost: number;
  defaultShopDrinksPerMonth: number;
  fieldVisibility: FieldVisibility[];
}

export const METHODS: Record<MethodId, MethodDefinition> = {
  pods: {
    id: 'pods',
    label: 'Pre-packaged pods',
    shortLabel: 'Pods',
    category: 'one_touch',
    ingredientModel: 'pods',
    defaultGramsPerCup: 0,
    defaultIngredientCost: 0.90,
    defaultMachineCost: 120,
    defaultShopDrinksPerMonth: 8,
    fieldVisibility: ['podsPerCup'],
  },
  bean_to_cup: {
    id: 'bean_to_cup',
    label: 'Bean-to-cup (super-automatic)',
    shortLabel: 'B-to-Cup',
    category: 'one_touch',
    ingredientModel: 'bulk',
    defaultGramsPerCup: 18,
    defaultIngredientCost: 15.75,
    defaultMachineCost: 800,
    defaultShopDrinksPerMonth: 4,
    fieldVisibility: ['gramsPerCup'],
  },
  bulk_brew: {
    id: 'bulk_brew',
    label: 'Drip, press, or pour-over',
    shortLabel: 'Bulk brew',
    category: 'bulk',
    ingredientModel: 'bulk',
    defaultGramsPerCup: 11,
    defaultIngredientCost: 15.75,
    defaultMachineCost: 45,
    defaultShopDrinksPerMonth: 8,
    fieldVisibility: ['gramsPerCup'],
  },
  manual_espresso: {
    id: 'manual_espresso',
    label: 'Manual espresso',
    shortLabel: 'Espresso',
    category: 'espresso',
    ingredientModel: 'bulk',
    defaultGramsPerCup: 18,
    defaultIngredientCost: 15.75,
    defaultMachineCost: 550,
    defaultShopDrinksPerMonth: 4,
    fieldVisibility: ['gramsPerCup'],
  },
};

export const DEFAULT_SELECTED_METHODS: MethodId[] = ['pods', 'bean_to_cup'];

export interface MethodInputValues {
  machineCost: number;
  /** Bulk methods: cost per pound. Pods: cost per pod/capsule. */
  ingredientCost: number;
  gramsPerCup: number;
  podsPerCup: number;
  shopDrinks: number;
  shopPeriod: ShopPeriod;
  annualConsumables: number;
  /** bulk_brew only; default 'drip' */
  gearPreset?: BulkGearPreset;
  /** pods only; default 'kcup' */
  podStyle?: PodStylePreset;
}

function defaultShopDrinksForPeriod(monthlyDefault: number, period: ShopPeriod): number {
  if (period === 'month') return monthlyDefault;
  return Math.round((monthlyDefault * 12) / 52);
}

export function applyBulkGearPreset(
  preset: BulkGearPreset,
  shopPeriod: ShopPeriod = 'week',
): Partial<MethodInputValues> {
  const gear = BULK_GEAR_PRESETS[preset];

  return {
    gearPreset: preset,
    machineCost: gear.defaultMachineCost,
    ingredientCost: gear.defaultIngredientCost,
    shopDrinks: defaultShopDrinksForPeriod(gear.defaultShopDrinksPerMonth, shopPeriod),
    annualConsumables: gear.defaultAnnualConsumables ?? 0,
    gramsPerCup: gear.defaultGramsPerCup,
  };
}

export function applyPodStylePreset(
  style: PodStylePreset,
  shopPeriod: ShopPeriod = 'week',
): Partial<MethodInputValues> {
  const pod = POD_STYLE_PRESETS[style];

  return {
    podStyle: style,
    machineCost: pod.defaultMachineCost,
    ingredientCost: pod.defaultIngredientCost,
    shopDrinks: defaultShopDrinksForPeriod(pod.defaultShopDrinksPerMonth, shopPeriod),
    annualConsumables: 0,
    gramsPerCup: 0,
    podsPerCup: 1,
  };
}

export function createDefaultMethodInputs(methodId: MethodId): MethodInputValues {
  const method = METHODS[methodId];
  const shopPeriod: ShopPeriod = 'week';

  if (methodId === 'bulk_brew') {
    return {
      ...applyBulkGearPreset('drip', shopPeriod),
      shopPeriod,
      podsPerCup: 1,
    } as MethodInputValues;
  }

  if (methodId === 'pods') {
    return {
      ...applyPodStylePreset('kcup', shopPeriod),
      shopPeriod,
    } as MethodInputValues;
  }

  const shopDrinks = defaultShopDrinksForPeriod(method.defaultShopDrinksPerMonth, shopPeriod);

  return {
    machineCost: method.defaultMachineCost,
    ingredientCost: method.defaultIngredientCost,
    gramsPerCup: method.defaultGramsPerCup,
    podsPerCup: 1,
    shopDrinks,
    shopPeriod,
    annualConsumables: 0,
  };
}

export function createDefaultMethodInputsMap(): Record<MethodId, MethodInputValues> {
  const inputs = {} as Record<MethodId, MethodInputValues>;
  for (const id of METHOD_IDS) {
    inputs[id] = createDefaultMethodInputs(id);
  }
  return inputs;
}
