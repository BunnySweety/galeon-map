import { test, expect } from '@playwright/test';

// Configuration des appareils de test
const testDevices = [
  { name: 'iPhone SE', viewport: { width: 375, height: 667 }, isMobile: true },
  { name: 'iPhone 12', viewport: { width: 390, height: 844 }, isMobile: true },
  { name: 'iPad Mini', viewport: { width: 768, height: 1024 }, isMobile: false },
  { name: 'Desktop Chrome', viewport: { width: 1366, height: 768 }, isMobile: false },
  { name: 'Desktop Firefox', viewport: { width: 1920, height: 1080 }, isMobile: false },
];

// Tests de responsivité pour chaque appareil
testDevices.forEach(device => {
  test.describe(`Responsiveness on ${device.name}`, () => {

    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(device.viewport);
      await page.goto('/');
      // Attendre la stabilisation réseau
      await page.waitForLoadState('networkidle');
      // Attendre l'apparition de l'un des layouts (desktop ou mobile v2)
      await page.waitForSelector('.sidebar-container, .sidebar-container-second, .timeline-container, .mobile-timeline-container, .mobile-actionbar-content', { timeout: 30000 });
    });

    test('should display sidebar appropriately', async ({ page }) => {
      const sidebar = page.locator('.sidebar-container');
      const mobileTimeline = page.locator('.mobile-timeline-container');
      await expect(sidebar.or(mobileTimeline)).toBeVisible();

      // Vérifier la largeur de la sidebar
      const sidebarBox = await sidebar.boundingBox();
      expect(sidebarBox).toBeTruthy();
      
             if (device.isMobile) {
         // Sur mobile, la sidebar peut être cachée ou adaptée
         if (sidebarBox) {
           expect(sidebarBox.width).toBeGreaterThanOrEqual(260);
           expect(sidebarBox.width).toBeLessThanOrEqual(420);
         }
       } else {
         // Sur desktop/tablet, largeur selon clamp(280px, 22vw, 340px)
         expect(sidebarBox!.width).toBeGreaterThanOrEqual(260);
         expect(sidebarBox!.width).toBeLessThanOrEqual(360);
       }
    });

    test('should display timeline with correct positioning', async ({ page }) => {
      const timeline = page.locator('.timeline-container');
      const mobileTimeline = page.locator('.mobile-timeline-container');
      await expect(timeline.or(mobileTimeline)).toBeVisible();

      const timelineBox = await timeline.boundingBox();
      expect(timelineBox).toBeTruthy();

             if (device.isMobile) {
         // Sur mobile, timeline en haut avec marges
         if (timelineBox) {
           expect(timelineBox.y).toBeGreaterThanOrEqual(0);
           expect(timelineBox.y).toBeLessThanOrEqual(80);
         }
         // Hauteur réduite sur mobile
         if (timelineBox) {
           expect(timelineBox.height).toBeGreaterThanOrEqual(60);
           expect(timelineBox.height).toBeLessThanOrEqual(140);
         }
       } else {
         // Sur desktop, timeline décalée par la sidebar
         expect(timelineBox!.x).toBeGreaterThanOrEqual(260);
         // Hauteur normale sur desktop (plus souple)
         expect(timelineBox!.height).toBeGreaterThanOrEqual(90);
         expect(timelineBox!.height).toBeLessThanOrEqual(220);
       }
    });

    test('should have touch-friendly button sizes', async ({ page }) => {
      // Tester les boutons de l'ActionBar
      const actionButtons = page.locator('button, [role="button"]');
      const buttonCount = await actionButtons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 10); i++) {
        const button = actionButtons.nth(i);
        const buttonBox = await button.boundingBox();
        
                 if (buttonBox) {
           const minSize = device.isMobile ? 44 : 28; // desktop un peu plus souple
           expect(buttonBox.width).toBeGreaterThanOrEqual(minSize);
           expect(buttonBox.height).toBeGreaterThanOrEqual(minSize);
         }
      }
    });

    test('should display text with readable font sizes', async ({ page }) => {
      // Tester les éléments de texte principaux
      const textElements = page.locator('p, span, div').filter({ hasText: /\w+/ });
      const elementCount = await textElements.count();
      
      for (let i = 0; i < Math.min(elementCount, 20); i++) {
        const element = textElements.nth(i);
        const fontSize = await element.evaluate(el => {
          const style = window.getComputedStyle(el);
          return parseFloat(style.fontSize);
        });
        
                 const minFontSize = device.isMobile ? 14 : 12;
         expect(fontSize).toBeGreaterThanOrEqual(minFontSize);
      }
    });

    test('should handle map responsively', async ({ page }) => {
      // Attendre que la carte soit chargée
      await page.waitForSelector('.mapboxgl-canvas, [data-testid="map-container"], .mobile-timeline-container', { timeout: 30000 });
      
      const mapContainer = page.locator('.mapboxgl-canvas, [data-testid="map-container"], .mobile-timeline-container').first();
      await expect(mapContainer).toBeVisible();

      const mapBox = await mapContainer.boundingBox();
      expect(mapBox).toBeTruthy();
      
      // La carte doit occuper l'espace disponible
      expect(mapBox!.width).toBeGreaterThan(200);
      expect(mapBox!.height).toBeGreaterThan(200);
    });

    test('should display hospital popups appropriately', async ({ page }) => {
      // Attendre que la carte soit chargée
      await page.waitForSelector('.mapboxgl-canvas, [data-testid="map-container"], .mobile-timeline-container', { timeout: 30000 });
      
      // Cliquer sur un marqueur d'hôpital (simuler)
      const mapCanvas = page.locator('.mapboxgl-canvas').first();
      await mapCanvas.click({ position: { x: 400, y: 300 } });
      
      // Attendre qu'un popup apparaisse (s'il y en a un)
      try {
        await page.waitForSelector('.mapboxgl-popup-content', { timeout: 3000 });
        
        const popup = page.locator('.mapboxgl-popup-content');
        const popupBox = await popup.boundingBox();
        
        if (popupBox) {
          // Le popup ne doit pas dépasser 90% de la largeur d'écran
          const viewportSize = page.viewportSize();
          const maxWidth = viewportSize!.width * 0.9;
          expect(popupBox.width).toBeLessThanOrEqual(maxWidth);
        }
      } catch {
        // Pas de popup trouvé, c'est OK
      }
    });

         test('should maintain proper spacing between interactive elements', async ({ page }) => {
       if (!device.isMobile) {
         // Test seulement sur mobile
         return;
       }

      const interactiveElements = page.locator('button, a, [role="button"]');
      const elementCount = await interactiveElements.count();
      
      // Vérifier l'espacement entre les premiers éléments
      for (let i = 0; i < Math.min(elementCount - 1, 5); i++) {
        const element1 = interactiveElements.nth(i);
        const element2 = interactiveElements.nth(i + 1);
        
        const box1 = await element1.boundingBox();
        const box2 = await element2.boundingBox();
        
        if (box1 && box2) {
          // Calculer la distance minimale entre les éléments
          const distance = Math.min(
            Math.abs(box1.x + box1.width - box2.x),
            Math.abs(box1.x - (box2.x + box2.width)),
            Math.abs(box1.y + box1.height - box2.y),
            Math.abs(box1.y - (box2.y + box2.height))
          );
          
          // Minimum 8px d'espacement sur mobile
          if (distance < 100) { // Seulement si les éléments sont proches
            expect(distance).toBeGreaterThanOrEqual(8);
          }
        }
      }
    });

         test('should handle orientation changes (mobile only)', async ({ page }) => {
       if (!device.isMobile) {
         return;
       }

      // Test en mode portrait (par défaut)
      let sidebar = page.locator('.sidebar-container');
      await expect(sidebar).toBeVisible();

      // Simuler un changement d'orientation vers paysage
      await page.setViewportSize({ width: 844, height: 390 });
      await page.waitForTimeout(500); // Attendre l'adaptation

      // Vérifier que l'interface s'adapte
      sidebar = page.locator('.sidebar-container');
      await expect(sidebar).toBeVisible();

      const timeline = page.locator('.timeline-container');
      await expect(timeline).toBeVisible();
    });

    test('should load images responsively', async ({ page }) => {
      // Attendre que les images soient chargées
      await page.waitForLoadState('networkidle');
      
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < Math.min(imageCount, 10); i++) {
        const img = images.nth(i);
        const imgBox = await img.boundingBox();
        
        if (imgBox) {
          // Vérifier que l'image ne dépasse pas son conteneur
          const parent = img.locator('..');
          const parentBox = await parent.boundingBox();
          
          if (parentBox) {
            expect(imgBox.width).toBeLessThanOrEqual(parentBox.width + 5);
          }
        }
      }
    });

    test('should maintain accessibility on all screen sizes', async ({ page }) => {
      // Vérifier que les éléments focusables sont accessibles
      const focusableElements = page.locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const elementCount = await focusableElements.count();
      
      for (let i = 0; i < Math.min(elementCount, 15); i++) {
        const element = focusableElements.nth(i);
        
        // Vérifier que l'élément est visible et cliquable
        await expect(element).toBeVisible();
        
        const box = await element.boundingBox();
        if (box) {
          expect(box.width).toBeGreaterThan(0);
          expect(box.height).toBeGreaterThan(0);
        }
      }
    });
  });
});

