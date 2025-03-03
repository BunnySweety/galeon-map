// File: lingui.config.ts
import { defineConfig } from '@lingui/conf';
import { formatter } from "@lingui/format-json";

export default defineConfig({
  locales: ['en', 'fr'],
  sourceLocale: 'en',
  catalogs: [
    {
      path: 'app/translations/{locale}',
      include: ['app'],
    },
  ],
  format: formatter({ style: "minimal" }),
  compileNamespace: 'cjs',
  runtimeConfigModule: {
    i18n: ['@lingui/core', 'i18n'],
    Trans: ['@lingui/react', 'Trans'],
  },
});