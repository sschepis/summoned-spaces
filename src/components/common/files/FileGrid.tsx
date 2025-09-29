import { LucideIcon, FileText, Image, Video, Music, Archive, Code, Database } from 'lucide-react';
import { FileCard, FileItem } from './FileCard';
import { FileListRow, FileListHeader } from './FileListRow';
import { EmptyState } from '../../ui/EmptyState';

// File type icon and color mappings
export const fileTypeIcons: Record<string, LucideIcon> = {
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

export const fileTypeColors: Record<string, string> = {
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

interface FileGridProps {
  files: FileItem[];
  viewMode: 'grid' | 'list';
  selectedFiles: Set<string>;
  onFileClick?: (file: FileItem, event: React.MouseEvent) => void;
  onContextMenu?: (event: React.MouseEvent, fileId: string) => void;
  emptyMessage?: string;
  searchQuery?: string;
  className?: string;
}

export function FileGrid({
  files,
  viewMode,
  selectedFiles,
  onFileClick,
  onContextMenu,
  emptyMessage,
  searchQuery = '',
  className = ''
}: FileGridProps) {
  if (files.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title={emptyMessage || 'No files found'}
        description={
          searchQuery 
            ? `No files found matching "${searchQuery}"`
            : 'No files in this space yet'
        }
        className={className}
      />
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>
        {files.map((file) => {
          const Icon = fileTypeIcons[file.type] || FileText;
          const iconColor = fileTypeColors[file.type] || 'text-gray-400';
          
          return (
            <FileCard
              key={file.id}
              file={file}
              icon={Icon}
              iconColor={iconColor}
              isSelected={selectedFiles.has(file.id)}
              onClick={onFileClick}
              onContextMenu={onContextMenu}
            />
          );
        })}
      </div>
    );
  }

  // List view
  return (
    <div className={`bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden ${className}`}>
      <FileListHeader />
      <div className="divide-y divide-white/5">
        {files.map((file) => {
          const Icon = fileTypeIcons[file.type] || FileText;
          const iconColor = fileTypeColors[file.type] || 'text-gray-400';
          
          return (
            <FileListRow
              key={file.id}
              file={file}
              icon={Icon}
              iconColor={iconColor}
              isSelected={selectedFiles.has(file.id)}
              onClick={onFileClick}
              onContextMenu={onContextMenu}
              onMoreClick={onContextMenu}
            />
          );
        })}
      </div>
    </div>
  );
}