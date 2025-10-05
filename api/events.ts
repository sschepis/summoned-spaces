/**
 * Vercel API Function: Server-Sent Events for real-time updates
 * TypeScript version with proper typing and message queue support
 */

import type { IncomingMessage, ServerResponse } from 'http';

interface VercelRequest extends IncomingMessage {
  query: Record<string, string | string[]>;
  body?: unknown;
}

interface SSEMessage {
  kind: string;
  payload: Record<string, unknown>;
}

// Simple in-memory message queue - in production use Redis
const messageQueues = new Map<string, SSEMessage[]>();

// Active connections tracking
const activeConnections = new Map<string, ServerResponse>();

// Helper to queue messages for a user
export function queueMessage(userId: string, message: SSEMessage): void {
  if (!messageQueues.has(userId)) {
    messageQueues.set(userId, []);
  }
  const queue = messageQueues.get(userId)!;
  queue.push(message);
  
  // Keep only last 100 messages per user
  if (queue.length > 100) {
    queue.shift();
  }
  
  // Try to deliver immediately if user is connected
  const connection = activeConnections.get(userId);
  if (connection) {
    try {
      connection.write(`data: ${JSON.stringify(message)}\n\n`);
      // Remove from queue if delivered
      const index = queue.indexOf(message);
      if (index > -1) {
        queue.splice(index, 1);
      }
    } catch (error) {
      // Connection might be closed, keep in queue
      console.error('[SSE] Failed to deliver message immediately:', error);
    }
  }
}

function getQueuedMessages(userId: string): SSEMessage[] {
  const messages = messageQueues.get(userId) || [];
  messageQueues.delete(userId); // Clear after retrieval
  return messages;
}

export default async function handler(req: VercelRequest, res: ServerResponse): Promise<void> {
  // Enable CORS for SSE
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  // Set up Server-Sent Events headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx buffering

  // Get user ID from query params
  const userId = req.query.userId as string | undefined;
  
  console.log('[SSE] Client connected to events stream', userId ? `(user: ${userId})` : '(anonymous)');

  // Send initial connection message
  const connectionMessage: SSEMessage = {
    kind: 'connected',
    payload: {
      message: 'SSE connection established',
      timestamp: Date.now(),
      userId
    }
  };
  
  res.write(`data: ${JSON.stringify(connectionMessage)}\n\n`);

  // Store connection if user ID provided
  if (userId) {
    activeConnections.set(userId, res);
    
    // Send any queued messages immediately
    const queuedMessages = getQueuedMessages(userId);
    queuedMessages.forEach(message => {
      try {
        res.write(`data: ${JSON.stringify(message)}\n\n`);
      } catch (error) {
        console.error('[SSE] Error sending queued message:', error);
      }
    });
  }

  // Send periodic ping messages to keep connection alive
  const pingInterval = setInterval(() => {
    const pingMessage: SSEMessage = {
      kind: 'heartbeat',
      payload: { timestamp: Date.now() }
    };
    
    try {
      res.write(`data: ${JSON.stringify(pingMessage)}\n\n`);
    } catch (error) {
      console.error('[SSE] Error sending ping:', error);
      clearInterval(pingInterval);
      if (userId) {
        activeConnections.delete(userId);
      }
    }
  }, 30000); // Every 30 seconds

  // Check for new queued messages periodically
  let messageCheckInterval: NodeJS.Timeout | undefined;
  if (userId) {
    messageCheckInterval = setInterval(() => {
      const messages = messageQueues.get(userId);
      if (messages && messages.length > 0) {
        const messagesToSend = [...messages];
        messageQueues.set(userId, []); // Clear queue
        
        messagesToSend.forEach(message => {
          try {
            res.write(`data: ${JSON.stringify(message)}\n\n`);
          } catch (error) {
            // Connection closed, re-queue messages
            if (!messageQueues.has(userId)) {
              messageQueues.set(userId, []);
            }
            messageQueues.get(userId)!.push(message);
            
            if (messageCheckInterval) {
              clearInterval(messageCheckInterval);
            }
            clearInterval(pingInterval);
            activeConnections.delete(userId);
          }
        });
      }
    }, 1000); // Check every second
  }

  // Clean up on client disconnect
  req.on('close', () => {
    console.log('[SSE] Client disconnected from events stream', userId ? `(user: ${userId})` : '(anonymous)');
    clearInterval(pingInterval);
    if (messageCheckInterval) {
      clearInterval(messageCheckInterval);
    }
    if (userId) {
      activeConnections.delete(userId);
    }
  });

  req.on('error', (error: Error & { code?: string }) => {
    // ECONNRESET is normal when client navigates away or refreshes
    // Don't log it as an error
    if (error.code === 'ECONNRESET') {
      console.log('[SSE] Client connection reset (normal during navigation/refresh)');
    } else {
      console.error('[SSE] Client connection error:', error);
    }
    clearInterval(pingInterval);
    if (messageCheckInterval) {
      clearInterval(messageCheckInterval);
    }
    if (userId) {
      activeConnections.delete(userId);
    }
  });

  // Keep the connection open
  // Note: Vercel functions have timeout limits
  // For longer SSE connections, consider upgrading plan or using external service
}