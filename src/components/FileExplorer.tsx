import { useState, useEffect } from 'react';
import { FileGrid } from './common/files/FileGrid';
import { FileListRow } from './common/files/FileListRow';
import { FileToolbar } from './common/files/FileToolbar';
import { FileUploadZone } from './FileUploadZone';
import { FileDetailsModal } from './FileDetailsModal';
import { LoadingSpinner } from './ui/LoadingSpinner';
import webSocketService from '../services/websocket';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

interface FileRecord {
    file_id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    uploader_id: string;
    created_at: string;
    fingerprint: string;
}

interface FileExplorerProps {
    spaceId: string;
}

interface UploadProgress {
    fileName: string;
    status: 'uploading' | 'success' | 'error';
    error?: string;
}

export function FileExplorer({ spaceId }: FileExplorerProps) {
    const [files, setFiles] = useState<FileRecord[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sort, setSort] = useState<{ by: string, order: 'asc' | 'desc' }>({ by: 'created_at', order: 'desc' });
    const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const { waitForAuth } = useAuth();

    useEffect(() => {
        const fetchFiles = async () => {
            await waitForAuth();
            webSocketService.sendMessage({
                kind: 'getSpaceFiles',
                payload: { spaceId }
            });
        };
        fetchFiles();

        const handleFileUpdate = (message: { kind: string; payload: any; }) => {
            if (message.kind === 'spaceFilesResponse' && message.payload.spaceId === spaceId) {
                // DEDUPLICATION FIX: Filter out duplicates and invalid files
                const validFiles = (message.payload.files || []).filter((file: FileRecord, index: number, arr: FileRecord[]) => {
                    if (!file || !file.file_id) return false;
                    // Keep only first occurrence of each file_id
                    return arr.findIndex(f => f && f.file_id === file.file_id) === index;
                });
                setFiles(validFiles);
            }
            if (message.kind === 'fileAddedToSpace' && message.payload.spaceId === spaceId) {
                const newFile = message.payload.file;
                if (newFile && newFile.file_id) {
                    setFiles(prev => {
                        // DUPLICATE PREVENTION: Check if file already exists
                        const exists = prev.some(f => f && f.file_id === newFile.file_id);
                        if (exists) {
                            console.log(`File ${newFile.file_id} already exists, skipping duplicate add`);
                            return prev;
                        }
                        return [newFile, ...prev];
                    });
                }
            }
            if (message.kind === 'fileRemovedFromSpace' && message.payload.spaceId === spaceId) {
                setFiles(prev => prev.filter(f => f && f.file_id !== message.payload.fileId));
            }
        };

        webSocketService.addMessageListener(handleFileUpdate);
        return () => webSocketService.removeMessageListener(handleFileUpdate);
    }, [spaceId, waitForAuth]);

    const handleUpload = async (uploadedFiles: globalThis.File[]) => {
        try {
            await waitForAuth();
            setIsUploading(true);
            
            // Initialize progress tracking
            const initialProgress: UploadProgress[] = uploadedFiles.map(file => ({
                fileName: file.name,
                status: 'uploading'
            }));
            setUploadProgress(initialProgress);

            // Process files sequentially to avoid overwhelming the browser
            for (let i = 0; i < uploadedFiles.length; i++) {
                const file = uploadedFiles[i];
                
                try {
                    // Update progress to show current file being processed
                    setUploadProgress(prev => prev.map((p, idx) =>
                        idx === i ? { ...p, status: 'uploading' } : p
                    ));

                    await processFile(file, i);
                    
                    // Mark as successful
                    setUploadProgress(prev => prev.map((p, idx) =>
                        idx === i ? { ...p, status: 'success' } : p
                    ));

                } catch (error) {
                    console.error(`Error uploading file ${file.name}:`, error);
                    
                    // Mark as failed
                    setUploadProgress(prev => prev.map((p, idx) =>
                        idx === i ? {
                            ...p,
                            status: 'error',
                            error: error instanceof Error ? error.message : 'Upload failed'
                        } : p
                    ));
                }
            }

            // Clear progress after a delay
            setTimeout(() => {
                setUploadProgress([]);
                setIsUploading(false);
            }, 3000);

        } catch (error) {
            console.error('Error during file upload process:', error);
            setUploadProgress([]);
            setIsUploading(false);
        }
    };

    const processFile = async (file: globalThis.File, index: number): Promise<void> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const fileContent = e.target?.result as ArrayBuffer;
                    if (!fileContent) {
                        throw new Error('Failed to read file content');
                    }

                    const fingerprint = `fingerprint_${file.name}_${file.size}_${Date.now()}`;
                    
                    // Convert ArrayBuffer to base64 in chunks to prevent UI blocking
                    const base64Content = await arrayBufferToBase64Chunked(fileContent);
                    
                    // Send file to server
                    webSocketService.sendMessage({
                        kind: 'addFileToSpace',
                        payload: {
                            spaceId,
                            fileName: file.name,
                            fileType: file.type || 'application/octet-stream',
                            fileSize: file.size,
                            fingerprint,
                            fileContent: base64Content
                        }
                    });
                    
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                reject(new Error(`Failed to read file: ${file.name}`));
            };
            
            reader.readAsArrayBuffer(file);
        });
    };

    // Convert ArrayBuffer to base64 in chunks to prevent UI blocking
    const arrayBufferToBase64Chunked = async (buffer: ArrayBuffer): Promise<string> => {
        return new Promise((resolve) => {
            const uint8Array = new Uint8Array(buffer);
            const chunkSize = 8192; // Process 8KB at a time
            let result = '';
            let offset = 0;

            const processChunk = () => {
                const end = Math.min(offset + chunkSize, uint8Array.length);
                const chunk = uint8Array.slice(offset, end);
                const binaryString = Array.from(chunk, byte => String.fromCharCode(byte)).join('');
                result += btoa(binaryString);
                offset = end;

                if (offset < uint8Array.length) {
                    // Use setTimeout to yield control back to the browser
                    setTimeout(processChunk, 0);
                } else {
                    resolve(result);
                }
            };

            processChunk();
        });
    };

    const handleRemoveFile = async (fileId: string) => {
        await waitForAuth();
        webSocketService.sendMessage({
            kind: 'removeFileFromSpace',
            payload: { spaceId, fileId }
        });
    };

    const sortedFiles = [...files].sort((a, b) => {
        const aVal = a[sort.by as keyof typeof a];
        const bVal = b[sort.by as keyof typeof b];
        if (aVal < bVal) return sort.order === 'asc' ? -1 : 1;
        if (aVal > bVal) return sort.order === 'asc' ? 1 : -1;
        return 0;
    });

    return (
        <div className="space-y-6">
            <FileUploadZone
                onUpload={handleUpload}
                maxFileSize={50 * 1024 * 1024} // 50MB limit
                maxFiles={5}
            />
            
            {/* Upload Progress */}
            {uploadProgress.length > 0 && (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-4">
                    <h3 className="text-sm font-medium text-white mb-3">
                        {isUploading ? 'Uploading Files...' : 'Upload Complete'}
                    </h3>
                    <div className="space-y-2">
                        {uploadProgress.map((progress, index) => (
                            <div key={index} className="flex items-center space-x-3">
                                {progress.status === 'uploading' && (
                                    <LoadingSpinner size="sm" />
                                )}
                                {progress.status === 'success' && (
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                )}
                                {progress.status === 'error' && (
                                    <AlertCircle className="w-4 h-4 text-red-400" />
                                )}
                                <span className="text-sm text-gray-300 flex-1">
                                    {progress.fileName}
                                </span>
                                {progress.status === 'error' && progress.error && (
                                    <span className="text-xs text-red-400">
                                        {progress.error}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <FileToolbar
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                sort={sort}
                onSortChange={(s) => setSort(s)}
                fileCount={files.length}
            />
            
            {viewMode === 'grid' ? (
                <FileGrid
                    files={sortedFiles}
                    spaceId={spaceId}
                    onFileSelect={(file) => setSelectedFile(file)}
                    onRemoveFile={handleRemoveFile}
                />
            ) : (
                <div className="space-y-2">
                    {sortedFiles.map(file => (
                        <FileListRow
                            key={file.file_id}
                            file={file}
                            onFileSelect={(file) => setSelectedFile(file)}
                            onRemoveFile={handleRemoveFile}
                        />
                    ))}
                </div>
            )}
            
            {selectedFile && (
                <FileDetailsModal
                    file={selectedFile}
                    spaceId={spaceId}
                    isOpen={!!selectedFile}
                    onClose={() => setSelectedFile(null)}
                />
            )}
        </div>
    );
}