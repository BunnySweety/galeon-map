// Fichier principal d'internationalisation (i18n) pour l'application Galeon Hospitals Map
// Ce fichier gère le chargement et l'activation des traductions

// Initialisation de Lingui
import { i18n } from '@lingui/core';
import { en, fr } from 'make-plural/plurals';
import logger from './utils/logger';

// Définir les locales disponibles
export const locales = {
  en: 'English',
  fr: 'Français',
};

// Locale par défaut
const defaultLocale = 'en';

// Définir les plurals pour chaque langue
i18n.loadLocaleData({
  en: { plurals: en },
  fr: { plurals: fr },
});

// Précharger les messages pour chaque locale
const messages = {
  en: {},
  fr: {},
};

/**
 * Activer une locale spécifique
 */
export async function activateLocale(locale) {
  logger.debug(`Setting language in store to: ${locale}`);

  try {
    // Si les messages ne sont pas encore chargés, les charger
    if (Object.keys(messages[locale] || {}).length === 0) {
      // Importer dynamiquement les messages
      const importedMessages = await import(`./translations/${locale}`).then(m => m.messages);

      // Stocker les messages pour une utilisation future
      messages[locale] = importedMessages;
    }

    // Charger et activer la locale
    i18n.load(locale, messages[locale]);
    i18n.activate(locale);

    // Stocker la locale choisie dans localStorage pour la persistance
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', locale);
    }

    logger.debug(
      `Locale ${locale} activated with ${Object.keys(messages[locale]).length} messages`
    );
    logger.debug(`Language set to ${locale} and locale activated`);
    return true;
  } catch (error) {
    logger.error(`Failed to activate language ${locale}:`, error);

    // Fallback to default locale if the requested locale failed to load
    if (locale !== defaultLocale) {
      return activateLocale(defaultLocale);
    }

    return false;
  }
}

/**
 * Initialiser i18n avec la locale par défaut ou stockée
 */
export function initI18n() {
  // Désactiver les avertissements côté client
  if (typeof window !== 'undefined') {
    // Attendre que le DOM soit chargé pour éviter les erreurs
    setTimeout(() => {
      try {
        // Remplacer la fonction console.warn originale pour filtrer les avertissements de Lingui
        // eslint-disable-next-line no-console
        const originalWarn = console.warn;
        // eslint-disable-next-line no-console
        console.warn = function (...args) {
          // Filtrer les avertissements de Lingui
          if (args[0] && typeof args[0] === 'string' && args[0].includes('Uncompiled message')) {
            return;
          }
          // Laisser passer les autres avertissements
          originalWarn.apply(console, args);
        };
      } catch (e) {
        // Ignorer les erreurs
      }
    }, 0);
  }

  // Obtenir la locale stockée dans localStorage ou utiliser la locale par défaut
  let locale = defaultLocale;

  if (typeof window !== 'undefined') {
    const storedLocale = localStorage.getItem('locale');
    if (storedLocale && Object.keys(locales).includes(storedLocale)) {
      locale = storedLocale;
    }
  }

  // Initialiser avec la locale par défaut
  i18n.load(defaultLocale, {});
  i18n.activate(defaultLocale);
  logger.debug('I18n initialized with default locale', defaultLocale);

  // Activer la locale stockée si elle est différente de la locale par défaut
  if (locale !== defaultLocale) {
    activateLocale(locale);
  } else {
    // Sinon, charger les messages pour la locale par défaut
    activateLocale(defaultLocale);
  }

  return i18n;
}

// Initialiser i18n
initI18n();

export { i18n };
