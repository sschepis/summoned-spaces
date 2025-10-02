import { UploadCloud, AlertCircle } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadZoneProps {
    onUpload: (files: File[]) => void;
    maxFileSize?: number; // in bytes
    maxFiles?: number;
    acceptedFileTypes?: string[];
}

export function FileUploadZone({
    onUpload,
    maxFileSize = 100 * 1024 * 1024, // 100MB default
    maxFiles = 10,
    acceptedFileTypes
}: FileUploadZoneProps) {
    const [uploadError, setUploadError] = useState<string | null>(null);

    const validateFiles = (files: File[]): { valid: File[], errors: string[] } => {
        const errors: string[] = [];
        const valid: File[] = [];

        if (files.length > maxFiles) {
            errors.push(`Cannot upload more than ${maxFiles} files at once`);
            return { valid: [], errors };
        }

        for (const file of files) {
            if (file.size > maxFileSize) {
                errors.push(`File "${file.name}" is too large (max ${Math.round(maxFileSize / (1024 * 1024))}MB)`);
                continue;
            }

            if (acceptedFileTypes && !acceptedFileTypes.some(type =>
                file.type.includes(type) || file.name.toLowerCase().endsWith(type)
            )) {
                errors.push(`File "${file.name}" type not supported`);
                continue;
            }

            valid.push(file);
        }

        return { valid, errors };
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setUploadError(null);
        
        try {
            const { valid, errors } = validateFiles(acceptedFiles);
            
            if (errors.length > 0) {
                setUploadError(errors.join(', '));
                return;
            }

            if (valid.length > 0) {
                onUpload(valid);
            }
        } catch (error) {
            console.error('Error processing dropped files:', error);
            setUploadError('Failed to process files');
        }
    }, [onUpload, maxFileSize, maxFiles, acceptedFileTypes]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true,
        noClick: true // Prevent default click to use our custom handler
    });

    const openFilePicker = async (event: React.MouseEvent) => {
        event.stopPropagation();
        setUploadError(null);

        try {
            // Check if File System Access API is supported
            if ('showOpenFilePicker' in window) {
                try {
                    const handles = await (window as any).showOpenFilePicker({
                        multiple: true,
                        excludeAcceptAllOption: false,
                        types: acceptedFileTypes ? [{
                            description: 'Allowed files',
                            accept: acceptedFileTypes.reduce((acc, type) => {
                                acc[type] = [type];
                                return acc;
                            }, {} as Record<string, string[]>)
                        }] : undefined
                    });
                    
                    const files = await Promise.all(handles.map(async (handle: any) => {
                        const file = await handle.getFile();
                        return file;
                    }));
                    
                    const { valid, errors } = validateFiles(files);
                    
                    if (errors.length > 0) {
                        setUploadError(errors.join(', '));
                        return;
                    }

                    if (valid.length > 0) {
                        onUpload(valid);
                    }
                } catch (err: any) {
                    if (err.name !== 'AbortError') { // User cancelled
                        console.error('File System Access API error:', err);
                        setUploadError('Failed to open file picker');
                    }
                }
            } else {
                // Fallback to traditional file input
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                if (acceptedFileTypes) {
                    input.accept = acceptedFileTypes.join(',');
                }
                
                input.onchange = (e) => {
                    const files = Array.from((e.target as HTMLInputElement).files || []);
                    const { valid, errors } = validateFiles(files);
                    
                    if (errors.length > 0) {
                        setUploadError(errors.join(', '));
                        return;
                    }

                    if (valid.length > 0) {
                        onUpload(valid);
                    }
                };
                
                input.click();
            }
        } catch (error) {
            console.error('Error opening file picker:', error);
            setUploadError('Failed to open file picker');
        }
    };

    return (
        <div className="space-y-2">
            <div
                {...getRootProps()}
                className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
                    ${isDragActive ? 'border-cyan-400 bg-cyan-500/10' : 'border-gray-600 hover:border-gray-500'}
                    ${uploadError ? 'border-red-500 bg-red-500/5' : ''}`}
                onClick={openFilePicker}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center">
                    <UploadCloud className="w-12 h-12 text-gray-500 mb-4" />
                    <p className="text-lg text-white">Drag & drop files here, or click to select</p>
                    <p className="text-sm text-gray-400">
                        Max {Math.round(maxFileSize / (1024 * 1024))}MB per file, up to {maxFiles} files
                    </p>
                </div>
            </div>
            
            {uploadError && (
                <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-400">{uploadError}</p>
                </div>
            )}
        </div>
    );
}