// DEPRECATED: WebSocket service has been replaced with SSE-based communication
// This file provides compatibility shims for the migration period
// All functionality now uses the communication manager with SSE

import { communicationManager, type CommunicationMessage } from './communication-manager';
import type { ClientMessage, ServerMessage, FollowNotificationMessage } from '../../server/protocol';

// Legacy WebSocket service interface for backward compatibility
export class WebSocketService {
    private messageListeners: ((message: ServerMessage) => void)[] = [];
    private notificationListeners: ((notification: FollowNotificationMessage) => void)[] = [];
    private reconnectionListeners: (() => void)[] = [];

    constructor() {
        console.log('[WebSocket] DEPRECATED: WebSocket service replaced with SSE communication');
        
        // Set up communication manager listener to forward messages to legacy listeners
        communicationManager.onMessage((message: CommunicationMessage) => {
            const serverMessage = message as ServerMessage;
            
            // Forward to message listeners
            this.messageListeners.forEach(listener => {
                try {
                    listener(serverMessage);
                } catch (error) {
                    console.error('[WebSocket] Error in message listener:', error);
                }
            });
            
            // Handle follow notifications
            if (serverMessage.kind === 'followNotification') {
                this.notificationListeners.forEach(listener => {
                    try {
                        listener(serverMessage as FollowNotificationMessage);
                    } catch (error) {
                        console.error('[WebSocket] Error in notification listener:', error);
                    }
                });
            }
        });
        
        // Auto-connect
        communicationManager.connect().catch(error => {
            console.error('[WebSocket] Failed to connect via communication manager:', error);
        });
    }

    public sendMessage(message: ClientMessage): void {
        console.log('[WebSocket] DEPRECATED: Forwarding message to communication manager:', message.kind);
        communicationManager.send(message as CommunicationMessage).catch(error => {
            console.error('[WebSocket] Error sending message via communication manager:', error);
        });
    }

    public isReady(): boolean {
        return communicationManager.isConnected();
    }

    public waitForConnection(): Promise<void> {
        return communicationManager.connect();
    }

    public addMessageListener(listener: (message: ServerMessage) => void): void {
        this.messageListeners.push(listener);
    }

    public removeMessageListener(listener: (message: ServerMessage) => void): void {
        this.messageListeners = this.messageListeners.filter(l => l !== listener);
    }

    public addNotificationListener(listener: (notification: FollowNotificationMessage) => void): void {
        this.notificationListeners.push(listener);
    }

    public removeNotificationListener(listener: (notification: FollowNotificationMessage) => void): void {
        this.notificationListeners = this.notificationListeners.filter(l => l !== listener);
    }

    public addReconnectionListener(listener: () => void): void {
        this.reconnectionListeners.push(listener);
    }

    public removeReconnectionListener(listener: () => void): void {
        this.reconnectionListeners = this.reconnectionListeners.filter(l => l !== listener);
    }

    public sendFollowMessage(userIdToFollow: string): void {
        this.sendMessage({
            kind: 'follow',
            payload: { userIdToFollow }
        });
    }

    public sendUnfollowMessage(userIdToUnfollow: string): void {
        this.sendMessage({
            kind: 'unfollow',
            payload: { userIdToUnfollow }
        });
    }
}

// Export a singleton instance for backward compatibility
const webSocketService = new WebSocketService();
export default webSocketService;
