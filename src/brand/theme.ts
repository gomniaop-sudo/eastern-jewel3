/**
 * Brand Theme
 * Centralized theme design tokens including spacing, radius, shadows, animations
 */

import { colors } from './colors';
import { typography } from './typography';

// Spacing Scale (8px base)
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
} as const;

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',    // 2px - Slightly rounded
  DEFAULT: '0.25rem', // 4px - Default
  md: '0.375rem',    // 6px
  lg: '0.5rem',      // 8px
  xl: '0.75rem',     // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  full: '9999px',    // Fully rounded (pills/circles)
} as const;

// Box Shadows
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  // Luxury specific shadows
  luxury: '0 25px 50px -12px rgb(0 0 0 / 0.5)',
  gold: `0 4px 20px 0 ${colors.gold[500]}40`,
} as const;

// Z-Index Scale
export const zIndex = {
  0: 0,
  10: 10,
  20: 20,
  30: 30,
  40: 40,
  50: 50,
  auto: 'auto',
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// Animation Durations
export const animationDurations = {
  instant: '0ms',
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  slower: '750ms',
  slowest: '1000ms',
} as const;

// Transition Presets
export const transitionPresets = {
  none: 'none',
  all: `all ${animationDurations.normal} ease-in-out`,
  colors: `color, background-color, border-color, text-decoration-color, fill, stroke ${animationDurations.normal} ease-in-out`,
  opacity: `opacity ${animationDurations.normal} ease-in-out`,
  shadow: `box-shadow, text-shadow ${animationDurations.normal} ease-in-out`,
  transform: `transform ${animationDurations.normal} ease-in-out`,
  // Luxury smooth transitions
  smooth: `all ${animationDurations.slow} cubic-bezier(0.4, 0, 0.2, 1)`,
  bounce: `all ${animationDurations.slow} cubic-bezier(0.68, -0.55, 0.265, 1.55)`,
} as const;

// Animation Timing Functions (Easing)
export const timingFunctions = {
  linear: 'linear',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  // Luxury easing
  smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Container Max Widths
export const containerMaxWidths = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  '3xl': '1792px',
  full: '100%',
} as const;

// Full Theme Export
export const theme = {
  spacing,
  borderRadius,
  shadows,
  zIndex,
  animationDurations,
  transitionPresets,
  timingFunctions,
  breakpoints,
  containerMaxWidths,
  colors,
  typography,
} as const;

export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;
export type Theme = typeof theme;
