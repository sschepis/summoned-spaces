import { useState, useCallback } from 'react';
import { Upload, File, X, Zap } from 'lucide-react';

interface FileUploadZoneProps {
  onClose: () => void;
}

export function FileUploadZone({ onClose }: FileUploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    setUploading(true);
    // Simulate upload process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setUploading(false);
    setFiles([]);
    onClose();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">Contribute Files</h2>
        <p className="text-gray-400 text-sm">Files are encoded as mathematical resonance fingerprints</p>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
          dragActive 
            ? 'border-cyan-400 bg-cyan-500/10' 
            : 'border-white/20 bg-white/5 hover:bg-white/10'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-cyan-500/20">
              <Upload className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-white mb-2">
              Drop files here or click to browse
            </h3>
            <p className="text-gray-400 text-sm">
              Files will be encoded using prime-resonant mathematical fingerprinting
            </p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Files to Upload ({files.length})</h3>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white/5 
                                        rounded-lg border border-white/10">
                <div className="flex items-center space-x-3">
                  <File className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-white">{file.name}</div>
                    <div className="text-xs text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="flex items-center justify-between pt-6 border-t border-white/10">
          <div className="text-sm text-gray-400">
            {files.length} file{files.length !== 1 ? 's' : ''} ready for resonance encoding
          </div>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white 
                     rounded-lg hover:from-blue-400 hover:to-teal-400 transition-all 
                     duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 
                     flex items-center space-x-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Encoding...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Begin Resonance Encoding</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}