// File: e2e/visual.spec.ts
import { test, expect } from '@playwright/test';

// Astuces stabilité visuelle: réduire les animations et masquer la carte (contenu non déterministe)
async function stabilizeUI(page: import('@playwright/test').Page) {
  await page.addStyleTag({
    content: `
      * { animation: none !important; transition: none !important; }
      [data-testid="map-container"] { visibility: hidden !important; }
    `,
  });
}

test.describe('Visual regression - desktop', () => {
  test('Home page - desktop', async ({ page }) => {
    await page.goto('/');
    await stabilizeUI(page);
    await expect(page).toHaveScreenshot('home-desktop.png', { fullPage: true });
  });

  test('Hospital detail - desktop', async ({ page }) => {
    await page.goto('/hospitals/1');
    await stabilizeUI(page);
    await expect(page).toHaveScreenshot('hospital-desktop.png', { fullPage: true });
  });
});

test.describe('Visual regression - mobile', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('Home page - mobile', async ({ page }) => {
    await page.goto('/');
    await stabilizeUI(page);
    await expect(page).toHaveScreenshot('home-mobile.png', { fullPage: true });
  });

  test('Hospital detail - mobile', async ({ page }) => {
    await page.goto('/hospitals/1');
    await stabilizeUI(page);
    await expect(page).toHaveScreenshot('hospital-mobile.png', { fullPage: true });
  });
});


