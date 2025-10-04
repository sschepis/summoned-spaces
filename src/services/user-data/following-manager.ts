/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Following List Management
 * Handles user following operations
 */

import type { WebSocketService } from '../websocket';
import { communicationManager } from '../communication-manager';
import type { CommunicationMessage } from '../communication-manager';
import { BeaconSubmitter } from './beacon-submission';

export class FollowingManager {
  private followingList: string[] = [];

  constructor(
    private webSocketService: WebSocketService,
    private beaconSubmitter: BeaconSubmitter
  ) {}

  /**
   * Add user to following list
   */
  async followUser(userIdToFollow: string, currentUserId: string | null): Promise<void> {
    console.log(`[FollowingManager] followUser called for: ${userIdToFollow}`);
    
    if (this.followingList.includes(userIdToFollow)) {
      console.log(`[FollowingManager] Already following ${userIdToFollow}`);
      return;
    }

    this.followingList.push(userIdToFollow);
    console.log(`[FollowingManager] Updated following list:`, this.followingList);
    
    // Send follow message to server
    try {
      if (this.webSocketService.isReady()) {
        this.webSocketService.sendFollowMessage(userIdToFollow);
      } else {
        const followMessage: CommunicationMessage = {
          kind: 'follow',
          payload: { userIdToFollow }
        };
        await communicationManager.send(followMessage);
      }
    } catch (error) {
      console.error('[FollowingManager] Error sending follow message:', error);
    }
    
    await this.beaconSubmitter.submitFollowingListBeacon(this.followingList, currentUserId);
  }

  /**
   * Remove user from following list
   */
  async unfollowUser(userId: string, currentUserId: string | null): Promise<void> {
    if (!this.followingList.includes(userId)) {
      return;
    }

    this.followingList = this.followingList.filter(id => id !== userId);
    
    // Send unfollow message to server
    try {
      if (this.webSocketService.isReady()) {
        this.webSocketService.sendUnfollowMessage(userId);
      } else {
        const unfollowMessage: CommunicationMessage = {
          kind: 'unfollow',
          payload: { userIdToUnfollow: userId }
        };
        await communicationManager.send(unfollowMessage);
      }
    } catch (error) {
      console.error('[FollowingManager] Error sending unfollow message:', error);
    }
    
    await this.beaconSubmitter.submitFollowingListBeacon(this.followingList, currentUserId);
  }

  /**
   * Get following list
   */
  getFollowingList(): string[] {
    return [...this.followingList];
  }

  /**
   * Set following list (for loading from beacon)
   */
  setFollowingList(list: string[]): void {
    this.followingList = list;
  }
}