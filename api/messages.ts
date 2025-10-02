/**
 * Vercel API Function: Handle REST messages for production communication
 */

import type { IncomingMessage, ServerResponse } from 'http';

// Communication message interface
interface CommunicationMessage {
  kind: string;
  payload: Record<string, unknown>;
}

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const message: CommunicationMessage = req.body;
    console.log('[API] Received message:', message.kind);

    // Route messages to appropriate handlers
    const response = await handleMessage(message);
    
    res.status(200).json(response);
  } catch (error) {
    console.error('[API] Error handling message:', error);
    res.status(500).json({
      kind: 'error',
      payload: {
        message: error instanceof Error ? error.message : 'Internal server error'
      }
    });
  }
}

async function handleMessage(message: CommunicationMessage): Promise<CommunicationMessage> {
  // For now, we'll implement basic message handling
  // In a real implementation, you'd route these to your actual server logic
  
  switch (message.kind) {
    case 'ping':
      return {
        kind: 'pong',
        payload: { timestamp: Date.now() }
      };
      
    case 'login':
    case 'register':
      // Redirect auth messages to auth endpoint
      return {
        kind: 'redirect',
        payload: { endpoint: '/api/auth', message }
      };
      
    case 'submitPostBeacon':
    case 'follow':
    case 'unfollow':
    case 'createSpace':
      // Handle quantum beacon and social operations
      return {
        kind: 'processing',
        payload: { 
          message: `Processing ${message.kind}`,
          originalKind: message.kind
        }
      };
      
    default:
      return {
        kind: 'echo',
        payload: { 
          message: `Received ${message.kind}`,
          original: message.payload
        }
      };
  }
}