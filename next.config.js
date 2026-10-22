const isDev = process.env.NODE_ENV !== 'production';

// Content Security Policy. Scripts and styles stay 'self' plus inline (Next
// inlines its bootstrap and Motion sets inline styles); Google Tag Manager is
// allowed only because the layout loads it when NEXT_PUBLIC_GTM is set.
// Nothing may frame the site except itself (the vault embeds the CV PDF).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://media.dev.to https://media2.dev.to https://www.googletagmanager.com https://*.google-analytics.com",
  "font-src 'self' data:",
  "media-src 'self' blob:",
  `connect-src 'self' https://*.google-analytics.com https://www.googletagmanager.com${isDev ? ' ws: wss:' : ''}`,
  "frame-src 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "manifest-src 'self'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  ...(isDev ? [] : [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,       // helps catch potential bugs
  poweredByHeader: false,      // don't advertise the framework
  // Restricted vault media is read from /private by an API route, not served
  // from /public; make sure serverless builds ship those files with it.
  outputFileTracingIncludes: {
    '/api/vault/media/[name]': ['./private/vault/**/*'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.dev.to',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'media2.dev.to',
        pathname: '**',
      },
    ],
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // Restricted and transactional pages: never cached, never indexed.
      {
        source: '/vault',
        headers: [
          { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      { source: '/book/thanks', headers: [{ key: 'Cache-Control', value: 'private, no-store' }, { key: 'X-Robots-Tag', value: 'noindex' }] },
      { source: '/api/:path*', headers: [{ key: 'Cache-Control', value: 'no-store' }, { key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    ];
  },
};

module.exports = nextConfig;
