import { LucideIcon, Star, MoreHorizontal } from 'lucide-react';
import { ResonanceIndicator } from '../../ResonanceIndicator';
import { FileItem } from './FileCard';

interface FileListRowProps {
  file: FileItem;
  icon: LucideIcon;
  iconColor: string;
  isSelected?: boolean;
  onClick?: (file: FileItem, event: React.MouseEvent) => void;
  onContextMenu?: (event: React.MouseEvent, fileId: string) => void;
  onMoreClick?: (event: React.MouseEvent, fileId: string) => void;
  className?: string;
}

export function FileListRow({
  file,
  icon: Icon,
  iconColor,
  isSelected = false,
  onClick,
  onContextMenu,
  onMoreClick,
  className = ''
}: FileListRowProps) {
  return (
    <div
      onClick={(e) => onClick?.(file, e)}
      onContextMenu={(e) => onContextMenu?.(e, file.id)}
      className={`px-6 py-4 transition-colors cursor-pointer ${
        isSelected 
          ? 'bg-cyan-500/10 border-l-2 border-cyan-400' 
          : 'hover:bg-white/5'
      } ${className}`}
    >
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* Name */}
        <div className="col-span-4 flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-black/20 ${iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex items-center space-x-2 min-w-0">
            <span className="font-medium text-white truncate">{file.name}</span>
            {file.isFavorite && (
              <Star className="w-3 h-3 text-yellow-400 fill-current flex-shrink-0" />
            )}
          </div>
        </div>
        
        {/* Size */}
        <div className="col-span-2">
          <span className="text-sm text-gray-300">{file.size}</span>
        </div>
        
        {/* Contributor */}
        <div className="col-span-2 flex items-center space-x-2">
          <img
            src={file.contributorAvatar}
            alt={file.contributor}
            className="w-5 h-5 rounded-full"
          />
          <span className="text-sm text-gray-300 truncate">{file.contributor}</span>
        </div>
        
        {/* Resonance */}
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
        
        {/* Date */}
        <div className="col-span-1">
          <span className="text-xs text-gray-400">{file.uploadedAt}</span>
        </div>
        
        {/* Actions */}
        <div className="col-span-1 flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoreClick?.(e, file.id);
            }}
            className="p-1 text-gray-400 hover:text-white transition-colors rounded hover:bg-white/10"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Table header for list view
export function FileListHeader() {
  return (
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
  );
}