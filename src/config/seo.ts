/**
 * SEO Configuration
 * Centralized SEO defaults and meta tags
 */

import { siteConfig } from './site';

export const seoConfig = {
  // Default meta tags
  defaults: {
    title: 'Eastern Jewel - Exclusive Elegance',
    titleTemplate: '%s | Eastern Jewel',
    description: 'An exclusive journey into elegance and sophistication. Discover premium content, stunning galleries, and exclusive experiences.',
    keywords: 'Eastern Jewel, luxury, premium, exclusive, elegant, art, photography',
    author: 'Eastern Jewel',
    robots: 'index, follow',
  },

  // Open Graph defaults
  openGraph: {
    type: 'website',
    title: 'Eastern Jewel - Exclusive Elegance',
    description: 'An exclusive journey into elegance and sophistication. Discover premium content and stunning galleries.',
    image: '/og-image.jpg',
    url: siteConfig.url,
    locale: {
      en: 'en_US',
      ar: 'ar_SA',
    },
  },

  // Twitter defaults
  twitter: {
    card: 'summary_large_image',
    title: 'Eastern Jewel - Exclusive Elegance',
    description: 'An exclusive journey into elegance and sophistication.',
    image: '/og-image.jpg',
  },

  // JSON-LD schemas
  jsonLd: {
    website: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Eastern Jewel',
      description: 'An exclusive journey into elegance and sophistication',
      url: siteConfig.url,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteConfig.url}/gallery?category={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  },
} as const;

// Page-specific SEO configurations
export const pageSeoConfig = {
  home: {
    title: seoConfig.defaults.title,
    description: seoConfig.defaults.description,
  },
  about: {
    title: 'About - Eastern Jewel',
    description: 'Discover the story behind Eastern Jewel. Learn about our philosophy, team, and commitment to artistic excellence.',
  },
  gallery: {
    title: 'Gallery - Eastern Jewel',
    description: 'Explore our curated collection of elegant photography. Browse portraits, artistic compositions, and exclusive content.',
  },
  premium: {
    title: 'Premium - Eastern Jewel',
    description: 'Unlock exclusive content with premium membership. Choose from Silver, Gold, or Diamond tiers for the ultimate experience.',
  },
  journal: {
    title: 'Journal - Eastern Jewel',
    description: 'Stories behind the lens. Explore our journal for insights into photography, art direction, and the creative process.',
  },
  contact: {
    title: 'Contact - Eastern Jewel',
    description: 'Get in touch with Eastern Jewel. We\'d love to hear from you.',
  },
  privacy: {
    title: 'Privacy Policy - Eastern Jewel',
    description: 'Eastern Jewel privacy policy. Learn how we collect, use, and protect your personal information.',
  },
  terms: {
    title: 'Terms of Service - Eastern Jewel',
    description: 'Eastern Jewel terms of service. Read our terms and conditions for using this website.',
  },
  cookies: {
    title: 'Cookie Policy - Eastern Jewel',
    description: 'Eastern Jewel cookie policy. Learn about the cookies we use and how to manage your preferences.',
  },
  dmca: {
    title: 'DMCA Policy - Eastern Jewel',
    description: 'Eastern Jewel DMCA policy. Information about copyright infringement claims and the Digital Millennium Copyright Act.',
  },
  '2257': {
    title: '2257 Compliance - Eastern Jewel',
    description: 'Eastern Jewel 2257 compliance statement. Information about record keeping requirements under 18 U.S.C. 2257.',
  },
} as const;

export type SeoConfig = typeof seoConfig;
export type PageSeoConfig = typeof pageSeoConfig;
