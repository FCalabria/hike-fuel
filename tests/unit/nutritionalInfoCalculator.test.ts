import { describe, it, expect } from 'vitest';
import { calculateNutritionalInfo } from '~/utils/nutritionalInfoCalculator';
import { NutritionalData } from '~/sharedTypes';

describe('calculateNutritionalInfo', () => {
  const baseData: NutritionalData = {
    quantity: '100',
    energy: '400',
    carbs: '50',
    sugar: '20',
    fats: '15',
    protein: '10',
    salt: '0.5',
  };

  it('1. should calculate caloric density accurately (energy / quantity)', () => {
    const result = calculateNutritionalInfo({
      ...baseData,
      energy: '450',
      quantity: '100',
    });
    expect(result.density).toBe(4.5);
  });

  it('2. should calculate carb to protein ratio accurately', () => {
    const result = calculateNutritionalInfo({
      ...baseData,
      carbs: '40',
      protein: '10',
    });
    expect(result.carbProt).toBe(4);
  });

  it('3. should prevent division by zero when protein is 0', () => {
    const result = calculateNutritionalInfo({
      ...baseData,
      carbs: '30',
      protein: '0',
    });
    // carbs / (protein || 1) => 30 / 1 = 30
    expect(result.carbProt).toBe(30);
  });

  it('4. should calculate percentage of calories from fat (fats * 900 / calculatedCals)', () => {
    // 10g fats = 90 kcal, 10g carbs = 40 kcal, 10g protein = 40 kcal => total = 170 kcal
    // calFat = (10 * 900) / 170 = 52.94%
    const result = calculateNutritionalInfo({
      ...baseData,
      fats: '10',
      carbs: '10',
      protein: '10',
    });
    const expected = (10 * 900) / (10 * 9 + 10 * 4 + 10 * 4);
    expect(result.calFat).toBeCloseTo(expected, 4);
  });

  it('5. should calculate percentage of calories from sugar (sugar * 400 / calculatedCals)', () => {
    // 5g sugar = 20 kcal, calculatedCals from fats(10*9) + carbs(10*4) + protein(10*4) = 170
    // calSugar = (5 * 400) / 170 = 11.76%
    const result = calculateNutritionalInfo({
      ...baseData,
      fats: '10',
      carbs: '10',
      protein: '10',
      sugar: '5',
    });
    const expected = (5 * 400) / (10 * 9 + 10 * 4 + 10 * 4);
    expect(result.calSugar).toBeCloseTo(expected, 4);
  });

  it('6. should calculate salt in mg per gram of food (salt * 1000 / quantity)', () => {
    // 1.5g salt in 100g quantity = 15 mg/g
    const result = calculateNutritionalInfo({
      ...baseData,
      quantity: '100',
      salt: '1.5',
    });
    expect(result.salt).toBe(15);
  });

  it('7. should correctly handle European decimal comma format (e.g., "1,5")', () => {
    const result = calculateNutritionalInfo({
      ...baseData,
      quantity: '100',
      salt: '2,5',
      energy: '350,5',
    });
    expect(result.salt).toBe(25);
    expect(result.density).toBeCloseTo(3.505, 3);
  });

  it('8. should default quantity to 1 when quantity is 0 or empty string', () => {
    const result = calculateNutritionalInfo({
      ...baseData,
      quantity: '0',
      energy: '200',
    });
    expect(result.density).toBe(200);
  });

  it('9. should handle completely empty input fields safely without crashing', () => {
    const emptyData: NutritionalData = {
      quantity: '',
      energy: '',
      carbs: '',
      sugar: '',
      fats: '',
      protein: '',
      salt: '',
    };
    const result = calculateNutritionalInfo(emptyData);
    expect(result.density).toBe(0);
    expect(result.carbProt).toBe(0);
    expect(result.calFat).toBe(0);
    expect(result.calSugar).toBe(0);
    expect(result.salt).toBe(0);
  });

  it('10. should handle missing object properties safely', () => {
    const partialData = {
      energy: '300',
      quantity: '50',
    } as unknown as NutritionalData;
    const result = calculateNutritionalInfo(partialData);
    expect(result.density).toBe(6);
    expect(result.carbProt).toBe(0);
  });

  it('11. should accurately calculate a realistic trail energy bar profile', () => {
    // Clif Bar approximate values (68g serving):
    // 250 kcal, 44g carbs, 21g sugars, 5g fats, 10g protein, 0.45g salt
    const clifBar: NutritionalData = {
      quantity: '68',
      energy: '250',
      carbs: '44',
      sugar: '21',
      fats: '5',
      protein: '10',
      salt: '0.45',
    };
    const result = calculateNutritionalInfo(clifBar);
    // Density: 250 / 68 = ~3.68 kcal/g
    expect(result.density).toBeCloseTo(3.676, 2);
    // Ratio carbs to protein: 44 / 10 = 4.4
    expect(result.carbProt).toBe(4.4);
    // Salt: (0.45 * 1000) / 68 = 6.617 mg/g
    expect(result.salt).toBeCloseTo(6.62, 1);
  });

  it('12. should calculate total macro calories properly when only fats are present', () => {
    const ketoFatBomb: NutritionalData = {
      quantity: '50',
      energy: '450',
      carbs: '0',
      sugar: '0',
      fats: '50',
      protein: '0',
      salt: '0',
    };
    const result = calculateNutritionalInfo(ketoFatBomb);
    // 50g fat * 9 = 450 kcal. calFat = (50 * 900) / 450 = 100%
    expect(result.calFat).toBe(100);
    expect(result.calSugar).toBe(0);
    expect(result.density).toBe(9);
  });
});
