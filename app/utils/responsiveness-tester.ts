// Système de test de responsivité pour valider l'adaptation aux différentes tailles d'écran

interface BreakpointConfig {
  name: string;
  width: number;
  height: number;
  description: string;
  category: 'mobile' | 'tablet' | 'desktop' | 'large';
}

interface ResponsivenessTest {
  name: string;
  selector: string;
  expectedBehavior: string;
  test: (element: Element, breakpoint: BreakpointConfig) => boolean;
  critical: boolean;
}

interface ResponsivenessResult {
  breakpoint: string;
  test: string;
  passed: boolean;
  error?: string;
  actualValue?: string;
  expectedValue?: string;
}

interface ResponsivenessReport {
  timestamp: number;
  totalTests: number;
  passed: number;
  failed: number;
  criticalFailures: number;
  score: number;
  results: ResponsivenessResult[];
  recommendations: string[];
}

/**
 * Testeur de responsivité
 */
export class ResponsivenessTester {
  private breakpoints: BreakpointConfig[] = [];
  private tests: ResponsivenessTest[] = [];

  // Configuration des seuils de test
  private readonly TOUCH_TARGET_MIN_SIZE = {
    mobile: 44, // Standard iOS/Android pour tactile
    tablet: 36, // Taille intermédiaire pour tablette
    desktop: 18, // ↓ Taille normale pour desktop (non-tactile)
    large: 18   // ↓ Taille normale pour grands écrans
  };

  private readonly TEXT_MIN_SIZE = {
    mobile: 14, // ↑ de 12px à 14px pour mobile
    tablet: 13, // Taille intermédiaire pour tablette
    desktop: 12, // Taille normale pour desktop
    large: 12   // Taille normale pour grands écrans
  };

  private readonly TOUCH_SPACING_MIN = 8; // ↑ de 4px à 8px

  constructor() {
    this.initializeBreakpoints();
    this.initializeTests();
  }

  /**
   * Initialiser les breakpoints de test
   */
  private initializeBreakpoints(): void {
    this.breakpoints = [
      // Mobile
      { name: 'iPhone SE', width: 375, height: 667, description: 'Petit mobile', category: 'mobile' },
      { name: 'iPhone 12', width: 390, height: 844, description: 'Mobile standard', category: 'mobile' },
      { name: 'iPhone 12 Pro Max', width: 428, height: 926, description: 'Grand mobile', category: 'mobile' },
      
      // Tablet
      { name: 'iPad Mini', width: 768, height: 1024, description: 'Petite tablette', category: 'tablet' },
      { name: 'iPad Pro', width: 1024, height: 1366, description: 'Grande tablette', category: 'tablet' },
      
      // Desktop
      { name: 'Laptop', width: 1366, height: 768, description: 'Laptop standard', category: 'desktop' },
      { name: 'Desktop', width: 1920, height: 1080, description: 'Desktop standard', category: 'desktop' },
      
      // Large screens
      { name: '4K', width: 3840, height: 2160, description: 'Écran 4K', category: 'large' },
    ];
  }

  /**
   * Initialiser les tests de responsivité
   */
  private initializeTests(): void {
    // Tests pour la sidebar
    this.addTest({
      name: 'Sidebar Visibility',
      selector: '.sidebar-container',
      expectedBehavior: 'Visible et accessible sur tous les écrans',
      critical: true,
      test: (element, breakpoint) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      },
    });

    this.addTest({
      name: 'Sidebar Width',
      selector: '.sidebar-container',
      expectedBehavior: 'Largeur adaptée selon la taille d\'écran',
      critical: false,
      test: (element, breakpoint) => {
        const rect = element.getBoundingClientRect();
        const width = rect.width;
        
        if (breakpoint.category === 'mobile') {
          // Sur mobile, largeur réduite mais suffisante
          return width >= 260 && width <= 350;
        } else {
          // Sur desktop, largeur normale
          return width >= 280 && width <= 400;
        }
      },
    });

