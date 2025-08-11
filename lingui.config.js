// Configuration Lingui
module.exports = {
  locales: ['en', 'fr'],
  sourceLocale: 'en',
  catalogs: [
    {
      path: 'locales/{locale}',
      include: ['app/**/*.{js,jsx,ts,tsx}'],
      exclude: ['node_modules/**'],
    },
  ],
  format: 'minimal',
  formatOptions: {
    lineNumbers: false,
  },
  fallbackLocales: {
    default: 'en',
  },
  pseudoLocale: 'pseudo',
  compileNamespace: 'cjs',
  runtimeConfigModule: ['@lingui/core', 'i18n'],
};
