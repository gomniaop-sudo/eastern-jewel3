/**
 * Smart Search Input with Suggestions and Keyboard Navigation
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock, TrendingUp, Image as ImageIcon, FileText, Loader as Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { searchService, type Suggestion } from '../../services/search.service';

interface SearchInputProps {
  placeholder?: string;
  autoFocus?: boolean;
  onSearch?: (query: string) => void;
  className?: string;
}

const DEBOUNCE_MS = 300;

const typeIcons = {
  recent: Clock,
  popular: TrendingUp,
  gallery: ImageIcon,
  journal: FileText,
};

export function SearchInput({
  placeholder = 'Search...',
  autoFocus = false,
  onSearch,
  className = '',
}: SearchInputProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedFetchSuggestions = useCallback((searchQuery: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchService.getSuggestions(searchQuery);
        setSuggestions(results);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    if (query.trim().length > 0) {
      setIsOpen(true);
      debouncedFetchSuggestions(query);
    } else if (query.length === 0) {
      setIsOpen(true);
      debouncedFetchSuggestions('');
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, debouncedFetchSuggestions]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex]);
        } else if (query.trim()) {
          handleSearchSubmit();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleSearchSubmit = () => {
    if (query.trim()) {
      searchService.saveRecentSearch(query.trim());
      setIsOpen(false);
      if (onSearch) {
        onSearch(query.trim());
      }
    }
  };

  const handleSelect = (suggestion: Suggestion) => {
    if (suggestion.type === 'gallery' || suggestion.type === 'journal') {
      searchService.saveRecentSearch(suggestion.text);
      setIsOpen(false);
      navigate(suggestion.url || '/');
    } else {
      setQuery(suggestion.text);
      searchService.saveRecentSearch(suggestion.text);
      if (onSearch) {
        onSearch(suggestion.text);
      }
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    if (!isOpen) {
      setIsOpen(true);
      debouncedFetchSuggestions(query);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          autoFocus={autoFocus}
          placeholder={placeholder}
          aria-label="Search"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-expanded={isOpen}
          aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
          className="w-full pl-10 pr-10 py-3 bg-luxury-light/10 border border-luxury-light/20 rounded-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-transparent"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {loading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-luxury-light/20 rounded-sm text-gray-400 hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.ul
            id="search-suggestions"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-luxury-black border border-luxury-light/20 rounded-sm overflow-hidden shadow-xl z-50"
            role="listbox"
          >
            {suggestions.map((suggestion, index) => {
              const Icon = typeIcons[suggestion.type];
              const isSelected = index === selectedIndex;

              return (
                <li
                  key={`${suggestion.type}-${index}`}
                  id={`suggestion-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(suggestion)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-gold-500/10 text-gold-400' : 'hover:bg-luxury-light/10'
                  }`}
                >
                  <div className={`shrink-0 ${isSelected ? 'text-gold-400' : 'text-gray-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {suggestion.image && (
                    <div className="w-10 h-10 rounded-sm overflow-hidden shrink-0">
                      <img src={suggestion.image} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className={`text-sm truncate ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                      {suggestion.text}
                    </div>
                    {suggestion.description && (
                      <div className="text-xs text-gray-500 truncate">{suggestion.description}</div>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 capitalize shrink-0">
                    {suggestion.type}
                  </div>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SearchInput;
