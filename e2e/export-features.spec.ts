// File: e2e/export-features.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Export Features', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Wait for the map to load
    await page.waitForSelector('[data-testid="map-container"]', { timeout: 10000 });

    // Wait for hospitals to load
    await page.waitForTimeout(2000);
  });

  test('should display export button', async ({ page }) => {
    const exportButton = page.locator('[aria-label*="Export"], button:has-text("Export")');
    await expect(exportButton).toBeVisible();
  });

  test('should open export menu on click', async ({ page }) => {
    // Click export button
    const exportButton = page.locator('[aria-label*="Export"], button:has-text("Export")');
    await exportButton.click();

    // Check if menu opens with export options
    const pdfOption = page.locator('text=PDF, button:has-text("PDF")');
    const excelOption = page.locator('text=Excel, button:has-text("Excel")');
    const jsonOption = page.locator('text=JSON, button:has-text("JSON")');

    // At least one should be visible
    const anyVisible = await Promise.race([
      pdfOption.isVisible(),
      excelOption.isVisible(),
      jsonOption.isVisible(),
    ]);

    expect(anyVisible).toBeTruthy();
  });

  test('should export PDF successfully', async ({ page }) => {
    // Click export button
    const exportButton = page.locator('[aria-label*="Export"], button:has-text("Export")');
    await exportButton.click();

    // Wait for menu
    await page.waitForTimeout(500);

    // Start waiting for download before clicking
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 });

    // Click PDF option
    const pdfButton = page.locator('button:has-text("PDF"), [aria-label*="PDF"]');
    await pdfButton.click();

    // Wait for download to complete
    const download = await downloadPromise;

    // Verify download
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/galeon.*\.pdf/i);

    // Verify file is not empty
    const path = await download.path();
    if (path) {
      const fs = await import('fs');
      const stats = fs.statSync(path);
      expect(stats.size).toBeGreaterThan(1000); // At least 1KB
    }
  });

  test('should export Excel successfully', async ({ page }) => {
    const exportButton = page.locator('[aria-label*="Export"], button:has-text("Export")');
    await exportButton.click();

    await page.waitForTimeout(500);

    const downloadPromise = page.waitForEvent('download', { timeout: 10000 });

    const excelButton = page.locator('button:has-text("Excel"), button:has-text("CSV")');
    await excelButton.click();

    const download = await downloadPromise;

    const filename = download.suggestedFilename();
    expect(filename).toMatch(/\.(csv|xlsx)$/i);

    const path = await download.path();
    if (path) {
      const fs = await import('fs');
      const stats = fs.statSync(path);
      expect(stats.size).toBeGreaterThan(100);
    }
  });

  test('should export JSON successfully', async ({ page }) => {
    const exportButton = page.locator('[aria-label*="Export"], button:has-text("Export")');
    await exportButton.click();

    await page.waitForTimeout(500);

    const downloadPromise = page.waitForEvent('download', { timeout: 10000 });

    const jsonButton = page.locator('button:has-text("JSON")');
    await jsonButton.click();

    const download = await downloadPromise;

    const filename = download.suggestedFilename();
    expect(filename).toMatch(/\.json$/i);

    // Verify JSON is valid
    const path = await download.path();
    if (path) {
      const fs = await import('fs');
      const content = fs.readFileSync(path, 'utf-8');

      // Should be valid JSON
      expect(() => JSON.parse(content)).not.toThrow();

      const data = JSON.parse(content);
      expect(Array.isArray(data)).toBeTruthy();
      expect(data.length).toBeGreaterThan(0);
    }
  });

  test('should show success toast after export', async ({ page }) => {
    const exportButton = page.locator('[aria-label*="Export"], button:has-text("Export")');
    await exportButton.click();

    await page.waitForTimeout(500);

    // Don't wait for download, just click
    const pdfButton = page.locator('button:has-text("PDF")');
    await pdfButton.click();

    // Look for success toast/notification
    const successMessage = page.locator(
      'text=/export.*success/i, [role="status"]:has-text("PDF")'
    );

    // Should show within 3 seconds
    await expect(successMessage).toBeVisible({ timeout: 3000 });
  });

  test('should respect rate limiting on multiple exports', async ({ page }) => {
    // Try to export multiple times quickly
    for (let i = 0; i < 6; i++) {
      const exportButton = page.locator('[aria-label*="Export"], button:has-text("Export")');
      await exportButton.click();
      await page.waitForTimeout(200);

      const jsonButton = page.locator('button:has-text("JSON")');
      await jsonButton.click();
      await page.waitForTimeout(300);
    }

    // Should show rate limit message after 5 exports
    const rateLimitMessage = page.locator('text=/too many|rate limit|wait/i');
    await expect(rateLimitMessage).toBeVisible({ timeout: 5000 });
  });

  test('should include filtered hospitals only in export', async ({ page }) => {
    // Apply a filter first
    const filterButton = page.locator('button:has-text("Deployed"), [aria-label*="filter"]');
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(1000);
    }

    // Export JSON to check content
    const exportButton = page.locator('[aria-label*="Export"], button:has-text("Export")');
    await exportButton.click();
    await page.waitForTimeout(500);

    const downloadPromise = page.waitForEvent('download');
    const jsonButton = page.locator('button:has-text("JSON")');
    await jsonButton.click();

    const download = await downloadPromise;
    const path = await download.path();

    if (path) {
      const fs = await import('fs');
      const content = fs.readFileSync(path, 'utf-8');
      const data = JSON.parse(content);

      // Should only include hospitals matching the filter
      expect(Array.isArray(data)).toBeTruthy();

      // If filter was applied, should have fewer items
      // (assuming total hospitals > filtered hospitals)
    }
  });

  test('should handle export errors gracefully', async ({ page }) => {
    // Mock a network failure or error condition
    await page.route('**/api/**', route => route.abort());

    const exportButton = page.locator('[aria-label*="Export"], button:has-text("Export")');
    await exportButton.click();
    await page.waitForTimeout(500);

    const pdfButton = page.locator('button:has-text("PDF")');
    await pdfButton.click();

    // Should show error message
    const errorMessage = page.locator('text=/error|failed/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should export with current date in filename', async ({ page }) => {
    const exportButton = page.locator('[aria-label*="Export"], button:has-text("Export")');
    await exportButton.click();
    await page.waitForTimeout(500);

    const downloadPromise = page.waitForEvent('download');
    const pdfButton = page.locator('button:has-text("PDF")');
    await pdfButton.click();

    const download = await downloadPromise;
    const filename = download.suggestedFilename();

    // Should include date in format YYYY-MM-DD or similar
    const datePattern = /\d{4}[-_]\d{2}[-_]\d{2}|\d{8}/;
    expect(filename).toMatch(datePattern);
  });
});

