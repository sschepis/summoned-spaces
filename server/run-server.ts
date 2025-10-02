#!/usr/bin/env node

import { createServer } from 'http';
import { createWebSocketServer } from './main.js';

const PORT = process.env.PORT || 8080;

// Create HTTP server
const server = createServer((req, res) => {
  // Simple health check endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }));
    return;
  }
  
  // Default response
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('WebSocket server running. Connect to /ws');
});

// Create WebSocket server
createWebSocketServer(server);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Summoned Spaces WebSocket server running on port ${PORT}`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}/ws`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n💫 Gracefully shutting down WebSocket server...');
  server.close(() => {
    console.log('✨ Server closed. Goodbye!');
    process.exit(0);
  });
});