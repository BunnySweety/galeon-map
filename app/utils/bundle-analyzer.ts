// Analyseur de bundle en temps réel pour surveiller les performances

/**
 * Analyseur de performance du bundle
 */
export class BundleAnalyzer {
  private static metrics = {
    totalSize: 0,
    chunkCount: 0,
    loadTime: 0,
    cacheHits: 0,
    cacheMisses: 0,
  };

  private static observers = new Set<PerformanceObserver>();

  /**
   * Initialiser l'analyse du bundle
   */
  static initialize(): void {
    if (typeof window === 'undefined' || !window.performance) return;

    this.analyzeResourceTiming();
    this.monitorChunkLoading();
    this.trackCachePerformance();
    
    console.log('📊 Bundle analyzer initialized');
  }

  /**
   * Analyser le timing des ressources
   */
  private static analyzeResourceTiming(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resource = entry as PerformanceResourceTiming;
        
        // Analyser les chunks JavaScript
        if (resource.name.includes('_next/static/chunks/')) {
          this.analyzeChunk(resource);
        }
        
        // Analyser les autres ressources
        if (resource.name.includes('.js') || resource.name.includes('.css')) {
          this.analyzeResource(resource);
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['resource'] });
      this.observers.add(observer);
    } catch (e) {
      console.warn('Resource timing not supported');
    }
  }

  /**
   * Analyser un chunk spécifique
   */
  private static analyzeChunk(resource: PerformanceResourceTiming): void {
    const chunkName = this.extractChunkName(resource.name);
    const size = resource.transferSize || resource.encodedBodySize || 0;
    const loadTime = resource.responseEnd - resource.responseStart;

    this.metrics.totalSize += size;
    this.metrics.chunkCount++;
    this.metrics.loadTime += loadTime;

    // Analyser la performance du chunk
    const performance = this.evaluateChunkPerformance(size, loadTime);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📦 Chunk: ${chunkName}`, {
        size: `${Math.round(size / 1024)}KB`,
        loadTime: `${Math.round(loadTime)}ms`,
        performance,
        cached: resource.transferSize === 0,
      });
    }

    // Alerter si chunk trop volumineux
    if (size > 500 * 1024) { // > 500KB
      console.warn(`⚠️ Large chunk detected: ${chunkName} (${Math.round(size / 1024)}KB)`);
    }

    // Alerter si chargement lent
    if (loadTime > 1000) { // > 1 seconde
      console.warn(`⚠️ Slow chunk loading: ${chunkName} (${Math.round(loadTime)}ms)`);
    }
  }

  /**
   * Analyser une ressource générale
   */
  private static analyzeResource(resource: PerformanceResourceTiming): void {
    const size = resource.transferSize || resource.encodedBodySize || 0;
    const loadTime = resource.responseEnd - resource.responseStart;
    
    // Détecter les ressources en cache
    if (resource.transferSize === 0 && resource.decodedBodySize > 0) {
      this.metrics.cacheHits++;
    } else {
      this.metrics.cacheMisses++;
    }

    // Analyser les ressources critiques
    if (resource.name.includes('react') || resource.name.includes('vendors')) {
      this.analyzeCriticalResource(resource);
    }
  }

  /**
   * Analyser une ressource critique
   */
  private static analyzeCriticalResource(resource: PerformanceResourceTiming): void {
    const loadTime = resource.responseEnd - resource.responseStart;
    const size = resource.transferSize || resource.encodedBodySize || 0;

    if (process.env.NODE_ENV === 'development') {
      console.log(`🎯 Critical resource: ${this.extractFileName(resource.name)}`, {
        size: `${Math.round(size / 1024)}KB`,
        loadTime: `${Math.round(loadTime)}ms`,
        cached: resource.transferSize === 0,
      });
    }
  }

  /**
   * Surveiller le chargement des chunks
   */
  private static monitorChunkLoading(): void {
    // Observer les mutations DOM pour détecter les nouveaux scripts
    if (typeof window !== 'undefined' && 'MutationObserver' in window) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              if (element.tagName === 'SCRIPT' && element.getAttribute('src')) {
                const src = element.getAttribute('src')!;
                if (src.includes('_next/static/chunks/')) {
                  this.trackChunkLoad(src);
                }
              }
            }
          });
        });
      });

      observer.observe(document.head, {
        childList: true,
        subtree: true,
      });
    }
  }

  /**
   * Tracker le chargement d'un chunk
   */
  private static trackChunkLoad(src: string): void {
    const startTime = performance.now();
    
    // Créer un observer pour ce chunk spécifique
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes(src)) {
          const loadTime = performance.now() - startTime;
          console.log(`⚡ Dynamic chunk loaded: ${this.extractChunkName(src)} (${Math.round(loadTime)}ms)`);
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['resource'] });
      
      // Nettoyer après 10 secondes
      setTimeout(() => {
        observer.disconnect();
      }, 10000);
    } catch (e) {
      // Observer pas supporté
    }
  }

  /**
   * Tracker la performance du cache
   */
  private static trackCachePerformance(): void {
    // Analyser les headers de cache
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const cacheEfficiency = this.calculateCacheEfficiency(navigation);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('💾 Cache performance:', {
            efficiency: `${Math.round(cacheEfficiency * 100)}%`,
            hits: this.metrics.cacheHits,
            misses: this.metrics.cacheMisses,
          });
        }
      }
    }
  }

  /**
   * Calculer l'efficacité du cache
   */
  private static calculateCacheEfficiency(navigation: PerformanceNavigationTiming): number {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    return total > 0 ? this.metrics.cacheHits / total : 0;
  }

  /**
   * Évaluer la performance d'un chunk
   */
  private static evaluateChunkPerformance(size: number, loadTime: number): 'excellent' | 'good' | 'poor' {
    const sizeScore = size < 100 * 1024 ? 2 : size < 300 * 1024 ? 1 : 0; // < 100KB = 2, < 300KB = 1, else = 0
    const timeScore = loadTime < 200 ? 2 : loadTime < 500 ? 1 : 0; // < 200ms = 2, < 500ms = 1, else = 0
    
    const totalScore = sizeScore + timeScore;
    
    if (totalScore >= 3) return 'excellent';
    if (totalScore >= 2) return 'good';
    return 'poor';
  }

  /**
   * Extraire le nom du chunk depuis l'URL
   */
  private static extractChunkName(url: string): string {
    const parts = url.split('/');
    const filename = parts[parts.length - 1] || '';
    return filename.split('.')[0] || filename;
  }

  /**
   * Extraire le nom du fichier depuis l'URL
   */
  private static extractFileName(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 1] || url;
  }

  /**
   * Obtenir les métriques actuelles
   */
  static getMetrics(): {
    totalSize: string;
    chunkCount: number;
    averageLoadTime: string;
    cacheEfficiency: string;
    performance: 'excellent' | 'good' | 'poor';
  } {
    const averageLoadTime = this.metrics.chunkCount > 0 
      ? this.metrics.loadTime / this.metrics.chunkCount 
      : 0;
    
    const cacheTotal = this.metrics.cacheHits + this.metrics.cacheMisses;
    const cacheEfficiency = cacheTotal > 0 
      ? this.metrics.cacheHits / cacheTotal 
      : 0;

    // Évaluer la performance globale
    const performance = this.evaluateOverallPerformance();

    return {
      totalSize: `${Math.round(this.metrics.totalSize / 1024)}KB`,
      chunkCount: this.metrics.chunkCount,
      averageLoadTime: `${Math.round(averageLoadTime)}ms`,
      cacheEfficiency: `${Math.round(cacheEfficiency * 100)}%`,
      performance,
    };
  }

  /**
   * Évaluer la performance globale
   */
  private static evaluateOverallPerformance(): 'excellent' | 'good' | 'poor' {
    const avgLoadTime = this.metrics.chunkCount > 0 
      ? this.metrics.loadTime / this.metrics.chunkCount 
      : 0;
    
    const avgSize = this.metrics.chunkCount > 0 
      ? this.metrics.totalSize / this.metrics.chunkCount 
      : 0;

    if (avgLoadTime < 300 && avgSize < 200 * 1024) return 'excellent';
    if (avgLoadTime < 600 && avgSize < 400 * 1024) return 'good';
    return 'poor';
  }

  /**
   * Générer un rapport de performance
   */
  static generateReport(): void {
    const metrics = this.getMetrics();
    
    console.group('📊 Bundle Performance Report');
    console.log(`📦 Total Size: ${metrics.totalSize}`);
    console.log(`🔢 Chunk Count: ${metrics.chunkCount}`);
    console.log(`⏱️ Average Load Time: ${metrics.averageLoadTime}`);
    console.log(`💾 Cache Efficiency: ${metrics.cacheEfficiency}`);
    console.log(`🏆 Overall Performance: ${metrics.performance}`);
    console.groupEnd();

    // Recommandations
    this.generateRecommendations(metrics);
  }

  /**
   * Générer des recommandations
   */
  private static generateRecommendations(metrics: ReturnType<typeof this.getMetrics>): void {
    const recommendations: string[] = [];

    if (parseInt(metrics.averageLoadTime) > 500) {
      recommendations.push('⚡ Consider code splitting for faster chunk loading');
    }

    if (parseInt(metrics.totalSize) > 1000) {
      recommendations.push('📦 Bundle size is large, consider tree-shaking');
    }

    if (parseInt(metrics.cacheEfficiency) < 70) {
      recommendations.push('💾 Improve caching strategy for better performance');
    }

    if (recommendations.length > 0) {
      console.group('💡 Recommendations');
      recommendations.forEach(rec => console.log(rec));
      console.groupEnd();
    }
  }

  /**
   * Nettoyer les observers
   */
  static cleanup(): void {
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();
  }
} 