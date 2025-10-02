import { FileText, MoreVertical, Trash2, Download, Eye } from 'lucide-react';
import { useState } from 'react';

interface FileRecord {
    file_id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    uploader_id: string;
    created_at: string;
    fingerprint: string;
}

export function FileListRow({ file, onFileSelect, onRemoveFile }: { file: FileRecord, onFileSelect: (file: FileRecord) => void, onRemoveFile: (fileId: string) => void }) {
    const [menuOpen, setMenuOpen] = useState(false);

    const getFileIcon = (fileType: string) => {
        if (fileType.startsWith('image/')) return '🖼️';
        if (fileType.startsWith('video/')) return '🎬';
        if (fileType.startsWith('audio/')) return '🎵';
        if (fileType === 'application/pdf') return '📄';
        return '📁';
    };

    return (
        <div className="flex items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
            <div className="text-2xl mr-4">{getFileIcon(file.file_type)}</div>
            <div className="flex-1">
                <p className="text-sm font-medium text-white">{file.file_name}</p>
                <p className="text-xs text-gray-400">
                    {(file.file_size / 1024 / 1024).toFixed(2)} MB • {new Date(file.created_at).toLocaleDateString()}
                </p>
            </div>
            <div className="text-xs text-gray-400 mr-4">Uploaded by {file.uploader_id.substring(0, 8)}</div>
            <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 rounded-full hover:bg-white/20">
                    <MoreVertical className="w-4 h-4 text-white" />
                </button>
                {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-md shadow-lg z-10">
                        <button onClick={() => { onFileSelect(file); setMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-slate-700">
                            <Eye className="w-4 h-4 mr-2" /> View Details
                        </button>
                        <button className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-slate-700">
                            <Download className="w-4 h-4 mr-2" /> Download
                        </button>
                        <button onClick={() => { onRemoveFile(file.file_id); setMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-400 hover:bg-slate-700">
                            <Trash2 className="w-4 h-4 mr-2" /> Remove
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}