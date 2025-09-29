import { useState, useRef } from 'react';
import { Search, Grid3x3 as Grid3X3, List, Filter, Import as SortAsc, MoreHorizontal, Download, Eye, Trash2, Star, Clock, User, FileText, Image, Video, Music, Archive, Code, Database, Zap, ChevronDown } from 'lucide-react';
import { ResonanceIndicator } from './ResonanceIndicator';

interface FileItem {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'png' | 'jpg' | 'mp4' | 'mp3' | 'zip' | 'js' | 'py' | 'csv';
  size: string;
  sizeBytes: number;
  contributor: string;
  contributorAvatar: string;
  uploadedAt: string;
  lastAccessed?: string;
  accessCount: number;
  resonanceStrength: number;
  fingerprint: string;
  tags: string[];
  volumeId: string;
  volumeName: string;
  isFavorite: boolean;
}

interface FileExplorerProps {
  spaceId: string;
  onFileSelect: (file: FileItem) => void;
  onFileAction: (action: string, fileIds: string[]) => void;
}

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
    lastAccessed: '5 minutes ago',
    accessCount: 23,
    resonanceStrength: 0.94,
    fingerprint: 'A7C4E9F2B8D1C5A3',
    tags: ['quantum', 'algorithms', 'research'],
    volumeId: '1',
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
    lastAccessed: '2 hours ago',
    accessCount: 18,
    resonanceStrength: 0.87,
    fingerprint: '8E3C91A52F7B4D6A',
    tags: ['quantum', 'entanglement', 'theory'],
    volumeId: '1',
    volumeName: 'Research Papers',
    isFavorite: false
  },
  {
    id: '3',
    name: 'measurement_data.csv',
    type: 'csv',
    size: '5.2 MB',
    sizeBytes: 5452800,
    contributor: 'Dr. Amanda Liu',
    contributorAvatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    uploadedAt: '3 days ago',
    lastAccessed: '1 day ago',
    accessCount: 8,
    resonanceStrength: 0.76,
    fingerprint: '2B4F7E8A91C3D5F2',
    tags: ['data', 'measurements', 'experiment'],
    volumeId: '1',
    volumeName: 'Research Papers',
    isFavorite: false
  },
  {
    id: '4',
    name: 'design_system_v2.png',
    type: 'png',
    size: '3.1 MB',
    sizeBytes: 3248128,
    contributor: 'Elena Kowalski',
    contributorAvatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    uploadedAt: '5 days ago',
    lastAccessed: '3 hours ago',
    accessCount: 15,
    resonanceStrength: 0.89,
    fingerprint: '9F1E5A3C7B2D8A6F',
    tags: ['design', 'ui', 'system'],
    volumeId: '2',
    volumeName: 'Design Assets',
    isFavorite: true
  },
  {
    id: '5',
    name: 'prototype_demo.mp4',
    type: 'mp4',
    size: '24.6 MB',
    sizeBytes: 25796608,
    contributor: 'James Wilson',
    contributorAvatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    uploadedAt: '1 week ago',
    lastAccessed: '6 hours ago',
    accessCount: 12,
    resonanceStrength: 0.82,
    fingerprint: '4C8A1F3E9B5D2C7A',
    tags: ['prototype', 'demo', 'video'],
    volumeId: '2',
    volumeName: 'Design Assets',
    isFavorite: false
  },
  {
    id: '6',
    name: 'api_documentation.pdf',
    type: 'pdf',
    size: '1.2 MB',
    sizeBytes: 1258291,
    contributor: 'Dr. Sarah Chen',
    contributorAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    uploadedAt: '4 days ago',
    lastAccessed: '1 hour ago',
    accessCount: 31,
    resonanceStrength: 0.91,
    fingerprint: '6D2F8A4E1C9B3E5A',
    tags: ['api', 'documentation', 'reference'],
    volumeId: '3',
    volumeName: 'Documentation',
    isFavorite: true
  }
];

const fileTypeIcons = {
  pdf: FileText,
  docx: FileText,
  png: Image,
  jpg: Image,
  mp4: Video,
  mp3: Music,
  zip: Archive,
  js: Code,
  py: Code,
  csv: Database
};

const fileTypeColors = {
  pdf: 'text-red-400',
  docx: 'text-blue-400',
  png: 'text-green-400',
  jpg: 'text-green-400',
  mp4: 'text-purple-400',
  mp3: 'text-pink-400',
  zip: 'text-yellow-400',
  js: 'text-yellow-500',
  py: 'text-green-500',
  csv: 'text-cyan-400'
};

