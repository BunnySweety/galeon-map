// File: app/i18n.ts
import { i18n } from '@lingui/core';
import { en, fr } from 'make-plural/plurals';

// Define our locales
export const locales = {
  en: 'English',
  fr: 'Français',
};

// Export the locale type for TypeScript
export type LocaleType = keyof typeof locales;

const defaultLocale = 'en';

// Add plurals for each locale
i18n.loadLocaleData({
  en: { plurals: en },
  fr: { plurals: fr },
});

// Preload messages for each locale
const messages = {
  en: {},
  fr: {},
};

/**
 * Activate a specific locale
 */
export async function activateLocale(locale: string) {
  try {
    // If messages are not loaded yet, load them
    if (Object.keys(messages[locale as keyof typeof messages] || {}).length === 0) {
      // Dynamically import the messages
      const importedMessages = await import(`./translations/${locale}`).then(m => m.messages);
      
      // Store the messages for future use
      messages[locale as keyof typeof messages] = importedMessages;
    }
    
    // Load and activate the locale
    i18n.load(locale, messages[locale as keyof typeof messages]);
    i18n.activate(locale);
    
    // Store the chosen locale in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', locale);
    }
    
    console.log(`Locale ${locale} activated with ${Object.keys(messages[locale as keyof typeof messages]).length} messages`);
    return locale;
  } catch (error) {
    console.error(`Error activating locale ${locale}:`, error);
    return defaultLocale;
  }
}

export async function initI18n() {
  try {
    // Load messages for the default locale if not already loaded
    if (Object.keys(messages[defaultLocale]).length === 0) {
      const importedMessages = await import(`./translations/${defaultLocale}`).then(m => m.messages);
      messages[defaultLocale] = importedMessages;
    }
    
    // Load and activate the default locale
    i18n.load(defaultLocale, messages[defaultLocale]);
    i18n.activate(defaultLocale);
    
    console.log(`Default locale ${defaultLocale} initialized with ${Object.keys(messages[defaultLocale]).length} messages`);
  } catch (error) {
    console.error('Error initializing i18n:', error);
  }
}

// Initialize i18n with default locale
initI18n();

export { i18n };