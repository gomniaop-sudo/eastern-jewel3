/**
 * Content Management Index
 * Centralized exports for all static content
 */

// Hero Content
export { heroContent, heroBadge, heroBackground, heroScrollIndicator } from './hero';

// About Content
export {
  aboutContent,
  aboutValues,
  aboutTeam,
  aboutStats,
  aboutImage,
  teamSectionHeading,
  valuesSectionHeading,
} from './about';
export type { ValueItem, TeamMember, StatItem } from './about';

// Gallery Content
export {
  galleryContent,
  galleryCategories,
  galleryItems,
  galleryConfig,
} from './gallery';
export type { GalleryItem, GalleryContent } from './gallery';

// Journal Content
export {
  journalContent,
  journalEntries,
  journalConfig,
} from './journal';
export type { JournalEntry, JournalContent } from './journal';

// Premium Content
export {
  premiumContent,
  premiumFeatures,
  premiumTiers,
  premiumSectionImage,
  popularBadge,
  whatsIncludedHeading,
} from './premium';
export type { PremiumFeature, PremiumTier, PremiumContent } from './premium';

// Contact Content
export {
  contactContent,
  contactInfo,
  contactFormFields,
  contactSuccessMessage,
  businessInfo,
  contactPageDescription,
} from './contact';
export type { ContactInfoItem, ContactContent } from './contact';
