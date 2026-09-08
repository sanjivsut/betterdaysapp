const isDev = process.env.NODE_ENV !== 'production';

// Baseline Content-Security-Policy. 'unsafe-inline' for scripts is still present
// (inline theme script + framework runtime + JSON-LD); tightening to a nonce is
// a follow-up. Everything else is locked down.
// `upgrade-insecure-requests` is production-only — on http://localhost it would
// force sub-resource / RSC fetches to https and break local dev.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com",
  "frame-src 'self' https://accounts.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  !isDev && 'upgrade-insecure-requests',
]
  .filter(Boolean)
  .join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  // HSTS only in production — an HSTS header on localhost can pin the browser
  // to https for all of localhost, breaking other local projects.
  ...(isDev
    ? []
    : [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
      ]),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Keep the framework from writing extra tooling instruction files into the repo.
  agentRules: false,
  async headers() {
    const noIndex = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }];
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      // Authenticated / private zones must never be indexed, even if a route
      // is accidentally reachable without a session.
      { source: '/app/:path*', headers: noIndex },
      { source: '/admin/:path*', headers: noIndex },
      { source: '/onboarding', headers: noIndex },
    ];
  },
};

export default nextConfig;
