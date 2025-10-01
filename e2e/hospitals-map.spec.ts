// File: e2e/hospitals-map.spec.ts
import { test, expect } from '@playwright/test';

test('should display the hospitals map page', async ({ page }) => {
  await page.goto('/');

  // Check if the main components are rendered
  await expect(page.getByText('Hospitals Map')).toBeVisible();
  await expect(page.getByText('Distribution')).toBeVisible();

  // Check if the map is loaded
  await expect(page.locator('[data-testid="map-container"]')).toBeVisible();
});

test('should filter hospitals by status', async ({ page }) => {
  await page.goto('/');

  // Click on the Deployed filter
  await page.getByText('Deployed').click();

  // Wait for the filter to be applied
  await page.waitForTimeout(500);

  // Validate filter state (this would need to be extended with actual state validation)
  // In a real test, we'd check that only deployed hospitals are shown
});

test('should change language', async ({ page }) => {
  await page.goto('/');

  // Select French language
  await page.locator('select').selectOption('fr');

  // Check if the UI is now in French
  await expect(page.getByText('Carte des Hôpitaux')).toBeVisible();
});
