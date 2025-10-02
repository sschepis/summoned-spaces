/* eslint-disable @typescript-eslint/no-explicit-any */
import dotenv from 'dotenv';
// Load environment variables from .env.local for development
dotenv.config({ path: '.env.local' });
import { WebSocketServer } from 'ws';
import { AuthenticationManager } from './auth';
import { ConnectionManager } from './connections';
import { PostManager } from './posts';
import { SpaceManager } from './spaces';
import { initializeDatabase, getDatabase } from './database';
import { NetworkStateManager } from './networkState';
import { SocialGraphManager } from './social';
import { QuaternionicChatManager } from './quaternionic-chat';
export function createWebSocketServer(server) {
    const wss = new WebSocketServer({ noServer: true });
    const authManager = new AuthenticationManager();
    const connectionManager = new ConnectionManager();
    const networkStateManager = new NetworkStateManager();
    const postManager = new PostManager(connectionManager);
    const spaceManager = new SpaceManager(postManager);
    const quaternionicChatManager = new QuaternionicChatManager(connectionManager);
    // Create social graph manager with notification broadcaster
    const socialGraphManager = new SocialGraphManager((targetUserId, message) => {
        // Send notification to all connections of the target user
        const targetConnections = connectionManager.getConnectionsByUserId(targetUserId);
        const messageString = JSON.stringify(message);
        targetConnections.forEach(ws => {
            try {
                ws.send(messageString);
                console.log(`[SERVER] Sent follow notification to user ${targetUserId}`);
            }
            catch (error) {
                console.error(`[SERVER] Failed to send follow notification to user ${targetUserId}:`, error);
            }
        });
    });
    // Add a function to broadcast network state to all clients
    async function broadcastNetworkUpdate() {
        const networkState = networkStateManager.getNetworkState();
        // Fetch usernames for all nodes
        const db = getDatabase();
        const nodesWithUsernames = await Promise.all(networkState.map(async (node) => {
            const userRow = await new Promise((resolve) => {
                db.get('SELECT username FROM users WHERE user_id = ?', [node.userId], (err, row) => {
                    if (err || !row) {
                        resolve({ username: node.userId.substring(0, 8) });
                    }
                    else {
                        resolve(row);
                    }
                });
            });
            return { ...node, username: userRow.username };
        }));
        const message = {
            kind: 'networkStateUpdate',
            payload: { nodes: nodesWithUsernames }
        };
        const messageString = JSON.stringify(message);
        // Use the connectionManager to get all active WebSocket connections
        const allConnections = connectionManager.getAllConnections();
        for (const ws of allConnections) {
            try {
                ws.send(messageString);
            }
            catch (error) {
                console.error('Failed to send network update to a client:', error);
            }
        }
    }
    // Monkey-patch the broadcast function into the network state manager
    networkStateManager.broadcastNetworkUpdate = broadcastNetworkUpdate;
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
    wss.on('connection', (ws) => {
        console.log('Client connected to /ws');
        let connectionId = null;
        ws.on('message', async (data) => {
            try {
                const message = JSON.parse(data.toString());
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
                        // Get username from database
                        const db = getDatabase();
                        const userRow = await new Promise((resolve, reject) => {
                            db.get('SELECT username FROM users WHERE user_id = ?', [session.userId], (err, row) => {
                                if (err)
                                    return reject(err);
                                resolve(row || { username: session.userId.substring(0, 8) });
                            });
                        });
                        // Add the node to the network state with username
                        networkStateManager.addNode(connectionId, session.userId, userRow.username, session.pri.publicResonance);
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
                        const userId = connectionManager['connections'].get(connectionId).userId;
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
                        const userId = connectionManager['connections'].get(connectionId).userId;
                        const { userIdToFollow } = message.payload;
                        console.log(`[SERVER] User ${userId} wants to follow ${userIdToFollow}`);
                        // Update the social graph
                        await socialGraphManager.addFollow(userIdToFollow, userId);
                        // Send success response to the follower
                        ws.send(JSON.stringify({
                            kind: 'followSuccess',
                            payload: { userIdToFollow }
                        }));
                        break;
                    }
                    case 'unfollow': {
                        if (!connectionId) {
                            throw new Error("Not authenticated");
                        }
                        const userId = connectionManager['connections'].get(connectionId).userId;
                        const { userIdToUnfollow } = message.payload;
                        console.log(`[SERVER] User ${userId} wants to unfollow ${userIdToUnfollow}`);
                        // Update the social graph
                        await socialGraphManager.removeFollow(userIdToUnfollow, userId);
                        // Send success response
                        ws.send(JSON.stringify({
                            kind: 'unfollowSuccess',
                            payload: { userIdToUnfollow }
                        }));
                        break;
                    }
                    case 'createSpace': {
                        if (!connectionId) {
                            throw new Error("Not authenticated");
                        }
                        const userId = connectionManager['connections'].get(connectionId).userId;
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
                        const userId = connectionManager['connections'].get(connectionId).userId;
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
                        const userId = connectionManager['connections'].get(connectionId).userId;
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
                        const results = {
                            users: [],
                            spaces: [],
                            beacons: []
                        };
                        if (category === 'all' || category === 'people') {
                            const userSql = `SELECT user_id, username FROM users WHERE username LIKE ? LIMIT 10`;
                            results.users = await new Promise((resolve, reject) => {
                                db.all(userSql, [`%${query}%`], (err, rows) => {
                                    if (err)
                                        return reject(err);
                                    resolve(rows);
                                });
                            });
                        }
                        if (category === 'all' || category === 'spaces') {
                            const spaceSql = `SELECT space_id, name, description FROM spaces WHERE name LIKE ? OR description LIKE ? LIMIT 10`;
                            results.spaces = await new Promise((resolve, reject) => {
                                db.all(spaceSql, [`%${query}%`, `%${query}%`], (err, rows) => {
                                    if (err)
                                        return reject(err);
                                    resolve(rows);
                                });
                            });
                        }
                        if (category === 'all' || category === 'posts') {
                            const beaconSql = `
                SELECT b.beacon_id, b.author_id, b.created_at, u.username
                FROM beacons b
                LEFT JOIN users u ON b.author_id = u.user_id
                WHERE b.beacon_type = 'post'
                LIMIT 10
              `;
                            results.beacons = await new Promise((resolve, reject) => {
                                db.all(beaconSql, [], (err, rows) => {
                                    if (err)
                                        return reject(err);
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
                    case 'getBeaconsByUser': {
                        const { userId, beaconType } = message.payload;
                        const db = getDatabase();
                        let sql;
                        const params = [];
                        // Support wildcard '*' to get all users' beacons of a specific type
                        // Include username in the query
                        if (userId === '*') {
                            sql = `
                SELECT b.*, u.username
                FROM beacons b
                LEFT JOIN users u ON b.author_id = u.user_id
                WHERE 1=1
              `;
                        }
                        else {
                            sql = `
                SELECT b.*, u.username
                FROM beacons b
                LEFT JOIN users u ON b.author_id = u.user_id
                WHERE b.author_id = ?
              `;
                            params.push(userId);
                        }
                        if (beaconType) {
                            sql += ` AND b.beacon_type = ?`;
                            params.push(beaconType);
                        }
                        sql += ` ORDER BY b.created_at DESC`;
                        const beacons = await new Promise((resolve, reject) => {
                            db.all(sql, params, (err, rows) => {
                                if (err) {
                                    console.error('Error retrieving beacons:', err.message);
                                    return reject(err);
                                }
                                resolve(rows);
                            });
                        });
                        ws.send(JSON.stringify({
                            kind: 'beaconsResponse',
                            payload: { beacons }
                        }));
                        break;
                    }
                    case 'getBeaconById': {
                        const { beaconId } = message.payload;
                        const db = getDatabase();
                        const sql = `SELECT * FROM beacons WHERE beacon_id = ?`;
                        const beacon = await new Promise((resolve, reject) => {
                            db.get(sql, [beaconId], (err, row) => {
                                if (err) {
                                    console.error('Error retrieving beacon:', err.message);
                                    return reject(err);
                                }
                                resolve(row || null);
                            });
                        });
                        ws.send(JSON.stringify({
                            kind: 'beaconResponse',
                            payload: { beacon }
                        }));
                        break;
                    }
                    case 'getFollowers': {
                        const { userId } = message.payload;
                        console.log(`[SERVER] Getting followers for user: ${userId}`);
                        try {
                            const followers = await socialGraphManager.getFollowers(userId);
                            ws.send(JSON.stringify({
                                kind: 'followersResponse',
                                payload: { followers }
                            }));
                        }
                        catch (error) {
                            console.error('[SERVER] Error getting followers:', error);
                            ws.send(JSON.stringify({
                                kind: 'followersResponse',
                                payload: { followers: [] }
                            }));
                        }
                        break;
                    }
                    case 'getFollowing': {
                        const { userId } = message.payload;
                        console.log(`[SERVER] Getting following for user: ${userId}`);
                        try {
                            const following = await socialGraphManager.getFollowing(userId);
                            ws.send(JSON.stringify({
                                kind: 'followingResponse',
                                payload: { following }
                            }));
                        }
                        catch (error) {
                            console.error('[SERVER] Error getting following:', error);
                            ws.send(JSON.stringify({
                                kind: 'followingResponse',
                                payload: { following: [] }
                            }));
                        }
                        break;
                    }
                    case 'restoreSession': {
                        const { sessionToken, userId, pri } = message.payload;
                        console.log('[SERVER] Received restoreSession request for user:', userId);
                        console.log('[SERVER] Session token:', sessionToken);
                        console.log('[SERVER] Current connectionId:', connectionId);
                        try {
                            // Validate the session token (in a real app, you'd check expiration, etc.)
                            console.log('[SERVER] Validating session token...');
                            const validatedSession = await authManager.validateSessionToken(sessionToken, userId);
                            if (validatedSession) {
                                console.log('[SERVER] Session token validated successfully');
                                // CRITICAL: Re-register the connection FIRST before any other operations
                                connectionId = connectionManager.addConnection(ws, userId);
                                console.log('[SERVER] New connectionId assigned:', connectionId);
                                // Get username from database
                                const db = getDatabase();
                                const userRow = await new Promise((resolve, reject) => {
                                    db.get('SELECT username FROM users WHERE user_id = ?', [userId], (err, row) => {
                                        if (err)
                                            return reject(err);
                                        resolve(row || { username: userId.substring(0, 8) });
                                    });
                                });
                                // Re-add the node to the network state with username
                                networkStateManager.addNode(connectionId, userId, userRow.username, pri.publicResonance);
                                console.log('[SERVER] Node added to network state');
                                // Chrome fix: Ensure all server-side state is synchronized before confirming
                                // This prevents race conditions where authenticated requests arrive before
                                // the server has fully processed the session restoration
                                await new Promise(resolve => setTimeout(resolve, 50));
                                console.log(`[SERVER] Session fully restored for user ${userId} on connection ${connectionId}`);
                                // Send success response BEFORE broadcasting to ensure client knows restoration is complete
                                ws.send(JSON.stringify({
                                    kind: 'sessionRestored',
                                    payload: { userId, success: true }
                                }));
                                // Small delay before broadcast to ensure the success message is processed first
                                setTimeout(() => {
                                    // Trigger a network state update to notify all clients
                                    broadcastNetworkUpdate();
                                }, 100);
                            }
                            else {
                                console.log('[SERVER] Session validation failed');
                                ws.send(JSON.stringify({
                                    kind: 'sessionRestored',
                                    payload: { userId, success: false }
                                }));
                            }
                        }
                        catch (error) {
                            console.error('[SERVER] Error restoring session:', error);
                            ws.send(JSON.stringify({
                                kind: 'sessionRestored',
                                payload: { userId, success: false, error: error instanceof Error ? error.message : 'Unknown error' }
                            }));
                        }
                        break;
                    }
                    case 'joinQuaternionicChatRoom': {
                        if (!connectionId) {
                            throw new Error("Not authenticated");
                        }
                        const userId = connectionManager['connections'].get(connectionId).userId;
                        const { roomId, participants } = message.payload;
                        await quaternionicChatManager.handleJoinChatRoom(userId, roomId, participants);
                        break;
                    }
                    case 'sendQuaternionicMessage': {
                        if (!connectionId) {
                            throw new Error("Not authenticated");
                        }
                        const userId = connectionManager['connections'].get(connectionId).userId;
                        const { receiverId, content, roomId } = message.payload;
                        await quaternionicChatManager.handleQuaternionicMessage(userId, receiverId, content, roomId);
                        break;
                    }
                    case 'synchronizeQuaternionicPhases': {
                        if (!connectionId) {
                            throw new Error("Not authenticated");
                        }
                        const userId = connectionManager['connections'].get(connectionId).userId;
                        const { targetUserId } = message.payload;
                        await quaternionicChatManager.handlePhaseSynchronization(userId, targetUserId);
                        break;
                    }
                    case 'getQuaternionicMessageHistory': {
                        if (!connectionId) {
                            throw new Error("Not authenticated");
                        }
                        const { roomId, limit } = message.payload;
                        const messages = await quaternionicChatManager.getQuaternionicMessageHistory(roomId, limit);
                        ws.send(JSON.stringify({
                            kind: 'quaternionicMessageHistoryResponse',
                            payload: { messages }
                        }));
                        break;
                    }
                    case 'getQuaternionicRoomMetrics': {
                        if (!connectionId) {
                            throw new Error("Not authenticated");
                        }
                        const { roomId } = message.payload;
                        const metrics = await quaternionicChatManager.getRoomMetrics(roomId);
                        ws.send(JSON.stringify({
                            kind: 'quaternionicRoomMetricsResponse',
                            payload: { metrics }
                        }));
                        break;
                    }
                    case 'addFileToSpace': {
                        if (!connectionId) {
                            throw new Error("Not authenticated");
                        }
                        const userId = connectionManager['connections'].get(connectionId).userId;
                        const { spaceId, fileName, fileType, fileSize, fingerprint, fileContent } = message.payload;
                        await spaceManager.addFileToSpace(spaceId, userId, { fileName, fileType, fileSize, fingerprint, fileContent });
                        // Notify all members of the space that the file index was updated
                        const allConnections = connectionManager.getAllConnections();
                        for (const ws of allConnections) {
                            ws.send(JSON.stringify({
                                kind: 'fileAddedToSpace',
                                payload: {
                                    spaceId,
                                    file: {
                                        file_id: fingerprint, // Use fingerprint as ID
                                        space_id: spaceId,
                                        uploader_id: userId,
                                        file_name: fileName,
                                        file_type: fileType,
                                        file_size: fileSize,
                                        fingerprint: fingerprint,
                                        created_at: new Date().toISOString()
                                    }
                                }
                            }));
                        }
                        break;
                    }
                    case 'removeFileFromSpace': {
                        if (!connectionId) {
                            throw new Error("Not authenticated");
                        }
                        const userId = connectionManager['connections'].get(connectionId).userId;
                        const { spaceId, fileId } = message.payload;
                        await spaceManager.removeFileFromSpace(spaceId, userId, fileId);
                        // Notify all members of the space
                        // (simplified: broadcasting to all connections for now)
                        const allConnections = connectionManager.getAllConnections();
                        for (const ws of allConnections) {
                            ws.send(JSON.stringify({
                                kind: 'fileRemovedFromSpace',
                                payload: { spaceId, fileId }
                            }));
                        }
                        break;
                    }
                    case 'getSpaceFiles': {
                        if (!connectionId) {
                            throw new Error("Not authenticated");
                        }
                        const { spaceId } = message.payload;
                        const files = await spaceManager.getSpaceFiles(spaceId);
                        ws.send(JSON.stringify({
                            kind: 'spaceFilesResponse',
                            payload: { spaceId, files }
                        }));
                        break;
                    }
                    case 'downloadFile': {
                        if (!connectionId) {
                            throw new Error("Not authenticated");
                        }
                        const { spaceId, fingerprint } = message.payload;
                        console.log(`[SERVER] Download request for file ${fingerprint} in space ${spaceId}`);
                        try {
                            const fileContent = await spaceManager.getFileContent(fingerprint, spaceId);
                            if (fileContent) {
                                ws.send(JSON.stringify({
                                    kind: 'downloadFileResponse',
                                    payload: { fingerprint, content: fileContent, success: true }
                                }));
                                console.log(`[SERVER] File content sent for ${fingerprint}`);
                            }
                            else {
                                ws.send(JSON.stringify({
                                    kind: 'downloadFileResponse',
                                    payload: { fingerprint, content: null, success: false, error: 'File content not found' }
                                }));
                                console.log(`[SERVER] File content not found for ${fingerprint}`);
                            }
                        }
                        catch (error) {
                            console.error(`[SERVER] Error downloading file ${fingerprint}:`, error);
                            ws.send(JSON.stringify({
                                kind: 'downloadFileResponse',
                                payload: { fingerprint, content: null, success: false, error: error instanceof Error ? error.message : 'Download failed' }
                            }));
                        }
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
                            }
                            else {
                                console.log(`Signaling failed: Target user ${targetUserId} not online.`);
                            }
                            break;
                        }
                        const errorMsg = {
                            kind: 'error',
                            payload: { message: 'Unknown message kind' }
                        };
                        ws.send(JSON.stringify(errorMsg));
                    }
                }
            }
            catch (error) {
                const errorMsg = {
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
