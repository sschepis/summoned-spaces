/* eslint-disable @typescript-eslint/no-explicit-any */
import { beaconCacheManager, CachedBeacon } from './beacon-cache';
import { holographicMemoryManager } from './holographic-memory';
import { SpaceMember } from './space-manager';

/**
 * SpaceDiscoveryService - Discovers space membership by decoding space_members beacons
 */
class SpaceDiscoveryService {
  private memberCache: Map<string, SpaceMember[]> = new Map(); // spaceId -> members
  private lastUpdate: Map<string, number> = new Map(); // spaceId -> timestamp
  private cacheDuration = 5 * 60 * 1000; // 5 minutes

  /**
   * Discover all members of a space
   */
  async discoverSpaceMembers(spaceId: string): Promise<SpaceMember[]> {
    // Check cache first
    const cached = this.getFromCache(spaceId);
    if (cached) {
      console.log(`Returning cached members for space ${spaceId}`);
      return cached;
    }

    console.log(`Discovering members for space ${spaceId}...`);

    try {
      // Fetch the most recent space_members beacon
      const beacon = await beaconCacheManager.getMostRecentBeacon(spaceId, 'space_members');
      
      if (!beacon) {
        console.log(`No member beacon found for space ${spaceId}`);
        return [];
      }

      // Try to decode the beacon
      const decoded = holographicMemoryManager.decodeMemory(beacon as any);
      
      if (!decoded) {
        console.log(`Could not decode member list for space ${spaceId}`);
        return [];
      }

      const data = JSON.parse(decoded);
      const members = data.members || [];

      // Update cache
      this.memberCache.set(spaceId, members);
      this.lastUpdate.set(spaceId, Date.now());

      console.log(`Discovered ${members.length} members for space ${spaceId}`);
      return members;
    } catch (error) {
      console.error(`Error discovering space members for ${spaceId}:`, error);
      return [];
    }
  }

  /**
   * Discover all spaces where a user is a member
   * This requires checking all space_members beacons
   */
  async discoverUserSpaces(userId: string): Promise<string[]> {
    console.log(`Discovering spaces for user ${userId}...`);
    const userSpaces: string[] = [];

    try {
      // Fetch all space_members beacons
      const allBeacons = await this.fetchAllSpaceBeacons();
      
      console.log(`Found ${allBeacons.length} space beacons to check`);

      // Try to decode each beacon and check if user is a member
      for (const beacon of allBeacons) {
        try {
          const decoded = holographicMemoryManager.decodeMemory(beacon as any);
          
          if (decoded) {
            const data = JSON.parse(decoded);
            
            if (data.members && Array.isArray(data.members)) {
              const isMember = data.members.some((m: SpaceMember) => m.userId === userId);
              if (isMember) {
                // Extract spaceId from beacon author_id or metadata
                userSpaces.push(beacon.author_id);
                console.log(`User ${userId} is a member of space ${beacon.author_id}`);
              }
            }
          }
        } catch (error) {
          // Expected to fail for beacons we don't have permission to decode
          // Silent fail - this is normal behavior
        }
      }

      console.log(`Discovered ${userSpaces.length} spaces for user ${userId}`);
      return userSpaces;
    } catch (error) {
      console.error('Error discovering user spaces:', error);
      return [];
    }
  }

  /**
   * Check if a user is a member of a space
   */
  async checkMembership(spaceId: string, userId: string): Promise<boolean> {
    const members = await this.discoverSpaceMembers(spaceId);
    return members.some(m => m.userId === userId);
  }

  /**
   * Get a user's role in a space
   */
  async getUserRole(spaceId: string, userId: string): Promise<string | null> {
    const members = await this.discoverSpaceMembers(spaceId);
    const member = members.find(m => m.userId === userId);
    return member?.role || null;
  }

  /**
   * Get space admins
   */
  async getSpaceAdmins(spaceId: string): Promise<SpaceMember[]> {
    const members = await this.discoverSpaceMembers(spaceId);
    return members.filter(m => m.role === 'admin' || m.role === 'owner');
  }

  /**
   * Get space owner
   */
  async getSpaceOwner(spaceId: string): Promise<SpaceMember | null> {
    const members = await this.discoverSpaceMembers(spaceId);
    return members.find(m => m.role === 'owner') || null;
  }

  /**
   * Count members in a space
   */
  async getMemberCount(spaceId: string): Promise<number> {
    const members = await this.discoverSpaceMembers(spaceId);
    return members.length;
  }

  /**
   * Fetch all space_members beacons from the server
   */
  private async fetchAllSpaceBeacons(): Promise<CachedBeacon[]> {
    try {
      // Use the beacon cache manager to fetch all space_members beacons
      const beacons = await beaconCacheManager.getBeaconsByUser('*', 'space_members');
      return beacons;
    } catch (error) {
      console.error('Error fetching space beacons:', error);
      return [];
    }
  }

  /**
   * Get members from cache if available and fresh
   */
  private getFromCache(spaceId: string): SpaceMember[] | null {
    const cached = this.memberCache.get(spaceId);
    const lastUpdate = this.lastUpdate.get(spaceId);

    if (cached && lastUpdate && (Date.now() - lastUpdate) < this.cacheDuration) {
      return cached;
    }

    return null;
  }

  /**
   * Invalidate cache for a specific space
   */
  invalidateCache(spaceId: string): void {
    this.memberCache.delete(spaceId);
    this.lastUpdate.delete(spaceId);
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.memberCache.clear();
    this.lastUpdate.clear();
  }
}

export const spaceDiscoveryService = new SpaceDiscoveryService();