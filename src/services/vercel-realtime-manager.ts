/**
 * Vercel-Compatible Real-time Manager
 * Uses intelligent polling since Vercel doesn't support long-lived SSE connections
 */

import { communicationManager, type CommunicationMessage } from './communication-manager';

interface PollConfig {
  baseInterval: number;  // Base polling interval in ms
  maxInterval: number;   // Maximum polling interval in ms
  backoffMultiplier: number; // How much to increase interval on empty responses
}

class VercelRealtimeManager {
  private pollInterval: number;
  private pollTimer: NodeJS.Timeout | null = null;
  private lastMessageTime: number = Date.now();
  private messageCallbacks: ((message: CommunicationMessage) => void)[] = [];
  private isPolling: boolean = false;
  private userId: string | null = null;
  
  private config: PollConfig = {
    baseInterval: 2000,      // Start with 2 second polls
    maxInterval: 10000,      // Max 10 seconds between polls
    backoffMultiplier: 1.5   // Increase by 50% each time
  };

  constructor() {
    this.pollInterval = this.config.baseInterval;
  }

  async start(userId?: string) {
    if (this.isPolling) return;
    
    this.userId = userId || null;
    this.isPolling = true;
    this.lastMessageTime = Date.now();
    
    console.log('[Vercel Realtime] Starting intelligent polling system');
    this.startPolling();
  }

  stop() {
    this.isPolling = false;
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
    console.log('[Vercel Realtime] Stopped polling');
  }

  onMessage(callback: (message: CommunicationMessage) => void) {
    this.messageCallbacks.push(callback);
  }

  private async startPolling() {
    if (!this.isPolling) return;

    try {
      // Poll for new messages
      const response = await fetch('/api/poll-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId,
          lastMessageTime: this.lastMessageTime
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.messages && data.messages.length > 0) {
          // We got messages! Reset interval to base
          this.pollInterval = this.config.baseInterval;
          this.lastMessageTime = Date.now();
          
          // Deliver messages to callbacks
          data.messages.forEach((message: CommunicationMessage) => {
            console.log('[Vercel Realtime] Received message:', message.kind);
            this.messageCallbacks.forEach(callback => callback(message));
          });
        } else {
          // No messages, increase interval (backoff)
          this.pollInterval = Math.min(
            this.pollInterval * this.config.backoffMultiplier,
            this.config.maxInterval
          );
        }
      }
    } catch (error) {
      console.error('[Vercel Realtime] Poll error:', error);
      // On error, use max interval
      this.pollInterval = this.config.maxInterval;
    }

    // Schedule next poll
    if (this.isPolling) {
      this.pollTimer = setTimeout(() => this.startPolling(), this.pollInterval);
    }
  }

  // Send a message and immediately poll for response
  async sendAndPoll(message: CommunicationMessage) {
    // Send via normal communication manager
    await communicationManager.send(message);
    
    // Immediately poll for response
    this.pollInterval = this.config.baseInterval;
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
    }
    this.startPolling();
  }
}

// Export singleton instance
export const vercelRealtimeManager = new VercelRealtimeManager();

// Auto-detect Vercel and use polling
export function setupRealtimeForEnvironment() {
  const isVercel = window.location.hostname.includes('vercel.app') || 
                   window.location.hostname.includes('.vercel.app');
  
  if (isVercel) {
    console.log('[Realtime] Detected Vercel environment - using intelligent polling');
    
    // Override communicationManager's onMessage to use polling
    const originalOnMessage = communicationManager.onMessage.bind(communicationManager);
    communicationManager.onMessage = (callback: (message: CommunicationMessage) => void) => {
      // Register with both systems
      originalOnMessage(callback);
      vercelRealtimeManager.onMessage(callback);
    };
    
    // Start polling when communication manager connects
    const originalConnect = communicationManager.connect.bind(communicationManager);
    communicationManager.connect = async () => {
      await originalConnect();
      const userId = localStorage.getItem('summoned_spaces_session') 
        ? JSON.parse(localStorage.getItem('summoned_spaces_session')!).userId 
        : null;
      vercelRealtimeManager.start(userId);
    };
    
    // Stop polling on disconnect
    const originalDisconnect = communicationManager.disconnect.bind(communicationManager);
    communicationManager.disconnect = () => {
      originalDisconnect();
      vercelRealtimeManager.stop();
    };
  }
}