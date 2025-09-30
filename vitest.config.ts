// File: vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./app/utils/__tests__/setup.ts'],
    include: [
      'app/**/*.{test,spec}.{js,ts,tsx}',
      'tests/**/*.{test,spec}.{js,ts,tsx}'
    ],
    exclude: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'playwright.config.ts'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      exclude: [
        'coverage/**',
        'dist/**',
        'out/**',
        '.next/**',
        'node_modules/**',
        '**/*.config.*',
        '**/*.d.ts',
        'app/api/hospitals/data.ts', // Static data
        'app/translations/**', // Translation files
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './app'),
      '@/components': path.resolve(__dirname, './app/components'),
      '@/utils': path.resolve(__dirname, './app/utils'),
      '@/store': path.resolve(__dirname, './app/store'),
      '@/api': path.resolve(__dirname, './app/api'),
    }
  },
});
