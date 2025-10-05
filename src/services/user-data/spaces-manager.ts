/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * User Spaces Management
 * Handles user space membership tracking
 */

import { BeaconSubmitter } from './beacon-submission';
import type { SpaceMembership } from './types';

const STORAGE_KEY = 'user_spaces_list';

export class SpacesManager {
  private spacesList: SpaceMembership[] = [];
  private currentUserId: string | null = null;

  constructor(private beaconSubmitter: BeaconSubmitter) {
    console.log('[SpacesManager] Constructor called');
    this.loadFromStorage();
  }

  /**
   * Set current user (called during initialization)
   */
  setCurrentUser(userId: string): void {
    console.log('[SpacesManager] setCurrentUser called with:', userId);
    if (this.currentUserId !== userId) {
      this.currentUserId = userId;
      this.loadFromStorage();
    } else {
      console.log('[SpacesManager] User ID unchanged, skipping reload');
    }
  }

  /**
   * Load from localStorage
   */
  private loadFromStorage(): void {
    if (!this.currentUserId) {
      console.log('[SpacesManager] loadFromStorage skipped: no currentUserId');
      return;
    }
    
    try {
      const key = `${STORAGE_KEY}_${this.currentUserId}`;
      console.log('[SpacesManager] Loading from localStorage key:', key);
      const stored = localStorage.getItem(key);
      if (stored) {
        this.spacesList = JSON.parse(stored);
        console.log('[SpacesManager] Loaded from localStorage:', this.spacesList.length, 'spaces', this.spacesList);
      } else {
        console.log('[SpacesManager] No data found in localStorage for key:', key);
      }
    } catch (error) {
      console.error('[SpacesManager] Failed to load from localStorage:', error);
    }
  }

  /**
   * Save to localStorage
   */
  private saveToStorage(): void {
    if (!this.currentUserId) {
      console.warn('[SpacesManager] saveToStorage skipped: no currentUserId');
      return;
    }
    
    try {
      const key = `${STORAGE_KEY}_${this.currentUserId}`;
      localStorage.setItem(key, JSON.stringify(this.spacesList));
      console.log('[SpacesManager] Saved to localStorage key:', key, 'spaces:', this.spacesList.length, this.spacesList);
    } catch (error) {
      console.error('[SpacesManager] Failed to save to localStorage:', error);
    }
  }

  /**
   * Join a space or update role if already joined
   */
  async joinSpace(spaceId: string, role: string, currentUserId: string | null): Promise<void> {
    const existingIndex = this.spacesList.findIndex(s => s.spaceId === spaceId);
    
    if (existingIndex >= 0) {
      // Update role if it's different
      if (this.spacesList[existingIndex].role !== role) {
        this.spacesList[existingIndex] = {
          ...this.spacesList[existingIndex],
          role
        };
      } else {
        return; // Already in space with same role
      }
    } else {
      // Add new space membership
      this.spacesList.push({
        spaceId,
        role,
        joinedAt: new Date().toISOString()
      });
    }

    this.saveToStorage();
    await this.beaconSubmitter.submitSpacesListBeacon(this.spacesList, currentUserId);
  }

  /**
   * Leave a space
   */
  async leaveSpace(spaceId: string, currentUserId: string | null): Promise<void> {
    this.spacesList = this.spacesList.filter(s => s.spaceId !== spaceId);
    this.saveToStorage();
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
    this.saveToStorage();
  }
}