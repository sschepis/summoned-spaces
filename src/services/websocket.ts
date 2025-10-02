import { ClientMessage, ServerMessage, FollowNotificationMessage } from '../../server/protocol';

const WS_URL = typeof window !== 'undefined'
    ? (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws'
    : 'ws://localhost:5173/ws';

export class WebSocketService {
    private ws: WebSocket | null = null;
    private messageListeners: ((message: ServerMessage) => void)[] = [];
    private notificationListeners: ((notification: FollowNotificationMessage) => void)[] = [];
    private reconnectionListeners: (() => void)[] = [];
    private messageQueue: ClientMessage[] = [];
    private isConnected = false;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000; // Start with 1 second

    constructor() {
        this.connect();
    }

    private connect() {
        console.log('[WS] Attempting to connect to:', WS_URL);
        console.log('[WS] User Agent:', typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown');
        
        // Detect browser types
        const isSafari = typeof navigator !== 'undefined' &&
            /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        const isChrome = typeof navigator !== 'undefined' &&
            /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        
        if (isSafari) {
            console.log('[WS] Safari detected, applying Safari-specific handling');
        }
        if (isChrome) {
            console.log('[WS] Chrome detected, applying Chrome-specific handling');
        }
        
        this.ws = new WebSocket(WS_URL);

        this.ws.onopen = () => {
            console.log('[WS] WebSocket connection established.');
            this.isConnected = true;
            
            // Browser-specific delays to ensure connection is fully established
            const processQueue = () => {
                // Send any queued messages
                console.log('[WS] Processing message queue, length:', this.messageQueue.length);
                while (this.messageQueue.length > 0) {
                    const message = this.messageQueue.shift();
                    if (message) {
                        console.log('[WS] Sending queued message:', message.kind);
                        this.sendMessage(message);
                    }
                }
                
                // Notify reconnection listeners (for session restoration)
                console.log('[WS] Notifying', this.reconnectionListeners.length, 'reconnection listeners');
                this.reconnectionListeners.forEach(listener => listener());
            };
            
            // Chrome and Safari both need delays, but for different reasons
            // Safari: connection stabilization
            // Chrome: race condition prevention on page refresh
            if (isSafari || isChrome) {
                const delay = isChrome ? 200 : 100;
                console.log(`[WS] Adding ${delay}ms delay before processing queue`);
                setTimeout(processQueue, delay);
            } else {
                processQueue();
            }
        };

        this.ws.onmessage = (event) => {
            try {
                const message: ServerMessage = JSON.parse(event.data);
                console.log('[WS] Received message:', message.kind);
                if (message.kind === 'sessionRestored' || message.kind === 'error') {
                    console.log('[WS] Full message:', JSON.stringify(message, null, 2));
                }
                
                // Handle follow notifications separately
                if (message.kind === 'followNotification') {
                    this.notificationListeners.forEach(listener => listener(message));
                }
                
                this.messageListeners.forEach(listener => {
                    listener(message);
                });
            } catch (e) {
                console.error('[WS] Failed to parse server message:', event.data, e);
            }
        };

        this.ws.onclose = (event) => {
            console.log('[WS] WebSocket connection closed. Code:', event.code, 'Reason:', event.reason);
            this.isConnected = false;
            
            // Enhanced reconnect logic with exponential backoff
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectAttempts++;
                const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
                console.log(`[WS] Will attempt reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms...`);
                setTimeout(() => this.connect(), delay);
            } else {
                console.error('[WS] Max reconnection attempts reached. Please refresh the page.');
            }
        };

        this.ws.onerror = (error) => {
            console.error('[WS] WebSocket error:', error);
            
            // Safari specific: Sometimes onerror fires without onclose
            if (isSafari && this.ws?.readyState === WebSocket.CLOSED) {
                this.ws.onclose?.(new CloseEvent('close'));
            }
        };
        
        // Reset reconnect attempts on successful connection
        this.ws.addEventListener('open', () => {
            this.reconnectAttempts = 0;
        });
    }

    public sendMessage(message: ClientMessage) {
        if (this.ws?.readyState === WebSocket.OPEN && this.isConnected) {
            console.log('[WS] Sending message:', message.kind);
            try {
                this.ws.send(JSON.stringify(message));
            } catch (error) {
                console.error('[WS] Error sending message:', error);
                // Re-queue the message
                this.messageQueue.push(message);
                this.isConnected = false;
            }
        } else {
            console.log('[WS] WebSocket not ready (readyState:', this.ws?.readyState, ', isConnected:', this.isConnected, '), queuing message:', message.kind);
            this.messageQueue.push(message);
        }
    }

    public isReady(): boolean {
        return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
    }

    public waitForConnection(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.isReady()) {
                resolve();
                return;
            }
            
            let attempts = 0;
            const maxAttempts = 100; // 10 seconds total
            
            const checkConnection = () => {
                if (this.isReady()) {
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject(new Error('WebSocket connection timeout'));
                } else {
                    attempts++;
                    setTimeout(checkConnection, 100);
                }
            };
            
            checkConnection();
        });
    }

    public addMessageListener(listener: (message: ServerMessage) => void) {
        this.messageListeners.push(listener);
    }

    public removeMessageListener(listener: (message: ServerMessage) => void) {
        this.messageListeners = this.messageListeners.filter(l => l !== listener);
    }

    public addNotificationListener(listener: (notification: FollowNotificationMessage) => void) {
        this.notificationListeners.push(listener);
    }

    public removeNotificationListener(listener: (notification: FollowNotificationMessage) => void) {
        this.notificationListeners = this.notificationListeners.filter(l => l !== listener);
    }

    public addReconnectionListener(listener: () => void) {
        this.reconnectionListeners.push(listener);
    }

    public removeReconnectionListener(listener: () => void) {
        this.reconnectionListeners = this.reconnectionListeners.filter(l => l !== listener);
    }

    public sendFollowMessage(userIdToFollow: string) {
        this.sendMessage({
            kind: 'follow',
            payload: { userIdToFollow }
        });
    }

    public sendUnfollowMessage(userIdToUnfollow: string) {
        this.sendMessage({
            kind: 'unfollow',
            payload: { userIdToUnfollow }
        });
    }
}

// Export a singleton instance
const webSocketService = new WebSocketService();
export default webSocketService;