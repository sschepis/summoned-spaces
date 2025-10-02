/**
 * Vercel API Function: Handle REST messages for production communication
 * Simple JavaScript version that works reliably with Vercel
 */

export default async function handler(req, res) {
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
    const message = req.body;
    console.log('[API] Received message:', message.kind);

    // Route messages to appropriate handlers
    const response = await handleMessage(message);
    
    res.status(200).json(response);
  } catch (error) {
    console.error('[API] Error handling message:', error);
    res.status(500).json({
      kind: 'error',
      payload: {
        message: error.message || 'Internal server error'
      }
    });
  }
}

async function handleMessage(message) {
  // Basic message handling for production
  switch (message.kind) {
    case 'ping':
      return {
        kind: 'pong',
        payload: { timestamp: Date.now() }
      };
      
    case 'login':
    case 'register':
      // Auth messages will be handled by separate auth endpoint
      return {
        kind: 'redirect',
        payload: { endpoint: '/api/auth', message }
      };
      
    case 'submitPostBeacon':
      return {
        kind: 'submitPostSuccess',
        payload: { 
          message: 'Post beacon submitted (production mode)',
          timestamp: Date.now()
        }
      };
      
    case 'follow':
      return {
        kind: 'followSuccess',
        payload: { 
          userIdToFollow: message.payload.userIdToFollow,
          message: 'Follow action completed (production mode)'
        }
      };
      
    case 'getBeaconsByUser':
      return {
        kind: 'beaconsResponse',
        payload: { 
          beacons: [],
          message: 'Production mode: Connect to full backend for data'
        }
      };
      
    case 'search':
      return {
        kind: 'searchResponse',
        payload: { 
          users: [],
          spaces: [],
          beacons: [],
          message: 'Production mode: Connect to full backend for search'
        }
      };
      
    default:
      return {
        kind: 'echo',
        payload: { 
          message: `Received ${message.kind} (production mode)`,
          original: message.payload
        }
      };
  }
}