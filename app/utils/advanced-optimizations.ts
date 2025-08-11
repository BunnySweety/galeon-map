// Optimisations avancées pour maximiser les performances de l'application

/**
 * Compression et optimisation des données
 */
export class DataOptimizer {
  private static compressionCache = new Map<string, string>();

  /**
   * Compresser les données JSON avec LZ-string (simulation)
   */
  static compressJSON(data: any): string {
    const jsonString = JSON.stringify(data);
    
    // Simulation de compression (en production, utiliser LZ-string ou similar)
    const compressed = this.simpleCompress(jsonString);
    
    // Cache pour éviter la recompression
    const hash = this.hashString(jsonString);
    this.compressionCache.set(hash, compressed);
    
    return compressed;
  }

  /**
   * Décompresser les données
   */
  static decompressJSON(compressed: string): any {
    const decompressed = this.simpleDecompress(compressed);
    return JSON.parse(decompressed);
  }

  /**
   * Compression simple (simulation)
   */
  private static simpleCompress(str: string): string {
    // Simulation de compression basique
    return btoa(str);
  }

  /**
   * Décompression simple
   */
  private static simpleDecompress(compressed: string): string {
    return atob(compressed);
  }

  /**
   * Hash simple pour le cache
   */
  private static hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }
}

/**
 * Cache intelligent avec TTL et compression
 */
export class IntelligentCache {
  private static cache = new Map<string, {
    data: any;
    timestamp: number;
    ttl: number;
    compressed: boolean;
    accessCount: number;
    lastAccess: number;
  }>();

  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private static readonly MAX_CACHE_SIZE = 100;

  /**
   * Stocker dans le cache avec compression automatique
   */
  static set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    // Nettoyer le cache si nécessaire
    this.cleanup();

    // Déterminer si compression est nécessaire
    const dataSize = JSON.stringify(data).length;
    const shouldCompress = dataSize > 1024; // Compresser si > 1KB

    const cacheEntry = {
      data: shouldCompress ? DataOptimizer.compressJSON(data) : data,
      timestamp: Date.now(),
      ttl,
      compressed: shouldCompress,
      accessCount: 0,
      lastAccess: Date.now(),
    };

    this.cache.set(key, cacheEntry);
  }

  /**
   * Récupérer du cache
   */
  static get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;

    // Vérifier TTL
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Mettre à jour les statistiques d'accès
    entry.accessCount++;
    entry.lastAccess = Date.now();

    // Décompresser si nécessaire
    return entry.compressed 
      ? DataOptimizer.decompressJSON(entry.data)
      : entry.data;
  }

  /**
   * Nettoyer le cache (LRU + TTL)
   */
  private static cleanup(): void {
    const now = Date.now();

    // Supprimer les entrées expirées
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }

    // Si toujours trop d'entrées, supprimer les moins utilisées
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => {
          // Trier par fréquence d'accès et dernière utilisation
          const now = Date.now();
          const scoreA = a[1].accessCount / Math.max(1, now - a[1].lastAccess);
          const scoreB = b[1].accessCount / Math.max(1, now - b[1].lastAccess);
          return scoreA - scoreB;
        });

      // Supprimer les 20% moins utilisées
      const toRemove = Math.floor(entries.length * 0.2);
      for (let i = 0; i < toRemove; i++) {
        const entry = entries[i];
        if (entry) {
          this.cache.delete(entry[0]);
        }
      }
    }
  }

  /**
   * Statistiques du cache
   */
  static getStats(): {
    size: number;
    hitRate: number;
    compressionRatio: number;
  } {
    const entries = Array.from(this.cache.values());
    const totalAccess = entries.reduce((sum, entry) => sum + entry.accessCount, 0);
    const compressedEntries = entries.filter(entry => entry.compressed).length;

    return {
      size: this.cache.size,
      hitRate: totalAccess > 0 ? entries.length / totalAccess : 0,
      compressionRatio: entries.length > 0 ? compressedEntries / entries.length : 0,
    };
  }
}

/**
 * Optimiseur de rendu avec Virtual Scrolling
 */
export class RenderOptimizer {
  /**
   * Calculer les éléments visibles pour virtual scrolling
   */
  static calculateVisibleItems<T>(
    items: T[],
    itemHeight: number,
    containerHeight: number,
    scrollTop: number
  ) {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    const visibleItems = items.slice(startIndex, endIndex);
    const totalHeight = items.length * itemHeight;
    const offsetY = startIndex * itemHeight;

    return {
      visibleItems,
      totalHeight,
      offsetY,
      startIndex,
      endIndex,
    };
  }
}

/**
 * Hook pour virtual scrolling
 */
export function useVirtualList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const virtualData = React.useMemo(() => {
    return RenderOptimizer.calculateVisibleItems(
      items,
      itemHeight,
      containerHeight,
      scrollTop
    );
  }, [items, itemHeight, containerHeight, scrollTop]);

  const onScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    ...virtualData,
    onScroll,
  };
}

/**
 * Hook pour callback optimisé avec debounce
 */
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  delay: number = 300
): T {
  const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);
  
  return React.useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    deps
  );
}

