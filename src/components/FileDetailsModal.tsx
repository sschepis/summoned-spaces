import { X, File, User, Calendar, Hash, Download } from 'lucide-react';
import { Modal } from './ui/Modal';
import { downloadFile } from '../services/file-download';
import { useState } from 'react';

interface File {
    file_id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    uploader_id: string;
    created_at: string;
    fingerprint: string;
}

export function FileDetailsModal({ file, spaceId, isOpen, onClose }: { file: File, spaceId: string, isOpen: boolean, onClose: () => void }) {
    const [downloading, setDownloading] = useState(false);
    
    if (!file) return null;

    const handleDownload = async () => {
        try {
            setDownloading(true);
            await downloadFile(spaceId, file.fingerprint, file.file_name, file.file_type);
        } catch (error) {
            console.error('Error downloading file:', error);
            // Could add toast notification here
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="File Details">
            <div className="space-y-4">
                <div className="text-center">
                    <div className="text-6xl mb-4">
                        {file.file_type.startsWith('image/') ? '🖼️' : '📄'}
                    </div>
                    <h2 className="text-xl font-semibold text-white">{file.file_name}</h2>
                    <p className="text-sm text-gray-400">{(file.file_size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <File className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">Type: {file.file_type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">Uploaded by: {file.uploader_id.substring(0, 12)}...</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">Uploaded on: {new Date(file.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Hash className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">Fingerprint:</span>
                    </div>
                    <p className="text-xs text-cyan-400 font-mono break-all">{file.fingerprint}</p>
                </div>
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="w-full flex items-center justify-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
                >
                    <Download className="w-4 h-4 mr-2" />
                    {downloading ? 'Downloading...' : 'Download File'}
                </button>
            </div>
        </Modal>
    );
}