import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'

function ssePlugin(): Plugin {
  return {
    name: 'sse-communication',
    configureServer(server) {
      // SSE-based communication enabled - no WebSocket server needed
      console.log('SSE-based communication enabled - using /api/events endpoint');
      
      // Add middleware to handle /api routes in development
      server.middlewares.use('/api', async (req, res, next) => {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }
        
        // Handle /api/messages endpoint
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
// Connect to /api/events for real-time updates

// Example SSE client code:
// const eventSource = new EventSource('/api/events');
// eventSource.onmessage = (event) => {
//   const data = JSON.parse(event.data);
//   console.log('SSE message:', data);
// };
