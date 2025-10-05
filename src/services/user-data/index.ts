/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * User Data Management Module
 * Main export for refactored user data functionality
 */

import type { HolographicMemoryManager } from '../holographic-memory';
import { beaconCacheManager } from '../beacon-cache';
import { BEACON_TYPES } from '../../constants/beaconTypes';
import { extractJsonPayload } from '../utils/json-repair';
import { BeaconSubmitter } from './beacon-submission';
import { FollowingManager } from './following-manager';
import { SpacesManager } from './spaces-manager';

// Re-export types
export type { SpaceMembership, FollowingListData, SpacesListData } from './types';

/**
 * Main User Data Manager
 * Coordinates user data operations through specialized managers
 */
export class UserDataManager {
  private currentUserId: string | null = null;
  private beaconSubmitter: BeaconSubmitter;
  private followingManager: FollowingManager;
  private spacesManager: SpacesManager;

  constructor(
    private holographicMemoryManager: HolographicMemoryManager
  ) {
    this.beaconSubmitter = new BeaconSubmitter(holographicMemoryManager);
    this.followingManager = new FollowingManager(this.beaconSubmitter);
    this.spacesManager = new SpacesManager(this.beaconSubmitter);
  }

  /**
   * Initialize with current user ID
   */
  setCurrentUser(userId: string): void {
    this.currentUserId = userId;
  }

  /**
   * Load user's existing beacons from server
   */
  async loadUserData(): Promise<void> {
    if (!this.currentUserId) {
      console.error('Cannot load user data: currentUserId not set');
      return;
    }

    try {
      // Using SSE for real-time updates
      // Just proceed with loading the data
      console.log('[UserDataManager] Loading user data for:', this.currentUserId);

      // Load following list
      await this.loadFollowingList();
      
      // Load spaces list
      await this.loadSpacesList();
      
      console.log('[UserDataManager] User data loaded successfully');
      
    } catch (error) {
      console.error('[UserDataManager] Failed to load user data:', error);
      throw error;
    }
  }

  /**
   * Load following list from beacon
   */
  private async loadFollowingList(): Promise<void> {
    if (!this.currentUserId) return;

    const followingBeacon = await beaconCacheManager.getMostRecentBeacon(
      this.currentUserId,
      BEACON_TYPES.USER_FOLLOWING_LIST
    );

    if (followingBeacon) {
      const decoded = this.holographicMemoryManager.decodeMemory(followingBeacon as any);
      if (decoded) {
        const payload = typeof decoded === 'string' ? extractJsonPayload(decoded) : null;

        if (payload && Array.isArray(payload.following)) {
          const followingList = (payload.following as unknown[])
            .filter((id): id is string => typeof id === 'string');
          this.followingManager.setFollowingList(followingList);
          console.log('Loaded following list:', followingList);
        } else {
          console.warn('Decoded following beacon but could not extract payload', decoded);
          this.followingManager.setFollowingList([]);
        }
      } else {
        console.log('No data decoded from following beacon');
        this.followingManager.setFollowingList([]);
      }
    }
  }

  /**
   * Load spaces list from beacon
   */
  private async loadSpacesList(): Promise<void> {
    if (!this.currentUserId) return;

    const spacesBeacon = await beaconCacheManager.getMostRecentBeacon(
      this.currentUserId,
      BEACON_TYPES.USER_SPACES_LIST
    );

    if (spacesBeacon) {
      const decoded = this.holographicMemoryManager.decodeMemory(spacesBeacon as any);
      if (decoded) {
        const payload = typeof decoded === 'string' ? extractJsonPayload(decoded) : null;

        if (payload && Array.isArray(payload.spaces)) {
          const spacesList = (payload.spaces as unknown[])
            .filter((space): space is { spaceId: string; role: string; joinedAt: string } =>
              typeof space === 'object' && space !== null &&
              typeof (space as { spaceId?: unknown }).spaceId === 'string' &&
              typeof (space as { role?: unknown }).role === 'string' &&
              typeof (space as { joinedAt?: unknown }).joinedAt === 'string'
            );
          this.spacesManager.setSpacesList(spacesList);
          console.log('Loaded spaces list:', spacesList);
        } else {
          console.warn('Decoded spaces beacon but could not extract payload', decoded);
          this.spacesManager.setSpacesList([]);
        }
      } else {
        console.log('No data decoded from spaces beacon');
        this.spacesManager.setSpacesList([]);
      }
    }
  }

  /**
   * Follow user
   */
  async followUser(userIdToFollow: string): Promise<void> {
    await this.followingManager.followUser(userIdToFollow, this.currentUserId);
  }

  /**
   * Unfollow user
   */
  async unfollowUser(userId: string): Promise<void> {
    await this.followingManager.unfollowUser(userId, this.currentUserId);
  }

  /**
   * Join space
   */
  async joinSpace(spaceId: string, role: string = 'member'): Promise<void> {
    await this.spacesManager.joinSpace(spaceId, role, this.currentUserId);
  }

  /**
   * Leave space
   */
  async leaveSpace(spaceId: string): Promise<void> {
    await this.spacesManager.leaveSpace(spaceId, this.currentUserId);
  }

  /**
   * Get following list
   */
  getFollowingList(): string[] {
    return this.followingManager.getFollowingList();
  }

  /**
   * Get spaces list
   */
  getSpacesList() {
    return this.spacesManager.getSpacesList();
  }
}

// Export singleton instance for backward compatibility
import { holographicMemoryManager } from '../holographic-memory';
export const userDataManager = new UserDataManager(holographicMemoryManager);