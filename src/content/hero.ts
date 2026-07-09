/**
 * Hero Section Content
 * Static content for the hero section
 */

// Hero Badge Content
export const heroBadge = {
  icon: 'Sparkles',
  text: 'Exclusive Collection',
} as const;

// Hero Background Image
export const heroBackground = {
  image: 'https://images.pexels.com/photos/1537635/pexels-photo-1537635.jpeg?auto=compress&cs=tinysrgb&w=1920',
  overlay: true,
} as const;

// Hero Animation Scroll Indicator
export const heroScrollIndicator = {
  icon: 'ChevronDown',
  animationDuration: 2, // seconds
} as const;

// Full Hero Content Export
export const heroContent = {
  badge: heroBadge,
  background: heroBackground,
  scrollIndicator: heroScrollIndicator,
} as const;

export type HeroContent = typeof heroContent;