/**
 * Hook pour memoization avancée avec cache intelligent
 */
export function useIntelligentMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  cacheKey?: string
): T {
  const memoizedValue = React.useMemo(() => {
    if (cacheKey) {
      const cached = IntelligentCache.get(cacheKey);
      if (cached) return cached;
    }

    const value = factory();
    
    if (cacheKey) {
      IntelligentCache.set(cacheKey, value);
    }

    return value;
  }, deps);

  return memoizedValue;
}

/**
 * Optimiseur de réseau avec retry et circuit breaker
 */
export class NetworkOptimizer {
  private static requestCache = new Map<string, Promise<any>>();
  private static failureCount = new Map<string, number>();
  private static readonly MAX_FAILURES = 3;
  private static readonly CIRCUIT_BREAKER_TIMEOUT = 30000; // 30 secondes

  /**
   * Fetch optimisé avec cache et retry
   */
  static async optimizedFetch<T>(
    url: string,
    options: RequestInit = {},
    retries: number = 3
  ): Promise<T> {
    const cacheKey = `${url}_${JSON.stringify(options)}`;
    
    // Vérifier le circuit breaker
    if (this.isCircuitOpen(url)) {
      throw new Error(`Circuit breaker open for ${url}`);
    }

    // Vérifier le cache de requêtes en cours
    if (this.requestCache.has(cacheKey)) {
      return this.requestCache.get(cacheKey);
    }

    // Créer la promesse de requête
    const requestPromise = this.executeRequest<T>(url, options, retries);
    
    // Mettre en cache la promesse
    this.requestCache.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      
      // Réinitialiser le compteur d'échecs en cas de succès
      this.failureCount.delete(url);
      
      return result;
    } catch (error) {
      // Incrémenter le compteur d'échecs
      const failures = (this.failureCount.get(url) || 0) + 1;
      this.failureCount.set(url, failures);
      
      throw error;
    } finally {
      // Nettoyer le cache de requêtes
      this.requestCache.delete(cacheKey);
    }
  }

  /**
   * Exécuter la requête avec retry
   */
  private static async executeRequest<T>(
    url: string,
    options: RequestInit,
    retries: number
  ): Promise<T> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Créer un AbortController pour le timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }

        // Délai exponentiel entre les tentatives
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('Max retries exceeded');
  }

  /**
   * Vérifier si le circuit breaker est ouvert
   */
  private static isCircuitOpen(url: string): boolean {
    const failures = this.failureCount.get(url) || 0;
    return failures >= this.MAX_FAILURES;
  }

  /**
   * Réinitialiser le circuit breaker
   */
  static resetCircuitBreaker(url: string): void {
    this.failureCount.delete(url);
  }
}

/**
 * Optimiseur de mémoire
 */
export class MemoryOptimizer {
  private static observers = new Set<IntersectionObserver>();
  private static timers = new Set<NodeJS.Timeout>();

  /**
   * Nettoyer les observers et timers
   */
  static cleanup(): void {
    // Nettoyer les intersection observers
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();

    // Nettoyer les timers
    this.timers.forEach(timer => {
      clearTimeout(timer);
    });
    this.timers.clear();

    // Forcer le garbage collection si disponible
    if (typeof window !== 'undefined' && 'gc' in window) {
      (window as any).gc();
    }
  }

  /**
   * Créer un intersection observer géré
   */
  static createManagedObserver(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ): IntersectionObserver {
    const observer = new IntersectionObserver(callback, options);
    this.observers.add(observer);
    return observer;
  }

  /**
   * Créer un timer géré
   */
  static createManagedTimer(
    callback: () => void,
    delay: number
  ): NodeJS.Timeout {
    const timer = setTimeout(() => {
      callback();
      this.timers.delete(timer);
    }, delay);
    
    this.timers.add(timer);
    return timer;
  }

  /**
   * Surveiller l'utilisation mémoire
   */
  static monitorMemoryUsage(): void {
    if (typeof window === 'undefined' || !('performance' in window)) return;

    const checkMemory = () => {
      const memory = (performance as any).memory;
      if (memory) {
        const used = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        const total = Math.round(memory.totalJSHeapSize / 1024 / 1024);
        const limit = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);

        console.log(`🧠 Memory: ${used}MB / ${total}MB (limit: ${limit}MB)`);

        // Alerter si utilisation > 80%
        if (used / limit > 0.8) {
          console.warn('⚠️ High memory usage detected');
          this.cleanup();
        }
      }
    };

    // Vérifier toutes les 30 secondes
    setInterval(checkMemory, 30000);
  }
}

/**
 * Initialiser toutes les optimisations avancées
 */
export function initializeAdvancedOptimizations(): void {
  // Surveiller l'utilisation mémoire
  MemoryOptimizer.monitorMemoryUsage();

  // Nettoyer à la fermeture de la page
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      MemoryOptimizer.cleanup();
    });

    // Nettoyer périodiquement
    setInterval(() => {
      IntelligentCache.getStats();
    }, 60000); // Toutes les minutes
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('🚀 Advanced optimizations initialized');
  }
}

// Export des types pour utilisation externe
export type { };

// Import React pour les hooks
import React from 'react'; 