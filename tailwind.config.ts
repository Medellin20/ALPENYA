import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // LOCAVIA : forêt profonde, ivoire et accents de laiton.
        ink: {
          DEFAULT: '#233C35', 50: '#F2F5F2', 100: '#E2E8E1', 200: '#C5CFC5',
          300: '#A6B6A9', 400: '#73877B', 500: '#576D61', 600: '#425C4F',
          700: '#304D40', 800: '#243E33', 900: '#1C352B', 950: '#142B23',
        },
        canal: {
          DEFAULT: '#A18A5B', 50: '#FAF7EF', 100: '#F1EADB', 200: '#E4D7B9',
          300: '#D1BD91', 400: '#B59A63', 500: '#9A7E48', 600: '#806635',
          700: '#6A542D', 800: '#544429', 900: '#423622',
        },
        brick: {
          DEFAULT: '#A44C36', 50: '#FCF3EF', 100: '#F6E2D9', 200: '#E8BEAB',
          300: '#D89376', 400: '#BE6D50', 500: '#A44C36', 600: '#8A3D2A',
          700: '#713323', 800: '#59291E',
        },
        sand: {
          DEFAULT: '#F7F5EF', 50: '#FFFEFB', 100: '#F7F5EF', 200: '#EDE9DE',
          300: '#DAD3C3', 400: '#B9B09B',
        },
        status: { available: '#397550', reserved: '#9A733A', rented: '#6B7280', draft: '#9CA3AF' },
      },
      fontFamily: {
        sans: ['var(--font-locavia)'],
        serif: ['var(--font-locavia)'],
        mono: ['var(--font-locavia)'],
      },
      fontSize: {
        'display-lg': ['3.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.015em', fontWeight: '700' }],
        'display-sm': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        eyebrow: ['0.75rem', { lineHeight: '1', letterSpacing: '0.14em', fontWeight: '600' }],
      },
      borderRadius: {
        xl: '0.5rem',
        '2xl': '0.75rem',
        '3xl': '1rem',
      },
      boxShadow: {
        soft: '0 2px 10px -2px rgba(20,43,35,0.06), 0 1px 2px -1px rgba(20,43,35,0.04)',
        card: '0 8px 24px -8px rgba(20,43,35,0.10), 0 2px 6px -2px rgba(20,43,35,0.04)',
        lifted: '0 22px 48px -14px rgba(20,43,35,0.16)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-700px 0' },
          '100%': { backgroundPosition: '700px 0' },
        },
        float: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fade-in 0.4s ease-out both',
        shimmer: 'shimmer 1.6s linear infinite',
        float: 'float 4s ease-in-out infinite',
      },
      backgroundImage: {
        'canal-line':
          'linear-gradient(90deg, transparent, rgba(161,138,91,0.28) 20%, rgba(161,138,91,0.28) 80%, transparent)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
