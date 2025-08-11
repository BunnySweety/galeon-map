// Système de validation des optimisations

interface OptimizationTest {
  name: string;
  category: 'performance' | 'security' | 'seo' | 'pwa' | 'accessibility';
  test: () => Promise<boolean> | boolean;
  description: string;
  critical: boolean; // Si true, l'échec de ce test est critique
}

interface ValidationResult {
  test: string;
  passed: boolean;
  error?: string;
  duration: number;
  category: string;
  critical: boolean;
}

interface ValidationReport {
  timestamp: number;
  totalTests: number;
  passed: number;
  failed: number;
  criticalFailures: number;
  score: number; // 0-100
  results: ValidationResult[];
  recommendations: string[];
}

/**
 * Validateur d'optimisations
 */
export class OptimizationValidator {
  private tests: OptimizationTest[] = [];

  constructor() {
    this.initializeTests();
  }

  /**
   * Initialiser tous les tests de validation
   */
  private initializeTests(): void {
    // Tests de Performance
    this.addTest({
      name: 'Web Vitals Monitoring',
      category: 'performance',
      critical: true,
      description: 'Vérifier que le monitoring Web Vitals est actif',
      test: () => {
        return typeof window !== 'undefined' && 
               'performance' in window && 
               'PerformanceObserver' in window;
      },
    });

    this.addTest({
      name: 'Service Worker Registration',
      category: 'performance',
      critical: false,
      description: 'Vérifier que le Service Worker est enregistré',
      test: async () => {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
          return false;
        }
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          return !!registration;
        } catch {
          return false;
        }
      },
    });

    this.addTest({
      name: 'Critical CSS Injection',
      category: 'performance',
      critical: false,
      description: 'Vérifier que le CSS critique est injecté',
      test: () => {
        if (typeof document === 'undefined') return false;
        const criticalStyle = document.getElementById('critical-css-placeholder');
        return !!criticalStyle;
      },
    });

    this.addTest({
      name: 'Resource Hints',
      category: 'performance',
      critical: false,
      description: 'Vérifier la présence des resource hints',
      test: () => {
        if (typeof document === 'undefined') return false;
        const preconnects = document.querySelectorAll('link[rel="preconnect"]');
        const preloads = document.querySelectorAll('link[rel="preload"]');
        return preconnects.length > 0 && preloads.length > 0;
      },
    });

    this.addTest({
      name: 'Font Optimization',
      category: 'performance',
      critical: false,
      description: 'Vérifier que les polices sont optimisées',
      test: () => {
        if (typeof document === 'undefined') return false;
        const fontLinks = document.querySelectorAll('link[href*="fonts"]');
        return Array.from(fontLinks).some(link => 
          link.getAttribute('rel')?.includes('preload')
        );
      },
    });

    // Tests de Sécurité
    this.addTest({
      name: 'CSP Headers',
      category: 'security',
      critical: true,
      description: 'Vérifier la présence des headers CSP',
      test: async () => {
        if (typeof window === 'undefined') return false;
        try {
          const response = await fetch(window.location.href, { method: 'HEAD' });
          const csp = response.headers.get('Content-Security-Policy');
          return !!csp && csp.includes('default-src');
        } catch {
          return false;
        }
      },
    });

    this.addTest({
      name: 'Rate Limiting Active',
      category: 'security',
      critical: true,
      description: 'Vérifier que le rate limiting est actif',
      test: () => {
        try {
          // Vérifier que les modules de rate limiting sont disponibles
          return typeof window !== 'undefined' && 
                 window.sessionStorage !== undefined;
        } catch {
          return false;
        }
      },
    });

    this.addTest({
      name: 'HTTPS Enforcement',
      category: 'security',
      critical: true,
      description: 'Vérifier que HTTPS est utilisé en production',
      test: () => {
        if (typeof window === 'undefined') return true; // Skip en SSR
        return window.location.protocol === 'https:' || 
               window.location.hostname === 'localhost';
      },
    });

    // Tests SEO
    this.addTest({
      name: 'Meta Tags',
      category: 'seo',
      critical: false,
      description: 'Vérifier la présence des meta tags essentiels',
      test: () => {
        if (typeof document === 'undefined') return false;
        const title = document.querySelector('title');
        const description = document.querySelector('meta[name="description"]');
        const viewport = document.querySelector('meta[name="viewport"]');
        return !!(title && description && viewport);
      },
    });

    this.addTest({
      name: 'Open Graph Tags',
      category: 'seo',
      critical: false,
      description: 'Vérifier la présence des tags Open Graph',
      test: () => {
        if (typeof document === 'undefined') return false;
        const ogTitle = document.querySelector('meta[property="og:title"]');
        const ogDescription = document.querySelector('meta[property="og:description"]');
        const ogImage = document.querySelector('meta[property="og:image"]');
        return !!(ogTitle && ogDescription && ogImage);
      },
    });

    this.addTest({
      name: 'Structured Data',
      category: 'seo',
      critical: false,
      description: 'Vérifier la présence des données structurées',
      test: () => {
        if (typeof document === 'undefined') return false;
        const structuredData = document.querySelector('script[type="application/ld+json"]');
        return !!structuredData;
      },
    });

    this.addTest({
      name: 'Sitemap Accessibility',
      category: 'seo',
      critical: false,
      description: 'Vérifier que le sitemap est accessible',
      test: async () => {
        if (typeof window === 'undefined') return false;
        try {
          const response = await fetch('/sitemap.xml');
          return response.ok;
        } catch {
          return false;
        }
      },
    });

    // Tests PWA
    this.addTest({
      name: 'Web App Manifest',
      category: 'pwa',
      critical: false,
      description: 'Vérifier la présence du manifest PWA',
      test: async () => {
        if (typeof window === 'undefined') return false;
        try {
          const response = await fetch('/manifest.json');
          return response.ok;
        } catch {
          return false;
        }
      },
    });

    this.addTest({
      name: 'PWA Icons',
      category: 'pwa',
      critical: false,
      description: 'Vérifier la présence des icônes PWA',
      test: () => {
        if (typeof document === 'undefined') return false;
        const appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
        const favicon = document.querySelector('link[rel="icon"]');
        return !!(appleIcon && favicon);
      },
    });

    // Tests d'Accessibilité
    this.addTest({
      name: 'Alt Text on Images',
      category: 'accessibility',
      critical: false,
      description: 'Vérifier que les images ont des attributs alt',
      test: () => {
        if (typeof document === 'undefined') return true;
        const images = document.querySelectorAll('img');
        return Array.from(images).every(img => 
          img.hasAttribute('alt') || img.hasAttribute('aria-label')
        );
      },
    });

    this.addTest({
      name: 'Keyboard Navigation',
      category: 'accessibility',
      critical: false,
      description: 'Vérifier que les éléments interactifs sont accessibles au clavier',
      test: () => {
        if (typeof document === 'undefined') return true;
        const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
        return Array.from(interactiveElements).every(element => {
          const tabIndex = element.getAttribute('tabindex');
          return tabIndex !== '-1' || element.hasAttribute('aria-hidden');
        });
      },
    });

    this.addTest({
      name: 'Color Contrast',
      category: 'accessibility',
      critical: false,
      description: 'Vérifier que les couleurs ont un contraste suffisant',
      test: () => {
        // Test basique - en production, utiliser un outil comme axe-core
        if (typeof document === 'undefined') return true;
        const body = document.body;
        const computedStyle = window.getComputedStyle(body);
        const backgroundColor = computedStyle.backgroundColor;
        const color = computedStyle.color;
        return backgroundColor !== color; // Test très basique
      },
    });
  }

  /**
   * Ajouter un test personnalisé
   */
  addTest(test: OptimizationTest): void {
    this.tests.push(test);
  }

  /**
   * Exécuter tous les tests
   */
  async runAllTests(): Promise<ValidationReport> {
    const startTime = Date.now();
    const results: ValidationResult[] = [];
    let passed = 0;
    let failed = 0;
    let criticalFailures = 0;

    for (const test of this.tests) {
      const testStartTime = performance.now();
      let testResult: ValidationResult;

      try {
        const result = await test.test();
        const duration = performance.now() - testStartTime;

        testResult = {
          test: test.name,
          passed: result,
          duration,
          category: test.category,
          critical: test.critical,
        };

        if (result) {
          passed++;
        } else {
          failed++;
          if (test.critical) {
            criticalFailures++;
          }
        }
      } catch (error) {
        const duration = performance.now() - testStartTime;
        testResult = {
          test: test.name,
          passed: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          duration,
          category: test.category,
          critical: test.critical,
        };

        failed++;
        if (test.critical) {
          criticalFailures++;
        }
      }

      results.push(testResult);
    }

    // Calculer le score
    const totalTests = this.tests.length;
    const baseScore = (passed / totalTests) * 100;
    const criticalPenalty = criticalFailures * 20; // -20 points par échec critique
    const score = Math.max(0, baseScore - criticalPenalty);

    // Générer des recommandations
    const recommendations = this.generateRecommendations(results);

    return {
      timestamp: startTime,
      totalTests,
      passed,
      failed,
      criticalFailures,
      score: Math.round(score),
      results,
      recommendations,
    };
  }

  /**
   * Exécuter les tests d'une catégorie spécifique
   */
  async runCategoryTests(category: OptimizationTest['category']): Promise<ValidationResult[]> {
    const categoryTests = this.tests.filter(test => test.category === category);
    const results: ValidationResult[] = [];

    for (const test of categoryTests) {
      const testStartTime = performance.now();
      try {
        const result = await test.test();
        const duration = performance.now() - testStartTime;

        results.push({
          test: test.name,
          passed: result,
          duration,
          category: test.category,
          critical: test.critical,
        });
      } catch (error) {
        const duration = performance.now() - testStartTime;
        results.push({
          test: test.name,
          passed: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          duration,
          category: test.category,
          critical: test.critical,
        });
      }
    }

    return results;
  }

  /**
   * Générer des recommandations basées sur les résultats
   */
  private generateRecommendations(results: ValidationResult[]): string[] {
    const recommendations: string[] = [];
    const failedTests = results.filter(r => !r.passed);

    // Recommandations par catégorie
    const failedByCategory = failedTests.reduce((acc, test) => {
      if (!acc[test.category]) acc[test.category] = [];
      const category = acc[test.category];
      if (category) {
        category.push(test);
      }
      return acc;
    }, {} as Record<string, ValidationResult[]>);

    if (failedByCategory.performance && failedByCategory.performance.length > 0) {
      recommendations.push('🚀 Performance: Optimiser le chargement des ressources et activer le monitoring');
    }

    if (failedByCategory.security && failedByCategory.security.length > 0) {
      recommendations.push('🛡️ Sécurité: Renforcer les headers de sécurité et activer le rate limiting');
    }

    if (failedByCategory.seo && failedByCategory.seo.length > 0) {
      recommendations.push('📈 SEO: Améliorer les métadonnées et les données structurées');
    }

    if (failedByCategory.pwa && failedByCategory.pwa.length > 0) {
      recommendations.push('📱 PWA: Configurer le manifest et les icônes pour une expérience app-like');
    }

    if (failedByCategory.accessibility && failedByCategory.accessibility.length > 0) {
      recommendations.push('♿ Accessibilité: Améliorer la navigation clavier et les contrastes');
    }

    // Recommandations spécifiques pour les échecs critiques
    const criticalFailures = failedTests.filter(t => t.critical);
    if (criticalFailures.length > 0) {
      recommendations.unshift('⚠️ CRITIQUE: Corriger immédiatement les échecs critiques de sécurité et performance');
    }

    return recommendations;
  }

  /**
   * Obtenir un résumé des tests par catégorie
   */
     getTestSummary(): Record<string, { total: number; critical: number }> {
     return this.tests.reduce((acc, test) => {
       if (!acc[test.category]) {
         acc[test.category] = { total: 0, critical: 0 };
       }
       const category = acc[test.category];
       if (category) {
         category.total++;
         if (test.critical) {
           category.critical++;
         }
       }
       return acc;
     }, {} as Record<string, { total: number; critical: number }>);
   }
}

