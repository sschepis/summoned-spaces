/**
 * Hybrid Communication Manager
 * Automatically switches between WebSocket (development) and REST/SSE (production)
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

class WebSocketCommunicationManager implements CommunicationManager {
  private ws: WebSocket | null = null;
  private messageCallback: ((message: CommunicationMessage) => void) | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: number | null = null;

  async connect(): Promise<void> {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    console.log('[WS] Attempting to connect to:', wsUrl);
    
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('[WS] Connected successfully');
        this.reconnectAttempts = 0;
        resolve();
      };
      
      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (this.messageCallback) {
            this.messageCallback(message);
          }
        } catch (error) {
          console.error('[WS] Failed to parse message:', error);
        }
      };
      
      this.ws.onclose = (event) => {
        console.log(`[WS] Connection closed. Code: ${event.code}`);
        this.ws = null;
        this.attemptReconnect();
      };
      
      this.ws.onerror = (error) => {
        console.error('[WS] WebSocket error:', error);
        reject(error);
      };
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[WS] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`[WS] Will attempt reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms...`);
    
    this.reconnectTimeout = window.setTimeout(() => {
      this.connect().catch(() => {
        // Reconnection failed, will try again
      });
    }, delay);
  }

  async send(message: CommunicationMessage): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }
    
    this.ws.send(JSON.stringify(message));
  }

  onMessage(callback: (message: CommunicationMessage) => void): void {
    this.messageCallback = callback;
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

class RESTCommunicationManager implements CommunicationManager {
  private messageCallback: ((message: CommunicationMessage) => void) | null = null;
  private eventSource: EventSource | null = null;
  private connected = false;
  private sessionToken: string | null = null;
  private userId: string | null = null;

  async connect(): Promise<void> {
    console.log('[REST] Initializing REST + SSE communication');
    
    // Try to restore session from localStorage
    const savedSession = localStorage.getItem('summoned_spaces_session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        this.sessionToken = session.sessionToken;
        this.userId = session.userId;
      } catch (error) {
        console.warn('[REST] Failed to parse saved session:', error);
      }
    }

    // Set up Server-Sent Events for real-time updates
    this.setupSSE();
    this.connected = true;
  }

  private setupSSE(): void {
    if (typeof EventSource === 'undefined') {
      console.warn('[REST] EventSource not supported, falling back to polling');
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
      throw new Error('REST communication not connected');
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
      throw new Error(`REST request failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Handle immediate responses
    if (result.kind && this.messageCallback) {
      this.messageCallback(result);
    }

    // Handle follow/unfollow notifications in the response
    if (result.payload?.notification && this.messageCallback) {
      console.log('[REST] Processing embedded notification:', result.payload.notification);
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

// Environment detection and manager selection
function createCommunicationManager(): CommunicationManager {
  // Consolidated environment detection (removed duplicate vercel.app checks)
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  
  // Primary detection: Vercel hosting
  const isVercelHostname = hostname.includes('vercel.app');
  
  // Secondary detection: Production indicators
  const isHTTPS = protocol === 'https:';
  const isNotLocalhost = !hostname.includes('localhost') &&
                         !hostname.includes('127.0.0.1') &&
                         hostname !== 'localhost';
  const isNotDevPort = !port ||
                       (port !== '3000' && port !== '5173' && port !== '8080');
  
  // Environment variables
  const isProduction = import.meta.env.PROD;
  const isVercel = import.meta.env.VERCEL === '1';
  const isProductionBuild = import.meta.env.MODE === 'production';
  const vercelEnv = import.meta.env.VERCEL_ENV;
  
  // Single decision point: Use REST for any production indicator
  const shouldUseREST = isVercelHostname ||
                       (isHTTPS && isNotLocalhost && isNotDevPort) ||
                       isProduction ||
                       isVercel ||
                       isProductionBuild ||
                       vercelEnv === 'production' ||
                       vercelEnv === 'preview';
  
  console.log('[COMM] Environment detection:', {
    hostname, protocol, port,
    isVercelHostname, isHTTPS, isNotLocalhost, isNotDevPort,
    isProduction, isVercel, isProductionBuild, vercelEnv,
    shouldUseREST,
    mode: import.meta.env.MODE,
    location: window.location.href
  });
  
  if (shouldUseREST) {
    console.log('[COMM] ✅ Using REST + SSE communication for production/Vercel');
    return new RESTCommunicationManager();
  } else {
    console.log('[COMM] 🔧 Using WebSocket communication for development');
    return new WebSocketCommunicationManager();
  }
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