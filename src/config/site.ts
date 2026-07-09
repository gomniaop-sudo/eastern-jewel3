/**
 * Site Configuration
 * Centralized static configuration values for Eastern Jewel
 */

export const siteConfig = {
  // Brand
  name: 'Eastern Jewel',
  nameParts: {
    first: 'Eastern',
    second: 'Jewel',
  },
  tagline: {
    en: 'Where Elegance Meets Artistry',
    ar: 'حيث تلتقي الأناقة مع الفن',
  },

  // Domain
  url: 'https://easternjewel.com',

  // Contact emails
  email: {
    contact: 'contact@easternjewel.com',
    privacy: 'privacy@easternjewel.com',
    legal: 'legal@easternjewel.com',
    dmca: 'dmca@easternjewel.com',
    compliance: 'compliance@easternjewel.com',
  },

  // Language configuration
  i18n: {
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'ar'] as const,
    languageNames: {
      en: 'English',
      ar: 'العربية',
    },
  },

  // Response times
  responseTime: '24-48 hours',
} as const;

// Navigation configuration
export const navigationConfig = {
  main: [
    { path: '/', labelKey: 'nav.home' },
    { path: '/about', labelKey: 'nav.about' },
    { path: '/gallery', labelKey: 'nav.gallery' },
    { path: '/premium', labelKey: 'nav.premium' },
    { path: '/journal', labelKey: 'nav.journal' },
    { path: '/contact', labelKey: 'nav.contact' },
  ],
  legal: [
    { path: '/privacy', labelKey: 'legal.privacy' },
    { path: '/terms', labelKey: 'legal.terms' },
    { path: '/cookies', labelKey: 'legal.cookies' },
    { path: '/dmca', labelKey: 'legal.dmca' },
    { path: '/2257', labelKey: 'legal.compliance' },
  ],
} as const;

// Address configuration
export const addressConfig = {
  street: '123 Luxury Lane, Suite 500',
  city: 'New York',
  state: 'NY',
  zip: '10001',
  country: 'USA',
};

export type SiteConfig = typeof siteConfig;
export type NavigationConfig = typeof navigationConfig;
