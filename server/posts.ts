import type { Beacon } from './protocol'; // Using our placeholder Beacon type
import { SocialGraphManager } from './social';
import { ConnectionManager } from './connections';

export class PostManager {
  private socialGraphManager: SocialGraphManager;
  private connectionManager: ConnectionManager;

  constructor(socialGraphManager: SocialGraphManager, connectionManager: ConnectionManager) {
    this.socialGraphManager = socialGraphManager;
    this.connectionManager = connectionManager;
    console.log('PostManager initialized');
  }

  async handleBeaconSubmission(userId: string, beacon: Beacon): Promise<{ postId: string; beaconId: string }> {
    console.log(`Received beacon submission from user ${userId}`);

    // --- Mock Validation ---
    if (!beacon.signature || beacon.signature.length === 0) {
        throw new Error("Invalid beacon: Signature is missing.");
    }
    console.log('Mock validation passed for beacon fingerprint:', beacon.fingerprint);
    
    // --- Propagation ---
    this.propagateBeaconToFollowers(userId, beacon);

    const postId = `post_${Math.random().toString(36).substr(2, 9)}`;
    const beaconId = `beacon_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`Beacon processed. PostID: ${postId}, BeaconID: ${beaconId}`);

    return { postId, beaconId };
  }

  private propagateBeaconToFollowers(authorId: string, beacon: Beacon): void {
    const followers = this.socialGraphManager.getFollowers(authorId);
    console.log(`Propagating beacon from ${authorId} to followers:`, followers);

    for (const followerId of followers) {
      const connections = this.connectionManager.getConnectionsByUserId(followerId);
      for (const ws of connections) {
        try {
          ws.send(JSON.stringify({
            kind: 'newPostBeacon',
            payload: {
              authorId,
              beacon,
            }
          }));
          console.log(`Sent beacon to follower ${followerId}`);
        } catch (error) {
          console.error(`Failed to send beacon to follower ${followerId}:`, error);
        }
      }
    }
  }
}