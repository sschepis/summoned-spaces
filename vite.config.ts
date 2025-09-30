import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import { createWebSocketServer } from './server/main' // Import the new function

function customWsPlugin(): Plugin {
  return {
    name: 'custom-ws',
    configureServer(server) {
      // The WebSocket server logic is now handled by the imported function
      server.httpServer?.once('listening', () => {
        const wss = createWebSocketServer(server.httpServer!);

        server.httpServer?.once('close', () => {
          wss?.close();
        });
      });
    },
  }
}

export default defineConfig({
  plugins: [customWsPlugin()],
  esbuild: {
    target: 'es2022'
  },
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
