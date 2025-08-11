/**
 * Script pour corriger les problèmes de chargement de ressources
 * Désactive temporairement le preloading des chunks inexistants
 */

// Fonction pour nettoyer les tentatives de preload incorrectes
export function disableIncorrectPreloading() {
  if (typeof window === 'undefined') return;

  // Supprimer les link preload incorrects
  const incorrectPreloads = document.querySelectorAll(
    'link[rel="preload"][href*="react.js"], link[rel="preload"][href*="vendors.js"]'
  );
  
  incorrectPreloads.forEach(link => {
    link.remove();
    console.log('Removed incorrect preload:', link.href);
  });

  // Intercepter et bloquer les tentatives de preload incorrectes
  const originalAppendChild = Element.prototype.appendChild;
  Element.prototype.appendChild = function(child) {
    if (child && child.tagName === 'LINK' && child.rel === 'preload') {
      const href = child.href || '';
      if (href.includes('react.js') || href.includes('vendors.js')) {
        console.log('Blocked incorrect preload:', href);
        return child;
      }
    }
    return originalAppendChild.call(this, child);
  };
}

// Fonction pour corriger les erreurs MIME type
export function fixMimeTypeErrors() {
  if (typeof window === 'undefined') return;

  // Supprimer les link incorrects qui causent des erreurs MIME
  const incorrectStylesheets = document.querySelectorAll(
    'link[rel="stylesheet"][href$=".js"], link[rel="preload"][as="style"][href$=".js"]'
  );
  
  incorrectStylesheets.forEach(link => {
    link.remove();
    console.log('Removed incorrect stylesheet link:', link.href);
  });

  // Supprimer les scripts qui essaient de charger des CSS
  const incorrectScripts = document.querySelectorAll(
    'script[src*=".css"], script[src*="/css/"]'
  );
  
  incorrectScripts.forEach(script => {
    script.remove();
    console.log('Removed incorrect script loading CSS:', script.src);
  });

  // Intercepter et bloquer les tentatives de charger des CSS comme scripts
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateElement.call(document, tagName);
    
    if (tagName.toLowerCase() === 'script') {
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name, value) {
        if (name === 'src' && value && (value.includes('.css') || value.includes('/css/'))) {
          console.log('Blocked script trying to load CSS:', value);
          return;
        }
        return originalSetAttribute.call(this, name, value);
      };
    }
    
    return element;
  };
}

// Initialiser les corrections
export function initResourceFixes() {
  if (typeof window === 'undefined') return;

  // Appliquer les corrections immédiatement
  disableIncorrectPreloading();
  fixMimeTypeErrors();

  // Réappliquer après le chargement du DOM
  if (document.readyState !== 'complete') {
    window.addEventListener('load', () => {
      disableIncorrectPreloading();
      fixMimeTypeErrors();
    });
  }
}

// Auto-initialiser en développement
if (process.env.NODE_ENV === 'development') {
  initResourceFixes();
}
