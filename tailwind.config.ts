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
        // Palette ALPENYA — bleu ciel lumineux, bleu nuit pour le contraste,
        // et magenta comme accent distinctif.
        ink: {
          DEFAULT: '#102A43',
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#075985',
          800: '#0C4A6E',
          900: '#123B5D',
          950: '#082F49',
        },
        canal: {
          DEFAULT: '#38BDF8',
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },
        brick: {
          DEFAULT: '#D81B60',
          50: '#FFF0F6',
          100: '#FFE0EC',
          200: '#FFB8D2',
          300: '#F986AE',
          400: '#EE4F87',
          500: '#D81B60',
          600: '#BE185D',
          700: '#9D174D',
          800: '#831843',
        },
        sand: {
          DEFAULT: '#F4FAFE',
          50: '#FFFFFF',
          100: '#F4FAFE',
          200: '#E8F5FC',
          300: '#D6EEFA',
        },
        status: {
          available: '#39A78E',
          reserved: '#D81B60',
          rented: '#6B7280',
          draft: '#9CA3AF',
        },
      },
      fontFamily: {
        sans: ['var(--font-open-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['3.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.015em', fontWeight: '700' }],
        'display-sm': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        eyebrow: ['0.75rem', { lineHeight: '1', letterSpacing: '0.14em', fontWeight: '600' }],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        soft: '0 2px 10px -2px rgba(2,132,199,0.12), 0 1px 2px -1px rgba(8,47,73,0.08)',
        card: '0 8px 24px -8px rgba(2,132,199,0.18), 0 2px 6px -2px rgba(8,47,73,0.08)',
        lifted: '0 22px 48px -14px rgba(8,47,73,0.28)',
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
          'linear-gradient(90deg, transparent, rgba(14,165,233,0.28) 20%, rgba(14,165,233,0.28) 80%, transparent)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
