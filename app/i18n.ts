// File: app/i18n.ts
import { i18n } from '@lingui/core';
import { en, fr } from 'make-plural/plurals';

// Define our locales
export const locales = {
  en: 'English',
  fr: 'Français',
};

// Define the messages for each locale
export const messages = {
  en: async () => (await import('./locales/en/messages')).messages,
  fr: async () => (await import('./locales/fr/messages')).messages,
};

// Add plurals for each locale
i18n.loadLocaleData({
  en: { plurals: en },
  fr: { plurals: fr },
});

// Export the locale type for TypeScript
export type LocaleType = keyof typeof locales;

/**
 * Activate a specific locale
 * @param locale The locale to activate
 */
export async function activateLocale(locale: LocaleType) {
  const msgs = await messages[locale]();
  i18n.load(locale, msgs);
  i18n.activate(locale);
  // Store the chosen locale in localStorage for persistence
  if (typeof window !== 'undefined') {
    localStorage.setItem('locale', locale);
  }
  
  return locale;
}