/**
 * SSE-Only Communication Manager
 * Provides real-time functionality using Server-Sent Events and REST API
 */

interface CommunicationMessage {
  kind: string;
  payload: Record<string, unknown>;
}

interface CommunicationManager {
  connect(): Promise<void>;
  send(message: CommunicationMessage): Promise<void>;
  onMessage(callback: (message: CommunicationMessage) => void): void;
  disconnect(): void;
  isConnected(): boolean;
}

class SSECommunicationManager implements CommunicationManager {
  private messageCallback: ((message: CommunicationMessage) => void) | null = null;
  private eventSource: EventSource | null = null;
  private connected = false;
  private sessionToken: string | null = null;
  private userId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: number | null = null;
  private baseReconnectDelay = 5000; // 5 seconds

  async connect(): Promise<void> {
    // Don't reconnect if already connected
    if (this.connected && this.eventSource) {
      console.log('[SSE] Already connected, skipping duplicate connection');
      return;
    }
    
    console.log('[SSE] Initializing SSE + REST communication');
    
    // Try to restore session from localStorage
    const savedSession = localStorage.getItem('summoned_spaces_session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        this.sessionToken = session.sessionToken;
        this.userId = session.userId;
      } catch (error) {
        console.warn('[SSE] Failed to parse saved session:', error);
      }
    }

    // Mark as connected immediately so send() can work even if SSE setup fails
    // (will use REST-only mode as fallback)
    this.connected = true;
    
    // Set up Server-Sent Events for real-time updates
    this.setupSSE();
  }

  private setupSSE(): void {
    if (typeof EventSource === 'undefined') {
      console.warn('[SSE] EventSource not supported in this browser');
      return;
    }

    // Always try SSE first, regardless of environment
    const sseUrl = `/api/events${this.userId ? `?userId=${this.userId}` : ''}`;
    
    // Try to create EventSource - it will work on Vercel with the api/events.ts handler
    try {
      this.createEventSource(sseUrl);
      console.log('[SSE] Attempting to establish SSE connection to:', sseUrl);
    } catch (error) {
      console.error('[SSE] Failed to create EventSource:', error);
      console.log('[SSE] Falling back to REST API only mode');
    }
  }

  private createEventSource(sseUrl: string): void {
    // Clean up any existing EventSource
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    this.eventSource = new EventSource(sseUrl);
    
    this.eventSource.onopen = () => {
      console.log('[SSE] ✅ Connected to Server-Sent Events');
      console.log('[SSE] Real-time updates are now active');
      // Reset reconnection attempts on successful connection
      this.reconnectAttempts = 0;
    };
    
    this.eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('[SSE] Received real-time message:', message.kind);
        if (this.messageCallback) {
          this.messageCallback(message);
        }
      } catch (error) {
        console.error('[SSE] Failed to parse message:', error);
      }
    };
    
    this.eventSource.onerror = () => {
      // Increment reconnection attempts
      this.reconnectAttempts++;
      
      // Close the current connection
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
      
      // Clear any existing reconnection timeout
      if (this.reconnectTimeout !== null) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
      
      // Check if we've exceeded max reconnection attempts
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error(`[SSE] Max reconnection attempts (${this.maxReconnectAttempts}) reached. Stopping reconnection.`);
        console.log('[SSE] Operating in REST-only mode. Real-time updates disabled.');
        return;
      }
      
      // Calculate exponential backoff delay
      const delay = this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      console.error(`[SSE] Connection error - attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay/1000} seconds`);
      
      // Attempt to reconnect with exponential backoff
      this.reconnectTimeout = window.setTimeout(() => {
        if (this.connected) {
          console.log('[SSE] Attempting to reconnect...');
          this.setupSSE();
        }
      }, delay);
    };
  }


  async send(message: CommunicationMessage): Promise<void> {
    // Auto-connect if not connected yet
    if (!this.connected) {
      console.log('[SSE] Auto-connecting before sending message...');
      await this.connect();
    }

    // Add session info to message if available
    const enhancedMessage = {
      ...message,
      payload: {
        ...message.payload,
        sessionToken: this.sessionToken,
        userId: this.userId
      }
    };

    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(enhancedMessage)
    });

    if (!response.ok) {
      throw new Error(`SSE request failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Handle immediate responses
    if (result.kind && this.messageCallback) {
      this.messageCallback(result);
    }

    // Handle follow/unfollow notifications in the response
    if (result.payload?.notification && this.messageCallback) {
      console.log('[SSE] Processing embedded notification:', result.payload.notification);
      this.messageCallback(result.payload.notification);
    }

    // Store session info if provided
    if (result.payload?.sessionToken) {
      this.sessionToken = result.payload.sessionToken;
      this.userId = result.payload.userId;
      
      localStorage.setItem('summoned_spaces_session', JSON.stringify({
        sessionToken: this.sessionToken,
        userId: this.userId
      }));
    }
  }

  onMessage(callback: (message: CommunicationMessage) => void): void {
    this.messageCallback = callback;
  }

  disconnect(): void {
    this.connected = false;
    
    // Clear any pending reconnection timeout
    if (this.reconnectTimeout !== null) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    // Close EventSource
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    // Reset reconnection attempts
    this.reconnectAttempts = 0;
  }

  isConnected(): boolean {
    return this.connected;
  }
}

// SSE-only manager creation
function createCommunicationManager(): CommunicationManager {
  console.log('[COMM] ✅ Using SSE-only communication for all environments');
  return new SSECommunicationManager();
}

// Dynamic communication manager that re-evaluates environment each time
export const communicationManager = {
  _instance: null as CommunicationManager | null,
  
  getInstance(): CommunicationManager {
    if (!this._instance) {
      this._instance = createCommunicationManager();
    }
    return this._instance;
  },
  
  // Force recreation (useful for environment changes)
  reset(): void {
    if (this._instance) {
      this._instance.disconnect();
    }
    this._instance = null;
  },
  
  // Proxy methods to the actual instance
  async connect(): Promise<void> {
    return this.getInstance().connect();
  },
  
  async send(message: CommunicationMessage): Promise<void> {
    return this.getInstance().send(message);
  },
  
  onMessage(callback: (message: CommunicationMessage) => void): void {
    return this.getInstance().onMessage(callback);
  },
  
  disconnect(): void {
    return this.getInstance().disconnect();
  },
  
  isConnected(): boolean {
    return this.getInstance().isConnected();
  }
};

export type { CommunicationMessage, CommunicationManager };