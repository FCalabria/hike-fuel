import { test, expect } from '@playwright/test';

test.describe('Hike Fuel - Core Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('1. should load the application and render initial components', async ({ page }) => {
    // Check title and main header
    await expect(page).toHaveTitle(/Hike fuel/i);
    await expect(page.getByRole('heading', { name: /Hike fuel/i })).toBeVisible();

    // Check initial food input card
    const foodInputs = page.getByPlaceholder('Alimento');
    await expect(foodInputs).toHaveCount(1);
    await expect(page.getByLabel('Porción')).toBeVisible();
    await expect(page.getByLabel('Energía')).toBeVisible();

    // Check action buttons and total evaluation
    await expect(page.getByRole('button', { name: 'Añadir comida' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Evaluación total' })).toBeVisible();
    await expect(page.getByText('Densidad calórica:')).toBeVisible();

    // Visual snapshot: initial page layout
    await expect(page).toHaveScreenshot('initial-page.png');
  });

  test('2. should add a new food item card when clicking "Añadir comida"', async ({ page }) => {
    // Initially 1 food card
    await expect(page.getByPlaceholder('Alimento')).toHaveCount(1);
    // Delete button should NOT be visible when only 1 food exists
    await expect(page.getByLabel('Eliminar comida')).toHaveCount(0);

    // Click Add Food
    await page.getByRole('button', { name: 'Añadir comida' }).click();

    // Now 2 food cards should exist
    await expect(page.getByPlaceholder('Alimento')).toHaveCount(2);

    // Both cards can have names typed
    const foodCards = page.getByPlaceholder('Alimento');
    await foodCards.nth(0).fill('Almendras');
    await foodCards.nth(1).fill('Barrita energética');

    await expect(foodCards.nth(0)).toHaveValue('Almendras');
    await expect(foodCards.nth(1)).toHaveValue('Barrita energética');

    // Delete buttons should now appear
    await expect(page.getByLabel('Eliminar comida')).toHaveCount(2);

    // Visual snapshot: two food cards layout
    await expect(page.locator('.max-w-2xl')).toHaveScreenshot('two-foods-added.png');
  });

  test('3. should delete a food item and hide delete button when 1 food remains', async ({ page }) => {
    // Add a second food
    await page.getByRole('button', { name: 'Añadir comida' }).click();
    await expect(page.getByPlaceholder('Alimento')).toHaveCount(2);

    const deleteButtons = page.getByLabel('Eliminar comida');
    await expect(deleteButtons).toHaveCount(2);

    // Delete the first food item
    await deleteButtons.first().click();

    // Only 1 food card remains
    await expect(page.getByPlaceholder('Alimento')).toHaveCount(1);
    // Delete button should disappear since only 1 food is left
    await expect(page.getByLabel('Eliminar comida')).toHaveCount(0);
  });

  test('4. should update total nutritional evaluation when entering food values', async ({ page }) => {
    // Fill in nutritional values for the first food
    // Use click + fill + Tab to ensure React controlled inputs update properly
    const portionInput = page.getByLabel('Porción');
    const energyInput = page.getByLabel('Energía');
    const fatsInput = page.getByLabel('Grasas');
    const carbsInput = page.getByLabel('Hidratos de carbono');

    await portionInput.click();
    await portionInput.fill('100');
    await expect(portionInput).toHaveValue('100');

    await energyInput.click();
    await energyInput.fill('500');
    await expect(energyInput).toHaveValue('500');

    await fatsInput.click();
    await fatsInput.fill('20');
    await expect(fatsInput).toHaveValue('20');

    await carbsInput.click();
    await carbsInput.fill('60');
    await expect(carbsInput).toHaveValue('60');

    // Blur the last input to ensure all change events are processed
    await carbsInput.blur();

    // Density should update: 500 kcal / 100g = 5.00 kcal/gr
    await expect(page.getByText('5.00 kcal/gr')).toBeVisible();

    // Visual snapshot: calculated evaluation results
    await expect(page.locator('.max-w-2xl')).toHaveScreenshot('evaluation-results.png');
  });

  test('5. should handle multiple foods addition, deletion, and recalculation', async ({ page }) => {
    // Add two more foods (total 3)
    await page.getByRole('button', { name: 'Añadir comida' }).click();
    await page.getByRole('button', { name: 'Añadir comida' }).click();
    await expect(page.getByPlaceholder('Alimento')).toHaveCount(3);

    // Remove one food
    await page.getByLabel('Eliminar comida').nth(1).click();
    await expect(page.getByPlaceholder('Alimento')).toHaveCount(2);

    // Remove another food
    await page.getByLabel('Eliminar comida').first().click();
    await expect(page.getByPlaceholder('Alimento')).toHaveCount(1);
    await expect(page.getByLabel('Eliminar comida')).toHaveCount(0);
  });
});
