import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  onClear?: () => void;
  autoFocus?: boolean;
  className?: string;
}

export function SearchInput({ 
  value, 
  onChange, 
  placeholder = 'Search...', 
  size = 'md',
  onClear,
  autoFocus = false,
  className = '' 
}: SearchInputProps) {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleClear = () => {
    onChange('');
    onClear?.();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className={`${iconSizeClasses[size]} text-gray-400`} />
      </div>
      
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`
          w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg 
          text-white placeholder-gray-400 focus:outline-none focus:ring-2 
          focus:ring-cyan-500 focus:border-transparent transition-colors
          pl-10 ${sizeClasses[size]}
          ${value ? 'pr-10' : 'pr-4'}
        `}
      />
      
      {value && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 
                   hover:text-white transition-colors"
        >
          <X className={iconSizeClasses[size]} />
        </button>
      )}
    </div>
  );
}