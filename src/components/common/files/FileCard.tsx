import { LucideIcon, Star, User } from 'lucide-react';
import { ResonanceIndicator } from '../../ResonanceIndicator';

export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: string;
  sizeBytes: number;
  contributor: string;
  contributorAvatar: string;
  uploadedAt: string;
  resonanceStrength: number;
  fingerprint?: string;
  tags?: string[];
  volumeName?: string;
  isFavorite?: boolean;
}

interface FileCardProps {
  file: FileItem;
  icon: LucideIcon;
  iconColor: string;
  isSelected?: boolean;
  onClick?: (file: FileItem, event: React.MouseEvent) => void;
  onContextMenu?: (event: React.MouseEvent, fileId: string) => void;
  showResonance?: boolean;
  showContributor?: boolean;
  className?: string;
}

export function FileCard({
  file,
  icon: Icon,
  iconColor,
  isSelected = false,
  onClick,
  onContextMenu,
  showResonance = true,
  showContributor = true,
  className = ''
}: FileCardProps) {
  return (
    <div
      onClick={(e) => onClick?.(file, e)}
      onContextMenu={(e) => onContextMenu?.(e, file.id)}
      className={`group relative bg-white/5 backdrop-blur-sm rounded-xl p-4 border 
                 transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
        isSelected 
          ? 'border-cyan-400/50 bg-cyan-500/10 shadow-lg shadow-cyan-500/20' 
          : 'border-white/10 hover:bg-white/10 hover:border-white/20'
      } ${className}`}
    >
      {file.isFavorite && (
        <Star className="absolute top-2 right-2 w-4 h-4 text-yellow-400 fill-current" />
      )}
      
      <div className="flex flex-col items-center space-y-3">
        <div className={`p-3 rounded-lg bg-black/20 ${iconColor}`}>
          <Icon className="w-8 h-8" />
        </div>
        
        <div className="text-center w-full">
          <h3 className="font-medium text-white text-sm truncate group-hover:text-cyan-300 
                       transition-colors" title={file.name}>
            {file.name}
          </h3>
          <p className="text-xs text-gray-400 mt-1">{file.size}</p>
        </div>
        
        {showResonance && (
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Resonance</span>
              <span className="font-mono text-cyan-400">
                {(file.resonanceStrength * 100).toFixed(0)}%
              </span>
            </div>
            <ResonanceIndicator strength={file.resonanceStrength} size="small" />
          </div>
        )}
        
        {showContributor && (
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            <User className="w-3 h-3" />
            <span className="truncate">{file.contributor}</span>
          </div>
        )}
      </div>
    </div>
  );
}