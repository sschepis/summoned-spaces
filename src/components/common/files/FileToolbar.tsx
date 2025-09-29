import { Search, Grid3x3 as Grid3X3, List, Filter } from 'lucide-react';
import { SearchInput } from '../../ui/SearchInput';
import { Select } from '../../ui/forms/Select';

export type ViewMode = 'grid' | 'list';
export type SortOption = 'name' | 'size' | 'date' | 'resonance';

interface FileToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  filterVolume?: string;
  onFilterVolumeChange?: (volumeId: string) => void;
  volumes?: Array<{ id: string; name: string }>;
  selectedCount?: number;
  onBulkAction?: (action: string) => void;
  searchPlaceholder?: string;
  className?: string;
}

export function FileToolbar({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  filterVolume,
  onFilterVolumeChange,
  volumes = [],
  selectedCount = 0,
  onBulkAction,
  searchPlaceholder = 'Search files, tags, or contributors...',
  className = ''
}: FileToolbarProps) {
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'size', label: 'Size' },
    { value: 'date', label: 'Date' },
    { value: 'resonance', label: 'Resonance' }
  ];

  return (
    <div className={`flex items-center justify-between flex-wrap gap-4 ${className}`}>
      {/* Search and Filters */}
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <div className="relative flex-1 max-w-md">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          {volumes.length > 0 && onFilterVolumeChange && (
            <Select
              value={filterVolume || 'all'}
              onChange={(e) => onFilterVolumeChange(e.target.value)}
              options={volumes.map(v => ({ value: v.id, label: v.name }))}
              className="min-w-[150px]"
            />
          )}
          
          <Select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            options={sortOptions}
            className="min-w-[130px]"
          />
        </div>
      </div>
      
      {/* View Controls and Actions */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onViewModeChange(viewMode === 'grid' ? 'list' : 'grid')}
          className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
          title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
        >
          {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
        </button>
        
        {selectedCount > 0 && onBulkAction && (
          <div className="flex items-center space-x-2 px-3 py-2 bg-cyan-500/20 text-cyan-300 
                       rounded-lg border border-cyan-500/30">
            <span className="text-sm font-medium">{selectedCount} selected</span>
            <button
              onClick={() => onBulkAction('summon')}
              className="text-xs text-cyan-200 hover:text-white transition-colors font-medium"
            >
              Summon All
            </button>
          </div>
        )}
      </div>
    </div>
  );
}