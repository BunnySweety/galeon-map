// File: app/utils/mapbox-passive-fix.ts

// Extend Window interface to include our custom property
declare global {
  interface Window {
    _originalAddEventListener?: typeof EventTarget.prototype.addEventListener;
  }
}

/**
 * Cette fonction applique un correctif pour les événements Mapbox
 * en rétablissant certains événements comme non-passifs lorsque nécessaire
 */
export function applyMapboxPassiveEventsFix(): void {
    if (typeof window === 'undefined') return;
    
    // Sauvegarde de la méthode originale
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    window._originalAddEventListener = originalAddEventListener;
    
    // Remplacement par une version plus intelligente
    EventTarget.prototype.addEventListener = function(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ) {
      // Liste des événements qui devraient être passifs
      const passiveEvents = ['wheel', 'mousewheel'];
      
      // Ces événements peuvent nécessiter preventDefault() dans certains cas
      // donc on ne les force pas en passif
      const nonPassiveEvents = ['touchstart', 'touchmove', 'touchend'];
      
      // Si c'est un événement qui devrait être passif
      if (passiveEvents.includes(type)) {
        // Conversion des options en objet si nécessaire
        const optionsObject = typeof options === 'object' 
          ? options 
          : options === undefined 
            ? {} 
            : { capture: options };
        
        // Forcer l'option passive à true
        const passiveOptions = {
          ...optionsObject,
          passive: true
        };
        
        // Appel de la méthode originale avec les options modifiées
        return originalAddEventListener.call(this, type, listener, passiveOptions);
      }
      
      // Si c'est un événement Mapbox spécifique, on laisse Mapbox gérer la configuration
      // Détection basée sur l'élément et le type d'événement
      const isMapboxElement = 
        (this instanceof HTMLElement && this.classList && 
         (this.classList.contains('mapboxgl-canvas') || 
          this.classList.contains('mapboxgl-map') ||
          this.classList.contains('mapboxgl-marker') ||
          this.classList.contains('mapboxgl-popup')));
      
      if (isMapboxElement && nonPassiveEvents.includes(type)) {
        // Laisser Mapbox contrôler ses propres écouteurs
        return originalAddEventListener.call(this, type, listener, options);
      }
      
      // Sinon, utiliser la méthode originale sans modification
      return originalAddEventListener.call(this, type, listener, options);
    };
  }
  
  /**
   * Cette fonction restaure le comportement original de addEventListener
   * Utile pour nettoyer avant de quitter l'application
   */
  export function removeMapboxPassiveEventsFix(): void {
    if (typeof window === 'undefined') return;
    
    // Restauration de la méthode originale si elle a été sauvegardée quelque part
    const originalAddEventListener = window._originalAddEventListener;
    if (originalAddEventListener) {
      EventTarget.prototype.addEventListener = originalAddEventListener;
      delete window._originalAddEventListener;
    }
  }