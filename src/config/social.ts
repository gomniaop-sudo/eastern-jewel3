/**
 * Social Media Configuration
 * Centralized social links and external URLs
 */

export const socialConfig = {
  // Social media links
  links: [
    {
      id: 'instagram',
      name: 'Instagram',
      href: 'https://instagram.com',
      icon: 'instagram',
    },
    {
      id: 'twitter',
      name: 'Twitter',
      href: 'https://twitter.com',
      icon: 'twitter',
    },
    {
      id: 'email',
      name: 'Email',
      href: 'mailto:contact@easternjewel.com',
      icon: 'mail',
    },
  ],

  // External URLs
  external: {
    instagram: 'https://instagram.com',
    twitter: 'https://twitter.com',
  },
} as const;

export type SocialConfig = typeof socialConfig;