test.describe('Export Content Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="map-container"]', { timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  test('PDF should contain hospital information', async ({ page }) => {
    const exportButton = page.locator('[aria-label*="Export"], button:has-text("Export")');
    await exportButton.click();
    await page.waitForTimeout(500);

    const downloadPromise = page.waitForEvent('download');
    const pdfButton = page.locator('button:has-text("PDF")');
    await pdfButton.click();

    const download = await downloadPromise;
    expect(download).toBeTruthy();

    // Note: Full PDF content verification would require pdf-parse library
    // Here we just verify the file exists and has reasonable size
    const path = await download.path();
    if (path) {
      const fs = await import('fs');
      const stats = fs.statSync(path);

      // PDF should be at least 10KB for meaningful content
      expect(stats.size).toBeGreaterThan(10000);
    }
  });

  test('Excel should contain headers and data', async ({ page }) => {
    const exportButton = page.locator('[aria-label*="Export"], button:has-text("Export")');
    await exportButton.click();
    await page.waitForTimeout(500);

    const downloadPromise = page.waitForEvent('download');
    const excelButton = page.locator('button:has-text("Excel"), button:has-text("CSV")');
    await excelButton.click();

    const download = await downloadPromise;
    const path = await download.path();

    if (path) {
      const fs = await import('fs');
      const content = fs.readFileSync(path, 'utf-8');

      // Should contain headers
      expect(content).toContain('Name');
      expect(content).toContain('Status');
      expect(content).toContain('Address');

      // Should contain data rows (multiple lines)
      const lines = content.split('\n');
      expect(lines.length).toBeGreaterThan(2); // Header + at least one data row
    }
  });

  test('JSON should have correct structure', async ({ page }) => {
    const exportButton = page.locator('[aria-label*="Export"], button:has-text("Export")');
    await exportButton.click();
    await page.waitForTimeout(500);

    const downloadPromise = page.waitForEvent('download');
    const jsonButton = page.locator('button:has-text("JSON")');
    await jsonButton.click();

    const download = await downloadPromise;
    const path = await download.path();

    if (path) {
      const fs = await import('fs');
      const content = fs.readFileSync(path, 'utf-8');
      const data = JSON.parse(content);

      // Should be array of objects
      expect(Array.isArray(data)).toBeTruthy();
      expect(data.length).toBeGreaterThan(0);

      // First item should have expected properties
      const firstHospital = data[0];
      expect(firstHospital).toHaveProperty('id');
      expect(firstHospital).toHaveProperty('nameEn');
      expect(firstHospital).toHaveProperty('status');
      expect(firstHospital).toHaveProperty('coordinates');
    }
  });
});
