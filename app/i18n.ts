// TypeScript definitions for i18n
import { i18n } from '@lingui/core';
// Define the LocaleType
export type LocaleType = 'en' | 'fr';

// Import the actual implementation
// This is a trick to make TypeScript aware of the JavaScript module
// while also providing type definitions
import * as i18nImpl from './i18n.js';

// Re-export everything from the JavaScript implementation with proper types
export const locales: Record<LocaleType, string> = i18nImpl.locales;
export const activateLocale: (locale: LocaleType) => Promise<boolean> = i18nImpl.activateLocale;
export const initI18n: () => typeof i18n = i18nImpl.initI18n;
export { i18n };
