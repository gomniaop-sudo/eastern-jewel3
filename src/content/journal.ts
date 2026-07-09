/**
 * Journal Section Content
 * Static content for the journal section and page
 */

// Journal Entry Interface
export interface JournalEntry {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  slug: string;
  category: string;
}

// Journal Entries
export const journalEntries: JournalEntry[] = [
  {
    id: '1',
    title: 'The Art of Capturing Light',
    excerpt: 'Understanding how natural light transforms ordinary moments into extraordinary memories. Learn the techniques behind our most captivating portraits.',
    date: '2026-06-28',
    image: 'https://images.pexels.com/photos/1557898/pexels-photo-1557898.jpeg?auto=compress&cs=tinysrgb&w=800',
    slug: 'art-of-capturing-light',
    category: 'Photography',
  },
  {
    id: '2',
    title: 'Behind the Lens: Eastern Inspirations',
    excerpt: 'How Eastern aesthetics and philosophies influence our creative direction. A deep dive into the artistic vision that defines Eastern Jewel.',
    date: '2026-06-15',
    image: 'https://images.pexels.com/photos/1537635/pexels-photo-1537635.jpeg?auto=compress&cs=tinysrgb&w=800',
    slug: 'eastern-inspirations',
    category: 'Art Direction',
  },
  {
    id: '3',
    title: 'The Evolution of Elegance',
    excerpt: 'Tracing the journey from concept to creation. Exploring how timeless beauty is crafted through careful attention to detail.',
    date: '2026-05-30',
    image: 'https://images.pexels.com/photos/1642225/pexels-photo-1642225.jpeg?auto=compress&cs=tinysrgb&w=800',
    slug: 'evolution-of-elegance',
    category: 'Editorial',
  },
  {
    id: '4',
    title: 'Golden Hour: Natures Perfect Filter',
    excerpt: 'Mastering the magical moments when sunlight creates its most flattering effects. Tips and techniques for perfect golden hour photography.',
    date: '2026-05-18',
    image: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=800',
    slug: 'golden-hour-photography',
    category: 'Photography',
  },
  {
    id: '5',
    title: 'The Philosophy of Minimalism',
    excerpt: 'Less is more: embracing simplicity to create more impactful visual narratives. How restraint creates sophistication.',
    date: '2026-04-22',
    image: 'https://images.pexels.com/photos/1028157/pexels-photo-1028157.jpeg?auto=compress&cs=tinysrgb&w=800',
    slug: 'philosophy-of-minimalism',
    category: 'Art Direction',
  },
  {
    id: '6',
    title: 'Seasonal Stories: Summer Collection',
    excerpt: 'Exploring the warmth and vibrancy of summer through our latest curated collection. Celebrating the season in style.',
    date: '2026-04-05',
    image: 'https://images.pexels.com/photos/1629785/pexels-photo-1629785.jpeg?auto=compress&cs=tinysrgb&w=800',
    slug: 'summer-collection',
    category: 'Editorial',
  },
];

// Journal Section Display Limit
export const journalConfig = {
  sectionDisplayLimit: 3,
  pageDisplayLimit: 6,
} as const;

// Full Journal Content Export
export const journalContent = {
  entries: journalEntries,
  config: journalConfig,
} as const;

export type JournalContent = typeof journalContent;