export function FileExplorer({ spaceId, onFileSelect, onFileAction }: FileExplorerProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date' | 'resonance'>('name');
  const [filterVolume, setFilterVolume] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; fileId: string } | null>(null);

  // Filter and sort files
  const filteredFiles = mockFiles
    .filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesVolume = filterVolume === 'all' || file.volumeId === filterVolume;
      return matchesSearch && matchesVolume;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'size':
          return b.sizeBytes - a.sizeBytes;
        case 'date':
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        case 'resonance':
          return b.resonanceStrength - a.resonanceStrength;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const volumes = [
    { id: 'all', name: 'All Files' },
    { id: '1', name: 'Research Papers' },
    { id: '2', name: 'Design Assets' },
    { id: '3', name: 'Documentation' }
  ];

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

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleFileAction = (action: string) => {
    if (contextMenu) {
      onFileAction(action, [contextMenu.fileId]);
    } else if (selectedFiles.size > 0) {
      onFileAction(action, Array.from(selectedFiles));
    }
    closeContextMenu();
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files, tags, or contributors..."
              className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 
                       rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                       focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={filterVolume}
              onChange={(e) => setFilterVolume(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm
                       focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {volumes.map((volume) => (
                <option key={volume.id} value={volume.id} className="bg-slate-800">
                  {volume.name}
                </option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm
                       focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="name" className="bg-slate-800">Name</option>
              <option value="size" className="bg-slate-800">Size</option>
              <option value="date" className="bg-slate-800">Date</option>
              <option value="resonance" className="bg-slate-800">Resonance</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
          </button>
          
          {selectedFiles.size > 0 && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-cyan-500/20 text-cyan-300 
                          rounded-lg border border-cyan-500/30">
              <span className="text-sm">{selectedFiles.size} selected</span>
              <button
                onClick={() => handleFileAction('summon')}
                className="text-xs text-cyan-200 hover:text-white transition-colors"
              >
                Summon All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* File Grid/List View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFiles.map((file) => {
            const FileIcon = fileTypeIcons[file.type];
            const isSelected = selectedFiles.has(file.id);
            
            return (
              <div
                key={file.id}
                onClick={(e) => handleFileClick(file, e)}
                onContextMenu={(e) => handleContextMenu(e, file.id)}
                className={`group relative bg-white/5 backdrop-blur-sm rounded-xl p-4 border 
                          transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
                  isSelected 
                    ? 'border-cyan-400/50 bg-cyan-500/10 shadow-lg shadow-cyan-500/20' 
                    : 'border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                {file.isFavorite && (
                  <Star className="absolute top-2 right-2 w-4 h-4 text-yellow-400 fill-current" />
                )}
                
                <div className="flex flex-col items-center space-y-3">
                  <div className={`p-3 rounded-lg bg-black/20 ${fileTypeColors[file.type]}`}>
                    <FileIcon className="w-8 h-8" />
                  </div>
                  
                  <div className="text-center w-full">
                    <h3 className="font-medium text-white text-sm truncate group-hover:text-cyan-300 
                                 transition-colors" title={file.name}>
                      {file.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">{file.size}</p>
                  </div>
                  
                  <div className="w-full space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Resonance</span>
                      <span className="font-mono text-cyan-400">
                        {(file.resonanceStrength * 100).toFixed(0)}%
                      </span>
                    </div>
                    <ResonanceIndicator strength={file.resonanceStrength} size="small" />
                  </div>
                  
                  <div className="flex items-center space-x-1 text-xs text-gray-400">
                    <User className="w-3 h-3" />
                    <span className="truncate">{file.contributor}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          <div className="px-6 py-3 border-b border-white/10 bg-white/5">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-400">
              <div className="col-span-4">Name</div>
              <div className="col-span-2">Size</div>
              <div className="col-span-2">Contributor</div>
              <div className="col-span-2">Resonance</div>
              <div className="col-span-1">Modified</div>
              <div className="col-span-1"></div>
            </div>
          </div>
          
          <div className="divide-y divide-white/5">
            {filteredFiles.map((file) => {
              const FileIcon = fileTypeIcons[file.type];
              const isSelected = selectedFiles.has(file.id);
              
              return (
                <div
                  key={file.id}
                  onClick={(e) => handleFileClick(file, e)}
                  onContextMenu={(e) => handleContextMenu(e, file.id)}
                  className={`px-6 py-4 transition-colors cursor-pointer ${
                    isSelected 
                      ? 'bg-cyan-500/10 border-l-2 border-cyan-400' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-4 flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-black/20 ${fileTypeColors[file.type]}`}>
                        <FileIcon className="w-4 h-4" />
                      </div>
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="font-medium text-white truncate">{file.name}</span>
                        {file.isFavorite && (
                          <Star className="w-3 h-3 text-yellow-400 fill-current flex-shrink-0" />
                        )}
                      </div>
                    </div>
                    
                    <div className="col-span-2">
                      <span className="text-sm text-gray-300">{file.size}</span>
                    </div>
                    
                    <div className="col-span-2 flex items-center space-x-2">
                      <img
                        src={file.contributorAvatar}
                        alt={file.contributor}
                        className="w-5 h-5 rounded-full"
                      />
                      <span className="text-sm text-gray-300 truncate">{file.contributor}</span>
                    </div>
                    
                    <div className="col-span-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1">
                          <ResonanceIndicator strength={file.resonanceStrength} size="small" />
                        </div>
                        <span className="text-xs font-mono text-cyan-400">
                          {(file.resonanceStrength * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="col-span-1">
                      <span className="text-xs text-gray-400">{file.uploadedAt}</span>
                    </div>
                    
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContextMenu(e, file.id);
                        }}
                        className="p-1 text-gray-400 hover:text-white transition-colors rounded hover:bg-white/10"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={closeContextMenu}
          />
          <div
            ref={contextMenuRef}
            className="fixed z-50 bg-slate-800 rounded-lg shadow-2xl border border-white/10 py-2 min-w-48"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={() => handleFileAction('summon')}
              className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 
                       transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Summon File</span>
            </button>
            <button
              onClick={() => handleFileAction('details')}
              className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 
                       transition-colors flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>View Details</span>
            </button>
            <button
              onClick={() => handleFileAction('favorite')}
              className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 
                       transition-colors flex items-center space-x-2"
            >
              <Star className="w-4 h-4" />
              <span>Add to Favorites</span>
            </button>
            <hr className="border-white/10 my-2" />
            <button
              onClick={() => handleFileAction('delete')}
              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 
                       transition-colors flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete File</span>
            </button>
          </div>
        </>
      )}

      {filteredFiles.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400">
            {searchQuery ? 
              `No files found matching "${searchQuery}"` : 
              'No files in this space yet'
            }
          </div>
        </div>
      )}
    </div>
  );
}