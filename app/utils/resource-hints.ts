// Utilitaire pour optimiser les resource hints et le preloading des ressources

/**
 * Types de ressources pour le preloading
 */
type ResourceType = 'script' | 'style' | 'image' | 'font' | 'fetch' | 'document';

interface ResourceHint {
  href: string;
  as: ResourceType;
  type?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
  media?: string;
  importance?: 'high' | 'low' | 'auto';
}

/**
 * Ressources critiques à précharger
 */
const criticalResources: ResourceHint[] = [
  // Polices critiques
  {
    href: '/fonts/MinionPro-Regular.otf',
    as: 'font',
    type: 'font/otf',
    crossOrigin: 'anonymous',
    importance: 'high',
  },
  
  // Images critiques
  {
    href: '/logo-white.svg',
    as: 'image',
    importance: 'high',
  },
  
  // Favicon
  {
    href: '/favicon.ico',
    as: 'image',
    importance: 'low',
  },
  
  // Manifest PWA
  {
    href: '/manifest.json',
    as: 'fetch',
    crossOrigin: 'anonymous',
    importance: 'low',
  },
];

/**
 * Ressources externes à préconnecter
 */
const externalDomains = [
  'https://api.mapbox.com',
  'https://events.mapbox.com',
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
];

/**
 * Ajouter un resource hint au document
 */
function addResourceHint(
  rel: 'preload' | 'prefetch' | 'preconnect' | 'dns-prefetch',
  resource: ResourceHint
): void {
  if (typeof document === 'undefined') return;

  // Vérifier si la ressource est déjà préchargée
  const existingLink = document.querySelector(
    `link[rel="${rel}"][href="${resource.href}"]`
  );
  if (existingLink) return;

  const link = document.createElement('link');
  link.rel = rel;
  link.href = resource.href;

  if (resource.as) link.as = resource.as;
  if (resource.type) link.type = resource.type;
  if (resource.crossOrigin) link.crossOrigin = resource.crossOrigin;
  if (resource.media) link.media = resource.media;
  
  // Ajouter l'importance si supportée
  if (resource.importance && 'importance' in link) {
    (link as any).importance = resource.importance;
  }

  document.head.appendChild(link);
}

/**
 * Précharger les ressources critiques
 */
export function preloadCriticalResources(): void {
  criticalResources.forEach(resource => {
    addResourceHint('preload', resource);
  });
}

/**
 * Préconnecter aux domaines externes
 */
export function preconnectExternalDomains(): void {
  if (typeof document === 'undefined') return;

  externalDomains.forEach(domain => {
    // Preconnect pour établir la connexion
    addResourceHint('preconnect', { href: domain, as: 'fetch' });
    
    // DNS prefetch comme fallback
    const dnsLink = document.createElement('link');
    dnsLink.rel = 'dns-prefetch';
    dnsLink.href = domain;
    document.head.appendChild(dnsLink);
  });
}

/**
 * Précharger les chunks JavaScript critiques
 */
export function preloadCriticalChunks(): void {
  if (typeof document === 'undefined') return;

  // Identifier les chunks critiques depuis le build
  // Désactivé temporairement car ces chunks n'existent pas dans Next.js 15
  const criticalChunks: string[] = [
    // '/_next/static/chunks/framework.js',
    // '/_next/static/chunks/main.js',
  ];

  criticalChunks.forEach(chunk => {
    addResourceHint('preload', {
      href: chunk,
      as: 'script',
      importance: 'high',
    });
  });
}

/**
 * Prefetch des ressources non-critiques
 */
export function prefetchNonCriticalResources(): void {
  if (typeof document === 'undefined') return;

  const nonCriticalResources: ResourceHint[] = [
    // Aucune ressource non-critique à prefetch pour l'instant
  ];

  // Prefetch après le chargement initial
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      setTimeout(() => {
        nonCriticalResources.forEach(resource => {
          addResourceHint('prefetch', resource);
        });
      }, 2000); // Délai pour ne pas interférer avec le chargement critique
    });
  }
}

/**
 * Optimiser les images avec lazy loading et preload conditionnel
 */
export function optimizeImageLoading(): void {
  if (typeof document === 'undefined') return;

  // Observer pour détecter les images dans le viewport
  const imageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          
          // Précharger l'image si elle n'est pas encore chargée
          if (img.dataset.src && !img.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          
          imageObserver.unobserve(img);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '50px',
    }
  );

  // Observer toutes les images avec data-src
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

/**
 * Optimiser le chargement des polices
 */
export function optimizeFontLoading(): void {
  if (typeof document === 'undefined') return;

  // Précharger les polices critiques
  const criticalFonts = [
    '/fonts/MinionPro-Regular.otf',
  ];

  criticalFonts.forEach(fontUrl => {
    addResourceHint('preload', {
      href: fontUrl,
      as: 'font',
      type: 'font/otf',
      crossOrigin: 'anonymous',
      importance: 'high',
    });
  });

  // Optimiser l'affichage des polices
  if ('fonts' in document) {
    (document as any).fonts.ready.then(() => {
      console.log('✅ All fonts loaded');
    });
  }
}

/**
 * Mesurer l'efficacité des resource hints
 */
export function measureResourceHintEffectiveness(): void {
  if (typeof window === 'undefined' || !window.performance) return;

  // Mesurer les ressources préchargées
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const resourceEntry = entry as PerformanceResourceTiming;
      
      // Identifier les ressources préchargées
      if (resourceEntry.name.includes('preload') || 
          resourceEntry.transferSize === 0) {
        console.log(`🚀 Preloaded resource: ${resourceEntry.name} (${resourceEntry.duration.toFixed(2)}ms)`);
      }
    }
  });

  try {
    observer.observe({ entryTypes: ['resource'] });
  } catch (e) {
    // Resource timing pas supporté dans tous les navigateurs
  }
}

/**
 * Initialiser toutes les optimisations de resource hints
 */
export function initializeResourceHints(): void {
  // Préconnecter aux domaines externes immédiatement
  preconnectExternalDomains();
  
  // Précharger les ressources critiques
  preloadCriticalResources();
  
  // Optimiser les polices
  optimizeFontLoading();
  
  // Précharger les chunks critiques
  preloadCriticalChunks();
  
  // Optimiser les images
  optimizeImageLoading();
  
  // Prefetch des ressources non-critiques après le chargement
  prefetchNonCriticalResources();
  
  // Mesurer l'efficacité en développement
  if (process.env.NODE_ENV === 'development') {
    measureResourceHintEffectiveness();
  }
}

/**
 * Nettoyer les resource hints inutiles
 */
export function cleanupResourceHints(): void {
  if (typeof document === 'undefined') return;

  // Supprimer les preload links après utilisation pour libérer la mémoire
  const preloadLinks = document.querySelectorAll('link[rel="preload"]');
  
  preloadLinks.forEach(link => {
    const linkElement = link as HTMLLinkElement;
    
    // Vérifier si la ressource a été utilisée
    if (linkElement.as === 'script' || linkElement.as === 'style') {
      // Garder les scripts et styles
      return;
    }
    
    // Supprimer les autres preload après un délai
    setTimeout(() => {
      if (linkElement.parentNode) {
        linkElement.parentNode.removeChild(linkElement);
      }
    }, 10000); // 10 secondes
  });
} 