// File: lingui.config.ts
import { defineConfig } from '@lingui/conf';

export default defineConfig({
  locales: ['en', 'fr'],
  sourceLocale: 'en',
  catalogs: [
    {
      path: 'src/locales/{locale}/messages',
      include: ['src'],
    },
  ],
  format: 'po',
});