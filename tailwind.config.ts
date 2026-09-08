import type { Config } from 'tailwindcss';

/**
 * Design tokens are declared as CSS custom properties in globals.css (light +
 * dark). Tailwind references them here so the same utility class resolves to the
 * right value in either theme. Only semantic color is used in the authenticated
 * app; bolder gradient treatments live on the public marketing pages.
 */
const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Brand
        brand: {
          DEFAULT: '#e8734a',
          dark: '#d9522e',
        },
        // Semantic accents — channels + <alpha-value> so `/12` etc. work.
        success: 'rgb(var(--color-success) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        accent: {
          DEFAULT: 'rgb(var(--color-accent-bg) / <alpha-value>)',
          foreground: 'rgb(var(--color-accent-fg) / <alpha-value>)',
        },
        // Surfaces / text (theme-aware, used as solid values).
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        'surface-muted': 'var(--color-surface-muted)',
        border: 'var(--color-border)',
        content: {
          DEFAULT: 'var(--color-text)',
          muted: 'var(--color-text-muted)',
          subtle: 'var(--color-text-subtle)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        badge: '10px',
      },
      maxWidth: {
        app: '1200px',
      },
      keyframes: {
        'flame-pop': {
          '0%': { transform: 'scale(0.2)', opacity: '0' },
          '60%': { transform: 'scale(1.15)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'flame-flicker': {
          '0%, 100%': { transform: 'scale(1) translateY(0)' },
          '40%': { transform: 'scale(1.04) translateY(-1.5px)' },
          '70%': { transform: 'scale(0.98) translateY(0.5px)' },
        },
        'fade-up': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'icon-pop': {
          '0%': { transform: 'scale(0.4)', opacity: '0' },
          '70%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'flame-pop': 'flame-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'flame-flicker': 'flame-flicker 2.4s ease-in-out 0.6s infinite',
        'fade-up': 'fade-up 0.5s ease-out both',
        'icon-pop': 'icon-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'fade-in': 'fade-in 0.4s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
