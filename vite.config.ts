import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'

// Development mode space storage
const devSpaces: Array<{
  space_id: string;
  name: string;
  description: string;
  is_public: number;
  created_at: string;
}> = [];

function ssePlugin(): Plugin {
  return {
    name: 'sse-communication',
    configureServer(server) {
      // SSE-based communication enabled - no WebSocket server needed
      console.log('SSE-based communication enabled - using /v1/events endpoint');
      
      // Add middleware to handle /v1 routes in development
      server.middlewares.use('/v1', async (req, res, next) => {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }
        
        // Handle /v1/auth/login endpoint
        // In dev mode, just use simple in-memory auth for testing
        if (req.url === '/auth/login' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', () => {
            try {
              const credentials = JSON.parse(body);
              console.log('[DEV API] Login attempt:', credentials.username);
              
              const username = credentials.username || 'devuser';
              const userId = 'dev_' + Math.random().toString(36).substr(2, 9);
              
              const response = {
                success: true,
                payload: {
                  sessionToken: 'dev_session_' + Date.now(),
                  userId: userId,
                  username: username,
                  avatar: '',
                  bio: 'Development user',
                  stats: { followers: 0, following: 0, spaces: 0, resonanceScore: 0.5 },
                  recentActivity: 'Just logged in',
                  tags: [],
                  pri: {
                    nodeAddress: userId,
                    publicResonance: {
                      primaryPrimes: [2, 3, 5, 7, 11],
                      harmonicPrimes: [13, 17, 19, 23]
                    },
                    fingerprint: 'dev_fingerprint_' + userId
                  }
                }
              };
              
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify(response));
            } catch (error) {
              console.error('[DEV API] Login error:', error);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Invalid request' }));
            }
          });
          return;
        }
        
        // Handle /v1/messages endpoint
        if (req.url === '/messages' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', () => {
            try {
              const message = JSON.parse(body);
              console.log('[DEV API] Received message:', message.kind);
              
              // Return appropriate response based on message kind
              let response;
              
              if (message.kind === 'login') {
                // Return proper login success with PRI data
                const username = message.payload?.username || 'devuser';
                const userId = 'dev_' + Math.random().toString(36).substr(2, 9);
                
                response = {
                  kind: 'loginSuccess',
                  payload: {
                    sessionToken: 'dev_session_' + Date.now(),
                    userId: userId,
                    username: username,
                    pri: {
                      nodeAddress: userId,
                      publicResonance: {
                        primaryPrimes: [2, 3, 5, 7, 11],
                        harmonicPrimes: [13, 17, 19, 23]
                      },
                      fingerprint: 'dev_fingerprint_' + userId
                    }
                  }
                };
              } else if (message.kind === 'getPublicSpaces') {
                // Return spaces in production API format
                response = {
                  kind: 'publicSpacesResponse',
                  payload: {
                    spaces: devSpaces,
                    totalSpaces: devSpaces.length,
                    page: 1,
                    hasMore: false
                  }
                };
              } else if (message.kind === 'createSpace') {
                // Store created space in dev spaces array
                const newSpace = {
                  space_id: `space_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                  name: message.payload.name,
                  description: message.payload.description,
                  is_public: message.payload.isPublic ? 1 : 0,
                  created_at: new Date().toISOString()
                };
                devSpaces.push(newSpace);
                
                console.log(`[DEV API] Created space: ${newSpace.space_id}, total spaces: ${devSpaces.length}`);
                
                response = {
                  kind: 'createSpaceSuccess',
                  payload: {
                    spaceId: newSpace.space_id,
                    name: newSpace.name,
                    description: newSpace.description,
                    isPublic: message.payload.isPublic,
                    message: 'Space created successfully'
                  }
                };
              } else {
                response = {
                  kind: message.kind === 'register' ? 'registerSuccess' : 'success',
                  payload: {
                    message: 'Development mode - no backend connected',
                    note: 'Run backend server for full functionality',
                    original: message
                  }
                };
              }
              
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify(response));
            } catch {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Invalid request' }));
            }
          });
          return;
        }
        
        // Handle /v1/events endpoint for SSE
        if (req.url?.startsWith('/events')) {
          console.log('[DEV API] SSE client connected to /v1/events');
          
          // Set SSE headers
          res.setHeader('Content-Type', 'text/event-stream');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Connection', 'keep-alive');
          res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering for SSE
          
          // Prevent the response from timing out
          res.socket?.setTimeout(0);
          res.socket?.setNoDelay(true);
          res.socket?.setKeepAlive(true);
          
          // Send initial connection message
          const connectionMessage = {
            kind: 'connected',
            payload: {
              message: 'SSE connection established (dev mode)',
              timestamp: Date.now()
            }
          };
          
          res.write(`data: ${JSON.stringify(connectionMessage)}\n\n`);
          
          // Send periodic ping messages
          const pingInterval = setInterval(() => {
            const pingMessage = {
              kind: 'ping',
              payload: { timestamp: Date.now() }
            };
            
            try {
              // Check if connection is still writable before writing
              if (!res.writableEnded) {
                res.write(`data: ${JSON.stringify(pingMessage)}\n\n`);
              } else {
                clearInterval(pingInterval);
              }
            } catch (error) {
              console.error('[DEV API] Error sending SSE ping:', error);
              clearInterval(pingInterval);
            }
          }, 30000); // Every 30 seconds
          
          // Clean up on disconnect
          req.on('close', () => {
            console.log('[DEV API] SSE client disconnected');
            clearInterval(pingInterval);
          });
          
          req.on('error', (error: Error & { code?: string }) => {
            // ECONNRESET is normal when client navigates away or refreshes
            // Don't log it as an error
            if (error.code === 'ECONNRESET') {
              console.log('[DEV API] SSE client connection reset (normal during navigation/refresh)');
            } else {
              console.error('[DEV API] SSE connection error:', error);
            }
            clearInterval(pingInterval);
          });
          
          // Don't end the response - keep it open for SSE
          return; // Don't call next()
        }
        
        // Pass through to other handlers
        next();
      });
    },
  }
}

export default defineConfig({
  plugins: [react(), ssePlugin()],
  esbuild: {
    target: 'es2022'
  },
  build: {
    target: 'es2022',
    minify: 'esbuild',
    rollupOptions: {
      external: (id) => {
        // Externalize server-only modules during build
        return id.includes('server/') ||
               id.includes('sqlite3') ||
               id.includes('node:');
      }
    }
  },
  define: {
    // Define environment variables for client - accessible via import.meta.env
    'import.meta.env.VERCEL': JSON.stringify(process.env.VERCEL || '0'),
    'import.meta.env.VERCEL_URL': JSON.stringify(process.env.VERCEL_URL || ''),
    'import.meta.env.VERCEL_ENV': JSON.stringify(process.env.VERCEL_ENV || 'development')
  }
})


// WebSocket endpoints have been removed
// All real-time communication now uses Server-Sent Events (SSE)
// Connect to /v1/events for real-time updates

// Example SSE client code:
// const eventSource = new EventSource('/v1/events');
// eventSource.onmessage = (event) => {
//   const data = JSON.parse(event.data);
//   console.log('SSE message:', data);
// };
