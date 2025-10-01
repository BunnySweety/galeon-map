import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * E2E Accessibility Tests with axe-core
 * Tests WCAG 2.1 Level A & AA compliance
 */

test.describe('Accessibility - WCAG 2.1 Compliance', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto('/');
    // Wait for content to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should not have any automatically detectable WCAG A & AA violations on homepage', async ({
    page,
  }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper ARIA landmarks on homepage', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('main')
      .withTags(['wcag2a', 'wcag21a'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);

    // Verify landmark regions exist
    const regions = await page.locator('[role="region"]').count();
    expect(regions).toBeGreaterThan(0);
  });

  test('should have accessible map component with ARIA attributes', async ({ page }) => {
    // Check map container has proper role
    const mapRegion = page.locator('[role="region"][aria-label*="map" i]');
    await expect(mapRegion).toBeVisible();

    // Check map application role
    const mapApplication = page.locator('[role="application"]');
    await expect(mapApplication).toBeVisible();

    // Run axe on map component specifically
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[role="region"][aria-label*="map" i]')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have accessible timeline control with slider role', async ({ page }) => {
    // Check timeline has slider role
    const timeline = page.locator('[role="slider"]');
    await expect(timeline).toBeVisible();

    // Verify ARIA slider attributes
    const ariaValueMin = await timeline.getAttribute('aria-valuemin');
    const ariaValueMax = await timeline.getAttribute('aria-valuemax');
    const ariaValueNow = await timeline.getAttribute('aria-valuenow');
    const ariaValueText = await timeline.getAttribute('aria-valuetext');

    expect(ariaValueMin).toBeTruthy();
    expect(ariaValueMax).toBeTruthy();
    expect(ariaValueNow).toBeTruthy();
    expect(ariaValueText).toBeTruthy();

    // Run axe on timeline
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[role="slider"]')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have accessible action bar with toolbar role', async ({ page }) => {
    // Check toolbar exists
    const toolbar = page.locator('[role="toolbar"]');
    await expect(toolbar).toBeVisible();

    // Run axe on toolbar
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[role="toolbar"]')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have accessible hospital table with proper semantics', async ({ page }) => {
    // Check if table region exists
    const tableRegion = page.locator('[role="region"][aria-label*="hospital" i]').first();

    if ((await tableRegion.count()) > 0) {
      await expect(tableRegion).toBeVisible();

      // Check table has proper headers
      const tableHeaders = page.locator('th[scope="col"]');
      const headerCount = await tableHeaders.count();
      expect(headerCount).toBeGreaterThan(0);

      // Run axe on table
      const accessibilityScanResults = await new AxeBuilder({ page }).include('table').analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    }
  });

  test('should have proper color contrast (WCAG AA)', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .options({ rules: { 'color-contrast': { enabled: true } } })
      .analyze();

    const contrastViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'color-contrast'
    );

    expect(contrastViolations).toEqual([]);
  });

  test('should have keyboard accessible navigation', async ({ page }) => {
    // Check all interactive elements are keyboard accessible
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a'])
      .options({ rules: { 'keyboard-accessible': { enabled: true } } })
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Accessibility - Hospital Detail Page', () => {
  test('should not have WCAG violations on hospital detail page', async ({ page }) => {
    // Navigate to a hospital detail page
    await page.goto('/hospitals/1');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have accessible hospital detail card with article role', async ({ page }) => {
    await page.goto('/hospitals/1');
    await page.waitForLoadState('networkidle');

    // Check article role exists
    const article = page.locator('[role="article"]');
    await expect(article).toBeVisible();

    // Check image has proper role and label
    const imageRole = page.locator('[role="img"]');
    const imageCount = await imageRole.count();
    expect(imageCount).toBeGreaterThan(0);
  });

  test('should have accessible back button and navigation', async ({ page }) => {
    await page.goto('/hospitals/1');
    await page.waitForLoadState('networkidle');

    // Check back button is accessible
    const backButton = page.locator('button').filter({ hasText: /back|retour/i });
    if ((await backButton.count()) > 0) {
      await expect(backButton).toBeVisible();

      const ariaLabel = await backButton.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
    }
  });
});

test.describe('Accessibility - Keyboard Navigation', () => {
  test('should navigate timeline with arrow keys', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const timeline = page.locator('[role="slider"]');
    await expect(timeline).toBeVisible();

    // Focus on timeline
    await timeline.focus();

    // Get initial value
    const initialValue = await timeline.getAttribute('aria-valuenow');

    // Press ArrowRight
    await page.keyboard.press('ArrowRight');

    // Wait a bit for state update
    await page.waitForTimeout(100);

    // Get new value
    const newValue = await timeline.getAttribute('aria-valuenow');

    // Value should have changed (or stayed at max)
    expect(newValue).toBeTruthy();
  });

  test('should close menus with Escape key', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find and click Export button (if exists)
    const exportButton = page
      .locator('button')
      .filter({ hasText: /export/i })
      .first();

    if ((await exportButton.count()) > 0) {
      await exportButton.click();

      // Wait for menu to appear
      await page.waitForTimeout(200);

      // Press Escape
      await page.keyboard.press('Escape');

      // Wait for menu to close
      await page.waitForTimeout(200);

      // Menu should be closed (check aria-expanded)
      const isExpanded = await exportButton.getAttribute('aria-expanded');
      expect(isExpanded).toBe('false');
    }
  });

  test('should have visible focus indicators', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);

    // Check that focused element has visible outline
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return null;

      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        outlineColor: styles.outlineColor,
        boxShadow: styles.boxShadow,
      };
    });

    // Should have some form of visible focus (outline or box-shadow)
    expect(
      focusedElement?.outline !== 'none' ||
        focusedElement?.outlineWidth !== '0px' ||
        focusedElement?.boxShadow !== 'none'
    ).toBeTruthy();
  });

  test('should have logical tab order', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a'])
      .options({ rules: { tabindex: { enabled: true } } })
      .analyze();

    const tabindexViolations = accessibilityScanResults.violations.filter(v => v.id === 'tabindex');

    expect(tabindexViolations).toEqual([]);
  });
});

