import { describe, it, expect, vi } from 'vitest';
import {
  formatOpenFoodFactsProduct,
  fetchProductByBarcode,
  searchOpenFoodFacts,
  mapToSnackInsert,
} from '~/utils/openFoodFacts';

describe('openFoodFacts helper', () => {
  describe('formatOpenFoodFactsProduct', () => {
    it('should format a complete product correctly', () => {
      const raw = {
        code: '1234567890123',
        product_name: 'Energy Bar Peanut Butter',
        brands: 'Clif Bar',
        serving_size: '68 g',
        image_front_small_url: 'https://example.com/img.jpg',
        nutriments: {
          'energy-kcal_100g': 382,
          carbohydrates_100g: 65,
          sugars_100g: 31,
          fat_100g: 8.8,
          proteins_100g: 13,
          sodium_100g: 0.35, // 0.35g -> 350mg
        },
      };

      const result = formatOpenFoodFactsProduct(raw);
      expect(result).toEqual({
        code: '1234567890123',
        name: 'Energy Bar Peanut Butter',
        brand: 'Clif Bar',
        serving_size_g: 68,
        calories_kcal: 382,
        carbs_g: 65,
        sugars_g: 31,
        fat_g: 8.8,
        protein_g: 13,
        sodium_mg: 350,
        image_url: 'https://example.com/img.jpg',
      });
    });

    it('should prioritize spanish product name when available', () => {
      const raw = {
        code: '123',
        product_name: 'English Name',
        product_name_es: 'Nombre en Español',
        nutriments: { 'energy-kcal_100g': 200 },
      };

      const result = formatOpenFoodFactsProduct(raw);
      expect(result?.name).toBe('Nombre en Español');
    });

    it('should calculate kcal from kJ when kcal is missing', () => {
      const raw = {
        code: '123',
        product_name: 'Snack',
        nutriments: {
          energy_100g: 837, // 837 kJ / 4.184 ≈ 200 kcal
        },
      };

      const result = formatOpenFoodFactsProduct(raw);
      expect(result?.calories_kcal).toBeCloseTo(200, 0);
    });

    it('should calculate sodium from salt when sodium is missing', () => {
      const raw = {
        code: '123',
        product_name: 'Salty Snack',
        nutriments: {
          salt_100g: 1, // 1g salt ≈ 400mg sodium
        },
      };

      const result = formatOpenFoodFactsProduct(raw);
      expect(result?.sodium_mg).toBe(400);
    });

    it('should use explicit mg sodium if unit is mg', () => {
      const raw = {
        code: '123',
        product_name: 'Electrolyte Chew',
        nutriments: {
          sodium_unit: 'mg',
          sodium_value: 125,
        },
      };

      const result = formatOpenFoodFactsProduct(raw);
      expect(result?.sodium_mg).toBe(125);
    });

    it('should parse complex serving sizes or fallback to 100g', () => {
      expect(
        formatOpenFoodFactsProduct({
          product_name: 'Item 1',
          serving_size: '1 bar (45.5 g)',
        })?.serving_size_g
      ).toBe(45.5);

      expect(
        formatOpenFoodFactsProduct({
          product_name: 'Item 2',
          serving_size: undefined,
        })?.serving_size_g
      ).toBe(100);
    });

    it('should return null when product name is empty or missing', () => {
      expect(formatOpenFoodFactsProduct({})).toBeNull();
      expect(formatOpenFoodFactsProduct({ product_name: '   ' })).toBeNull();
    });
  });

  describe('fetchProductByBarcode', () => {
    it('should fetch and format product when found', async () => {
      const mockProduct = {
        code: '8410000000001',
        product_name: 'Barrita de Almendras',
        brands: 'HikeFuel Brand',
        nutriments: {
          'energy-kcal_100g': 450,
        },
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: 1, product: mockProduct }),
      });

      const product = await fetchProductByBarcode(
        '8410000000001',
        mockFetch as unknown as typeof fetch
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch.mock.calls[0][0]).toContain('8410000000001.json');
      expect(product?.name).toBe('Barrita de Almendras');
      expect(product?.calories_kcal).toBe(450);
    });

    it('should return null when product is not found (status 0)', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: 0, status_verbose: 'product not found' }),
      });

      const product = await fetchProductByBarcode(
        '0000000000000',
        mockFetch as unknown as typeof fetch
      );
      expect(product).toBeNull();
    });

    it('should handle network errors gracefully', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
      const product = await fetchProductByBarcode(
        '12345678',
        mockFetch as unknown as typeof fetch
      );
      expect(product).toBeNull();
    });

    it('should return null for empty barcode', async () => {
      const mockFetch = vi.fn();
      const product = await fetchProductByBarcode(
        '   ',
        mockFetch as unknown as typeof fetch
      );
      expect(product).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('searchOpenFoodFacts', () => {
    it('should search products by text query', async () => {
      const mockProducts = [
        {
          code: '111',
          product_name: 'Barrita Plátano',
          nutriments: { 'energy-kcal_100g': 300 },
        },
        {
          code: '222',
          product_name: 'Barrita Chocolate',
          nutriments: { 'energy-kcal_100g': 350 },
        },
      ];

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ count: 2, products: mockProducts }),
      });

      const results = await searchOpenFoodFacts(
        'barrita',
        { pageSize: 10 },
        mockFetch as unknown as typeof fetch
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch.mock.calls[0][0]).toContain('search_terms=barrita');
      expect(mockFetch.mock.calls[0][0]).toContain('page_size=10');
      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('Barrita Plátano');
      expect(results[1].name).toBe('Barrita Chocolate');
    });

    it('should delegate to fetchProductByBarcode if query is numeric barcode', async () => {
      const mockProduct = {
        code: '8412345678901',
        product_name: 'Barra Energética',
        nutriments: { 'energy-kcal_100g': 400 },
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: 1, product: mockProduct }),
      });

      const results = await searchOpenFoodFacts(
        '8412345678901',
        {},
        mockFetch as unknown as typeof fetch
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch.mock.calls[0][0]).toContain('8412345678901.json');
      expect(results).toHaveLength(1);
      expect(results[0].code).toBe('8412345678901');
    });

    it('should return empty array for empty search query', async () => {
      const mockFetch = vi.fn();
      const results = await searchOpenFoodFacts(
        '   ',
        {},
        mockFetch as unknown as typeof fetch
      );
      expect(results).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should handle fetch failure gracefully', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Fetch failed'));
      const results = await searchOpenFoodFacts(
        'error-query',
        {},
        mockFetch as unknown as typeof fetch
      );
      expect(results).toEqual([]);
    });
  });

  describe('mapToSnackInsert', () => {
    it('should map OpenFoodFactsProduct to Supabase snack insert format', () => {
      const product = {
        code: '123456',
        name: 'Trail Mix Frutos Secos',
        brand: 'Hiker Snacks',
        serving_size_g: 50,
        calories_kcal: 520,
        carbs_g: 40,
        sugars_g: 25,
        fat_g: 32,
        protein_g: 14,
        sodium_mg: 120,
        image_url: 'https://example.com/snack.jpg',
      };

      const mapped = mapToSnackInsert(product, {
        userId: 'user-uuid-123',
        isGeneric: false,
      });

      expect(mapped).toEqual({
        user_id: 'user-uuid-123',
        name: 'Trail Mix Frutos Secos',
        brand: 'Hiker Snacks',
        is_generic: false,
        serving_size_g: 50,
        calories_kcal: 520,
        carbs_g: 40,
        sugars_g: 25,
        fat_g: 32,
        protein_g: 14,
        sodium_mg: 120,
      });
    });
  });
});
