// Rate limiter pour les APIs et requêtes sensibles

interface RateLimitConfig {
  windowMs: number; // Fenêtre de temps en millisecondes
  maxRequests: number; // Nombre maximum de requêtes par fenêtre
  keyGenerator?: (identifier: string) => string; // Générateur de clé personnalisé
  skipSuccessfulRequests?: boolean; // Ignorer les requêtes réussies
  skipFailedRequests?: boolean; // Ignorer les requêtes échouées
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

/**
 * Rate limiter côté client pour prévenir les abus
 */
export class RateLimiter {
  private static instances = new Map<string, RateLimiter>();
  private requests = new Map<string, RateLimitEntry>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      keyGenerator: (id) => id,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...config,
    };
  }

  /**
   * Obtenir une instance de rate limiter
   */
  static getInstance(name: string, config: RateLimitConfig): RateLimiter {
    if (!this.instances.has(name)) {
      this.instances.set(name, new RateLimiter(config));
    }
    return this.instances.get(name)!;
  }

  /**
   * Vérifier si une requête est autorisée
   */
  isAllowed(identifier: string): { allowed: boolean; resetTime?: number; remaining?: number } {
    const key = this.config.keyGenerator!(identifier);
    const now = Date.now();
    
    // Nettoyer les entrées expirées
    this.cleanup(now);

    const entry = this.requests.get(key);

    if (!entry) {
      // Première requête pour cet identifiant
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
        firstRequest: now,
      });
      return { 
        allowed: true, 
        resetTime: now + this.config.windowMs,
        remaining: this.config.maxRequests - 1 
      };
    }

    // Vérifier si la fenêtre a expiré
    if (now >= entry.resetTime) {
      // Réinitialiser le compteur
      entry.count = 1;
      entry.resetTime = now + this.config.windowMs;
      entry.firstRequest = now;
      return { 
        allowed: true, 
        resetTime: entry.resetTime,
        remaining: this.config.maxRequests - 1 
      };
    }

    // Vérifier si la limite est atteinte
    if (entry.count >= this.config.maxRequests) {
      return { 
        allowed: false, 
        resetTime: entry.resetTime,
        remaining: 0 
      };
    }

    // Incrémenter le compteur
    entry.count++;
    return { 
      allowed: true, 
      resetTime: entry.resetTime,
      remaining: this.config.maxRequests - entry.count 
    };
  }

  /**
   * Enregistrer une requête (pour tracking)
   */
  recordRequest(identifier: string, success: boolean = true): void {
    if (
      (success && this.config.skipSuccessfulRequests) ||
      (!success && this.config.skipFailedRequests)
    ) {
      return;
    }

    // La logique est déjà gérée dans isAllowed
    // Cette méthode peut être utilisée pour des métriques supplémentaires
  }

  /**
   * Nettoyer les entrées expirées
   */
  private cleanup(now: number): void {
    for (const [key, entry] of this.requests.entries()) {
      if (now >= entry.resetTime) {
        this.requests.delete(key);
      }
    }
  }

  /**
   * Obtenir les statistiques actuelles
   */
  getStats(): { totalKeys: number; activeKeys: number } {
    const now = Date.now();
    this.cleanup(now);
    
    return {
      totalKeys: this.requests.size,
      activeKeys: Array.from(this.requests.values()).filter(
        entry => now < entry.resetTime
      ).length,
    };
  }

  /**
   * Réinitialiser le rate limiter
   */
  reset(): void {
    this.requests.clear();
  }
}

/**
 * Rate limiters prédéfinis pour différents cas d'usage
 */
export const RateLimiters = {
  // API générale - 100 requêtes par minute
  api: RateLimiter.getInstance('api', {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  }),

  // Export de données - 5 exports par minute
  export: RateLimiter.getInstance('export', {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
  }),

  // Partage social - 10 partages par minute
  share: RateLimiter.getInstance('share', {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
  }),

  // Géolocalisation - 20 requêtes par minute
  geolocation: RateLimiter.getInstance('geolocation', {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
  }),

  // Recherche - 50 requêtes par minute
  search: RateLimiter.getInstance('search', {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 50,
  }),
};

/**
 * Middleware pour rate limiting des requêtes
 */
export function withRateLimit<T extends (...args: any[]) => any>(
  fn: T,
  limiter: RateLimiter,
  identifier: string = 'default'
): T {
  return ((...args: Parameters<T>) => {
    const result = limiter.isAllowed(identifier);
    
    if (!result.allowed) {
      const resetDate = new Date(result.resetTime!);
      throw new Error(
        `Rate limit exceeded. Try again at ${resetDate.toLocaleTimeString()}`
      );
    }

    return fn(...args);
  }) as T;
}

/**
 * Hook React pour rate limiting
 */
export function useRateLimit(
  limiter: RateLimiter,
  identifier: string = 'default'
) {
  const checkLimit = () => limiter.isAllowed(identifier);
  
  const executeWithLimit = <T>(fn: () => T): T => {
    const result = limiter.isAllowed(identifier);
    
    if (!result.allowed) {
      const resetDate = new Date(result.resetTime!);
      throw new Error(
        `Rate limit exceeded. Try again at ${resetDate.toLocaleTimeString()}`
      );
    }

    return fn();
  };

  return {
    checkLimit,
    executeWithLimit,
    getStats: () => limiter.getStats(),
  };
}

/**
 * Utilitaire pour obtenir un identifiant unique du client
 */
export function getClientIdentifier(): string {
  if (typeof window === 'undefined') return 'server';
  
  // Utiliser une combinaison de facteurs pour identifier le client
  const factors = [
    navigator.userAgent,
    screen.width,
    screen.height,
    navigator.language,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ];
  
  // Créer un hash simple
  let hash = 0;
  const str = factors.join('|');
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return `client_${Math.abs(hash)}`;
}

/**
 * Initialiser le rate limiting global
 */
export function initializeRateLimiting(): void {
  if (typeof window === 'undefined') return;

  // Nettoyer périodiquement les rate limiters
  setInterval(() => {
    Object.values(RateLimiters).forEach(limiter => {
      limiter.getStats(); // Déclenche le cleanup
    });
  }, 5 * 60 * 1000); // Toutes les 5 minutes

  if (process.env.NODE_ENV === 'development') {
    console.log('🛡️ Rate limiting initialized');
  }
} 