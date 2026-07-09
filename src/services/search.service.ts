/**
 * Advanced Search Service
 * Unified search across Gallery and Journal with Arabic/English support
 * Includes caching and memoization for performance
 */

import { galleryService } from './gallery.service';
import { journalService } from './journal.service';
import { logger } from '../utils/logger';

const RECENT_SEARCHES_KEY = 'easternjewel_recent_searches';
const MAX_RECENT_SEARCHES = 10;
const MAX_SUGGESTIONS = 8;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Simple in-memory cache
const searchCache = new Map<string, { results: SearchResult[]; timestamp: number }>();

function getCached(key: string): SearchResult[] | null {
  const cached = searchCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.results;
  }
  searchCache.delete(key);
  return null;
}

function setCache(key: string, results: SearchResult[]): void {
  if (searchCache.size > 50) {
    const oldestKey = searchCache.keys().next().value;
    if (oldestKey) searchCache.delete(oldestKey);
  }
  searchCache.set(key, { results, timestamp: Date.now() });
}

// Memoization for normalize text
const normalizeCache = new Map<string, string>();
function memoizedNormalizeText(text: string): string {
  const cached = normalizeCache.get(text);
  if (cached) return cached;
  const normalized = normalizeArabic(text)
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (normalizeCache.size > 100) {
    normalizeCache.clear();
  }
  normalizeCache.set(text, normalized);
  return normalized;
}

export interface SearchResult {
  id: string;
  type: 'gallery' | 'journal';
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  image: string;
  url: string;
  category?: string;
  tags?: string[];
  isPremium?: boolean;
  isFeatured?: boolean;
  publishedAt?: string;
  createdAt: string;
  score: number;
  matchedFields: string[];
}

export interface SearchFilters {
  category?: string;
  isPremium?: boolean;
  isFeatured?: boolean;
  isPublished?: boolean;
}

export interface SearchOptions {
  query: string;
  filters?: SearchFilters;
  sortBy?: 'relevance' | 'newest' | 'oldest' | 'alphabetical';
  limit?: number;
}

export interface Suggestion {
  type: 'recent' | 'popular' | 'gallery' | 'journal';
  text: string;
  url?: string;
  image?: string;
  description?: string;
}

const POPULAR_SEARCHES = [
  'photography',
  'portrait',
  'artistic',
  'elegance',
  'premium',
  'editorial',
];

function normalizeArabic(text: string): string {
  return text
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ى]/g, 'ي')
    .replace(/[ة]/g, 'ه')
    .replace(/[ؤئ]/g, 'ء');
}

const normalizeText = memoizedNormalizeText;

function calculateScore(
  item: { title: string; titleAr?: string; description?: string; isFeatured?: boolean; createdAt: string },
  query: string,
  matchedFields: string[]
): number {
  const normalizedQuery = normalizeText(query);
  const normalizedTitle = normalizeText(item.title);
  const normalizedTitleAr = item.titleAr ? normalizeText(item.titleAr) : '';
  let score = 0;

  if (normalizedTitle === normalizedQuery || normalizedTitleAr === normalizedQuery) {
    score += 100;
  } else if (normalizedTitle.startsWith(normalizedQuery) || normalizedTitleAr.startsWith(normalizedQuery)) {
    score += 80;
  } else if (normalizedTitle.includes(normalizedQuery) || normalizedTitleAr.includes(normalizedQuery)) {
    score += 50;
  }

  if (matchedFields.length > 1) {
    score += 20;
  }

  if (item.isFeatured) {
    score += 15;
  }

  const daysSinceCreation = (Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreation < 30) {
    score += 10;
  } else if (daysSinceCreation < 90) {
    score += 5;
  }

  return score;
}

