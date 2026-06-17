export const METHOD_IDS = [
  'drip',
  'pods',
  'french_press',
  'pour_over',
  'manual_espresso',
  'bean_to_cup',
] as const;

export type MethodId = (typeof METHOD_IDS)[number];

export type MethodCategory = 'home_brew' | 'pre_packaged' | 'machine_bulk' | 'manual_home';

export type IngredientModel = 'bulk' | 'pods';

export type ShopPeriod = 'week' | 'month';

export type FieldVisibility = 'gramsPerCup' | 'podsPerCup';

export interface MethodDefinition {
  id: MethodId;
  label: string;
  category: MethodCategory;
  ingredientModel: IngredientModel;
  defaultGramsPerCup: number;
  defaultIngredientCost: number;
  defaultMachineCost: number;
  defaultShopDrinksPerMonth: number;
  fieldVisibility: FieldVisibility[];
}

export const METHODS: Record<MethodId, MethodDefinition> = {
  drip: {
    id: 'drip',
    label: 'Drip / auto-drip',
    category: 'home_brew',
    ingredientModel: 'bulk',
    defaultGramsPerCup: 15,
    defaultIngredientCost: 10,
    defaultMachineCost: 45,
    defaultShopDrinksPerMonth: 8,
    fieldVisibility: ['gramsPerCup'],
  },
  pods: {
    id: 'pods',
    label: 'Pre-packaged pods',
    category: 'pre_packaged',
    ingredientModel: 'pods',
    defaultGramsPerCup: 0,
    defaultIngredientCost: 0.65,
    defaultMachineCost: 120,
    defaultShopDrinksPerMonth: 12,
    fieldVisibility: ['podsPerCup'],
  },
  french_press: {
    id: 'french_press',
    label: 'French press',
    category: 'manual_home',
    ingredientModel: 'bulk',
    defaultGramsPerCup: 15,
    defaultIngredientCost: 11,
    defaultMachineCost: 28,
    defaultShopDrinksPerMonth: 10,
    fieldVisibility: ['gramsPerCup'],
  },
  pour_over: {
    id: 'pour_over',
    label: 'Pour-over',
    category: 'manual_home',
    ingredientModel: 'bulk',
    defaultGramsPerCup: 15,
    defaultIngredientCost: 12,
    defaultMachineCost: 55,
    defaultShopDrinksPerMonth: 8,
    fieldVisibility: ['gramsPerCup'],
  },
  manual_espresso: {
    id: 'manual_espresso',
    label: 'Manual espresso',
    category: 'manual_home',
    ingredientModel: 'bulk',
    defaultGramsPerCup: 18,
    defaultIngredientCost: 14,
    defaultMachineCost: 550,
    defaultShopDrinksPerMonth: 5,
    fieldVisibility: ['gramsPerCup'],
  },
  bean_to_cup: {
    id: 'bean_to_cup',
    label: 'Bean-to-cup (super-automatic)',
    category: 'machine_bulk',
    ingredientModel: 'bulk',
    defaultGramsPerCup: 15,
    defaultIngredientCost: 12,
    defaultMachineCost: 800,
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
}

function defaultShopDrinksForPeriod(monthlyDefault: number, period: ShopPeriod): number {
  if (period === 'month') return monthlyDefault;
  return Math.round((monthlyDefault * 12) / 52);
}

export function createDefaultMethodInputs(methodId: MethodId): MethodInputValues {
  const method = METHODS[methodId];

  const shopPeriod: ShopPeriod = 'week';
  const shopDrinks = defaultShopDrinksForPeriod(method.defaultShopDrinksPerMonth, shopPeriod);

  if (method.ingredientModel === 'pods') {
    return {
      machineCost: method.defaultMachineCost,
      ingredientCost: method.defaultIngredientCost,
      gramsPerCup: 0,
      podsPerCup: 1,
      shopDrinks,
      shopPeriod,
      annualConsumables: 0,
    };
  }

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