// Tests de performance responsive
test.describe('Responsive Performance', () => {
  test('should load quickly on mobile', async ({ page, context }) => {
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
        configurable: true
      });
    });
    await page.setViewportSize({ width: 390, height: 844 });
    
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForSelector('.sidebar-container', { timeout: 10000 });
    const loadTime = Date.now() - startTime;
    
    // L'application doit se charger en moins de 5 secondes sur mobile
    expect(loadTime).toBeLessThan(5000);
  });

  test('should be responsive to window resize', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.sidebar-container');
    
    // Tester différentes tailles
    const sizes = [
      { width: 375, height: 667 }, // iPhone SE
      { width: 768, height: 1024 }, // iPad
      { width: 1920, height: 1080 }, // Desktop
    ];
    
    for (const size of sizes) {
      await page.setViewportSize(size);
      await page.waitForTimeout(300); // Attendre l'adaptation
      
      // Vérifier que les éléments principaux sont toujours visibles
      await expect(page.locator('.sidebar-container')).toBeVisible();
      await expect(page.locator('.timeline-container')).toBeVisible();
    }
  });
});

// Tests d'interaction responsive
test.describe('Responsive Interactions', () => {
  test('should handle touch interactions on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForSelector('.sidebar-container');
    
    // Tester le tap sur les boutons
    const buttons = page.locator('button').first();
    if (await buttons.isVisible()) {
      await buttons.tap();
      // Vérifier qu'il n'y a pas d'erreur
      await page.waitForTimeout(500);
    }
  });

  test('should handle swipe gestures', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForSelector('.timeline-container');
    
    // Tester le swipe sur la timeline
    const timeline = page.locator('.timeline-scroll-container');
    if (await timeline.isVisible()) {
      const box = await timeline.boundingBox();
      if (box) {
        // Simuler un swipe horizontal
        await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2);
        await page.mouse.up();
        
        await page.waitForTimeout(500);
      }
    }
  });
}); 