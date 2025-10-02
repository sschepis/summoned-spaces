import { Download, Eye, File, Image, Video, Archive, X } from 'lucide-react';
import { BinaryFilePost, FileAttachment } from '../../types/posts';
import { Button } from '../ui/Button';

interface BinaryFileRendererProps {
  post: BinaryFilePost;
  onFileDownload?: (file: FileAttachment) => void;
  onFilePreview?: (file: FileAttachment) => void;
  compact?: boolean;
}

const fileTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'image': Image,
  'video': Video,
  'archive': Archive,
  'default': File
};

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return fileTypeIcons.image;
  if (mimeType.startsWith('video/')) return fileTypeIcons.video;
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return fileTypeIcons.archive;
  return fileTypeIcons.default;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileTypeColor = (type: string): string => {
  switch (type) {
    case 'image': return 'text-blue-400';
    case 'video': return 'text-red-400';
    case 'archive': return 'text-yellow-400';
    default: return 'text-gray-400';
  }
};

export function BinaryFileRenderer({ 
  post, 
  onFileDownload, 
  onFilePreview, 
  compact = false 
}: BinaryFileRendererProps) {
  const handleDownload = (file: FileAttachment) => {
    if (onFileDownload) {
      onFileDownload(file);
    } else {
      // Default download behavior
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.click();
    }
  };

  const handlePreview = (file: FileAttachment) => {
    if (onFilePreview) {
      onFilePreview(file);
    } else if (file.previewUrl) {
      window.open(file.previewUrl, '_blank');
    } else {
      window.open(file.url, '_blank');
    }
  };

  const isPreviewable = (file: FileAttachment): boolean => {
    return file.type === 'image' || file.previewUrl !== undefined;
  };

  // Group files by type for better organization
  const filesByType = post.files.reduce((acc, file) => {
    const type = file.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(file);
    return acc;
  }, {} as Record<string, FileAttachment[]>);

  const imageFiles = filesByType.image || [];
  const otherFiles = post.files.filter(f => f.type !== 'image');

  return (
    <div className="space-y-4">
      {/* Caption */}
      {post.caption && (
        <div className="text-gray-200 text-sm leading-relaxed">
          {post.caption}
        </div>
      )}

      {/* Image Gallery */}
      {imageFiles.length > 0 && (
        <div className="space-y-3">
          {imageFiles.length === 1 ? (
            // Single image - full width
            <div className="relative group">
              <img
                src={imageFiles[0].previewUrl || imageFiles[0].url}
                alt={imageFiles[0].name}
                className="w-full max-h-96 object-cover rounded-lg border border-white/20"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              {/* Image overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg 
                            flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePreview(imageFiles[0])}
                    className="bg-black/60 border-white/20"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDownload(imageFiles[0])}
                    className="bg-black/60 border-white/20"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // Multiple images - grid layout
            <div className={`grid gap-2 ${
              imageFiles.length === 2 ? 'grid-cols-2' :
              imageFiles.length === 3 ? 'grid-cols-3' :
              'grid-cols-2'
            }`}>
              {imageFiles.slice(0, 4).map((file, index) => (
                <div key={file.id} className="relative group aspect-square">
                  <img
                    src={file.previewUrl || file.url}
                    alt={file.name}
                    className="w-full h-full object-cover rounded-lg border border-white/20"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  
                  {/* Show count overlay for 4+ images */}
                  {index === 3 && imageFiles.length > 4 && (
                    <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        +{imageFiles.length - 3}
                      </span>
                    </div>
                  )}
                  
                  {/* Image overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg 
                                flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(file)}
                        className="bg-black/60 border-white/20 w-8 h-8 p-0"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(file)}
                        className="bg-black/60 border-white/20 w-8 h-8 p-0"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Other Files */}
      {otherFiles.length > 0 && (
        <div className="space-y-2">
          {compact && otherFiles.length > 1 && (
            <div className="text-sm text-gray-400 font-medium">
              {otherFiles.length} files attached
            </div>
          )}
          
          <div className={compact ? 'space-y-1' : 'space-y-2'}>
            {(compact ? otherFiles.slice(0, 3) : otherFiles).map((file) => {
              const IconComponent = getFileIcon(file.mimeType);
              const colorClass = getFileTypeColor(file.type);
              
              return (
                <div
                  key={file.id}
                  className="flex items-center space-x-3 p-3 bg-white/5 border border-white/10 rounded-lg 
                           hover:bg-white/10 transition-colors group"
                >
                  {/* File Icon */}
                  <div className={`w-10 h-10 bg-white/10 rounded flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className={`w-5 h-5 ${colorClass}`} />
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {file.name}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span className="capitalize">{file.type}</span>
                      {file.mimeType && (
                        <>
                          <span>•</span>
                          <span>{file.mimeType.split('/')[1]?.toUpperCase()}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isPreviewable(file) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(file)}
                        className="p-2"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(file)}
                      className="p-2"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Show more indicator for compact mode */}
          {compact && otherFiles.length > 3 && (
            <div className="text-center">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                +{otherFiles.length - 3} more files
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Summary for multiple files */}
      {post.files.length > 1 && !compact && (
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="text-xs text-gray-400">
            {post.files.length} files • Total size: {formatFileSize(
              post.files.reduce((total, file) => total + file.size, 0)
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Download all files
              post.files.forEach(file => handleDownload(file));
            }}
            className="text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Download All
          </Button>
        </div>
      )}
    </div>
  );
}