function matchAndScore(
  item: {
    title: string;
    titleAr?: string;
    description?: string;
    descriptionAr?: string;
    category?: string;
    tags?: string[];
    excerpt?: string;
    content?: string;
    slug?: string;
    isFeatured?: boolean;
    isPremium?: boolean;
    createdAt: string;
    publishedAt?: string;
  },
  query: string
): { matches: boolean; score: number; matchedFields: string[] } {
  const normalizedQuery = normalizeText(query);
  const matchedFields: string[] = [];

  if (normalizeText(item.title).includes(normalizedQuery) || (item.titleAr && normalizeText(item.titleAr).includes(normalizedQuery))) {
    matchedFields.push('title');
  }
  if (item.description && normalizeText(item.description).includes(normalizedQuery)) {
    matchedFields.push('description');
  }
  if (item.descriptionAr && normalizeText(item.descriptionAr).includes(normalizedQuery)) {
    matchedFields.push('description');
  }
  if (item.category && normalizeText(item.category).includes(normalizedQuery)) {
    matchedFields.push('category');
  }
  if (item.tags && item.tags.some((tag) => normalizeText(tag).includes(normalizedQuery))) {
    matchedFields.push('tags');
  }
  if (item.excerpt && normalizeText(item.excerpt).includes(normalizedQuery)) {
    matchedFields.push('excerpt');
  }
  if (item.content && normalizeText(item.content).includes(normalizedQuery)) {
    matchedFields.push('content');
  }
  if (item.slug && normalizeText(item.slug).includes(normalizedQuery)) {
    matchedFields.push('slug');
  }

  if (matchedFields.length === 0) {
    return { matches: false, score: 0, matchedFields: [] };
  }

  const score = calculateScore(
    {
      title: item.title,
      titleAr: item.titleAr,
      description: item.description,
      isFeatured: item.isFeatured,
      createdAt: item.createdAt,
    },
    query,
    matchedFields
  );

  return { matches: true, score, matchedFields };
}