    // Tests pour les boutons tactiles - AMÉLIORÉ (sans timeline-point)
    this.addTest({
      name: 'Touch Targets',
      selector: 'button, a[href], [role="button"], .timeline-skip-button',
      expectedBehavior: 'Taille minimale pour interaction tactile',
      critical: true,
      test: (element, breakpoint) => {
        // Sélectionner tous les éléments tactiles (sans timeline-point qui n'est pas cliquable)
        const touchElements = element.querySelectorAll('button, a[href], [role="button"], .timeline-skip-button');
        
        // Si l'élément lui-même est tactile, l'inclure
        const allElements = element.matches('button, a[href], [role="button"], .timeline-skip-button') 
          ? [element, ...Array.from(touchElements)]
          : Array.from(touchElements);
        
        const minTouchSize = this.TOUCH_TARGET_MIN_SIZE[breakpoint.category as keyof typeof this.TOUCH_TARGET_MIN_SIZE] || 32;
        
        for (const touchElement of allElements) {
          const rect = touchElement.getBoundingClientRect();
          
          // Ignorer les éléments cachés
          if (rect.width === 0 || rect.height === 0) continue;
          
          // Vérifier la taille minimale
          if (rect.width < minTouchSize || rect.height < minTouchSize) {
            console.warn(`Touch target too small: ${touchElement.className} (${rect.width}x${rect.height}px, required: ${minTouchSize}px)`);
            return false;
          }
        }
        
        return true;
      },
    });

    // Tests pour la lisibilité du texte - AMÉLIORÉ
    this.addTest({
      name: 'Text Readability',
      selector: 'p, span, div, h1, h2, h3, h4, h5, h6, .timeline-date, .timeline-hospital-name',
      expectedBehavior: 'Taille de police lisible sur mobile',
      critical: true,
      test: (element, breakpoint) => {
        const textElements = element.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, .timeline-date, .timeline-hospital-name');
        const allElements = [element, ...Array.from(textElements)];
        
        const minTextSize = this.TEXT_MIN_SIZE[breakpoint.category as keyof typeof this.TEXT_MIN_SIZE] || 12;
        
        for (const textElement of allElements) {
          // Ignorer les éléments sans texte
          if (!textElement.textContent?.trim()) continue;
          
          const computedStyle = window.getComputedStyle(textElement);
          const fontSize = parseFloat(computedStyle.fontSize);
          
          // Vérifier la taille minimale
          if (fontSize < minTextSize) {
            console.warn(`Text too small: ${textElement.className} (${fontSize}px, required: ${minTextSize}px)`);
            return false;
          }
        }
        
        return true;
      },
    });

    // Tests pour l'espacement tactile - AMÉLIORÉ
    this.addTest({
      name: 'Touch Spacing',
      selector: 'button, a[href], [role="button"]',
      expectedBehavior: 'Espacement suffisant entre éléments tactiles',
      critical: true,
      test: (element, breakpoint) => {
        const touchElements = Array.from(element.querySelectorAll('button, a[href], [role="button"]'));
        
        // Ajouter l'élément lui-même s'il est tactile
        if (element.matches('button, a[href], [role="button"]')) {
          touchElements.push(element);
        }
        
        // Vérifier l'espacement entre éléments adjacents
        for (let i = 0; i < touchElements.length - 1; i++) {
          const current = touchElements[i]?.getBoundingClientRect();
          const next = touchElements[i + 1]?.getBoundingClientRect();
          
          // Ignorer les éléments cachés ou non définis
          if (!current || !next || current.width === 0 || next.width === 0) continue;
          
          // Calculer la distance entre les éléments
          const horizontalGap = Math.abs(next.left - (current.left + current.width));
          const verticalGap = Math.abs(next.top - (current.top + current.height));
          
          // Vérifier l'espacement minimal (horizontal ou vertical)
          const minGap = Math.min(horizontalGap, verticalGap);
          if (minGap < this.TOUCH_SPACING_MIN && minGap > 0) {
            console.warn(`Touch spacing too small: ${minGap}px (required: ${this.TOUCH_SPACING_MIN}px)`);
            return false;
          }
        }
        
        return true;
      },
    });

