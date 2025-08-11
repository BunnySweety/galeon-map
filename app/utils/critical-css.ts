// Utilitaire pour gérer le CSS critique et optimiser le chargement des styles

/**
 * CSS critique pour le chargement initial de l'application
 * Ces styles sont inlinés dans le HTML pour éviter le FOUC (Flash of Unstyled Content)
 */
export const criticalCSS = `
  /* Reset et base styles critiques */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    line-height: 1.15;
    -webkit-text-size-adjust: 100%;
  }

  body {
    margin: 0;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    background-color: #0f172a;
    color: #ffffff;
  }

  /* Styles critiques pour le loading */
  .loading-container {
    height: 100vh;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #0f172a;
  }

  .loading-spinner {
    animation: spin 1s linear infinite;
    border-radius: 50%;
    border: 2px solid transparent;
    border-top: 2px solid #3b82f6;
    width: 2rem;
    height: 2rem;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Styles critiques pour la sidebar */
  .sidebar-container {
    background: rgba(217, 217, 217, 0.05);
    backdrop-filter: blur(17.5px);
    border: 2px solid rgba(71, 154, 243, 0.3);
    border-radius: 16px;
  }

  /* Styles critiques pour les boutons */
  .btn-primary {
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.5rem;
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .btn-primary:hover {
    background-color: #2563eb;
  }

  /* Styles critiques pour le texte neon */
  .neon-text {
    color: #60a5fa;
    text-shadow: 
      0 0 5px rgba(96, 165, 250, 0.7),
      0 0 10px rgba(96, 165, 250, 0.5),
      0 0 15px rgba(96, 165, 250, 0.3);
  }

  /* Styles critiques pour les animations */
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  /* Styles critiques pour la responsivité */
  @media (max-width: 768px) {
    .sidebar-container {
      margin: 0.5rem;
    }
  }
`;

/**
 * Injecter le CSS critique dans le document
 */
export function injectCriticalCSS(): void {
  if (typeof document === 'undefined') return;

  // Vérifier si le CSS critique est déjà injecté
  if (document.getElementById('critical-css')) return;

  const style = document.createElement('style');
  style.id = 'critical-css';
  style.textContent = criticalCSS;
  
  // Insérer avant les autres styles
  const head = document.head;
  const firstLink = head.querySelector('link[rel="stylesheet"]');
  
  if (firstLink) {
    head.insertBefore(style, firstLink);
  } else {
    head.appendChild(style);
  }
}

/**
 * Précharger les polices critiques
 */
export function preloadCriticalFonts(): void {
  if (typeof document === 'undefined') return;

  const fonts = [
    '/fonts/MinionPro-Regular.otf',
  ];

  fonts.forEach(fontUrl => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = fontUrl;
    link.as = 'font';
    link.type = 'font/otf';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

/**
 * Optimiser le chargement des styles non-critiques
 */
export function loadNonCriticalCSS(): void {
  if (typeof document === 'undefined') return;

  // Charger les styles non-critiques de manière asynchrone
  const nonCriticalStyles = [
    '/_next/static/css/app.css',
  ];

  nonCriticalStyles.forEach(styleUrl => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = styleUrl;
    link.media = 'print';
    link.onload = function() {
      (this as HTMLLinkElement).media = 'all';
    };
    document.head.appendChild(link);
  });
}

/**
 * Optimiser les ressources critiques
 */
export function optimizeCriticalResources(): void {
  if (typeof document === 'undefined') return;

  // Précharger les ressources critiques
  const criticalResources = [
    { href: '/logo-white.svg', as: 'image' },
    { href: '/favicon.ico', as: 'image' },
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    document.head.appendChild(link);
  });
}

/**
 * Initialiser toutes les optimisations critiques
 */
export function initializeCriticalOptimizations(): void {
  // Injecter le CSS critique immédiatement
  injectCriticalCSS();
  
  // Précharger les polices critiques
  preloadCriticalFonts();
  
  // Optimiser les ressources critiques
  optimizeCriticalResources();
  
  // Charger les styles non-critiques après le chargement initial
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      // Délai pour permettre au contenu critique de se charger
      setTimeout(loadNonCriticalCSS, 100);
    });
  }
}

/**
 * Mesurer les métriques de performance du CSS critique
 */
export function measureCriticalCSSPerformance(): void {
  if (typeof window === 'undefined' || !window.performance) return;

  // Mesurer le First Contentful Paint
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        console.log(`🎨 First Contentful Paint: ${entry.startTime.toFixed(2)}ms`);
      }
    }
  });

  try {
    observer.observe({ entryTypes: ['paint'] });
  } catch (e) {
    // Paint timing pas supporté dans tous les navigateurs
  }

  // Mesurer le temps de chargement du CSS critique
  const criticalCSSElement = document.getElementById('critical-css');
  if (criticalCSSElement) {
    console.log('✅ Critical CSS injected successfully');
  }
} 