/**
 * Content Re-exports
 * Maintains backward compatibility by re-exporting from centralized content
 */

// Re-export from centralized content
export {
  galleryItems,
  galleryCategories,
  galleryContent,
} from '../content';

export {
  journalEntries,
  journalContent,
} from '../content';

export {
  aboutStats as stats,
  aboutStats,
  aboutValues,
  aboutTeam,
  aboutContent,
} from '../content';

export {
  premiumFeatures,
  premiumTiers,
  premiumContent,
} from '../content';

export type {
  GalleryItem,
  JournalEntry,
  StatItem,
  ValueItem,
  TeamMember,
  PremiumFeature,
  PremiumTier,
} from '../content';
