import { FileCard } from './FileCard';

interface FileRecord {
    file_id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    uploader_id: string;
    created_at: string;
    fingerprint: string;
}

interface FileGridProps {
    files: FileRecord[];
    spaceId: string;
    onFileSelect: (file: FileRecord) => void;
    onRemoveFile: (fileId: string) => void;
}

export function FileGrid({ files, spaceId, onFileSelect, onRemoveFile }: FileGridProps) {
    // Defensive programming - filter out null/undefined files and ensure required properties exist
    const validFiles = (files || []).filter(file => {
        if (!file) return false;
        if (!file.file_id) return false;
        return true;
    });

    const handleFileSelect = (file: FileRecord) => {
        try {
            if (file && onFileSelect) {
                onFileSelect(file);
            }
        } catch (error) {
            console.error('Error selecting file:', error);
        }
    };

    const handleRemoveFile = (fileId: string) => {
        try {
            if (fileId && onRemoveFile) {
                onRemoveFile(fileId);
            }
        } catch (error) {
            console.error('Error removing file:', error);
        }
    };

    if (validFiles.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-400">No files to display</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {validFiles.map((file, index) => {
                // UNIQUE KEY FIX: Generate unique keys to prevent React duplication warnings
                const uniqueKey = file.file_id || `${file.file_name}_${file.file_size}_${index}_${Date.now()}`;
                
                return (
                    <FileCard
                        key={uniqueKey}
                        file={file}
                        spaceId={spaceId}
                        onSelect={() => handleFileSelect(file)}
                        onRemove={() => handleRemoveFile(file.file_id)}
                    />
                );
            })}
        </div>
    );
}