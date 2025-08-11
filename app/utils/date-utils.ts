// Centralized date utilities for optimal tree-shaking
import { format as formatDate } from 'date-fns/format';
import { enUS } from 'date-fns/locale/en-US';
import { fr } from 'date-fns/locale/fr';

export type SupportedLocale = 'en' | 'fr';

const localeMap = {
  en: enUS,
  fr: fr,
} as const;

/**
 * Format a date with the specified format and locale
 */
export function formatDateWithLocale(
  date: Date | string | number,
  formatStr: string,
  locale: SupportedLocale = 'en'
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return formatDate(dateObj, formatStr, { locale: localeMap[locale] });
}

/**
 * Format a date with default format (dd/MM/yyyy)
 */
export function formatDateDefault(
  date: Date | string | number,
  locale: SupportedLocale = 'en'
): string {
  return formatDateWithLocale(date, 'dd/MM/yyyy', locale);
}

/**
 * Format a date for export (ISO format)
 */
export function formatDateForExport(date: Date | string | number): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return formatDate(dateObj, 'yyyy-MM-dd');
}

/**
 * Format a date for display (localized)
 */
export function formatDateForDisplay(
  date: Date | string | number,
  locale: SupportedLocale = 'en'
): string {
  return formatDateWithLocale(date, 'PPP', locale);
} 