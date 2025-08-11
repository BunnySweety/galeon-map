// Cache prédictif avancé pour optimiser les performances

interface CacheStrategy {
  name: string;
  maxAge: number; // Durée de vie en millisecondes
  maxEntries: number; // Nombre maximum d'entrées
  priority: number; // Priorité (1-10, 10 = haute priorité)
  predictor?: (url: string, context: CacheContext) => number; // Score de prédiction (0-1)
}

interface CacheContext {
  userAgent: string;
  language: string;
  timeOfDay: number; // 0-23
  dayOfWeek: number; // 0-6
  previousUrls: string[];
  sessionDuration: number;
}

interface CacheEntry {
  url: string;
  data: any;
  timestamp: number;
  accessCount: number;
  lastAccess: number;
  strategy: string;
  size: number;
  predictionScore: number;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  evictions: number;
  totalSize: number;
  averageAccessTime: number;
}

/**
 * Cache prédictif intelligent avec stratégies multiples
 */
export class PredictiveCache {
  private cache = new Map<string, CacheEntry>();
  private strategies = new Map<string, CacheStrategy>();
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalSize: 0,
    averageAccessTime: 0,
  };
  private accessTimes: number[] = [];
  private maxTotalSize: number;

  constructor(maxTotalSize: number = 50 * 1024 * 1024) { // 50MB par défaut
    this.maxTotalSize = maxTotalSize;
    this.initializeStrategies();
  }

  /**
   * Initialiser les stratégies de cache prédéfinies
   */
  private initializeStrategies(): void {
    // Stratégie pour les pages d'hôpitaux
    this.addStrategy({
      name: 'hospitals',
      maxAge: 24 * 60 * 60 * 1000, // 24 heures
      maxEntries: 50,
      priority: 8,
      predictor: (url, context) => {
        if (url.includes('/hospitals/')) {
          // Plus probable si l'utilisateur a visité d'autres hôpitaux
          const hospitalVisits = context.previousUrls.filter(u => u.includes('/hospitals/')).length;
          return Math.min(0.9, 0.3 + (hospitalVisits * 0.1));
        }
        return 0;
      },
    });

    // Stratégie pour les images
    this.addStrategy({
      name: 'images',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      maxEntries: 100,
      priority: 6,
      predictor: (url, context) => {
        if (url.includes('/images/')) {
          // Images plus probables pendant les heures de bureau
          const isBusinessHours = context.timeOfDay >= 9 && context.timeOfDay <= 17;
          return isBusinessHours ? 0.7 : 0.4;
        }
        return 0;
      },
    });

    // Stratégie pour les assets statiques
    this.addStrategy({
      name: 'static',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours
      maxEntries: 200,
      priority: 9,
      predictor: (url, context) => {
        if (url.includes('/_next/static/') || url.includes('.js') || url.includes('.css')) {
          return 0.95; // Très probable
        }
        return 0;
      },
    });

    // Stratégie pour les données API
    this.addStrategy({
      name: 'api',
      maxAge: 5 * 60 * 1000, // 5 minutes
      maxEntries: 20,
      priority: 7,
      predictor: (url, context) => {
        if (url.includes('/api/')) {
          // Plus probable si session active
          const isActiveSession = context.sessionDuration > 2 * 60 * 1000; // > 2 minutes
          return isActiveSession ? 0.6 : 0.3;
        }
        return 0;
      },
    });
  }

  /**
   * Ajouter une stratégie de cache
   */
  addStrategy(strategy: CacheStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  /**
   * Obtenir le contexte actuel
   */
  private getCurrentContext(): CacheContext {
    const now = new Date();
    return {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      language: typeof navigator !== 'undefined' ? navigator.language : 'en',
      timeOfDay: now.getHours(),
      dayOfWeek: now.getDay(),
      previousUrls: this.getPreviousUrls(),
      sessionDuration: this.getSessionDuration(),
    };
  }

  /**
   * Obtenir les URLs précédemment visitées
   */
  private getPreviousUrls(): string[] {
    // Simuler l'historique des URLs (en production, utiliser sessionStorage)
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const history = sessionStorage.getItem('cache_url_history');
      return history ? JSON.parse(history) : [];
    }
    return [];
  }

  /**
   * Obtenir la durée de la session
   */
  private getSessionDuration(): number {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const startTime = sessionStorage.getItem('session_start');
      if (startTime) {
        return Date.now() - parseInt(startTime);
      }
    }
    return 0;
  }

  /**
   * Mettre en cache une ressource
   */
  async set(url: string, data: any, strategyName?: string): Promise<void> {
    const strategy = strategyName ? this.strategies.get(strategyName) : this.getBestStrategy(url);
    if (!strategy) return;

    const size = this.estimateSize(data);
    const context = this.getCurrentContext();
    const predictionScore = strategy.predictor ? strategy.predictor(url, context) : 0.5;

    const entry: CacheEntry = {
      url,
      data,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccess: Date.now(),
      strategy: strategy.name,
      size,
      predictionScore,
    };

    // Vérifier si on doit éviter des entrées
    await this.ensureSpace(size);

    this.cache.set(url, entry);
    this.metrics.totalSize += size;
    this.updateUrlHistory(url);
  }

  /**
   * Récupérer une ressource du cache
   */
  async get(url: string): Promise<any | null> {
    const startTime = performance.now();
    const entry = this.cache.get(url);

    if (!entry) {
      this.metrics.misses++;
      return null;
    }

    const strategy = this.strategies.get(entry.strategy);
    if (!strategy) {
      this.cache.delete(url);
      return null;
    }

    // Vérifier l'expiration
    if (Date.now() - entry.timestamp > strategy.maxAge) {
      this.cache.delete(url);
      this.metrics.totalSize -= entry.size;
      this.metrics.misses++;
      return null;
    }

    // Mettre à jour les statistiques d'accès
    entry.accessCount++;
    entry.lastAccess = Date.now();

    this.metrics.hits++;
    const accessTime = performance.now() - startTime;
    this.accessTimes.push(accessTime);
    this.updateAverageAccessTime();

    return entry.data;
  }

  /**
   * Prédire et précharger les ressources probables
   */
  async predictAndPreload(): Promise<void> {
    const context = this.getCurrentContext();
    const predictions: Array<{ url: string; score: number; strategy: string }> = [];

    // Analyser les patterns d'usage pour prédire les prochaines ressources
    for (const [strategyName, strategy] of this.strategies) {
      if (strategy.predictor) {
        // Générer des URLs candidates basées sur l'historique
        const candidateUrls = this.generateCandidateUrls(context);
        
        for (const url of candidateUrls) {
          const score = strategy.predictor(url, context);
          if (score > 0.5) { // Seuil de prédiction
            predictions.push({ url, score, strategy: strategyName });
          }
        }
      }
    }

    // Trier par score et précharger les meilleures prédictions
    predictions
      .sort((a, b) => b.score - a.score)
      .slice(0, 5) // Limiter à 5 prédictions
      .forEach(prediction => {
        this.preloadResource(prediction.url, prediction.strategy);
      });
  }

  /**
   * Générer des URLs candidates pour la prédiction
   */
  private generateCandidateUrls(context: CacheContext): string[] {
    const candidates: string[] = [];

    // Basé sur l'historique récent
    const recentUrls = context.previousUrls.slice(-5);
    
    // Prédire les pages d'hôpitaux similaires
    recentUrls.forEach(url => {
      if (url.includes('/hospitals/')) {
        const match = url.match(/\/hospitals\/(\d+)/);
        if (match && match[1]) {
          const currentId = parseInt(match[1]);
          // Suggérer les hôpitaux adjacents
          candidates.push(`/hospitals/${currentId + 1}`);
          candidates.push(`/hospitals/${currentId - 1}`);
        }
      }
    });

    // Ajouter des ressources communes
    candidates.push(
      '/'
      // Les chunks sont gérés automatiquement par Next.js
      // '/images/hospitals/' - désactivé car cause des 404
    );

    return candidates;
  }

  /**
   * Précharger une ressource
   */
  private async preloadResource(url: string, strategyName: string): Promise<void> {
    try {
      // Vérifier si déjà en cache
      if (this.cache.has(url)) return;

      // Simuler le préchargement (en production, faire une vraie requête)
      if (typeof window !== 'undefined') {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);

        // Nettoyer après un délai
                 setTimeout(() => {
           if (document.head.contains(link)) {
             document.head.removeChild(link);
           }
         }, 5000);
      }
    } catch (error) {
      console.warn(`Failed to preload ${url}:`, error);
    }
  }

  /**
   * Obtenir la meilleure stratégie pour une URL
   */
  private getBestStrategy(url: string): CacheStrategy | undefined {
    let bestStrategy: CacheStrategy | undefined;
    let bestScore = 0;

    for (const strategy of this.strategies.values()) {
      if (strategy.predictor) {
        const score = strategy.predictor(url, this.getCurrentContext());
        if (score > bestScore) {
          bestScore = score;
          bestStrategy = strategy;
        }
      }
    }

    return bestStrategy;
  }

  /**
   * S'assurer qu'il y a assez d'espace
   */
  private async ensureSpace(requiredSize: number): Promise<void> {
    while (this.metrics.totalSize + requiredSize > this.maxTotalSize) {
      const evicted = this.evictLeastValuable();
      if (!evicted) break; // Plus rien à éviter
    }
  }

  /**
   * Éviter l'entrée la moins précieuse
   */
  private evictLeastValuable(): boolean {
    let leastValuable: { key: string; entry: CacheEntry; score: number } | null = null;

    for (const [key, entry] of this.cache) {
      const strategy = this.strategies.get(entry.strategy);
      if (!strategy) continue;

      // Calculer un score de valeur basé sur plusieurs facteurs
      const ageScore = 1 - (Date.now() - entry.timestamp) / strategy.maxAge;
      const accessScore = Math.min(1, entry.accessCount / 10);
      const recencyScore = 1 - (Date.now() - entry.lastAccess) / (24 * 60 * 60 * 1000);
      const priorityScore = strategy.priority / 10;
      const predictionScore = entry.predictionScore;

      const totalScore = (ageScore + accessScore + recencyScore + priorityScore + predictionScore) / 5;

      if (!leastValuable || totalScore < leastValuable.score) {
        leastValuable = { key, entry, score: totalScore };
      }
    }

    if (leastValuable) {
      this.cache.delete(leastValuable.key);
      this.metrics.totalSize -= leastValuable.entry.size;
      this.metrics.evictions++;
      return true;
    }

    return false;
  }

  /**
   * Estimer la taille d'un objet
   */
  private estimateSize(data: any): number {
    if (typeof data === 'string') {
      return data.length * 2; // UTF-16
    }
    if (data instanceof ArrayBuffer) {
      return data.byteLength;
    }
    if (data instanceof Blob) {
      return data.size;
    }
    // Estimation approximative pour les objets
    return JSON.stringify(data).length * 2;
  }

  /**
   * Mettre à jour l'historique des URLs
   */
  private updateUrlHistory(url: string): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const history = this.getPreviousUrls();
      history.push(url);
      
      // Garder seulement les 20 dernières URLs
      const recentHistory = history.slice(-20);
      sessionStorage.setItem('cache_url_history', JSON.stringify(recentHistory));
    }
  }

  /**
   * Mettre à jour le temps d'accès moyen
   */
  private updateAverageAccessTime(): void {
    if (this.accessTimes.length > 100) {
      this.accessTimes = this.accessTimes.slice(-50); // Garder les 50 derniers
    }
    
    const sum = this.accessTimes.reduce((a, b) => a + b, 0);
    this.metrics.averageAccessTime = sum / this.accessTimes.length;
  }

  /**
   * Obtenir les métriques de performance
   */
  getMetrics(): CacheMetrics & { hitRate: number; efficiency: number } {
    const total = this.metrics.hits + this.metrics.misses;
    const hitRate = total > 0 ? this.metrics.hits / total : 0;
    
    // Calculer l'efficacité basée sur plusieurs facteurs
    const sizeEfficiency = 1 - (this.metrics.totalSize / this.maxTotalSize);
    const accessEfficiency = Math.min(1, 10 / Math.max(1, this.metrics.averageAccessTime));
    const efficiency = (hitRate + sizeEfficiency + accessEfficiency) / 3;

    return {
      ...this.metrics,
      hitRate,
      efficiency,
    };
  }

  /**
   * Nettoyer le cache expiré
   */
  cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [key, entry] of this.cache) {
      const strategy = this.strategies.get(entry.strategy);
      if (!strategy || now - entry.timestamp > strategy.maxAge) {
        toDelete.push(key);
      }
    }

    toDelete.forEach(key => {
      const entry = this.cache.get(key);
      if (entry) {
        this.cache.delete(key);
        this.metrics.totalSize -= entry.size;
      }
    });
  }

  /**
   * Réinitialiser le cache
   */
  clear(): void {
    this.cache.clear();
    this.metrics = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalSize: 0,
      averageAccessTime: 0,
    };
    this.accessTimes = [];
  }
}

/**
 * Instance globale du cache prédictif
 */
export const predictiveCache = new PredictiveCache();

/**
 * Initialiser le cache prédictif
 */
export function initializePredictiveCache(): void {
  if (typeof window === 'undefined') return;

  // Marquer le début de session
  if (!sessionStorage.getItem('session_start')) {
    sessionStorage.setItem('session_start', Date.now().toString());
  }

  // Nettoyer périodiquement
  setInterval(() => {
    predictiveCache.cleanup();
  }, 5 * 60 * 1000); // Toutes les 5 minutes

  // Prédire et précharger périodiquement
  setInterval(() => {
    predictiveCache.predictAndPreload();
  }, 30 * 1000); // Toutes les 30 secondes

  if (process.env.NODE_ENV === 'development') {
    console.log('🔮 Predictive cache initialized');
    
    // Afficher les métriques en développement
    setInterval(() => {
      const metrics = predictiveCache.getMetrics();
      console.log('📊 Cache metrics:', metrics);
    }, 60 * 1000); // Toutes les minutes
  }
} 