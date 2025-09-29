import { Play, Music, FileText, File } from 'lucide-react';

interface MediaPreviewProps {
  type: 'image' | 'video' | 'audio' | 'document' | 'file';
  url?: string;
  thumbnail?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
  onClick?: () => void;
  className?: string;
}

export function MediaPreview({ 
  type, 
  url, 
  thumbnail,
  alt = 'Media preview',
  size = 'md',
  aspectRatio = 'landscape',
  onClick,
  className = '' 
}: MediaPreviewProps) {
  const sizeClasses = {
    sm: 'max-w-xs',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    full: 'w-full'
  };

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]'
  };

  const renderMediaContent = () => {
    switch (type) {
      case 'image':
        return (
          <img
            src={url}
            alt={alt}
            className="w-full h-full object-cover"
          />
        );

      case 'video':
        return (
          <div className="relative w-full h-full">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={alt}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-black" />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center 
                            shadow-lg hover:bg-white transition-colors">
                <Play className="w-8 h-8 text-black ml-1" fill="currentColor" />
              </div>
            </div>
          </div>
        );

      case 'audio':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 
                        flex items-center justify-center">
            <div className="text-center">
              <Music className="w-12 h-12 text-purple-400 mx-auto mb-2" />
              <p className="text-sm text-gray-300">Audio File</p>
            </div>
          </div>
        );

      case 'document':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 
                        flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-12 h-12 text-blue-400 mx-auto mb-2" />
              <p className="text-sm text-gray-300">Document</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-gray-500/20 to-gray-600/20 
                        flex items-center justify-center">
            <div className="text-center">
              <File className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-300">File</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        ${aspectRatioClasses[aspectRatio]}
        rounded-xl overflow-hidden border border-white/10
        ${onClick ? 'cursor-pointer hover:scale-[1.02] transition-transform' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {renderMediaContent()}
    </div>
  );
}

// Compact version for inline use
interface MediaIconProps {
  type: 'image' | 'video' | 'audio' | 'document' | 'file';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MediaIcon({ type, size = 'md', className = '' }: MediaIconProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const icons = {
    image: null, // Will show thumbnail
    video: Play,
    audio: Music,
    document: FileText,
    file: File
  };

  const Icon = icons[type];
  
  if (!Icon) return null;

  return <Icon className={`${sizeClasses[size]} ${className}`} />;
}