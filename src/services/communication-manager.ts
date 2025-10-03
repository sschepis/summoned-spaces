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

  async connect(): Promise<void> {
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

    // Set up Server-Sent Events for real-time updates
    this.setupSSE();
    this.connected = true;
  }

  private setupSSE(): void {
    if (typeof EventSource === 'undefined') {
      console.warn('[SSE] EventSource not supported, falling back to polling');
      this.setupPolling();
      return;
    }

    // In development, use a different approach since /api routes aren't available
    const isDevelopment = import.meta.env.DEV;
    
    if (isDevelopment) {
      console.log('[SSE] Development mode: Using polling fallback since /api routes not available');
      this.setupPolling();
      return;
    }
    
    const sseUrl = `/api/events${this.userId ? `?userId=${this.userId}` : ''}`;
    this.eventSource = new EventSource(sseUrl);
    
    this.eventSource.onopen = () => {
      console.log('[SSE] Connected to Server-Sent Events');
    };
    
    this.eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (this.messageCallback) {
          this.messageCallback(message);
        }
      } catch (error) {
        console.error('[SSE] Failed to parse message:', error);
      }
    };
    
    this.eventSource.onerror = (error) => {
      console.error('[SSE] EventSource error:', error);
      // Try to reconnect after a delay
      setTimeout(() => {
        if (this.connected) {
          this.setupSSE();
        }
      }, 5000);
    };
  }

  private setupPolling(): void {
    // Fallback polling mechanism
    const poll = async () => {
      if (!this.connected) return;
      
      try {
        const response = await fetch('/api/poll', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionToken: this.sessionToken,
            userId: this.userId
          })
        });
        
        if (response.ok) {
          const messages = await response.json();
          if (messages.length > 0 && this.messageCallback) {
            messages.forEach((message: CommunicationMessage) => {
              this.messageCallback!(message);
            });
          }
        }
      } catch (error) {
        console.error('[POLL] Polling error:', error);
      }
      
      // Poll every 2 seconds
      setTimeout(poll, 2000);
    };
    
    poll();
  }

  async send(message: CommunicationMessage): Promise<void> {
    if (!this.connected) {
      throw new Error('SSE communication not connected');
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
    
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
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