/* eslint-disable @typescript-eslint/no-explicit-any */
import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage } from 'http';
import type { Duplex } from 'stream';
import { AuthenticationManager } from './auth';
import { ConnectionManager } from './connections';
import { PostManager } from './posts';
import { SocialGraphManager } from './social';
import { SpaceManager } from './spaces';
import { initializeDatabase, getDatabase } from './database';
import { NetworkStateManager } from './networkState';
import { ClientMessage, ErrorMessage, NetworkStateUpdateMessage } from './protocol';

// Define an interface that captures the essential parts of the http server we need.
// This makes our function more generic and less coupled to specific http/https/http2 implementations.
interface IHttpServer {
  on(event: 'upgrade', listener: (req: IncomingMessage, socket: Duplex, head: Buffer) => void): this;
}

export function createWebSocketServer(server: IHttpServer) {
  const wss = new WebSocketServer({ noServer: true });
  const authManager = new AuthenticationManager();
  const connectionManager = new ConnectionManager();
  const socialGraphManager = new SocialGraphManager();
  const networkStateManager = new NetworkStateManager();
  const spaceManager = new SpaceManager();
  const postManager = new PostManager(socialGraphManager, connectionManager);

  // Add a function to broadcast network state to all clients
  function broadcastNetworkUpdate() {
    const networkState = networkStateManager.getNetworkState();
    const message: NetworkStateUpdateMessage = {
      kind: 'networkStateUpdate',
      payload: { nodes: networkState }
    };
    const messageString = JSON.stringify(message);
    
    // Use the connectionManager to get all active WebSocket connections
    const allConnections = connectionManager.getAllConnections();
    for (const ws of allConnections) {
      try {
        ws.send(messageString);
      } catch (error) {
        console.error('Failed to send network update to a client:', error);
      }
    }
  }

  // Monkey-patch the broadcast function into the network state manager
  (networkStateManager as any).broadcastNetworkUpdate = broadcastNetworkUpdate;


  initializeDatabase().then(() => {
    console.log('Database initialization complete.');
    server.on('upgrade', (req, socket, head) => {
      if (req.url === '/ws') {
        wss.handleUpgrade(req, socket, head, (ws) => {
          wss.emit('connection', ws, req);
        });
      }
    });
  }).catch(error => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });

  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected to /ws');
    let connectionId: string | null = null;

    ws.on('message', async (data) => {
      try {
        const message: ClientMessage = JSON.parse(data.toString());

        switch (message.kind) {
          case 'register': {
            const { username, email, password } = message.payload;
            const result = await authManager.registerUser(username, email, password);
            ws.send(JSON.stringify({
              kind: 'registerSuccess',
              payload: { userId: result.userId }
            }));
            break;
          }
          case 'login': {
            const { username, password } = message.payload;
            const session = await authManager.loginUser(username, password);
            
            // Register the connection with the manager
            connectionId = connectionManager.addConnection(ws, session.userId);

            // Add the node to the network state
            networkStateManager.addNode(connectionId, session.userId, session.pri.publicResonance);

            ws.send(JSON.stringify({
              kind: 'loginSuccess',
              payload: {
                sessionToken: session.sessionToken,
                userId: session.userId,
                pri: session.pri,
              }
            }));
            break;
          }
          case 'submitPostBeacon': {
            if (!connectionId) {
              throw new Error("Not authenticated");
            }
            // This is a simplified way to get the userId. In a real app,
            // you'd look it up from the session token.
            const userId = connectionManager['connections'].get(connectionId)!.userId;
            const { beacon, beaconType } = message.payload;
            const result = await postManager.handleBeaconSubmission(userId, beacon, beaconType);
            ws.send(JSON.stringify({
              kind: 'submitPostSuccess',
              payload: { ...result, timestamp: Date.now() }
            }));
            break;
          }
          case 'follow': {
            if (!connectionId) {
              throw new Error("Not authenticated");
            }
            const userId = connectionManager['connections'].get(connectionId)!.userId;
            const { userIdToFollow } = message.payload;
            await socialGraphManager.addFollow(userIdToFollow, userId);
            // Optional: send a confirmation message back to the client
            break;
          }
          case 'createSpace': {
            if (!connectionId) {
              throw new Error("Not authenticated");
            }
            const userId = connectionManager['connections'].get(connectionId)!.userId;
            const { name, description, isPublic } = message.payload;
            const result = await spaceManager.createSpace(userId, name, description, isPublic);
            ws.send(JSON.stringify({
              kind: 'createSpaceSuccess',
              payload: { spaceId: result.spaceId, name }
            }));
            break;
          }
          case 'submitCommentBeacon': {
            if (!connectionId) {
              throw new Error("Not authenticated");
            }
            const userId = connectionManager['connections'].get(connectionId)!.userId;
            const { postBeaconId, beacon } = message.payload;
            const result = await postManager.handleCommentSubmission(userId, postBeaconId, beacon);
            ws.send(JSON.stringify({
              kind: 'submitCommentSuccess',
              payload: { ...result, postBeaconId }
            }));
            break;
          }
          case 'likePost': {
            if (!connectionId) {
              throw new Error("Not authenticated");
            }
            const userId = connectionManager['connections'].get(connectionId)!.userId;
            const { postBeaconId } = message.payload;
            const result = await postManager.toggleLike(userId, postBeaconId);
            ws.send(JSON.stringify({
              kind: 'likePostSuccess',
              payload: { postBeaconId, liked: result.liked }
            }));
            break;
          }
          case 'getPublicSpaces': {
            const spaces = await spaceManager.getPublicSpaces();
            ws.send(JSON.stringify({
              kind: 'publicSpacesResponse',
              payload: { spaces }
            }));
            break;
          }
          case 'search': {
            const { query, category } = message.payload;
            const db = getDatabase();
            
            const results: { users: any[], spaces: any[], beacons: any[] } = {
              users: [],
              spaces: [],
              beacons: []
            };

            if (category === 'all' || category === 'people') {
              const userSql = `SELECT user_id, username FROM users WHERE username LIKE ? LIMIT 10`;
              results.users = await new Promise((resolve, reject) => {
                db.all(userSql, [`%${query}%`], (err: Error | null, rows: any[]) => {
                  if (err) return reject(err);
                  resolve(rows);
                });
              });
            }

            if (category === 'all' || category === 'spaces') {
              const spaceSql = `SELECT space_id, name, description FROM spaces WHERE name LIKE ? OR description LIKE ? LIMIT 10`;
              results.spaces = await new Promise((resolve, reject) => {
                db.all(spaceSql, [`%${query}%`, `%${query}%`], (err: Error | null, rows: any[]) => {
                  if (err) return reject(err);
                  resolve(rows);
                });
              });
            }

            if (category === 'all' || category === 'posts') {
              const beaconSql = `SELECT beacon_id, author_id FROM beacons WHERE beacon_type = 'post' LIMIT 10`;
              results.beacons = await new Promise((resolve, reject) => {
                db.all(beaconSql, [], (err: Error | null, rows: any[]) => {
                  if (err) return reject(err);
                  resolve(rows);
                });
              });
            }

            ws.send(JSON.stringify({
              kind: 'searchResponse',
              payload: results
            }));
            break;
          }
          default: {
            // Relay signaling messages
            if (message.kind === 'requestTeleport' || message.kind === 'acceptTeleport') {
              const targetUserId = message.kind === 'requestTeleport' ? message.payload.targetUserId : message.payload.sourceUserId;
              const connections = connectionManager.getConnectionsByUserId(targetUserId);
              
              if (connections.length > 0) {
                // Just send to the first connection for simplicity
                const targetWs = connections[0];
                const relayMessage = {
                  kind: message.kind === 'requestTeleport' ? 'teleportRequest' : 'teleportAccepted',
                  payload: message.payload
                };
                targetWs.send(JSON.stringify(relayMessage));
              } else {
                console.log(`Signaling failed: Target user ${targetUserId} not online.`);
              }
              break;
            }

            const errorMsg: ErrorMessage = {
              kind: 'error',
              payload: { message: 'Unknown message kind' }
            };
            ws.send(JSON.stringify(errorMsg));
          }
        }
      } catch (error) {
        const errorMsg: ErrorMessage = {
          kind: 'error',
          payload: {
            message: error instanceof Error ? error.message : 'An unknown error occurred',
          }
        };
        ws.send(JSON.stringify(errorMsg));
      }
    });

    ws.on('close', () => {
      if (connectionId) {
        connectionManager.removeConnection(connectionId);
        networkStateManager.removeNode(connectionId);
      }
      console.log('Client disconnected from /ws');
    });
  });

  return wss;
}