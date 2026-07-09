/**
 * Brand Typography
 * Centralized typography design tokens for Eastern Jewel
 */

// Font Families
export const fontFamilies = {
  display: "'Playfair Display', serif",
  body: "'Inter', system-ui, sans-serif",
  arabic: "'Noto Sans Arabic', 'Tajawal', sans-serif",
} as const;

// Font Weights
export const fontWeights = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

// Font Sizes (responsive scale)
export const fontSizes = {
  xs: '0.75rem',      // 12px
  sm: '0.875rem',     // 14px
  base: '1rem',       // 16px
  lg: '1.125rem',     // 18px
  xl: '1.25rem',      // 20px
  '2xl': '1.5rem',    // 24px
  '3xl': '1.875rem',  // 30px
  '4xl': '2.25rem',   // 36px
  '5xl': '3rem',      // 48px
  '6xl': '3.75rem',   // 60px
  '7xl': '4.5rem',    // 72px
  '8xl': '6rem',      // 96px
} as const;

// Line Heights
export const lineHeights = {
  none: 1,
  tight: 1.2,    // Headings
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

// Letter Spacing
export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

// Typography Scale Presets
export const typographyPresets = {
  // Headings
  h1: {
    fontFamily: fontFamilies.display,
    fontSize: fontSizes['5xl'],
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.tight,
  },
  h2: {
    fontFamily: fontFamilies.display,
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.tight,
  },
  h3: {
    fontFamily: fontFamilies.display,
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.tight,
  },
  h4: {
    fontFamily: fontFamilies.display,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.snug,
  },
  // Body Text
  body: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
  },
  bodyLarge: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.relaxed,
  },
  bodySmall: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
  },
  // Special
  caption: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
  },
  label: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.none,
  },
  // Hero
  hero: {
    fontFamily: fontFamilies.display,
    fontSize: fontSizes['7xl'],
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.tight,
  },
} as const;

// Full Typography Export
export const typography = {
  fonts: fontFamilies,
  weights: fontWeights,
  sizes: fontSizes,
  lineHeights,
  letterSpacing,
  presets: typographyPresets,
} as const;

export type FontFamilies = typeof fontFamilies;
export type Typography = typeof typography;
