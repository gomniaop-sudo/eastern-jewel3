/**
 * Production Security Headers Configuration
 *
 * These headers should be set by the hosting platform (Bolt, Vercel, Netlify, etc.)
 * or by a reverse proxy (Nginx, Cloudflare) in front of the application.
 *
 * For Bolt deployments, headers are configured automatically by the platform.
 * This file documents the required headers for production readiness audits.
 */

export interface SecurityHeader {
  key: string
  value: string
}

export const securityHeaders: SecurityHeader[] = [
  // Prevent clickjacking — no framing allowed
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // Prevent MIME-type sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Control referrer information sent to other sites
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Force HTTPS for 1 year (including subdomains)
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  // Restrict browser features (camera, mic, geolocation, etc.)
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  // Content Security Policy — restrict resource sources
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://doltmipomqvpthzwvuls.supabase.co",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https://doltmipomqvpthzwvuls.supabase.co https://images.pexels.com",
      "connect-src 'self' https://doltmipomqvpthzwvuls.supabase.co wss://doltmipomqvpthzwvuls.supabase.co",
      "media-src 'self' https://doltmipomqvpthzwvuls.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join('; '),
  },
  // Cross-Origin isolation for advanced browser features
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin',
  },
  {
    key: 'Cross-Origin-Embedder-Policy',
    value: 'credentialless',
  },
]

/**
 * Convert headers to a plain key-value record for platform configuration
 */
export function getHeadersAsRecord(): Record<string, string> {
  return securityHeaders.reduce(
    (acc, header) => {
      acc[header.key] = header.value
      return acc
    },
    {} as Record<string, string>
  )
}

/**
 * Cache control recommendations for production assets
 */
export const cacheControlHeaders: SecurityHeader[] = [
  // Hashed assets — immutable, cache for 1 year
  {
    key: 'Cache-Control',
    value: 'public, max-age=31536000, immutable',
  },
]

/**
 * Cache control for index.html — must always revalidate
 */
export const htmlCacheControl: SecurityHeader = {
  key: 'Cache-Control',
  value: 'no-cache, no-store, must-revalidate',
}
