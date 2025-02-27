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

// File: app/utils/mapHelpers.ts
import mapboxgl from 'mapbox-gl';
import { Hospital } from '../app/store/useMapStore';

/**
 * Creates a bounds object from an array of hospitals
 */
export function createBoundsFromHospitals(hospitals: Hospital[]): mapboxgl.LngLatBounds | null {
  if (!hospitals.length) return null;

  const bounds = new mapboxgl.LngLatBounds();
  
  hospitals.forEach(hospital => {
    bounds.extend(hospital.coordinates);
  });
  
  return bounds;
}

/**
 * Creates a custom marker element for a hospital
 */
export function createMarkerElement(hospital: Hospital): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'hospital-marker';
  el.style.width = '24px';
  el.style.height = '24px';
  el.style.borderRadius = '50%';
  el.style.backgroundColor = hospital.status === 'Deployed' ? '#36A2EB' : '#4BC0C0';
  el.style.border = '2px solid white';
  el.style.cursor = 'pointer';
  el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
  return el;
}

/**
 * Gets the formatted date string
 */
export function formatDate(dateString: string, locale: string = 'en'): string {
  return new Date(dateString).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US');
}