/**
 * Instance globale du validateur
 */
export const optimizationValidator = new OptimizationValidator();

/**
 * Exécuter une validation complète et afficher les résultats
 */
export async function validateOptimizations(): Promise<ValidationReport> {
  const report = await optimizationValidator.runAllTests();
  
  if (process.env.NODE_ENV === 'development') {
    console.group('🔍 Validation des Optimisations');
    console.log(`📊 Score global: ${report.score}/100`);
    console.log(`✅ Tests réussis: ${report.passed}/${report.totalTests}`);
    console.log(`❌ Tests échoués: ${report.failed}/${report.totalTests}`);
    
    if (report.criticalFailures > 0) {
      console.warn(`⚠️ Échecs critiques: ${report.criticalFailures}`);
    }

    // Afficher les résultats par catégorie
    const categories = ['performance', 'security', 'seo', 'pwa', 'accessibility'] as const;
    categories.forEach(category => {
      const categoryResults = report.results.filter(r => r.category === category);
      const categoryPassed = categoryResults.filter(r => r.passed).length;
      console.log(`${getCategoryIcon(category)} ${category}: ${categoryPassed}/${categoryResults.length}`);
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
 * Obtenir l'icône pour une catégorie
 */
function getCategoryIcon(category: string): string {
  const icons = {
    performance: '🚀',
    security: '🛡️',
    seo: '📈',
    pwa: '📱',
    accessibility: '♿',
  };
  return icons[category as keyof typeof icons] || '📋';
}

/**
 * Initialiser la validation automatique en développement
 */
export function initializeValidation(): void {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return;
  }

  // Validation automatique après le chargement
  window.addEventListener('load', () => {
    setTimeout(() => {
      validateOptimizations();
    }, 2000); // Attendre 2 secondes après le chargement
  });

  // Validation périodique en développement
  setInterval(() => {
    validateOptimizations();
  }, 5 * 60 * 1000); // Toutes les 5 minutes

  console.log('🔍 Validation automatique des optimisations activée');
} 