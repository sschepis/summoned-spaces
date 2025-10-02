import { useState, useEffect, useRef } from 'react';
import { Upload, File, Image, Video, Archive, X, Download, Eye } from 'lucide-react';
import { CreateBinaryFilePost, FileAttachment } from '../../types/posts';

interface FileUploadComposerProps {
  onChange: (data: Partial<CreateBinaryFilePost>, isValid: boolean) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
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

const generatePreviewUrl = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      // For non-images, return a placeholder or file icon
      resolve('');
    }
  });
};

export function FileUploadComposer({ 
  onChange, 
  maxFiles = 10, 
  maxFileSize = 50 
}: FileUploadComposerProps) {
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [caption, setCaption] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const isValid = files.length > 0;
    // Convert FileAttachment back to File objects for the interface
    const fileObjects = files.map(f => f.metadata?.originalFile as File).filter(Boolean);
    onChange({ files: fileObjects, caption: caption || undefined }, isValid);
  }, [files, caption, onChange]);

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File "${file.name}" is too large. Maximum size is ${maxFileSize}MB.`;
    }
    
    // Add more validation rules as needed
    const allowedTypes = [
      'image/', 'video/', 'audio/', 'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument', 'text/', 'application/zip',
      'application/x-rar-compressed', 'application/json'
    ];
    
    const isAllowed = allowedTypes.some(type => file.type.startsWith(type));
    if (!isAllowed) {
      return `File type "${file.type}" is not allowed.`;
    }
    
    return null;
  };

  const processFiles = async (fileList: FileList) => {
    setError(null);
    setUploading(true);
    
    const newFiles: FileAttachment[] = [];
    const errors: string[] = [];
    
    if (files.length + fileList.length > maxFiles) {
      setError(`Cannot upload more than ${maxFiles} files.`);
      setUploading(false);
      return;
    }
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const validationError = validateFile(file);
      
      if (validationError) {
        errors.push(validationError);
        continue;
      }
      
      try {
        const previewUrl = await generatePreviewUrl(file);
        
        const fileAttachment: FileAttachment = {
          id: `file_${Date.now()}_${i}`,
          name: file.name,
          type: file.type.split('/')[0],
          size: file.size,
          url: URL.createObjectURL(file), // Temporary URL for display
          mimeType: file.type,
          previewUrl: previewUrl || undefined,
          metadata: {
            lastModified: file.lastModified,
            originalFile: file // Store original file for upload
          }
        };
        
        newFiles.push(fileAttachment);
      } catch {
        errors.push(`Failed to process file "${file.name}".`);
      }
    }
    
    if (errors.length > 0) {
      setError(errors.join(' '));
    }
    
    setFiles(prev => [...prev, ...newFiles]);
    setUploading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      // Cleanup object URLs to prevent memory leaks
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return updated;
    });
  };

  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCaption(e.target.value);
  };

  return (
    <div className="space-y-4">
      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          dragActive
            ? 'border-cyan-400 bg-cyan-400/10'
            : 'border-white/20 hover:border-white/30'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar,.json"
        />
        
        {uploading ? (
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mr-3"></div>
            <span className="text-gray-300">Processing files...</span>
          </div>
        ) : (
          <>
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-white font-medium mb-2">
              Drop files here or click to browse
            </h4>
            <p className="text-gray-400 text-sm mb-2">
              Upload images, documents, videos, or other files
            </p>
            <p className="text-xs text-gray-500">
              Max {maxFiles} files, {maxFileSize}MB per file
            </p>
          </>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-white font-medium">
            Uploaded Files ({files.length}/{maxFiles})
          </h4>
          
          <div className="space-y-2">
            {files.map((file) => {
              const IconComponent = getFileIcon(file.mimeType);
              return (
                <div
                  key={file.id}
                  className="flex items-center space-x-3 p-3 bg-white/5 border border-white/10 rounded-lg"
                >
                  {/* File Preview/Icon */}
                  <div className="flex-shrink-0">
                    {file.previewUrl ? (
                      <img
                        src={file.previewUrl}
                        alt={file.name}
                        className="w-12 h-12 object-cover rounded border border-white/20"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-white/10 rounded flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
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
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {file.previewUrl && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(file.previewUrl, '_blank');
                        }}
                        className="p-1 text-gray-400 hover:text-cyan-400 transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const link = document.createElement('a');
                        link.href = file.url;
                        link.download = file.name;
                        link.click();
                      }}
                      className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Caption Input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Add a caption (optional):
        </label>
        <textarea
          value={caption}
          onChange={handleCaptionChange}
          placeholder="Describe the files you're sharing or add context..."
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-3 text-white text-sm
                   placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400 
                   focus:border-transparent"
          rows={3}
          maxLength={280}
        />
        <div className="flex justify-between items-center mt-2">
          <div className="text-xs text-gray-400">
            Optional description for your files
          </div>
          <div className="text-xs text-gray-400">
            {caption.length}/280
          </div>
        </div>
      </div>

      {/* Instructions */}
      {files.length === 0 && !uploading && (
        <div className="text-center py-4">
          <File className="w-8 h-8 text-gray-500 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">
            No files selected. Upload files to share with your space.
          </p>
        </div>
      )}
    </div>
  );
}