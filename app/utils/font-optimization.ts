// Optimisations spécialisées pour les polices

/**
 * Gestionnaire d'optimisation des polices
 */
export class FontOptimizer {
  private static loadedFonts = new Set<string>();
  private static fontLoadPromises = new Map<string, Promise<void>>();

  /**
   * Précharger une police avec gestion d'erreur
   */
  static async preloadFont(
    fontUrl: string,
    fontFamily: string,
    fontWeight: string = 'normal',
    fontStyle: string = 'normal'
  ): Promise<void> {
    // Éviter le rechargement
    if (this.loadedFonts.has(fontUrl)) {
      return Promise.resolve();
    }

    // Retourner la promesse existante si en cours
    if (this.fontLoadPromises.has(fontUrl)) {
      return this.fontLoadPromises.get(fontUrl)!;
    }

    const loadPromise = this.loadFontWithFallback(fontUrl, fontFamily, fontWeight, fontStyle);
    this.fontLoadPromises.set(fontUrl, loadPromise);

    try {
      await loadPromise;
      this.loadedFonts.add(fontUrl);
    } catch (error) {
      console.warn(`Failed to load font: ${fontUrl}`, error);
    } finally {
      this.fontLoadPromises.delete(fontUrl);
    }
  }

  /**
   * Charger une police avec fallback
   */
  private static async loadFontWithFallback(
    fontUrl: string,
    fontFamily: string,
    fontWeight: string,
    fontStyle: string
  ): Promise<void> {
    if (typeof window === 'undefined') return;

    // Méthode 1: Font Loading API
    if ('fonts' in document) {
      try {
        const fontFace = new FontFace(fontFamily, `url(${fontUrl})`, {
          weight: fontWeight,
          style: fontStyle,
          display: 'swap',
        });

        await fontFace.load();
        (document as any).fonts.add(fontFace);
        return;
      } catch (error) {
        console.warn('Font Loading API failed, falling back to link preload');
      }
    }

    // Méthode 2: Link preload fallback
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = fontUrl;
      link.as = 'font';
      link.type = this.getFontType(fontUrl);
      link.crossOrigin = 'anonymous';

      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to preload font: ${fontUrl}`));

      document.head.appendChild(link);

      // Timeout après 5 secondes
      setTimeout(() => reject(new Error('Font load timeout')), 5000);
    });
  }

  /**
   * Déterminer le type MIME de la police
   */
  private static getFontType(fontUrl: string): string {
    const extension = fontUrl.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'woff2':
        return 'font/woff2';
      case 'woff':
        return 'font/woff';
      case 'ttf':
        return 'font/ttf';
      case 'otf':
        return 'font/otf';
      case 'eot':
        return 'application/vnd.ms-fontobject';
      default:
        return 'font/woff2';
    }
  }

  /**
   * Optimiser l'affichage des polices avec font-display
   */
  static injectFontDisplayCSS(): void {
    if (typeof document === 'undefined') return;

    const css = `
      @font-face {
        font-family: 'Geist Sans';
        font-display: swap;
      }
      
      @font-face {
        font-family: 'Geist Mono';
        font-display: swap;
      }
      
      @font-face {
        font-family: 'Inter';
        font-display: swap;
      }
      
      @font-face {
        font-family: 'Minion Pro';
        font-display: swap;
        src: url('/fonts/MinionPro-Regular.otf') format('opentype');
      }
    `;

    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  /**
   * Surveiller le chargement des polices
   */
  static monitorFontLoading(): void {
    if (typeof window === 'undefined' || !('fonts' in document)) return;

    (document as any).fonts.ready.then(() => {
      console.log('✅ All fonts loaded successfully');
      
      // Mesurer les polices chargées
      const loadedFonts = Array.from((document as any).fonts.values());
      console.log(`📊 Loaded fonts: ${loadedFonts.length}`);
    });

    // Surveiller les échecs de chargement
    (document as any).fonts.addEventListener('loadingdone', (event: any) => {
      event.fontfaces.forEach((fontFace: any) => {
        if (fontFace.status === 'loaded') {
          console.log(`✅ Font loaded: ${fontFace.family}`);
        } else if (fontFace.status === 'error') {
          console.error(`❌ Font failed to load: ${fontFace.family}`);
        }
      });
    });
  }

  /**
   * Précharger toutes les polices critiques
   */
  static async preloadCriticalFonts(): Promise<void> {
    const criticalFonts = [
      {
        url: '/fonts/MinionPro-Regular.otf',
        family: 'Minion Pro',
        weight: 'normal',
        style: 'normal',
      },
    ];

    const loadPromises = criticalFonts.map(font =>
      this.preloadFont(font.url, font.family, font.weight, font.style)
    );

    try {
      await Promise.allSettled(loadPromises);
      console.log('🎨 Critical fonts preloading completed');
    } catch (error) {
      console.warn('Some critical fonts failed to load:', error);
    }
  }

  /**
   * Optimiser les polices Google Fonts
   */
  static optimizeGoogleFonts(): void {
    if (typeof document === 'undefined') return;

    // Préconnecter aux domaines Google Fonts
    const preconnectDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
    ];

    preconnectDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  /**
   * Initialiser toutes les optimisations de polices
   */
  static async initialize(): Promise<void> {
    // Injecter les styles font-display
    this.injectFontDisplayCSS();
    
    // Optimiser Google Fonts
    this.optimizeGoogleFonts();
    
    // Surveiller le chargement
    this.monitorFontLoading();
    
    // Précharger les polices critiques
    await this.preloadCriticalFonts();
    
    console.log('🚀 Font optimization initialized');
  }

  /**
   * Obtenir les statistiques de chargement des polices
   */
  static getStats(): {
    loadedFonts: number;
    failedFonts: number;
    totalFonts: number;
  } {
    return {
      loadedFonts: this.loadedFonts.size,
      failedFonts: 0, // À implémenter si nécessaire
      totalFonts: this.loadedFonts.size,
    };
  }
} 