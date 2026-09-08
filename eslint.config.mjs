import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

/**
 * Flat ESLint config. `next lint` was removed in Next 16 and `next build` no
 * longer runs linting — run `npm run lint` (eslint CLI) directly.
 */
const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'public/**',
      'scripts/**',
      'next-env.d.ts',
    ],
  },
  ...nextCoreWebVitals,
  {
    rules: {
      // Next 16 ships react-hooks v7, which flags every setState in a mount
      // effect. Our uses are deliberate and SSR-safe: reading browser-only
      // APIs (sessionStorage / localStorage / matchMedia) after hydration, and
      // fetching data on mount. Keep it visible as a warning, not an error.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    // Config files legitimately export a literal.
    files: ['*.config.{js,mjs,ts}'],
    rules: { 'import/no-anonymous-default-export': 'off' },
  },
];

export default config;