    // Tests pour la timeline
    this.addTest({
      name: 'Timeline Position',
      selector: '.timeline-container',
      expectedBehavior: 'Position adaptée selon la taille d\'écran',
      critical: true,
      test: (element, breakpoint) => {
        const rect = element.getBoundingClientRect();
        
        if (breakpoint.category === 'mobile') {
          // Sur mobile, timeline en haut avec marges
          return rect.top >= 10 && rect.top <= 30;
        } else {
          // Sur desktop, timeline décalée par la sidebar
          return rect.left >= 300; // Après la sidebar
        }
      },
    });

    // Test spécifique pour les points de timeline (visuels, non-tactiles)
    this.addTest({
      name: 'Timeline Points Size',
      selector: '.timeline-point',
      expectedBehavior: 'Taille appropriée pour l\'affichage (non-tactile)',
      critical: false,
      test: (element, breakpoint) => {
        const rect = element.getBoundingClientRect();
        
        // Vérifier que les points ne sont pas trop gros ou trop petits
        if (breakpoint.category === 'mobile') {
          return rect.width >= 16 && rect.width <= 24; // Petits sur mobile
        } else {
          return rect.width >= 16 && rect.width <= 20; // Normaux sur desktop
        }
      },
    });

    this.addTest({
      name: 'Timeline Height',
      selector: '.timeline-container',
      expectedBehavior: 'Hauteur réduite sur mobile',
      critical: false,
      test: (element, breakpoint) => {
        const rect = element.getBoundingClientRect();
        const height = rect.height;
        
        if (breakpoint.category === 'mobile') {
          // Sur mobile, hauteur réduite
          return height >= 70 && height <= 120;
        } else {
          // Sur desktop, hauteur normale
          return height >= 120 && height <= 180;
        }
      },
    });

    // Tests pour l'ActionBar
    this.addTest({
      name: 'ActionBar Size',
      selector: '.action-menu, [class*="action"]',
      expectedBehavior: 'Taille adaptée aux écrans tactiles',
      critical: true,
      test: (element, breakpoint) => {
        const buttons = element.querySelectorAll('button');
        
        for (const button of buttons) {
          const rect = button.getBoundingClientRect();
          const minTouchSize = breakpoint.category === 'mobile' ? 44 : 32; // 44px minimum pour mobile
          
          if (rect.width < minTouchSize || rect.height < minTouchSize) {
            return false;
          }
        }
        
        return true;
      },
    });

    // Tests pour les popups
    this.addTest({
      name: 'Popup Responsiveness',
      selector: '.mapboxgl-popup-content',
      expectedBehavior: 'Taille adaptée à l\'écran',
      critical: false,
      test: (element, breakpoint) => {
        const rect = element.getBoundingClientRect();
        const maxWidth = breakpoint.width * 0.9; // 90% de la largeur d'écran max
        
        return rect.width <= maxWidth;
      },
    });

