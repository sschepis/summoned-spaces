import type { Beacon } from './protocol'; // Using our placeholder Beacon type
import { SocialGraphManager } from './social';
import { ConnectionManager } from './connections';
import { getDatabase } from './database';

export class PostManager {
  private socialGraphManager: SocialGraphManager;
  private connectionManager: ConnectionManager;

  constructor(socialGraphManager: SocialGraphManager, connectionManager: ConnectionManager) {
    this.socialGraphManager = socialGraphManager;
    this.connectionManager = connectionManager;
    console.log('PostManager initialized');
  }

  async handleBeaconSubmission(
    userId: string,
    beacon: Beacon,
    beaconType: string = 'post'
  ): Promise<{ postId: string; beaconId: string }> {
    console.log(`Received ${beaconType} beacon submission from user ${userId}`);

    // --- Mock Validation ---
    if (!beacon.signature || beacon.signature.length === 0) {
        throw new Error("Invalid beacon: Signature is missing.");
    }
    console.log('Mock validation passed for beacon fingerprint:', beacon.fingerprint);

    // --- Persistence ---
    const beaconId = `beacon_${Math.random().toString(36).substr(2, 9)}`;
    await this.saveBeaconToDb(beaconId, userId, beacon, beaconType);
    
    // --- Propagation (only for posts, not user data beacons) ---
    if (beaconType === 'post') {
      this.propagateBeacon(userId, beacon);
    }

    const postId = `post_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`Beacon processed. Type: ${beaconType}, PostID: ${postId}, BeaconID: ${beaconId}`);

    return { postId, beaconId };
  }

  private async propagateBeacon(authorId: string, beacon: Beacon): Promise<void> {
    const followers = await this.socialGraphManager.getFollowers(authorId);
    
    const recipients = new Set<string>(followers);
    recipients.add(authorId);

    console.log(`Propagating beacon from ${authorId} to recipients:`, Array.from(recipients));

    for (const recipientId of recipients) {
      const connections = this.connectionManager.getConnectionsByUserId(recipientId);
      for (const ws of connections) {
        try {
          ws.send(JSON.stringify({
            kind: 'newPostBeacon',
            payload: {
              authorId,
              beacon,
            }
          }));
          console.log(`Sent beacon to recipient ${recipientId}`);
        } catch (error) {
          console.error(`Failed to send beacon to recipient ${recipientId}:`, error);
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
    const sql = `
      INSERT INTO beacons (beacon_id, beacon_type, author_id, prime_indices, epoch, fingerprint, signature, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      beaconId,
      beaconType,
      authorId,
      JSON.stringify(beacon.index),
      beacon.epoch,
      beacon.fingerprint,
      beacon.signature,
      new Date().toISOString()
    ];

    return new Promise((resolve, reject) => {
      db.run(sql, params, (err: Error | null) => {
        if (err) {
          console.error('Error saving beacon to DB', err.message);
          return reject(err);
        }
        console.log(`Beacon ${beaconId} saved to database.`);
        resolve();
      });
    });
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
    const commentId = `comment_${Math.random().toString(36).substr(2, 9)}`;
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
    const beaconId = `beacon_${Math.random().toString(36).substr(2, 9)}`;
    const beaconSql = `
      INSERT INTO beacons (beacon_id, author_id, prime_indices, epoch, fingerprint, signature, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    await new Promise<void>((resolve, reject) => {
      db.run(beaconSql, [
        beaconId,
        authorId,
        JSON.stringify(beacon.index),
        beacon.epoch,
        beacon.fingerprint,
        beacon.signature,
        new Date().toISOString()
      ], (err: Error | null) => {
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
      ], (err: Error | null) => {
        if (err) {
          console.error('Error saving comment', err.message);
          return reject(err);
        }
        console.log(`Comment ${commentId} saved to database.`);
        resolve();
      });
    });
  }

  async toggleLike(userId: string, postBeaconId: string): Promise<{ liked: boolean }> {
    const db = getDatabase();
    
    // Check if already liked
    const checkSql = `SELECT * FROM likes WHERE post_beacon_id = ? AND user_id = ?`;
    
    const exists = await new Promise<boolean>((resolve, reject) => {
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
      await new Promise<void>((resolve, reject) => {
        db.run(deleteSql, [postBeaconId, userId], (err: Error | null) => {
          if (err) {
            console.error('Error unliking post', err.message);
            return reject(err);
          }
          console.log(`User ${userId} unliked post ${postBeaconId}`);
          resolve();
        });
      });
      return { liked: false };
    } else {
      // Like
      const insertSql = `INSERT INTO likes (post_beacon_id, user_id, created_at) VALUES (?, ?, ?)`;
      await new Promise<void>((resolve, reject) => {
        db.run(insertSql, [postBeaconId, userId, new Date().toISOString()], (err: Error | null) => {
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