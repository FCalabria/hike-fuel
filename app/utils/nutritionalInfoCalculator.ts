import { NutritionalValues } from '~/sharedTypes';

export function calculateNutritionalInfo(
  nutritionInfo: Record<NutritionalValues, string>
) {
  const safeGetter = (map: Record<NutritionalValues, string>) => {
    return (path: NutritionalValues) =>
      map[path] ? parseFloat(map[path].replace(',', '.')) : 0;
  };
  const safeGet = safeGetter(nutritionInfo);
  const quantity = safeGet('quantity') || 1;
  const energy = safeGet('energy');
  const carbs = safeGet('carbs');
  const sugar = safeGet('sugar');
  const fats = safeGet('fats');
  const protein = safeGet('protein');
  const salt = safeGet('salt');
  const calculatedCals = fats * 9 + carbs * 4 + protein * 4 || 1;
  return {
    density: energy / quantity,
    carbProt: carbs / (protein || 1),
    calFat: (fats * 900) / calculatedCals,
    calSugar: (sugar * 400) / calculatedCals,
    salt: (salt * 1000) / quantity,
  };
}