    // Tests pour les images
    this.addTest({
      name: 'Image Responsiveness',
      selector: 'img',
      expectedBehavior: 'Images adaptatives',
      critical: false,
      test: (element, breakpoint) => {
        const img = element as HTMLImageElement;
        const rect = img.getBoundingClientRect();
        
        // Vérifier que l'image ne dépasse pas son conteneur
        const parent = img.parentElement;
        if (parent) {
          const parentRect = parent.getBoundingClientRect();
          return rect.width <= parentRect.width + 5; // Tolérance de 5px
        }
        
        return true;
      },
    });
  }

  /**
   * Ajouter un test personnalisé
   */
  addTest(test: ResponsivenessTest): void {
    this.tests.push(test);
  }

  /**
   * Simuler une taille d'écran (sans déclencher d'événements resize)
   */
  private async simulateViewport(breakpoint: BreakpointConfig): Promise<void> {
    // Ne pas modifier la taille de la fenêtre pour éviter les boucles infinies
    // Utiliser uniquement des propriétés CSS pour simuler le viewport
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--test-viewport-width', `${breakpoint.width}px`);
      document.documentElement.style.setProperty('--test-viewport-height', `${breakpoint.height}px`);
      document.documentElement.setAttribute('data-test-breakpoint', breakpoint.name);
      document.documentElement.setAttribute('data-test-category', breakpoint.category);
    }
    
    // Attendre que les styles se mettent à jour (réduit pour éviter les délais)
    return new Promise(resolve => setTimeout(resolve, 50));
  }

  /**
   * Exécuter les tests pour un breakpoint
   */
  private async runTestsForBreakpoint(breakpoint: BreakpointConfig): Promise<ResponsivenessResult[]> {
    const results: ResponsivenessResult[] = [];
    
    // Simuler le viewport
    await this.simulateViewport(breakpoint);
    
    for (const test of this.tests) {
      try {
        const elements = document.querySelectorAll(test.selector);
        let testPassed = true;
        let error: string | undefined;
        
        if (elements.length === 0) {
          testPassed = false;
          error = `No elements found for selector: ${test.selector}`;
        } else {
          // Tester chaque élément
          for (const element of elements) {
            if (!test.test(element, breakpoint)) {
              testPassed = false;
              error = `Test failed for element: ${test.selector}`;
              break;
            }
          }
        }
        
        results.push({
          breakpoint: breakpoint.name,
          test: test.name,
          passed: testPassed,
          ...(error && { error }),
        });
        
      } catch (err) {
        results.push({
          breakpoint: breakpoint.name,
          test: test.name,
          passed: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }
    
    return results;
  }

  /**
   * Exécuter tous les tests de responsivité
   */
  async runAllTests(): Promise<ResponsivenessReport> {
    const startTime = Date.now();
    const allResults: ResponsivenessResult[] = [];
    
    try {
      for (const breakpoint of this.breakpoints) {
        const results = await this.runTestsForBreakpoint(breakpoint);
        allResults.push(...results);
      }
    } finally {
      // Nettoyer les propriétés CSS de test
      if (typeof document !== 'undefined') {
        document.documentElement.style.removeProperty('--test-viewport-width');
        document.documentElement.style.removeProperty('--test-viewport-height');
        document.documentElement.removeAttribute('data-test-breakpoint');
        document.documentElement.removeAttribute('data-test-category');
      }
    }
    
    // Calculer les statistiques
    const totalTests = allResults.length;
    const passed = allResults.filter(r => r.passed).length;
    const failed = totalTests - passed;
    const criticalFailures = allResults.filter(r => !r.passed && 
      (this.tests.find(t => t.name === r.test)?.critical ?? false)
    ).length;
    
    const score = Math.round(((passed / totalTests) * 100) - (criticalFailures * 10));
    
    return {
      timestamp: startTime,
      totalTests,
      passed,
      failed,
      criticalFailures,
      score: Math.max(0, score),
      results: allResults,
      recommendations: this.generateRecommendations(allResults),
    };
  }

  /**
   * Générer des recommandations
   */
  private generateRecommendations(results: ResponsivenessResult[]): string[] {
    const recommendations: string[] = [];
    const failedTests = results.filter(r => !r.passed);
    
    // Analyser les échecs par catégorie
    const failuresByTest = failedTests.reduce((acc, result) => {
      if (!acc[result.test]) acc[result.test] = [];
      acc[result.test]?.push(result);
      return acc;
    }, {} as Record<string, ResponsivenessResult[]>);
    
    // Recommandations spécifiques
    if (failuresByTest['Sidebar Visibility']) {
      recommendations.push('📱 Sidebar: Implémenter un toggle mobile pour la sidebar');
    }
    
    if (failuresByTest['Timeline Position']) {
      recommendations.push('⏱️ Timeline: Ajuster le positionnement responsive de la timeline');
    }
    
    if (failuresByTest['ActionBar Size']) {
      recommendations.push('👆 Touch Targets: Augmenter la taille des boutons pour mobile (min 44px)');
    }
    
    if (failuresByTest['Text Readability']) {
      recommendations.push('📖 Typography: Augmenter la taille des polices sur mobile');
    }
    
    if (failuresByTest?.['Touch Spacing']) {
      recommendations.push('📏 Spacing: Ajouter plus d\'espacement entre les éléments tactiles');
    }
    
    // Recommandations générales
    const mobileFailures = failedTests.filter(r => 
      this.breakpoints.find(b => b.name === r.breakpoint)?.category === 'mobile'
    ).length;
    
    if (mobileFailures > 5) {
      recommendations.push('📱 Mobile: Réviser complètement l\'expérience mobile');
    }
    
    const criticalFailures = failedTests.filter(r => 
      (this.tests.find(t => t.name === r.test)?.critical ?? false)
    ).length;
    
    if (criticalFailures > 0) {
      recommendations.unshift('⚠️ CRITIQUE: Corriger immédiatement les échecs critiques de responsivité');
    }
    
    return recommendations;
  }

  /**
   * Obtenir un résumé par breakpoint
   */
  getBreakpointSummary(): Record<string, { total: number; critical: number }> {
    return this.breakpoints.reduce((acc, bp) => {
      acc[bp.name] = {
        total: this.tests.length,
        critical: this.tests.filter(t => t.critical).length,
      };
      return acc;
    }, {} as Record<string, { total: number; critical: number }>);
  }
}

/**
 * Instance globale du testeur
 */
export const responsivenessTester = new ResponsivenessTester();

/**
 * Exécuter les tests de responsivité et afficher les résultats
 */
export async function testResponsiveness(): Promise<ResponsivenessReport> {
  const report = await responsivenessTester.runAllTests();
  
  if (process.env.NODE_ENV === 'development') {
    console.group('📱 Test de Responsivité');
    console.log(`📊 Score global: ${report.score}/100`);
    console.log(`✅ Tests réussis: ${report.passed}/${report.totalTests}`);
    console.log(`❌ Tests échoués: ${report.failed}/${report.totalTests}`);
    
    if (report.criticalFailures > 0) {
      console.warn(`⚠️ Échecs critiques: ${report.criticalFailures}`);
    }

    // Afficher les résultats par breakpoint
    const breakpoints = ['iPhone SE', 'iPhone 12', 'iPad Mini', 'Desktop'];
    breakpoints.forEach(bp => {
      const bpResults = report.results.filter(r => r.breakpoint === bp);
      const bpPassed = bpResults.filter(r => r.passed).length;
      console.log(`📱 ${bp}: ${bpPassed}/${bpResults.length}`);
    });

    if (report.recommendations.length > 0) {
      console.group('💡 Recommandations');
      report.recommendations.forEach(rec => console.log(rec));
      console.groupEnd();
    }

    console.groupEnd();
  }

  return report;
}

/**
 * Tester un breakpoint spécifique
 */
export async function testBreakpoint(breakpointName: string): Promise<ResponsivenessResult[]> {
  const breakpoint = responsivenessTester['breakpoints'].find(bp => bp.name === breakpointName);
  if (!breakpoint) {
    throw new Error(`Breakpoint not found: ${breakpointName}`);
  }
  
  return responsivenessTester['runTestsForBreakpoint'](breakpoint);
}

/**
 * Initialiser les tests de responsivité automatiques
 */
export function initializeResponsivenessTests(): void {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return;
  }

  // Test automatique après le chargement (une seule fois, sans redimensionnement automatique)
  window.addEventListener('load', () => {
    setTimeout(() => {
      console.log('📱 Test de responsivité initial...');
      testResponsiveness().catch(error => {
        console.error('Erreur lors du test de responsivité:', error);
      });
    }, 5000); // Attendre 5 secondes après le chargement pour éviter les conflits
  }, { once: true });

  // Désactiver les tests automatiques sur resize pour éviter les boucles
  // Les tests peuvent être lancés manuellement via la console avec testResponsiveness()
  
  // Rendre la fonction disponible globalement pour les tests manuels
  if (typeof window !== 'undefined') {
    (window as any).testResponsiveness = testResponsiveness;
    (window as any).testBreakpoint = testBreakpoint;
  }

  console.log('📱 Tests de responsivité automatiques activés (test unique au chargement)');
  console.log('💡 Pour tester manuellement: testResponsiveness() dans la console');
} 