import type { Database } from '~/types/database.types';

export interface OpenFoodFactsProduct {
  code: string;
  name: string;
  brand: string | null;
  serving_size_g: number;
  calories_kcal: number;
  carbs_g: number;
  sugars_g: number;
  fat_g: number;
  protein_g: number;
  sodium_mg: number;
  image_url: string | null;
}

export interface SearchOptions {
  pageSize?: number;
  page?: number;
}

const DEFAULT_USER_AGENT = 'HikeFuel/1.0 (https://github.com/FCalabria/hike-fuel)';
const BASE_URL = 'https://world.openfoodfacts.org';

function parseServingSize(servingSizeStr?: string | null): number {
  if (!servingSizeStr) return 100;
  // Primero buscar un número seguido de g/gr/gramos/grams
  const matchWithUnit = servingSizeStr.match(/(\d+(?:[.,]\d+)?)\s*(?:g|gr|gramos|grams)\b/i);
  if (matchWithUnit) {
    const val = parseFloat(matchWithUnit[1].replace(',', '.'));
    if (!isNaN(val) && val > 0) return val;
  }
  // Si no tiene unidad explícita de gramos, buscar el primer número
  const matchAnyNumber = servingSizeStr.match(/(\d+(?:[.,]\d+)?)/);
  if (matchAnyNumber) {
    const val = parseFloat(matchAnyNumber[1].replace(',', '.'));
    if (!isNaN(val) && val > 0) return val;
  }
  return 100;
}

function parseCalories(nutriments: Record<string, unknown> = {}): number {
  const kcal = Number(
    nutriments['energy-kcal_100g'] ??
      nutriments['energy-kcal'] ??
      nutriments['energy-kcal_value'] ??
      0
  );
  if (!isNaN(kcal) && kcal > 0) return Math.round(kcal * 10) / 10;

  const kj = Number(nutriments['energy-kj_100g'] ?? nutriments['energy_100g'] ?? 0);
  if (!isNaN(kj) && kj > 0) {
    return Math.round((kj / 4.184) * 10) / 10;
  }
  return 0;
}

function parseSodiumMg(nutriments: Record<string, unknown> = {}): number {
  if (
    nutriments['sodium_unit'] === 'mg' &&
    typeof nutriments['sodium_value'] === 'number'
  ) {
    return Math.round(nutriments['sodium_value']);
  }

  const sodium100g = Number(nutriments['sodium_100g'] ?? nutriments['sodium'] ?? 0);
  if (!isNaN(sodium100g) && sodium100g > 0) {
    return Math.round(sodium100g * 1000);
  }

  const salt100g = Number(nutriments['salt_100g'] ?? nutriments['salt'] ?? 0);
  if (!isNaN(salt100g) && salt100g > 0) {
    return Math.round(salt100g * 400);
  }

  return 0;
}

function parseSafeNumber(val: unknown): number {
  const num = Number(val);
  return isNaN(num) || num < 0 ? 0 : Math.round(num * 10) / 10;
}

export function formatOpenFoodFactsProduct(raw: {
  code?: string;
  product_name?: string;
  product_name_es?: string;
  product_name_en?: string;
  brands?: string;
  nutriments?: Record<string, unknown>;
  serving_size?: string;
  image_front_small_url?: string;
  image_url?: string;
}): OpenFoodFactsProduct | null {
  const name =
    raw.product_name_es ||
    raw.product_name ||
    raw.product_name_en ||
    '';

  if (!name.trim()) return null;

  const nutriments = raw.nutriments || {};

  return {
    code: raw.code || '',
    name: name.trim(),
    brand: raw.brands?.trim() || null,
    serving_size_g: parseServingSize(raw.serving_size),
    calories_kcal: parseCalories(nutriments),
    carbs_g: parseSafeNumber(nutriments['carbohydrates_100g'] ?? nutriments['carbohydrates']),
    sugars_g: parseSafeNumber(nutriments['sugars_100g'] ?? nutriments['sugars']),
    fat_g: parseSafeNumber(nutriments['fat_100g'] ?? nutriments['fat']),
    protein_g: parseSafeNumber(nutriments['proteins_100g'] ?? nutriments['proteins']),
    sodium_mg: parseSodiumMg(nutriments),
    image_url: raw.image_front_small_url || raw.image_url || null,
  };
}

export async function fetchProductByBarcode(
  barcode: string,
  fetchFn: typeof fetch = fetch
): Promise<OpenFoodFactsProduct | null> {
  const cleanBarcode = barcode.trim();
  if (!cleanBarcode) return null;

  try {
    const url = `${BASE_URL}/api/v2/product/${encodeURIComponent(cleanBarcode)}.json?fields=code,product_name,product_name_es,product_name_en,brands,nutriments,serving_size,image_front_small_url,image_url`;
    const response = await fetchFn(url, {
      headers: {
        'User-Agent': DEFAULT_USER_AGENT,
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.status !== 1 || !data.product) return null;

    return formatOpenFoodFactsProduct(data.product);
  } catch (error) {
    console.error(`Error fetching Open Food Facts barcode ${cleanBarcode}:`, error);
    return null;
  }
}

export async function searchOpenFoodFacts(
  query: string,
  options: SearchOptions = {},
  fetchFn: typeof fetch = fetch
): Promise<OpenFoodFactsProduct[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // Si es un código de barras (8-14 dígitos numéricos), buscar directamente por código
  if (/^\d{8,14}$/.test(trimmed)) {
    const product = await fetchProductByBarcode(trimmed, fetchFn);
    return product ? [product] : [];
  }

  const { pageSize = 20, page = 1 } = options;

  try {
    const params = new URLSearchParams({
      search_terms: trimmed,
      fields:
        'code,product_name,product_name_es,product_name_en,brands,nutriments,serving_size,image_front_small_url,image_url',
      page_size: String(pageSize),
      page: String(page),
    });

    const url = `${BASE_URL}/api/v2/search?${params.toString()}`;
    const response = await fetchFn(url, {
      headers: {
        'User-Agent': DEFAULT_USER_AGENT,
      },
    });

    if (!response.ok) return [];

    const data = await response.json();
    if (!data.products || !Array.isArray(data.products)) return [];

    return data.products
      .map((p: Parameters<typeof formatOpenFoodFactsProduct>[0]) =>
        formatOpenFoodFactsProduct(p)
      )
      .filter((p: OpenFoodFactsProduct | null): p is OpenFoodFactsProduct => p !== null);
  } catch (error) {
    console.error(`Error searching Open Food Facts for "${trimmed}":`, error);
    return [];
  }
}

export function mapToSnackInsert(
  product: OpenFoodFactsProduct,
  options?: { userId?: string | null; isGeneric?: boolean }
): Database['public']['Tables']['snacks']['Insert'] {
  return {
    user_id: options?.userId ?? null,
    name: product.name,
    brand: product.brand,
    is_generic: options?.isGeneric ?? true,
    serving_size_g: product.serving_size_g,
    calories_kcal: product.calories_kcal,
    carbs_g: product.carbs_g,
    sugars_g: product.sugars_g,
    fat_g: product.fat_g,
    protein_g: product.protein_g,
    sodium_mg: product.sodium_mg,
  };
}