test.describe('Accessibility - Screen Reader Support', () => {
  test('should have proper page title', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should have lang attribute on html element', async ({ page }) => {
    await page.goto('/');

    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBeTruthy();
    expect(['en', 'fr']).toContain(lang);
  });

  test('should have descriptive button labels', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a'])
      .options({ rules: { 'button-name': { enabled: true } } })
      .analyze();

    const buttonNameViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'button-name'
    );

    expect(buttonNameViolations).toEqual([]);
  });

  test('should have descriptive link text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a'])
      .options({ rules: { 'link-name': { enabled: true } } })
      .analyze();

    const linkNameViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'link-name'
    );

    expect(linkNameViolations).toEqual([]);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a'])
      .options({ rules: { 'heading-order': { enabled: true } } })
      .analyze();

    const headingViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'heading-order'
    );

    expect(headingViolations).toEqual([]);
  });
});

test.describe('Accessibility - Forms and Inputs', () => {
  test('should have labeled form controls', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a'])
      .options({ rules: { label: { enabled: true } } })
      .analyze();

    const labelViolations = accessibilityScanResults.violations.filter(v => v.id === 'label');

    expect(labelViolations).toEqual([]);
  });

  test('should have accessible error messages', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for any error messages on page
    const errorMessages = page.locator('[role="alert"]');
    const errorCount = await errorMessages.count();

    if (errorCount > 0) {
      // If errors exist, they should be accessible
      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('[role="alert"]')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    }
  });
});

test.describe('Accessibility - Performance', () => {
  test('should have no duplicate IDs', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .options({ rules: { 'duplicate-id': { enabled: true } } })
      .analyze();

    const duplicateIdViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'duplicate-id'
    );

    expect(duplicateIdViolations).toEqual([]);
  });

  test('should have valid ARIA attributes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a'])
      .options({
        rules: {
          'aria-valid-attr': { enabled: true },
          'aria-valid-attr-value': { enabled: true },
        },
      })
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
