export type NutritionalValues =
  | 'quantity'
  | 'energy'
  | 'carbs'
  | 'sugar'
  | 'fats'
  | 'protein'
  | 'salt';

export type NutritionalData = Record<NutritionalValues, string>;
