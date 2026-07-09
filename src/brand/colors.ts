/**
 * Brand Colors
 * Centralized color design tokens for Eastern Jewel
 */

// Gold Palette - Primary Brand Colors
export const goldColors = {
  50: '#fefce8',
  100: '#fef9c3',
  200: '#fef08a',
  300: '#fde047',
  400: '#facc15',
  500: '#d4a574', // Primary gold
  600: '#b8860b',
  700: '#a16207',
  800: '#854d0e',
  900: '#713f12',
} as const;

// Luxury Background Colors
export const luxuryColors = {
  black: '#0a0a0a',    // Darkest background
  dark: '#121212',     // Dark elevated surfaces
  gray: '#1a1a1a',     // Gray elevated surfaces
  light: '#2a2a2a',    // Light elevated surfaces
  border: '#333333',   // Border color
} as const;

// Gold Accent Variants
export const goldAccent = {
  default: '#d4a574',   // Primary gold accent
  light: '#e8c99b',     // Lighter gold for hover states
  dark: '#b8860b',      // Darker gold for active states
} as const;

// Semantic Colors
export const semanticColors = {
  // Text Colors
  text: {
    primary: '#ffffff',
    secondary: '#e5e5e5',
    muted: '#a3a3a3',
    disabled: '#737373',
  },
  // Action Colors
  action: {
    success: '#22c55e',
    warning: '#eab308',
    error: '#ef4444',
    info: '#3b82f6',
  },
} as const;

// Full Color Palette Export
export const colors = {
  gold: goldColors,
  luxury: luxuryColors,
  goldAccent,
  semantic: semanticColors,
} as const;

// Tailwind-compatible color variable names
export const tailwindColors = {
  'gold-50': goldColors[50],
  'gold-100': goldColors[100],
  'gold-200': goldColors[200],
  'gold-300': goldColors[300],
  'gold-400': goldColors[400],
  'gold-500': goldColors[500],
  'gold-600': goldColors[600],
  'gold-700': goldColors[700],
  'gold-800': goldColors[800],
  'gold-900': goldColors[900],
  'luxury-black': luxuryColors.black,
  'luxury-dark': luxuryColors.dark,
  'luxury-gray': luxuryColors.gray,
  'luxury-light': luxuryColors.light,
  'luxury-border': luxuryColors.border,
  'luxury-gold': goldAccent.default,
  'luxury-gold-light': goldAccent.light,
  'luxury-gold-dark': goldAccent.dark,
} as const;

export type GoldColors = typeof goldColors;
export type LuxuryColors = typeof luxuryColors;
export type Colors = typeof colors;