export const searchService = {
  async searchGallery(query: string, filters?: SearchFilters): Promise<SearchResult[]> {
    const cacheKey = `gallery:${query}:${JSON.stringify(filters || {})}`;
    const cached = getCached(cacheKey);
    if (cached) {
      logger.debug('searchService: Cache hit for gallery search', { query });
      return cached;
    }

    try {
      const items = await galleryService.getAll({ isActive: true, ...filters });
      const results: SearchResult[] = [];

    for (const item of items) {
      const category = item.categories?.label_en || item.categories?.slug || '';
      const { matches, score, matchedFields } = matchAndScore(
        {
          title: item.title,
          description: item.description || undefined,
          category,
          tags: [],
          isFeatured: item.is_featured,
          isPremium: item.is_premium,
          createdAt: item.created_at,
        },
        query
      );

      if (matches) {
        const metadata = item.metadata as Record<string, string> | null;
        results.push({
          id: item.id,
          type: 'gallery',
          title: item.title,
          titleAr: metadata?.title_ar || undefined,
          description: item.description || '',
          descriptionAr: metadata?.description_ar || undefined,
          image: item.image_url,
          url: `/gallery/${item.slug || item.id}`,
          category,
          isPremium: item.is_premium,
          isFeatured: item.is_featured,
          createdAt: item.created_at,
          score,
          matchedFields,
        });
      }
    }

    const sorted = results.sort((a, b) => b.score - a.score);
    setCache(cacheKey, sorted);
    return sorted;
    } catch (error) {
      logger.error('searchService: Gallery search failed', { error: String(error) });
      return [];
    }
  },

  async searchJournal(query: string, filters?: SearchFilters): Promise<SearchResult[]> {
    const cacheKey = `journal:${query}:${JSON.stringify(filters || {})}`;
    const cached = getCached(cacheKey);
    if (cached) {
      logger.debug('searchService: Cache hit for journal search', { query });
      return cached;
    }

    try {
      const items = await journalService.getAll({ isPublished: true, ...filters });
      const results: SearchResult[] = [];

    for (const item of items) {
      const { matches, score, matchedFields } = matchAndScore(
        {
          title: item.title,
          description: item.excerpt || undefined,
          category: item.category || undefined,
          tags: item.tags || [],
          excerpt: item.excerpt || undefined,
          content: item.content || undefined,
          slug: item.slug,
          isFeatured: item.is_featured,
          createdAt: item.created_at,
          publishedAt: item.published_at || undefined,
        },
        query
      );

      if (matches) {
        const metadata = item.metadata as Record<string, string> | null;
        results.push({
          id: item.id,
          type: 'journal',
          title: item.title,
          titleAr: metadata?.title_ar || undefined,
          description: item.excerpt || '',
          descriptionAr: metadata?.excerpt_ar || undefined,
          image: item.image_url || '',
          url: `/journal/${item.slug}`,
          category: item.category || undefined,
          tags: item.tags || [],
          isFeatured: item.is_featured,
          createdAt: item.created_at,
          publishedAt: item.published_at || undefined,
          score,
          matchedFields,
        });
      }
    }

    const sorted = results.sort((a, b) => b.score - a.score);
    setCache(cacheKey, sorted);
    return sorted;
    } catch (error) {
      logger.error('searchService: Journal search failed', { error: String(error) });
      return [];
    }
  },

  async search(options: SearchOptions): Promise<SearchResult[]> {
    const { query, filters, sortBy = 'relevance', limit } = options;

    if (!query.trim()) {
      return [];
    }

    const [galleryResults, journalResults] = await Promise.all([
      this.searchGallery(query, filters),
      this.searchJournal(query, filters),
    ]);

    let results = [...galleryResults, ...journalResults];

    switch (sortBy) {
      case 'newest':
        results.sort((a, b) => {
          const dateA = new Date(a.publishedAt || a.createdAt).getTime();
          const dateB = new Date(b.publishedAt || b.createdAt).getTime();
          return dateB - dateA;
        });
        break;
      case 'oldest':
        results.sort((a, b) => {
          const dateA = new Date(a.publishedAt || a.createdAt).getTime();
          const dateB = new Date(b.publishedAt || b.createdAt).getTime();
          return dateA - dateB;
        });
        break;
      case 'alphabetical':
        results.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'relevance':
      default:
        results.sort((a, b) => b.score - a.score);
    }

    if (limit) {
      results = results.slice(0, limit);
    }

    return results;
  },

  async getSuggestions(query: string): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];

    if (query.trim()) {
      const recent = this.getRecentSearches();
      const matchingRecent = recent
        .filter((s) => normalizeText(s).includes(normalizeText(query)))
        .slice(0, 2);
      for (const term of matchingRecent) {
        suggestions.push({ type: 'recent', text: term });
      }

      try {
        const [galleryResults, journalResults] = await Promise.all([
          this.searchGallery(query, undefined),
          this.searchJournal(query, undefined),
        ]);

        const topGallery = galleryResults.slice(0, 3);
        for (const item of topGallery) {
          suggestions.push({
            type: 'gallery',
            text: item.title,
            url: item.url,
            image: item.image,
            description: item.description.slice(0, 50) + '...',
          });
        }

        const topJournal = journalResults.slice(0, 3);
        for (const item of topJournal) {
          suggestions.push({
            type: 'journal',
            text: item.title,
            url: item.url,
            image: item.image,
            description: item.description.slice(0, 50) + '...',
          });
        }
      } catch (err) {
        console.error('Error getting suggestions:', err);
      }
    } else {
      const recent = this.getRecentSearches().slice(0, 3);
      for (const term of recent) {
        suggestions.push({ type: 'recent', text: term });
      }

      for (const term of POPULAR_SEARCHES.slice(0, 3)) {
        suggestions.push({ type: 'popular', text: term });
      }
    }

    return suggestions.slice(0, MAX_SUGGESTIONS);
  },

  getRecentSearches(): string[] {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        return JSON.parse(stored) as string[];
      }
    } catch {
      // Ignore errors
    }
    return [];
  },

  saveRecentSearch(query: string): void {
    if (!query.trim()) return;

    try {
      let recent = this.getRecentSearches();
      recent = recent.filter((s) => s.toLowerCase() !== query.toLowerCase());
      recent.unshift(query);
      recent = recent.slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
    } catch {
      // Ignore errors
    }
  },

  clearRecentSearches(): void {
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Ignore errors
    }
  },

  clearCache(): void {
    searchCache.clear();
    normalizeCache.clear();
    logger.debug('searchService: Cache cleared');
  },

  highlightMatch(text: string, query: string): string {
    if (!query.trim()) return text;

    const normalizedText = normalizeText(text);
    const normalizedQuery = normalizeText(query);

    let result = text;
    const index = normalizedText.indexOf(normalizedQuery);

    if (index !== -1) {
      let charCount = 0;
      let startPos = -1;
      for (let i = 0; i < text.length; i++) {
        const normalizedChar = normalizeText(text[i]);
        if (charCount === index) {
          startPos = i;
          break;
        }
        if (normalizedChar) {
          charCount++;
        }
      }

      if (startPos >= 0) {
        const endPos = startPos + query.length;
        const before = text.slice(0, startPos);
        const match = text.slice(startPos, Math.min(endPos, text.length));
        const after = text.slice(Math.min(endPos, text.length));
        result = `${before}<mark class="bg-gold-500/30 text-inherit px-0.5 rounded">${match}</mark>${after}`;
      }
    }

    return result;
  },
};

export type { SearchResult as SearchResultType, Suggestion as SuggestionType };
