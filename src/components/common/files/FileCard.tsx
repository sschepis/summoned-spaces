import { FileText, MoreVertical, Trash2, Download, Eye } from 'lucide-react';
import { useState } from 'react';
import { downloadFile } from '../../../services/file-download';

interface FileRecord {
    file_id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    uploader_id: string;
    created_at: string;
    fingerprint: string;
}

interface FileCardProps {
    file: FileRecord;
    spaceId: string;
    onSelect: () => void;
    onRemove: () => void;
}

export function FileCard({ file, spaceId, onSelect, onRemove }: FileCardProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [downloading, setDownloading] = useState(false);

    // Defensive programming - handle null/undefined values
    if (!file) {
        return (
            <div className="aspect-square bg-red-500/10 rounded-lg flex items-center justify-center p-4">
                <p className="text-red-400 text-sm">Invalid file</p>
            </div>
        );
    }

    const getFileIcon = (fileType?: string, fileName?: string): string => {
        try {
            // FILE TYPE FIX: Improve file type detection and avoid defaulting to folder
            if (fileType) {
                if (fileType.startsWith('image/')) return '🖼️';
                if (fileType.startsWith('video/')) return '🎬';
                if (fileType.startsWith('audio/')) return '🎵';
                if (fileType === 'application/pdf') return '📄';
                if (fileType.includes('text')) return '📝';
                if (fileType.includes('document') || fileType.includes('word')) return '📄';
                if (fileType.includes('spreadsheet') || fileType.includes('excel')) return '📊';
                if (fileType.includes('presentation') || fileType.includes('powerpoint')) return '📽️';
                if (fileType.includes('zip') || fileType.includes('archive')) return '🗜️';
            }
            
            // Fallback to file extension detection if fileType is missing
            if (fileName) {
                const ext = fileName.toLowerCase().split('.').pop();
                if (ext) {
                    // Image extensions
                    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return '🖼️';
                    // Video extensions
                    if (['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv'].includes(ext)) return '🎬';
                    // Audio extensions
                    if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'].includes(ext)) return '🎵';
                    // Document extensions
                    if (['pdf'].includes(ext)) return '📄';
                    if (['doc', 'docx'].includes(ext)) return '📄';
                    if (['xls', 'xlsx'].includes(ext)) return '📊';
                    if (['ppt', 'pptx'].includes(ext)) return '📽️';
                    if (['txt', 'md', 'log'].includes(ext)) return '📝';
                    // Archive extensions
                    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return '🗜️';
                }
            }
            
            // Default to generic file icon instead of folder
            return '📄';
        } catch (error) {
            console.warn('Error determining file icon:', error);
            return '📄';
        }
    };

    const formatFileSize = (sizeInBytes?: number): string => {
        if (!sizeInBytes || typeof sizeInBytes !== 'number' || isNaN(sizeInBytes)) {
            return 'Unknown size';
        }
        try {
            if (sizeInBytes < 1024) return `${sizeInBytes} B`;
            const sizeInKB = sizeInBytes / 1024;
            if (sizeInKB < 1024) return `${sizeInKB.toFixed(1)} KB`;
            const sizeInMB = sizeInKB / 1024;
            if (sizeInMB < 1024) return `${sizeInMB.toFixed(1)} MB`;
            const sizeInGB = sizeInMB / 1024;
            return `${sizeInGB.toFixed(1)} GB`;
        } catch (error) {
            console.warn('Error formatting file size:', error);
            return 'Unknown size';
        }
    };

    const fileName = file.file_name || 'Unknown file';
    const fileType = file.file_type || '';
    const fileSize = formatFileSize(file.file_size);

    const handleSelect = () => {
        try {
            onSelect();
        } catch (error) {
            console.error('Error in onSelect:', error);
        }
    };

    const handleRemove = () => {
        try {
            onRemove();
            setMenuOpen(false);
        } catch (error) {
            console.error('Error in onRemove:', error);
        }
    };

    const handleMenuToggle = () => {
        try {
            setMenuOpen(!menuOpen);
        } catch (error) {
            console.error('Error toggling menu:', error);
        }
    };

    const handleDownload = async () => {
        try {
            setDownloading(true);
            setMenuOpen(false);
            await downloadFile(spaceId, file.fingerprint, file.file_name, file.file_type);
        } catch (error) {
            console.error('Error downloading file:', error);
            // Could add toast notification here
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="relative group">
            <div
                className="aspect-square bg-white/5 rounded-lg flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all duration-200 hover:bg-white/10"
                onClick={handleSelect}
            >
                <div className="text-4xl mb-2">{getFileIcon(fileType, fileName)}</div>
                <p className="text-sm text-white font-medium truncate w-full" title={fileName}>
                    {fileName}
                </p>
                <p className="text-xs text-gray-400">{fileSize}</p>
            </div>
            <div className="absolute top-2 right-2">
                <button
                    onClick={handleMenuToggle}
                    className="p-1 rounded-full hover:bg-white/20"
                    type="button"
                >
                    <MoreVertical className="w-4 h-4 text-white" />
                </button>
                {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-md shadow-lg z-10 border border-slate-700">
                        <button
                            onClick={() => { handleSelect(); setMenuOpen(false); }}
                            className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-slate-700"
                            type="button"
                        >
                            <Eye className="w-4 h-4 mr-2" /> View Details
                        </button>
                        <button
                            onClick={handleDownload}
                            disabled={downloading}
                            className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 disabled:opacity-50"
                            type="button"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            {downloading ? 'Downloading...' : 'Download'}
                        </button>
                        <button
                            onClick={handleRemove}
                            className="w-full text-left flex items-center px-4 py-2 text-sm text-red-400 hover:bg-slate-700"
                            type="button"
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Remove
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}