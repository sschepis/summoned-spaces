import { Grid, List, ArrowDownUp, Search } from 'lucide-react';

interface SortOption {
    by: string;
    order: 'asc' | 'desc';
}

export function FileToolbar({ viewMode, onViewModeChange, sort, onSortChange, fileCount }: { viewMode: 'grid' | 'list', onViewModeChange: (mode: 'grid' | 'list') => void, sort: SortOption, onSortChange: (sort: SortOption) => void, fileCount: number }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <button onClick={() => onViewModeChange('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white/20' : 'hover:bg-white/10'}`}>
                    <Grid className="w-5 h-5 text-white" />
                </button>
                <button onClick={() => onViewModeChange('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white/20' : 'hover:bg-white/10'}`}>
                    <List className="w-5 h-5 text-white" />
                </button>
                <div className="text-sm text-gray-400 pl-2">{fileCount} items</div>
            </div>
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Search files..." className="bg-transparent text-white focus:outline-none" />
                </div>
                <button onClick={() => onSortChange({ by: 'created_at', order: sort.order === 'asc' ? 'desc' : 'asc' })} className="flex items-center space-x-2 text-gray-300 hover:text-white">
                    <ArrowDownUp className="w-4 h-4" />
                    <span className="text-sm">Sort by Date</span>
                </button>
            </div>
        </div>
    );
}