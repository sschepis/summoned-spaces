/**
 * Vercel API Function: Server-Sent Events for real-time updates
 * TypeScript version with proper typing
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

  console.log('[SSE] Client connected to events stream');

  // Send initial connection message
  const connectionMessage: SSEMessage = {
    kind: 'connected',
    payload: { 
      message: 'SSE connection established',
      timestamp: Date.now()
    }
  };
  
  res.write(`data: ${JSON.stringify(connectionMessage)}\n\n`);

  // Send periodic ping messages to keep connection alive
  const pingInterval = setInterval(() => {
    const pingMessage: SSEMessage = {
      kind: 'ping',
      payload: { timestamp: Date.now() }
    };
    
    try {
      res.write(`data: ${JSON.stringify(pingMessage)}\n\n`);
    } catch (error) {
      console.error('[SSE] Error sending ping:', error);
      clearInterval(pingInterval);
    }
  }, 30000); // Every 30 seconds

  // Simulate some real-time updates for production
  const updateInterval = setInterval(() => {
    const networkUpdate: SSEMessage = {
      kind: 'networkStateUpdate',
      payload: {
        nodes: [{
          nodeId: 'production-node-1',
          userId: 'system',
          username: 'System',
          status: 'running',
          timestamp: Date.now()
        }]
      }
    };
    
    try {
      res.write(`data: ${JSON.stringify(networkUpdate)}\n\n`);
    } catch (error) {
      console.error('[SSE] Error sending update:', error);
      clearInterval(updateInterval);
      clearInterval(pingInterval);
    }
  }, 60000); // Every 60 seconds

  // Clean up on client disconnect
  req.on('close', () => {
    console.log('[SSE] Client disconnected from events stream');
    clearInterval(pingInterval);
    clearInterval(updateInterval);
  });

  req.on('error', (error: Error) => {
    console.error('[SSE] Client connection error:', error);
    clearInterval(pingInterval);
    clearInterval(updateInterval);
  });

  // Keep the connection open
  // Note: Vercel functions have timeout limits
  // For longer SSE connections, consider upgrading plan or using external service
}