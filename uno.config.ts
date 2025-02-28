// File: uno.config.ts
import { defineConfig } from 'unocss';
import presetWind from '@unocss/preset-wind';
import presetRemToPx from '@unocss/preset-rem-to-px';

export default defineConfig({
  presets: [
    presetWind(),
    presetRemToPx()
  ],
  rules: [
    ['h-screen-4rem', { height: 'calc(100vh - 4rem)' }],
  ],
  theme: {
    colors: {
      primary: '#3b82f6',
      secondary: '#4BC0C0',
      deployed: '#36A2EB',
    },
  },
  shortcuts: {
    'hospital-marker-base': 'w-6 h-6 rounded-full border-2 border-white cursor-pointer shadow-md transition-transform duration-200',
    'hospital-marker-deployed': 'hospital-marker-base bg-deployed',
    'hospital-marker-pending': 'hospital-marker-base bg-secondary',
  }
});