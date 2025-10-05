/* eslint-disable @typescript-eslint/no-explicit-any */
import { beaconCacheManager, CachedBeacon } from './beacon-cache';
import { holographicMemoryManager } from './holographic-memory';
import { communicationManager, type CommunicationMessage } from './communication-manager';

/**
 * FollowerDiscoveryService - Discovers followers by decoding following list beacons
 * Since all data is encrypted, we need to:
 * 1. Fetch all user_following_list beacons
 * 2. Try to decode each one (only works if we have permission)
 * 3. Check if the decoded list contains our user ID
 */
class FollowerDiscoveryService {
  private followerCache: Map<string, Set<string>> = new Map(); // userId -> Set of follower IDs
  private lastUpdate: Map<string, number> = new Map(); // userId -> timestamp
  private cacheDuration = 5 * 60 * 1000; // 5 minutes

  /**
   * Discover who follows a specific user
   * This is computationally expensive as it requires fetching and attempting to decode
   * all following list beacons in the system
   */
  async discoverFollowers(userId: string): Promise<string[]> {
    // Check cache first
    const cached = this.getFromCache(userId);
    if (cached) {
      console.log(`Returning cached followers for ${userId}`);
      return Array.from(cached);
    }

    console.log(`Discovering followers for ${userId}...`);
    const followers = new Set<string>();

    try {
      // Fetch all following list beacons
      const allBeacons = await this.fetchAllFollowingBeacons();
      
      console.log(`Found ${allBeacons.length} following list beacons to check`);

      // Try to decode each beacon and check if it contains our userId
      for (const beacon of allBeacons) {
        try {
          // Attempt to decode the beacon
          const decoded = holographicMemoryManager.decodeMemory(beacon as any);
          
          if (decoded) {
            const data = JSON.parse(decoded);
            
            // Check if this following list contains our userId
            if (data.following && Array.isArray(data.following)) {
              if (data.following.includes(userId)) {
                followers.add(beacon.author_id);
                console.log(`User ${beacon.author_id} follows ${userId}`);
              }
            }
          }
        } catch (error) {
          // Expected to fail for beacons we don't have permission to decode
          // Silent fail - this is normal behavior
        }
      }

      // Update cache
      this.followerCache.set(userId, followers);
      this.lastUpdate.set(userId, Date.now());

      console.log(`Discovered ${followers.size} followers for ${userId}`);
      return Array.from(followers);
    } catch (error) {
      console.error('Error discovering followers:', error);
      return [];
    }
  }

  /**
   * Discover all users that a specific user follows
   * This is simpler - we just need to fetch and decode their following list beacon
   */
  async discoverFollowing(userId: string): Promise<string[]> {
    try {
      const beacon = await beaconCacheManager.getMostRecentBeacon(userId, 'user_following_list');
      
      if (!beacon) {
        console.log(`No following list beacon found for ${userId}`);
        return [];
      }

      const decoded = holographicMemoryManager.decodeMemory(beacon as any);
      
      if (!decoded) {
        console.log(`Could not decode following list for ${userId}`);
        return [];
      }

      const data = JSON.parse(decoded);
      return data.following || [];
    } catch (error) {
      console.error('Error discovering following:', error);
      return [];
    }
  }

  /**
   * Check if user A follows user B
   */
  async checkIfFollows(userA: string, userB: string): Promise<boolean> {
    const following = await this.discoverFollowing(userA);
    return following.includes(userB);
  }

  /**
   * Get mutual connections between current user and another user
   */
  async getMutualConnections(currentUserId: string, targetUserId: string): Promise<string[]> {
    const currentFollowing = await this.discoverFollowing(currentUserId);
    const targetFollowing = await this.discoverFollowing(targetUserId);
    
    // Find intersection
    return currentFollowing.filter(id => targetFollowing.includes(id));
  }

  /**
   * Fetch all following list beacons from the server via SSE
   */
  private async fetchAllFollowingBeacons(): Promise<CachedBeacon[]> {
    return new Promise((resolve, reject) => {
      let resolved = false;
      
      const handleMessage = (message: CommunicationMessage) => {
        if (resolved) return;
        
        if (message.kind === 'beaconsResponse') {
          const beacons = (message.payload as any).beacons as CachedBeacon[];
          resolved = true;
          resolve(beacons);
        } else if (message.kind === 'error') {
          resolved = true;
          reject(new Error((message.payload as any).message));
        }
      };

      // Register message handler
      communicationManager.onMessage(handleMessage);
      
      // Request all following list beacons (no user filter)
      communicationManager.send({
        kind: 'getBeaconsByUser',
        payload: {
          userId: '*', // Special marker to get all users' beacons
          beaconType: 'user_following_list'
        }
      }).catch(error => {
        if (!resolved) {
          resolved = true;
          reject(error);
        }
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          reject(new Error('Fetch all following beacons timed out'));
        }
      }, 10000);
    });
  }

  /**
   * Get followers from cache if available and fresh
   */
  private getFromCache(userId: string): Set<string> | null {
    const cached = this.followerCache.get(userId);
    const lastUpdate = this.lastUpdate.get(userId);

    if (cached && lastUpdate && (Date.now() - lastUpdate) < this.cacheDuration) {
      return cached;
    }

    return null;
  }

  /**
   * Invalidate cache for a specific user
   */
  invalidateCache(userId: string): void {
    this.followerCache.delete(userId);
    this.lastUpdate.delete(userId);
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.followerCache.clear();
    this.lastUpdate.clear();
  }
}

export const followerDiscoveryService = new FollowerDiscoveryService();