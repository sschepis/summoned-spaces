/* eslint-disable @typescript-eslint/no-explicit-any */
import { communicationManager, type CommunicationMessage } from './communication-manager';

/**
 * Download a file from a space using SSE + REST API
 */
export async function downloadFile(spaceId: string, fingerprint: string, fileName: string, fileType: string): Promise<void> {
    try {
        console.log(`[FileDownload] Requesting download for ${fileName} (${fingerprint})`);
        
        // Set up listener for download response
        const downloadPromise = new Promise<string>((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Download request timed out'));
            }, 30000); // 30 second timeout

            const handleMessage = (message: CommunicationMessage) => {
                if (message.kind === 'downloadFileResponse' &&
                    (message.payload as any).fingerprint === fingerprint) {
                    clearTimeout(timeout);
                    
                    const payload = message.payload as any;
                    if (!payload.success || !payload.content) {
                        reject(new Error(payload.error || 'Failed to download file content'));
                    } else {
                        resolve(payload.content);
                    }
                }
            };

            // Register message handler
            communicationManager.onMessage(handleMessage);
        });

        // Send download request
        await communicationManager.send({
            kind: 'downloadFile',
            payload: { spaceId, fingerprint }
        });

        // Wait for response via SSE
        const base64Content = await downloadPromise;
        const binaryData = atob(base64Content);
        const bytes = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
            bytes[i] = binaryData.charCodeAt(i);
        }
        
        const blob = new Blob([bytes], { type: fileType || 'application/octet-stream' });
        
        // Trigger download using modern File System Access API or fallback
        await triggerDownload(blob, fileName);
        
        console.log(`[FileDownload] Successfully downloaded ${fileName}`);
    } catch (error) {
        console.error(`[FileDownload] Error downloading ${fileName}:`, error);
        throw error;
    }
}

/**
 * Trigger file download using the most appropriate method
 */
async function triggerDownload(blob: Blob, fileName: string): Promise<void> {
    try {
        // Try File System Access API first (Chrome/Edge)
        if ('showSaveFilePicker' in window) {
            try {
                const handle = await (window as any).showSaveFilePicker({
                    suggestedName: fileName,
                    types: [{
                        description: 'Files',
                        accept: { '*/*': ['*'] }
                    }]
                });
                
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
                return;
            } catch (err: any) {
                if (err.name === 'AbortError') {
                    // User cancelled, not an error
                    return;
                }
                // Fall through to fallback method
                console.warn('[FileDownload] File System Access API failed, using fallback:', err);
            }
        }

        // Fallback: Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up URL
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        
    } catch (error) {
        console.error('[FileDownload] Error triggering download:', error);
        throw new Error('Failed to save file');
    }
}