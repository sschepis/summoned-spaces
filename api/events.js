/**
 * Vercel API Function: Server-Sent Events for real-time updates
 * Provides real-time communication when WebSocket is not available
 */

export default async function handler(req, res) {
  // Enable CORS for SSE
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Set up Server-Sent Events headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  console.log('[SSE] Client connected to events stream');

  // Send initial connection message
  res.write(`data: ${JSON.stringify({
    kind: 'connected',
    payload: { 
      message: 'SSE connection established',
      timestamp: Date.now()
    }
  })}\n\n`);

  // Send periodic ping messages to keep connection alive
  const pingInterval = setInterval(() => {
    res.write(`data: ${JSON.stringify({
      kind: 'ping',
      payload: { timestamp: Date.now() }
    })}\n\n`);
  }, 30000); // Every 30 seconds

  // Simulate some real-time updates (in production, these would come from your database/events)
  const updateInterval = setInterval(() => {
    // Send network state updates
    res.write(`data: ${JSON.stringify({
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
    })}\n\n`);
  }, 60000); // Every 60 seconds

  // Clean up on client disconnect
  req.on('close', () => {
    console.log('[SSE] Client disconnected from events stream');
    clearInterval(pingInterval);
    clearInterval(updateInterval);
  });

  req.on('error', (error) => {
    console.error('[SSE] Client connection error:', error);
    clearInterval(pingInterval);
    clearInterval(updateInterval);
  });

  // Keep the connection open
  // Note: Vercel functions have a 10-second timeout by default
  // For longer SSE connections, you'd need to upgrade to Pro plan
}