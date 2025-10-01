import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}', // Garde si des composants externes
  ],

  theme: {
    extend: {
      // ===== COULEURS UNIFIÉES =====
      colors: {
        // Palette Galeon cohérente
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        glassmorphism: {
          bg: 'rgba(217, 217, 217, 0.05)',
          border: 'rgba(71, 154, 243, 0.3)',
          text: '#A1CBF9',
        },
        // Override des couleurs par défaut pour cohérence
        blue: {
          400: '#3b82f6',
          500: '#3b82f6',
        },
      },

      // ===== TYPOGRAPHIE OPTIMISÉE =====
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['var(--font-minion)', 'MinionPro', 'Georgia', 'serif'],
      },

      // ===== EFFETS GLASSMORPHISM =====
      backdropBlur: {
        '17.5': '17.5px',
      },

      // ===== ANIMATIONS COHÉRENTES =====
      animation: {
        'pulse-hospital': 'pulse-hospital 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },

      keyframes: {
        'pulse-hospital': {
          '0%': {
            boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.7)',
          },
          '70%': {
            boxShadow: '0 0 0 6px rgba(59, 130, 246, 0)',
          },
          '100%': {
            boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)',
          },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },

      // ===== ESPACEMENTS COHÉRENTS =====
      spacing: {
        standard: 'var(--standard-spacing)',
      },

      // ===== BREAKPOINTS PERSONNALISÉS =====
      screens: {
        xs: '375px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },

      // ===== Z-INDEX HIERARCHY =====
      zIndex: {
        timeline: '20',
        sidebar: '10',
        actionbar: '30',
        modal: '50',
        tooltip: '60',
        max: '9999',
      },
    },
  },

  // ===== PLUGINS OPTIMISÉS =====
  plugins: [],

  // ===== OPTIMISATION DE PRODUCTION =====
  ...(process.env.NODE_ENV === 'production' && {
    content: [
      './app/**/*.{js,ts,jsx,tsx,mdx}',
      // Scan plus ciblé en production
    ],
  }),
};

export default config;
