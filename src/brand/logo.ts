/**
 * Brand Logo Configuration
 * Centralized logo and brand identity tokens for Eastern Jewel
 */

// Logo Text Configuration
export const logoConfig = {
  // Full brand name
  name: 'Eastern Jewel',
  // Name parts for styled rendering
  parts: {
    primary: 'Eastern',   // Gold-colored part
    secondary: 'Jewel',   // White-colored part
  },
  // Brand slogan/tagline
  slogan: {
    en: 'Where Elegance Meets Artistry',
    ar: 'حيث تلتقي الأناقة مع الفن',
  },
  // Alternative taglines
  taglines: {
    hero: 'Exclusive Elegance',
    footer: {
      en: 'Made with heart for the discerning eye',
      ar: 'صنع بـ ❤️ للعين المميزة',
    },
  },
} as const;

// Logo Sizes
export const logoSizes = {
  sm: 'text-lg',     // Footer small
  md: 'text-2xl',   // Navbar default
  lg: 'text-3xl',   // Navbar scrolled
  xl: 'text-5xl',   // Hero tablet
  hero: 'text-8xl', // Hero desktop
} as const;

// Logo Color Classes
export const logoColors = {
  primary: 'text-gold-500',
  secondary: 'text-white',
  gradient: 'text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600',
} as const;

// Favicon Configuration
export const faviconConfig = {
  // SVG viewBox
  viewBox: '0 0 100 100',
  // Primary color (gold)
  fill: '#d4a574',
  // SVG paths (simplified jewel icon)
  basePath: 'M50 10 L85 40 L50 90 L15 40 Z',
} as const;

// Full Logo Export
export const logo = {
  config: logoConfig,
  sizes: logoSizes,
  colors: logoColors,
  favicon: faviconConfig,
} as const;

export type LogoConfig = typeof logoConfig;
export type Logo = typeof logo;
