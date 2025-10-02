import { getDatabase } from './database';
export class PostManager {
    connectionManager;
    constructor(connectionManager) {
        this.connectionManager = connectionManager;
        console.log('PostManager initialized');
    }
    async handleBeaconSubmission(userId, beacon, beaconType = 'post') {
        console.log(`[PostManager] ===== BEACON SUBMISSION =====`);
        console.log(`[PostManager] Received ${beaconType} beacon submission from user ${userId}`);
        console.log(`[PostManager] Beacon type: ${beaconType}`);
        console.log(`[PostManager] User ID: ${userId}`);
        // Convert arrays back to Uint8Arrays if needed
        if (Array.isArray(beacon.fingerprint)) {
            beacon.fingerprint = new Uint8Array(beacon.fingerprint);
            console.log('[PostManager] Converted fingerprint from array to Uint8Array');
        }
        if (Array.isArray(beacon.signature)) {
            beacon.signature = new Uint8Array(beacon.signature);
            console.log('[PostManager] Converted signature from array to Uint8Array');
        }
        console.log(`[PostManager] Beacon structure:`, {
            hasSignature: !!beacon.signature,
            signatureLength: beacon.signature?.length,
            hasFingerprint: !!beacon.fingerprint,
            fingerprintLength: beacon.fingerprint?.length,
            hasIndex: !!beacon.index,
            indexLength: beacon.index?.length,
            epoch: beacon.epoch
        });
        // --- Beacon Validation ---
        if (!beacon.signature || beacon.signature.length === 0) {
            throw new Error("Invalid beacon: Signature is missing.");
        }
        if (!beacon.fingerprint || beacon.fingerprint.length === 0) {
            throw new Error("Invalid beacon: Fingerprint is missing.");
        }
        if (!beacon.index || beacon.index.length === 0) {
            throw new Error("Invalid beacon: Prime indices are missing.");
        }
        console.log('[PostManager] Beacon validation passed');
        // --- Persistence ---
        const beaconId = `beacon_${Math.random().toString(36).substr(2, 9)}`;
        console.log(`[PostManager] Saving beacon ${beaconId} to database...`);
        await this.saveBeaconToDb(beaconId, userId, beacon, beaconType);
        // --- Propagation for posts and direct messages ---
        console.log(`[PostManager] Checking propagation for beacon type: ${beaconType}`);
        if (beaconType === 'post' || beaconType === 'direct_message' || beaconType === 'quantum_message' || beaconType === 'space_message') {
            console.log(`[PostManager] Propagating ${beaconType} beacon ${beaconId}`);
            this.propagateBeacon(userId, beacon, beaconType, beaconId);
        }
        else {
            console.log(`[PostManager] Skipping propagation for beacon type: ${beaconType}`);
        }
        const postId = `post_${Math.random().toString(36).substr(2, 9)}`;
        console.log(`Beacon processed. Type: ${beaconType}, PostID: ${postId}, BeaconID: ${beaconId}`);
        return { postId, beaconId };
    }
    async propagateBeacon(authorId, beacon, beaconType = 'post', beaconId = '') {
        // In the holographic architecture, propagation is handled client-side
        // through the follower discovery service. The server just stores the beacon
        // and clients discover and decode beacons based on their holographic permissions.
        console.log(`Beacon from ${authorId} saved - propagation handled by holographic discovery`);
        // For direct messages and quantum messages, broadcast the actual beacon to all clients
        // They will decode it client-side if they have the proper entanglement/permissions
        if (beaconType === 'direct_message' || beaconType === 'quantum_message' || beaconType === 'space_message') {
            console.log(`[PostManager] ===== BROADCASTING ${beaconType.toUpperCase()} BEACON =====`);
            console.log(`[PostManager] Beacon ID: ${beaconId}`);
            console.log(`[PostManager] Author ID: ${authorId}`);
            console.log(`[PostManager] Beacon Type: ${beaconType}`);
            console.log(`[PostManager] Beacon structure:`, {
                fingerprint: beacon.fingerprint?.constructor?.name,
                fingerprintLength: beacon.fingerprint?.length,
                signature: beacon.signature?.constructor?.name,
                signatureLength: beacon.signature?.length,
                index: beacon.index,
                epoch: beacon.epoch
            });
            const allConnections = this.connectionManager.getAllConnections();
            console.log(`[PostManager] Broadcasting to ${allConnections.length} connected clients`);
            const message = {
                kind: 'beaconReceived',
                payload: {
                    beaconId: beaconId,
                    senderId: authorId,
                    beaconType: beaconType,
                    beacon: beacon
                }
            };
            console.log(`[PostManager] Broadcast message:`, message);
            for (const ws of allConnections) {
                try {
                    const messageString = JSON.stringify(message);
                    ws.send(messageString);
                    console.log(`[PostManager] Successfully sent ${beaconType} beacon to client`);
                }
                catch (error) {
                    console.error(`[PostManager] Failed to broadcast ${beaconType} beacon to client:`, error);
                }
            }
            console.log(`[PostManager] Finished broadcasting ${beaconType} beacon`);
        }
        else {
            // For regular posts, just notify availability for holographic discovery
            const allConnections = this.connectionManager.getAllConnections();
            for (const ws of allConnections) {
                try {
                    ws.send(JSON.stringify({
                        kind: 'newBeaconAvailable',
                        payload: {
                            authorId,
                            beaconType: beaconType,
                            timestamp: Date.now()
                        }
                    }));
                }
                catch (error) {
                    console.error(`Failed to broadcast beacon availability:`, error);
                }
            }
        }
    }
    async saveBeaconToDb(beaconId, authorId, beacon, beaconType) {
        const db = getDatabase();
        const sql = `
      INSERT INTO beacons (beacon_id, beacon_type, author_id, prime_indices, epoch, fingerprint, signature, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
        console.log(`[PostManager] Preparing to save beacon with type: ${beaconType}`);
        const params = [
            beaconId,
            beaconType,
            authorId,
            JSON.stringify(beacon.index),
            beacon.epoch,
            Buffer.from(beacon.fingerprint).toString('base64'),
            Buffer.from(beacon.signature).toString('base64'),
            new Date().toISOString()
        ];
        console.log(`[PostManager] SQL params:`, {
            beaconId,
            beaconType,
            authorId,
            primeIndicesLength: beacon.index.length,
            epoch: beacon.epoch,
            fingerprintBase64Length: Buffer.from(beacon.fingerprint).toString('base64').length,
            signatureBase64Length: Buffer.from(beacon.signature).toString('base64').length
        });
        return new Promise((resolve, reject) => {
            db.run(sql, params, (err) => {
                if (err) {
                    console.error('[PostManager] Error saving beacon to DB:', err.message);
                    console.error('[PostManager] SQL:', sql);
                    console.error('[PostManager] Params:', params);
                    return reject(err);
                }
                console.log(`[PostManager] Beacon ${beaconId} (type: ${beaconType}) saved successfully to database.`);
                resolve();
            });
        });
    }
    async handleCommentSubmission(userId, postBeaconId, beacon) {
        console.log(`Received comment submission from user ${userId} on post ${postBeaconId}`);
        // Validate beacon
        if (!beacon.signature || beacon.signature.length === 0) {
            throw new Error("Invalid comment beacon: Signature is missing.");
        }
        // Persistence
        const commentId = `comment_${Math.random().toString(36).substr(2, 9)}`;
        await this.saveCommentToDb(commentId, postBeaconId, userId, beacon);
        console.log(`Comment processed. CommentID: ${commentId}`);
        return { commentId };
    }
    async saveCommentToDb(commentId, postBeaconId, authorId, beacon) {
        const db = getDatabase();
        // First save the beacon
        const beaconId = `beacon_${Math.random().toString(36).substr(2, 9)}`;
        const beaconSql = `
      INSERT INTO beacons (beacon_id, beacon_type, author_id, prime_indices, epoch, fingerprint, signature, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
        await new Promise((resolve, reject) => {
            db.run(beaconSql, [
                beaconId,
                'comment', // Set beacon_type to 'comment'
                authorId,
                JSON.stringify(beacon.index),
                beacon.epoch,
                Buffer.from(beacon.fingerprint).toString('base64'),
                Buffer.from(beacon.signature).toString('base64'),
                new Date().toISOString()
            ], (err) => {
                if (err) {
                    console.error('Error saving comment beacon', err.message);
                    return reject(err);
                }
                resolve();
            });
        });
        // Then save the comment reference
        const commentSql = `
      INSERT INTO comments (comment_id, post_beacon_id, author_id, comment_beacon_id, created_at)
      VALUES (?, ?, ?, ?, ?)
    `;
        return new Promise((resolve, reject) => {
            db.run(commentSql, [
                commentId,
                postBeaconId,
                authorId,
                beaconId,
                new Date().toISOString()
            ], (err) => {
                if (err) {
                    console.error('Error saving comment', err.message);
                    return reject(err);
                }
                console.log(`Comment ${commentId} saved to database.`);
                resolve();
            });
        });
    }
    async toggleLike(userId, postBeaconId) {
        const db = getDatabase();
        // Check if already liked
        const checkSql = `SELECT * FROM likes WHERE post_beacon_id = ? AND user_id = ?`;
        const exists = await new Promise((resolve, reject) => {
            db.get(checkSql, [postBeaconId, userId], (err, row) => {
                if (err) {
                    console.error('Error checking like status', err.message);
                    return reject(err);
                }
                resolve(!!row);
            });
        });
        if (exists) {
            // Unlike
            const deleteSql = `DELETE FROM likes WHERE post_beacon_id = ? AND user_id = ?`;
            await new Promise((resolve, reject) => {
                db.run(deleteSql, [postBeaconId, userId], (err) => {
                    if (err) {
                        console.error('Error unliking post', err.message);
                        return reject(err);
                    }
                    console.log(`User ${userId} unliked post ${postBeaconId}`);
                    resolve();
                });
            });
            return { liked: false };
        }
        else {
            // Like
            const insertSql = `INSERT INTO likes (post_beacon_id, user_id, created_at) VALUES (?, ?, ?)`;
            await new Promise((resolve, reject) => {
                db.run(insertSql, [postBeaconId, userId, new Date().toISOString()], (err) => {
                    if (err) {
                        console.error('Error liking post', err.message);
                        return reject(err);
                    }
                    console.log(`User ${userId} liked post ${postBeaconId}`);
                    resolve();
                });
            });
            return { liked: true };
        }
    }
}
