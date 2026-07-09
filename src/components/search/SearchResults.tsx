/**
 * Search Results Component with Filters and Sorting
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lock, Image as ImageIcon, FileText, AlertCircle, RefreshCw, SortAsc } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { searchService, type SearchResult } from '../../services/search.service';
import { siteConfig } from '../../config';

interface SearchFilters {
  category?: string;
  isPremium?: boolean;
  isPublished?: boolean;
}

interface SearchResultsProps {
  query: string;
  type?: 'gallery' | 'journal' | 'all';
  categories?: string[];
  onClear?: () => void;
}

type SortOption = 'relevance' | 'newest' | 'oldest' | 'alphabetical';

function HighlightedText({ text, query }: { text: string; query: string }) {
  const highlighted = useMemo(() => {
    return searchService.highlightMatch(text, query);
  }, [text, query]);

  return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
}

function SearchSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-video bg-luxury-light/20 rounded-sm mb-3" />
          <div className="h-4 bg-luxury-light/20 rounded w-3/4 mb-2" />
          <div className="h-3 bg-luxury-light/20 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ query, onClear }: { query: string; onClear?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-16 h-16 bg-luxury-light/10 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8 text-gray-500" />
      </div>
      <h3 className="text-xl font-display text-white mb-2">No results found</h3>
      <p className="text-gray-400 mb-6 max-w-md">
        {query
          ? `We couldn't find any matches for "${query}". Try different keywords or check your spelling.`
          : 'Start typing to search through our gallery and journal.'}
      </p>
      <div className="flex gap-3">
        {onClear && (
          <button
            onClick={onClear}
            className="px-4 py-2 bg-luxury-light/10 hover:bg-luxury-light/20 border border-luxury-light/20 text-gray-300 hover:text-white text-sm rounded-sm transition-colors"
          >
            Clear search
          </button>
        )}
        <Link
          to={siteConfig.url}
          className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-luxury-black text-sm font-medium rounded-sm transition-colors"
        >
          Browse all content
        </Link>
      </div>
    </motion.div>
  );
}

function ErrorState({ onRetry, error }: { onRetry: () => void; error: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <h3 className="text-xl font-display text-white mb-2">Search failed</h3>
      <p className="text-gray-400 mb-6">{error}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-luxury-light/10 hover:bg-luxury-light/20 border border-luxury-light/20 text-gray-300 hover:text-white text-sm rounded-sm flex items-center gap-2 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Try again
      </button>
    </motion.div>
  );
}

export function SearchResults({ query, type = 'all', onClear }: SearchResultsProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters] = useState<SearchFilters>({});
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [activeType, setActiveType] = useState<'all' | 'gallery' | 'journal'>(type);

  useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const searchFilters: SearchFilters = {};
        if (filters.category && filters.category !== 'all') {
          searchFilters.category = filters.category;
        }
        if (filters.isPremium !== undefined) {
          searchFilters.isPremium = filters.isPremium;
        }

        let searchResults: SearchResult[];

        if (activeType === 'gallery') {
          searchResults = await searchService.searchGallery(query, searchFilters);
        } else if (activeType === 'journal') {
          searchResults = await searchService.searchJournal(query, searchFilters);
        } else {
          searchResults = await searchService.search({
            query,
            filters: searchFilters,
            sortBy,
          });
        }

        searchService.saveRecentSearch(query);

        setResults(searchResults);
      } catch (err) {
        console.error('Search error:', err);
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [query, filters, sortBy, activeType]);

  const filteredResults = useMemo(() => {
    let filtered = [...results];

    filtered.sort((a, b) => b.score - a.score);

    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => {
          const dateA = new Date(a.publishedAt || a.createdAt).getTime();
          const dateB = new Date(b.publishedAt || b.createdAt).getTime();
          return dateB - dateA;
        });
        break;
      case 'oldest':
        filtered.sort((a, b) => {
          const dateA = new Date(a.publishedAt || a.createdAt).getTime();
          const dateB = new Date(b.publishedAt || b.createdAt).getTime();
          return dateA - dateB;
        });
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return filtered;
  }, [results, sortBy]);

  const galleryCount = results.filter((r) => r.type === 'gallery').length;
  const journalCount = results.filter((r) => r.type === 'journal').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4 mb-6">
          <div className="h-8 bg-luxury-light/20 rounded w-32 animate-pulse" />
        </div>
        <SearchSkeleton />
      </div>
    );
  }

  if (error) {
    return <ErrorState onRetry={() => window.location.reload()} error={error} />;
  }

  if (!query.trim()) {
    return <EmptyState query="" onClear={onClear} />;
  }

  if (filteredResults.length === 0) {
    return <EmptyState query={query} onClear={onClear} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveType('all')}
            className={`px-4 py-2 text-sm font-medium rounded-sm transition-colors ${
              activeType === 'all'
                ? 'bg-gold-500 text-luxury-black'
                : 'bg-luxury-light/10 text-gray-400 hover:text-white'
            }`}
          >
            All ({results.length})
          </button>
          <button
            onClick={() => setActiveType('gallery')}
            className={`px-4 py-2 text-sm font-medium rounded-sm transition-colors flex items-center gap-2 ${
              activeType === 'gallery'
                ? 'bg-gold-500 text-luxury-black'
                : 'bg-luxury-light/10 text-gray-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Gallery ({galleryCount})
          </button>
          <button
            onClick={() => setActiveType('journal')}
            className={`px-4 py-2 text-sm font-medium rounded-sm transition-colors flex items-center gap-2 ${
              activeType === 'journal'
                ? 'bg-gold-500 text-luxury-black'
                : 'bg-luxury-light/10 text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            Journal ({journalCount})
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <SortAsc className="w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-luxury-light/10 border border-luxury-light/20 rounded-sm text-sm text-white py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-gold-500"
              aria-label="Sort by"
            >
              <option value="relevance">Relevance</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredResults.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: index * 0.02 }}
            >
              <Link
                to={item.url}
                className="group block bg-luxury-light/5 border border-luxury-light/10 rounded-sm overflow-hidden hover:border-gold-500/30 transition-colors"
              >
                <div className="relative aspect-video overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-luxury-light/10 flex items-center justify-center">
                      {item.type === 'gallery' ? (
                        <ImageIcon className="w-12 h-12 text-gray-500" />
                      ) : (
                        <FileText className="w-12 h-12 text-gray-500" />
                      )}
                    </div>
                  )}

                  <div className="absolute top-3 left-3 flex gap-2">
                    <div className="bg-luxury-black/80 backdrop-blur-sm px-2 py-1 rounded-sm text-xs text-gray-300 capitalize">
                      {item.type}
                    </div>
                    {item.isPremium && (
                      <div className="bg-gold-500/90 px-2 py-1 rounded-sm text-xs text-luxury-black flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Premium
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-white font-display mb-2 group-hover:text-gold-400 transition-colors line-clamp-1">
                    <HighlightedText text={isRTL && item.titleAr ? item.titleAr : item.title} query={query} />
                  </h3>

                  <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                    <HighlightedText
                      text={isRTL && item.descriptionAr ? item.descriptionAr : item.description}
                      query={query}
                    />
                  </p>

                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {item.category && (
                      <span className="bg-luxury-light/10 px-2 py-0.5 rounded-sm">
                        {item.category}
                      </span>
                    )}
                    <span>
                      {new Date(item.publishedAt || item.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default SearchResults;
