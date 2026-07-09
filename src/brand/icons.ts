/**
 * Brand Icon Configuration
 * Centralized icon sizes and configuration for Eastern Jewel
 */

// Lucide icon imports used throughout the app
export const iconNames = {
  // Navigation
  menu: 'Menu',
  close: 'X',
  globe: 'Globe',
  chevronDown: 'ChevronDown',
  chevronLeft: 'ChevronLeft',
  chevronRight: 'ChevronRight',
  arrowRight: 'ArrowRight',
  externalLink: 'ExternalLink',

  // Actions
  send: 'Send',

  // Contact
  mail: 'Mail',
  clock: 'Clock',

  // Features/Status
  heart: 'Heart',
  star: 'Star',
  award: 'Award',
  zap: 'Zap',
  shield: 'Shield',
  headphones: 'Headphones',
  eye: 'Eye',
  sparkles: 'Sparkles',
  users: 'Users',
  camera: 'Camera',
  calendar: 'Calendar',
  lock: 'Lock',
  check: 'Check',
  share: 'Share2',
} as const;

// Icon Sizes
export const iconSizes = {
  xs: 12,
  sm: 14,
  md: 18,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

// Icon Color Classes (Tailwind classes)
export const iconColors = {
  primary: 'text-gold-500',
  secondary: 'text-white',
  muted: 'text-gray-400',
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
} as const;

// Icon Stroke Widths
export const iconStrokeWidths = {
  thin: 1,
  standard: 2,
  thick: 2.5,
  bold: 3,
} as const;

// Common Icon Variants
export const iconVariants = {
  nav: {
    size: iconSizes.sm,
    strokeWidth: iconStrokeWidths.standard,
  },
  button: {
    size: iconSizes.md,
    strokeWidth: iconStrokeWidths.standard,
  },
  hero: {
    size: iconSizes.lg,
    strokeWidth: iconStrokeWidths.standard,
  },
  feature: {
    size: iconSizes.xl,
    strokeWidth: iconStrokeWidths.thin,
  },
  decorative: {
    size: iconSizes['2xl'],
    strokeWidth: iconStrokeWidths.thin,
  },
} as const;

// Full Icon Export
export const icons = {
  names: iconNames,
  sizes: iconSizes,
  colors: iconColors,
  strokeWidths: iconStrokeWidths,
  variants: iconVariants,
} as const;

export type IconSizes = typeof iconSizes;
export type IconColors = typeof iconColors;
export type Icons = typeof icons;
