/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * User Spaces Management
 * Handles user space membership tracking
 */

import { BeaconSubmitter } from './beacon-submission';
import type { SpaceMembership } from './types';

export class SpacesManager {
  private spacesList: SpaceMembership[] = [];

  constructor(private beaconSubmitter: BeaconSubmitter) {}

  /**
   * Join a space
   */
  async joinSpace(spaceId: string, role: string, currentUserId: string | null): Promise<void> {
    if (this.spacesList.some(s => s.spaceId === spaceId)) {
      return; // Already in space
    }

    this.spacesList.push({
      spaceId,
      role,
      joinedAt: new Date().toISOString()
    });

    await this.beaconSubmitter.submitSpacesListBeacon(this.spacesList, currentUserId);
  }

  /**
   * Leave a space
   */
  async leaveSpace(spaceId: string, currentUserId: string | null): Promise<void> {
    this.spacesList = this.spacesList.filter(s => s.spaceId !== spaceId);
    await this.beaconSubmitter.submitSpacesListBeacon(this.spacesList, currentUserId);
  }

  /**
   * Get spaces list
   */
  getSpacesList(): SpaceMembership[] {
    return [...this.spacesList];
  }

  /**
   * Set spaces list (for loading from beacon)
   */
  setSpacesList(list: SpaceMembership[]): void {
    this.spacesList = list;
  }
}