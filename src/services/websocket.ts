import { ClientMessage, ServerMessage } from '../../server/protocol';

const WS_URL = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws';

class WebSocketService {
    private ws: WebSocket | null = null;
    private messageListeners: ((message: ServerMessage) => void)[] = [];

    constructor() {
        this.connect();
    }

    private connect() {
        this.ws = new WebSocket(WS_URL);

        this.ws.onopen = () => {
            console.log('WebSocket connection established.');
        };

        this.ws.onmessage = (event) => {
            try {
                const message: ServerMessage = JSON.parse(event.data);
                console.log('Received message from server:', message);
                this.messageListeners.forEach(listener => listener(message));
            } catch (error) {
                console.error('Failed to parse server message:', event.data);
            }
        };

        this.ws.onclose = () => {
            console.log('WebSocket connection closed. Reconnecting...');
            // Simple reconnect logic
            setTimeout(() => this.connect(), 3000);
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    public sendMessage(message: ClientMessage) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.error('WebSocket is not open. Ready state:', this.ws?.readyState);
        }
    }

    public addMessageListener(listener: (message: ServerMessage) => void) {
        this.messageListeners.push(listener);
    }

    public removeMessageListener(listener: (message: ServerMessage) => void) {
        this.messageListeners = this.messageListeners.filter(l => l !== listener);
    }
}

// Export a singleton instance
export const webSocketService = new WebSocketService();