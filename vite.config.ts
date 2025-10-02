import { defineConfig } from 'vite'
import type { Plugin } from 'vite'

function customWsPlugin(): Plugin {
  return {
    name: 'custom-ws',
    configureServer(server) {
      // Only run WebSocket server in development
      if (process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1') {
        // Dynamic import to avoid bundling server code in production
        import('./server/main').then(({ createWebSocketServer }) => {
          server.httpServer?.once('listening', () => {
            const wss = createWebSocketServer(server.httpServer!);

            server.httpServer?.once('close', () => {
              wss?.close();
            });
          });
        }).catch((error) => {
          console.warn('Could not start WebSocket server:', error);
        });
      }
    },
  }
}

export default defineConfig({
  plugins: [customWsPlugin()],
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
               id.includes('ws') ||
               id.includes('node:');
      }
    }
  },
  define: {
    // Define environment variables for client
    'process.env.VERCEL': JSON.stringify(process.env.VERCEL || '0'),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
})


// Example client code to connect to the custom WS endpoint
// const ws = new WebSocket(
//   (location.protocol === 'https:' ? 'wss://' : 'ws://') +
//   location.host +
//   '/ws'
// )

// ws.addEventListener('open', () => {
//   ws.send('ping')
// })

// ws.addEventListener('message', (e) => {
//   const msg = typeof e.data === 'string' ? e.data : ''
//   console.log('WS message:', msg)
// })
