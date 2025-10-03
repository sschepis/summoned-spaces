import type { Beacon } from './protocol'; // Using our placeholder Beacon type
import { ConnectionManager } from './connections';
import { getDatabase } from './database';
import type { CreateBeaconData } from '../lib/database/types.js';
import { randomBytes } from 'crypto';

export class PostManager {
  private connectionManager: ConnectionManager;

  constructor(connectionManager: ConnectionManager) {
    this.connectionManager = connectionManager;
    console.log('PostManager initialized');
  }

  async handleBeaconSubmission(
    userId: string,
    beacon: Beacon,
    beaconType: string = 'post'
  ): Promise<{ postId: string; beaconId: string }> {
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
    const beaconId = `beacon_${randomBytes(8).toString('hex')}`;
    console.log(`[PostManager] Saving beacon ${beaconId} to database...`);
    await this.saveBeaconToDb(beaconId, userId, beacon, beaconType);
    
    // --- Propagation for posts and direct messages ---
    console.log(`[PostManager] Checking propagation for beacon type: ${beaconType}`);
    if (beaconType === 'post' || beaconType === 'direct_message' || beaconType === 'quantum_message' || beaconType === 'space_message') {
      console.log(`[PostManager] Propagating ${beaconType} beacon ${beaconId}`);
      this.propagateBeacon(userId, beacon, beaconType, beaconId);
    } else {
      console.log(`[PostManager] Skipping propagation for beacon type: ${beaconType}`);
    }

    const postId = `post_${randomBytes(8).toString('hex')}`;
    
    console.log(`Beacon processed. Type: ${beaconType}, PostID: ${postId}, BeaconID: ${beaconId}`);

    return { postId, beaconId };
  }

  private async propagateBeacon(authorId: string, beacon: Beacon, beaconType: string = 'post', beaconId: string = ''): Promise<void> {
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
        } catch (error) {
          console.error(`[PostManager] Failed to broadcast ${beaconType} beacon to client:`, error);
        }
      }
      console.log(`[PostManager] Finished broadcasting ${beaconType} beacon`);
    } else {
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
        } catch (error) {
          console.error(`Failed to broadcast beacon availability:`, error);
        }
      }
    }
  }

  private async saveBeaconToDb(
    beaconId: string,
    authorId: string,
    beacon: Beacon,
    beaconType: string
  ): Promise<void> {
    const db = getDatabase();
    
    console.log(`[PostManager] Preparing to save beacon with type: ${beaconType}`);
    
    // Convert beacon data to match the NeonAdapter interface
    const beaconData: CreateBeaconData = {
      beacon_id: beaconId,
      beacon_type: beaconType,
      author_id: authorId,
      prime_indices: {
        // Calculate resonance values from beacon data
        base_resonance: (beacon.index[0] || 1) / 1000,
        amplification_factor: (beacon.index[1] || 1) / 1000,
        phase_alignment: (beacon.index[2] || 1) / 1000,
        entropy_level: beacon.fingerprint.length > 0 ?
          Array.from(beacon.fingerprint).reduce((a, b) => a + b, 0) / (beacon.fingerprint.length * 255) : 0.5,
        prime_sequence: beacon.index,
        resonance_signature: beacon.index.join('-')
      },
      epoch: beacon.epoch,
      fingerprint: Buffer.from(beacon.fingerprint),
      signature: Buffer.from(beacon.signature),
      metadata: { beaconType }
    };
    
    console.log(`[PostManager] Beacon data:`, {
      beaconId,
      beaconType,
      authorId,
      primeIndicesLength: beacon.index.length,
      epoch: beacon.epoch,
      fingerprintLength: beacon.fingerprint.length,
      signatureLength: beacon.signature.length
    });

    try {
      await db.createBeacon(beaconData);
      console.log(`[PostManager] Beacon ${beaconId} (type: ${beaconType}) saved successfully to database.`);
    } catch (err) {
      console.error('[PostManager] Error saving beacon to DB:', err instanceof Error ? err.message : err);
      throw err;
    }
  }

  async handleCommentSubmission(
    userId: string,
    postBeaconId: string,
    beacon: Beacon
  ): Promise<{ commentId: string }> {
    console.log(`Received comment submission from user ${userId} on post ${postBeaconId}`);

    // Validate beacon
    if (!beacon.signature || beacon.signature.length === 0) {
        throw new Error("Invalid comment beacon: Signature is missing.");
    }

    // Persistence
    const commentId = `comment_${randomBytes(8).toString('hex')}`;
    await this.saveCommentToDb(commentId, postBeaconId, userId, beacon);

    console.log(`Comment processed. CommentID: ${commentId}`);

    return { commentId };
  }

  private async saveCommentToDb(
    commentId: string,
    postBeaconId: string,
    authorId: string,
    beacon: Beacon
  ): Promise<void> {
    const db = getDatabase();
    
    // First save the beacon
    const beaconId = `beacon_${randomBytes(8).toString('hex')}`;
    
    const beaconData: CreateBeaconData = {
      beacon_id: beaconId,
      beacon_type: 'comment',
      author_id: authorId,
      prime_indices: {
        // Calculate resonance values from beacon data
        base_resonance: (beacon.index[0] || 1) / 1000,
        amplification_factor: (beacon.index[1] || 1) / 1000,
        phase_alignment: (beacon.index[2] || 1) / 1000,
        entropy_level: beacon.fingerprint.length > 0 ?
          Array.from(beacon.fingerprint).reduce((a, b) => a + b, 0) / (beacon.fingerprint.length * 255) : 0.5,
        prime_sequence: beacon.index,
        resonance_signature: beacon.index.join('-')
      },
      epoch: beacon.epoch,
      fingerprint: Buffer.from(beacon.fingerprint),
      signature: Buffer.from(beacon.signature),
      metadata: { beaconType: 'comment' }
    };
    
    try {
      await db.createBeacon(beaconData);
    } catch (err) {
      console.error('Error saving comment beacon', err instanceof Error ? err.message : err);
      throw err;
    }

    // Then save the comment reference using raw query
    const commentSql = `
      INSERT INTO comments (comment_id, post_beacon_id, author_id, comment_beacon_id, created_at)
      VALUES ($1, $2, $3, $4, $5)
    `;
    
    try {
      await db.query(commentSql, [
        commentId,
        postBeaconId,
        authorId,
        beaconId,
        new Date().toISOString()
      ]);
      console.log(`Comment ${commentId} saved to database.`);
    } catch (err) {
      console.error('Error saving comment', err instanceof Error ? err.message : err);
      throw err;
    }
  }

  async toggleLike(userId: string, postBeaconId: string): Promise<{ liked: boolean }> {
    const db = getDatabase();
    
    // Check if already liked using PostgreSQL syntax
    const checkSql = `SELECT * FROM likes WHERE post_beacon_id = $1 AND user_id = $2`;
    
    try {
      const result = await db.query(checkSql, [postBeaconId, userId]);
      const exists = result.length > 0;

      if (exists) {
        // Unlike using adapter method
        const success = await db.unlikeBeacon(userId, postBeaconId);
        if (success) {
          console.log(`User ${userId} unliked post ${postBeaconId}`);
          return { liked: false };
        } else {
          throw new Error('Failed to unlike post');
        }
      } else {
        // Like using adapter method
        const success = await db.likeBeacon(userId, postBeaconId);
        if (success) {
          console.log(`User ${userId} liked post ${postBeaconId}`);
          return { liked: true };
        } else {
          throw new Error('Failed to like post');
        }
      }
    } catch (err) {
      console.error('Error toggling like', err instanceof Error ? err.message : err);
      throw err;
    }
  }
}