import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

interface SearchBoxProps {
  value?: string;
  placeholder?: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  loading?: boolean;
  debounceMs?: number;
  autoFocus?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'minimal';
  showClearButton?: boolean;
  className?: string;
}

export function SearchBox({
  value = '',
  placeholder = 'Search...',
  onSearch,
  onClear,
  loading = false,
  debounceMs = 300,
  autoFocus = false,
  size = 'md',
  variant = 'default',
  showClearButton = true,
  className = ''
}: SearchBoxProps) {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, debounceMs);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (debouncedValue !== value) {
      onSearch(debouncedValue);
    }
  }, [debouncedValue, onSearch, value]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleClear = () => {
    setLocalValue('');
    onSearch('');
    onClear?.();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  const sizeClasses = {
    sm: 'h-8 text-sm px-3',
    md: 'h-10 text-sm px-4',
    lg: 'h-12 text-base px-5'
  };

  const variantClasses = {
    default: 'bg-white/5 border border-white/10 focus:ring-2 focus:ring-cyan-500',
    filled: 'bg-white/10 border-0 focus:ring-2 focus:ring-cyan-500',
    minimal: 'bg-transparent border-0 border-b-2 border-white/10 focus:border-cyan-500 rounded-none'
  };

  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${iconSize}`} />
        
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`
            w-full pl-10 pr-10 rounded-lg text-white placeholder-gray-400
            focus:outline-none transition-all duration-200
            ${sizeClasses[size]}
            ${variantClasses[variant]}
          `}
          aria-label="Search"
        />

        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {loading && (
            <Loader2 className={`animate-spin text-gray-400 ${iconSize}`} />
          )}
          
          {showClearButton && localValue && !loading && (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <X className={iconSize} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Search with suggestions
interface SearchSuggestion {
  id: string;
  label: string;
  category?: string;
  meta?: string;
}

interface SearchWithSuggestionsProps extends Omit<SearchBoxProps, 'onSearch'> {
  suggestions: SearchSuggestion[];
  onSearch: (query: string) => void;
  onSelectSuggestion: (suggestion: SearchSuggestion) => void;
  maxSuggestions?: number;
  showSuggestions?: boolean;
}

export function SearchWithSuggestions({
  suggestions,
  onSelectSuggestion,
  maxSuggestions = 5,
  showSuggestions = true,
  ...searchProps
}: SearchWithSuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = suggestions
    .filter(s => s.label.toLowerCase().includes(searchProps.value?.toLowerCase() || ''))
    .slice(0, maxSuggestions);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          onSelectSuggestion(filteredSuggestions[selectedIndex]);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
      <SearchBox
        {...searchProps}
        onSearch={(query) => {
          searchProps.onSearch(query);
          setIsOpen(query.length > 0 && showSuggestions);
          setSelectedIndex(-1);
        }}
      />

      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-white/10 rounded-lg shadow-2xl z-50 max-h-64 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              onClick={() => {
                onSelectSuggestion(suggestion);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0 ${
                index === selectedIndex ? 'bg-cyan-500/20' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">{suggestion.label}</div>
                  {suggestion.category && (
                    <div className="text-xs text-gray-400">{suggestion.category}</div>
                  )}
                </div>
                {suggestion.meta && (
                  <div className="text-xs text-gray-500">{suggestion.meta}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}