/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Space Member Management
 * Handles member operations (add, remove, update roles)
 */

import { beaconCacheManager } from '../beacon-cache';
import { holographicMemoryManager } from '../holographic-memory';
import { parseJsonWithRepair } from '../utils/json-repair';
import { BEACON_TYPES } from '../../constants/beaconTypes';
import type { SpaceMember, SpaceRole } from './types';

export class MemberManager {
  private spaceMemberLists: Map<string, SpaceMember[]> = new Map();

  /**
   * Get space members (with caching)
   */
  async getSpaceMembers(spaceId: string): Promise<SpaceMember[]> {
    // Check cache first
    if (this.spaceMemberLists.has(spaceId)) {
      return this.spaceMemberLists.get(spaceId)!;
    }

    try {
      console.log(`[MemberManager] Fetching members for space ${spaceId}`);
      
      const allSpaceMemberBeacons = await beaconCacheManager.getBeaconsByType(BEACON_TYPES.SPACE_MEMBERS);
      console.log(`[MemberManager] Found ${allSpaceMemberBeacons.length} space_members beacons`);
      
      let latestBeacon = null;
      let latestTimestamp = 0;
      
      // Find most recent beacon for this specific space
      for (const beacon of allSpaceMemberBeacons) {
        try {
          const decoded = holographicMemoryManager.decodeMemory(beacon as any);
          if (decoded) {
            const data = parseJsonWithRepair(decoded);
            if (data && (data as any).spaceId === spaceId && (data as any).version > latestTimestamp) {
              latestBeacon = beacon;
              latestTimestamp = (data as any).version;
            }
          }
        } catch (error) {
          console.warn(`[MemberManager] Could not decode beacon:`, error);
        }
      }
      
      if (!latestBeacon) {
        console.log(`[MemberManager] No member list beacon found for space ${spaceId}`);
        return [];
      }

      const decoded = holographicMemoryManager.decodeMemory(latestBeacon as any);
      if (!decoded) {
        console.log(`[MemberManager] Could not decode member list for space ${spaceId}`);
        return [];
      }

      const data = parseJsonWithRepair(decoded);
      const members = (data as any)?.members || [];
      
      console.log(`[MemberManager] Found ${members.length} members for space ${spaceId}`);
      this.spaceMemberLists.set(spaceId, members);
      
      return members;
    } catch (error) {
      console.error(`[MemberManager] Error getting space members for ${spaceId}:`, error);
      return [];
    }
  }

  /**
   * Check if user is a member
   */
  async isMember(spaceId: string, userId: string): Promise<boolean> {
    const members = await this.getSpaceMembers(spaceId);
    return members.some(m => m.userId === userId);
  }

  /**
   * Get user's role in a space
   */
  async getUserRole(spaceId: string, userId: string): Promise<SpaceRole | null> {
    const members = await this.getSpaceMembers(spaceId);
    const member = members.find(m => m.userId === userId);
    return member?.role || null;
  }

  /**
   * Update cached member list
   */
  updateMemberCache(spaceId: string, members: SpaceMember[]): void {
    this.spaceMemberLists.set(spaceId, members);
  }

  /**
   * Clear member cache for a space
   */
  clearSpaceMemberCache(spaceId: string, hasCurrentUser: boolean): void {
    console.log(`[MemberManager] Clearing member cache for space: ${spaceId}`);
    
    if (hasCurrentUser) {
      this.spaceMemberLists.delete(spaceId);
      console.log(`[MemberManager] Cache cleared for space: ${spaceId}`);
    } else {
      console.log(`[MemberManager] Skipping cache clear during initialization`);
    }
  }

  /**
   * Clear all caches
   */
  clear(): void {
    this.spaceMemberLists.clear();
  }
}