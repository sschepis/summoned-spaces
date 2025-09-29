import { useState } from 'react';
import { Download, Eye, Star, Trash2 } from 'lucide-react';
import { FileToolbar, FileGrid, FileContextMenu } from './common/files';
import type { FileItem, ViewMode, SortOption, ContextMenuItem } from './common/files';

interface FileExplorerProps {
  spaceId: string;
  onFileSelect: (file: FileItem) => void;
  onFileAction: (action: string, fileIds: string[]) => void;
}

// Mock data
const mockFiles: FileItem[] = [
  {
    id: '1',
    name: 'quantum_algorithms.pdf',
    type: 'pdf',
    size: '2.4 MB',
    sizeBytes: 2457600,
    contributor: 'Dr. Sarah Chen',
    contributorAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    uploadedAt: '2 days ago',
    resonanceStrength: 0.94,
    fingerprint: 'A7C4E9F2B8D1C5A3',
    tags: ['quantum', 'algorithms', 'research'],
    volumeName: 'Research Papers',
    isFavorite: true
  },
  {
    id: '2',
    name: 'entanglement_theory.docx',
    type: 'docx',
    size: '1.8 MB',
    sizeBytes: 1884160,
    contributor: 'Marcus Rodriguez',
    contributorAvatar: 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    uploadedAt: '1 week ago',
    resonanceStrength: 0.87,
    tags: ['quantum', 'entanglement', 'theory'],
    volumeName: 'Research Papers',
    isFavorite: false
  },
  {
    id: '3',
    name: 'design_system_v2.png',
    type: 'png',
    size: '3.1 MB',
    sizeBytes: 3248128,
    contributor: 'Elena Kowalski',
    contributorAvatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    uploadedAt: '5 days ago',
    resonanceStrength: 0.89,
    volumeName: 'Design Assets',
    isFavorite: true
  }
];

const volumes = [
  { id: 'all', name: 'All Files' },
  { id: '1', name: 'Research Papers' },
  { id: '2', name: 'Design Assets' },
  { id: '3', name: 'Documentation' }
];

export function FileExplorer({ spaceId, onFileSelect, onFileAction }: FileExplorerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [filterVolume, setFilterVolume] = useState<string>('all');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; fileId: string } | null>(null);

  // Filter and sort files
  const filteredFiles = mockFiles
    .filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (file.tags && file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
      const matchesVolume = filterVolume === 'all' || file.volumeName === volumes.find(v => v.id === filterVolume)?.name;
      return matchesSearch && matchesVolume;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'size':
          return b.sizeBytes - a.sizeBytes;
        case 'date':
          return 0; // Would need proper date comparison
        case 'resonance':
          return b.resonanceStrength - a.resonanceStrength;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const handleFileClick = (file: FileItem, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Multi-select
      const newSelected = new Set(selectedFiles);
      if (newSelected.has(file.id)) {
        newSelected.delete(file.id);
      } else {
        newSelected.add(file.id);
      }
      setSelectedFiles(newSelected);
    } else {
      // Single select and open
      setSelectedFiles(new Set([file.id]));
      onFileSelect(file);
    }
  };

  const handleContextMenu = (event: React.MouseEvent, fileId: string) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      fileId
    });
  };

  const contextMenuItems: ContextMenuItem[] = [
    {
      id: 'summon',
      label: 'Summon File',
      icon: Download,
      onClick: () => {
        if (contextMenu) {
          onFileAction('summon', [contextMenu.fileId]);
        }
      }
    },
    {
      id: 'details',
      label: 'View Details',
      icon: Eye,
      onClick: () => {
        if (contextMenu) {
          onFileAction('details', [contextMenu.fileId]);
        }
      }
    },
    {
      id: 'favorite',
      label: 'Add to Favorites',
      icon: Star,
      onClick: () => {
        if (contextMenu) {
          onFileAction('favorite', [contextMenu.fileId]);
        }
      }
    },
    {
      id: 'delete',
      label: 'Delete File',
      icon: Trash2,
      variant: 'danger',
      onClick: () => {
        if (contextMenu) {
          onFileAction('delete', [contextMenu.fileId]);
        }
      }
    }
  ];

  return (
    <div className="space-y-6">
      <FileToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortChange={setSortBy}
        filterVolume={filterVolume}
        onFilterVolumeChange={setFilterVolume}
        volumes={volumes}
        selectedCount={selectedFiles.size}
        onBulkAction={(action) => onFileAction(action, Array.from(selectedFiles))}
      />

      <FileGrid
        files={filteredFiles}
        viewMode={viewMode}
        selectedFiles={selectedFiles}
        onFileClick={handleFileClick}
        onContextMenu={handleContextMenu}
        searchQuery={searchQuery}
      />

      {contextMenu && (
        <FileContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          items={contextMenuItems}
        />
      )}
    </div>
  );
}