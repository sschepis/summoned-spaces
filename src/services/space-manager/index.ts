/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Space Manager Module
 * Main export for refactored space management functionality
 */

import { communicationManager } from '../communication-manager';
import { quantumNetworkOps } from '../quantum';
import { userDataManager } from '../user-data';
import { MemberManager } from './member-management';
import { SpaceQuantumOperations } from './quantum-operations';
import { SpaceBeaconOperations } from './beacon-operations';

// Re-export types
export type { SpaceRole, SpaceMember, SpaceMetadata } from './types';
import type { SpaceMember, SpaceRole, SpaceMetadata } from './types';

/**
 * Main Space Manager
 * Coordinates space operations through specialized managers
 */
class SpaceManager {
  private currentUserId: string | null = null;
  private spaceMetadata: Map<string, SpaceMetadata> = new Map();
  private initializationPromise: Promise<void> | null = null;
  private isInitialized: boolean = false;

  private memberManager: MemberManager;
  private quantumOps: SpaceQuantumOperations;
  private beaconOps: SpaceBeaconOperations;

  constructor() {
    this.memberManager = new MemberManager();
    this.quantumOps = new SpaceQuantumOperations();
    this.beaconOps = new SpaceBeaconOperations();
  }

  /**
   * Initialize with current user ID
   */
  setCurrentUser(userId: string): void {
    this.currentUserId = userId;
    console.log(`[SpaceManager] Current user set to: ${userId}`);
    
    // Initialize user's quantum node if it doesn't exist
    const userNode = quantumNetworkOps.getNode(userId);
    if (!userNode) {
      quantumNetworkOps.createQuantumNode(userId);
      console.log(`[SpaceManager] Created quantum node for user ${userId}`);
    }
  }

  /**
   * Initialize SpaceManager for session restoration
   */
  async initializeForUser(userId: string): Promise<void> {
    console.log(`[SpaceManager] Initializing for user: ${userId}`);
    
    if (this.initializationPromise && this.currentUserId === userId) {
      console.log(`[SpaceManager] Already initializing for user ${userId}, waiting...`);
      return this.initializationPromise;
    }
    
    if (this.isInitialized && this.currentUserId === userId) {
      console.log(`[SpaceManager] Already initialized for user ${userId}`);
      return Promise.resolve();
    }
    
    this.isInitialized = false;
    this.setCurrentUser(userId);
    
    this.initializationPromise = (async () => {
      try {
        // Pre-load user's space memberships (now a no-op with SSE)
        await this.loadUserSpaces(userId);
        
        this.isInitialized = true;
        console.log(`[SpaceManager] Successfully initialized for user ${userId}`);
      } catch (error) {
        console.error(`[SpaceManager] Failed to initialize for user ${userId}:`, error);
        this.isInitialized = false;
        throw error;
      } finally {
        this.initializationPromise = null;
      }
    })();
    
    return this.initializationPromise;
  }

  /**
   * Wait for initialization
   */
  async waitForInitialization(): Promise<void> {
    if (this.isInitialized) {
      return Promise.resolve();
    }
    
    if (this.initializationPromise) {
      return this.initializationPromise;
    }
    
    throw new Error('SpaceManager not initialized. Call initializeForUser() first.');
  }

  /**
   * Check if ready
   */
  isReady(): boolean {
    return this.isInitialized && this.currentUserId !== null;
  }

  /**
   * Load all spaces a user is a member of
   * NOTE: This is deprecated with the move to SSE. Space memberships are now loaded
   * via SSE events rather than WebSocket requests. Keeping this as a minimal operation
   * for backward compatibility.
   */
  private async loadUserSpaces(userId: string): Promise<void> {
    console.log(`[SpaceManager] Skipping space loading for user ${userId} (SSE handles space data)`);
    // No-op: SSE will populate the cache via real-time events
    return Promise.resolve();
  }

  /**
   * Create a new space
   */
  async createSpace(name: string, description: string, isPublic: boolean, userId?: string): Promise<string> {
    await this.waitForInitialization();
    
    const effectiveUserId = userId || this.currentUserId;
    
    if (!effectiveUserId) {
      throw new Error('User not authenticated. Please log in and try again.');
    }
    
    if (!this.currentUserId) {
      this.setCurrentUser(effectiveUserId);
    }

    // Ensure communication manager is connected
    await communicationManager.connect();

    try {
      // Send create space request - response comes back from send()
      await communicationManager.send({
        kind: 'createSpace',
        payload: { name, description, isPublic }
      });

      // For now, generate a temporary space ID
      // The actual space creation will be handled by the server and sent via SSE
      const tempSpaceId = `space_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      // Initialize space metadata
      this.spaceMetadata.set(tempSpaceId, {
        spaceId: tempSpaceId,
        name,
        description,
        isPublic,
        createdAt: new Date().toISOString()
      });

      // Initialize member list with creator as owner
      const initialMembers: SpaceMember[] = [{
        userId: effectiveUserId,
        role: 'owner',
        joinedAt: new Date().toISOString()
      }];

      // Create quantum node for the space
      await this.quantumOps.createSpaceQuantumNode(tempSpaceId);

      // Create quantum entanglement
      await this.quantumOps.createUserSpaceEntanglement(effectiveUserId, tempSpaceId);
      
      // Submit initial member list beacon
      await this.beaconOps.submitSpaceMemberBeacon(tempSpaceId, initialMembers);
      this.memberManager.updateMemberCache(tempSpaceId, initialMembers);
      
      // Add to user's personal spaces list
      await userDataManager.joinSpace(tempSpaceId, 'owner');
      
      console.log(`[SpaceManager] Space ${tempSpaceId} created`);
      return tempSpaceId;
    } catch (error) {
      console.error('[SpaceManager] Failed to create space:', error);
      throw error;
    }
  }

  /**
   * Add member to space
   */
  async addMember(spaceId: string, userId: string, role: SpaceRole = 'member'): Promise<void> {
    if (!this.currentUserId) {
      throw new Error('User not authenticated');
    }

    const members = await this.memberManager.getSpaceMembers(spaceId);
    
    if (members.some(m => m.userId === userId)) {
      console.log(`User ${userId} is already a member of space ${spaceId}`);
      return;
    }

    // Validate permission with quantum consensus
    const permissionValid = await this.quantumOps.validatePermissionWithConsensus(
      spaceId,
      this.currentUserId,
      'addMember',
      { targetUserId: userId, role },
      (spaceId) => this.memberManager.getSpaceMembers(spaceId)
    );

    if (!permissionValid) {
      throw new Error('Insufficient permissions to add members (quantum consensus failed)');
    }

    // Create quantum entanglement
    await this.quantumOps.createUserSpaceEntanglement(userId, spaceId);

    // Add new member
    const newMember: SpaceMember = {
      userId,
      role,
      joinedAt: new Date().toISOString()
    };

    const updatedMembers = [...members, newMember];
    
    // Use quantum teleportation to update member list
    await this.quantumOps.quantumUpdateMemberList(spaceId, updatedMembers);
    await this.beaconOps.submitSpaceMemberBeacon(spaceId, updatedMembers);
    this.memberManager.updateMemberCache(spaceId, updatedMembers);
    
    console.log(`User ${userId} added to space ${spaceId} with quantum entanglement`);
  }

  /**
   * Remove member from space
   */
  async removeMember(spaceId: string, userId: string): Promise<void> {
    if (!this.currentUserId) {
      throw new Error('User not authenticated');
    }

    const members = await this.memberManager.getSpaceMembers(spaceId);
    const currentUserMember = members.find(m => m.userId === this.currentUserId);
    
    if (!currentUserMember || (currentUserMember.role !== 'owner' && currentUserMember.role !== 'admin')) {
      throw new Error('Insufficient permissions to remove members');
    }

    const targetMember = members.find(m => m.userId === userId);
    if (targetMember?.role === 'owner') {
      throw new Error('Cannot remove space owner');
    }

    const updatedMembers = members.filter(m => m.userId !== userId);
    await this.beaconOps.submitSpaceMemberBeacon(spaceId, updatedMembers);
    this.memberManager.updateMemberCache(spaceId, updatedMembers);
  }

  /**
   * Update member role
   */
  async updateMemberRole(spaceId: string, userId: string, newRole: SpaceRole): Promise<void> {
    if (!this.currentUserId) {
      throw new Error('User not authenticated');
    }

    const members = await this.memberManager.getSpaceMembers(spaceId);
    const currentUserMember = members.find(m => m.userId === this.currentUserId);
    
    if (!currentUserMember || currentUserMember.role !== 'owner') {
      throw new Error('Only space owner can change member roles');
    }

    const targetMember = members.find(m => m.userId === userId);
    if (targetMember?.role === 'owner') {
      throw new Error('Cannot change owner role');
    }

    const updatedMembers = members.map(m => 
      m.userId === userId ? { ...m, role: newRole } : m
    );

    await this.beaconOps.submitSpaceMemberBeacon(spaceId, updatedMembers);
    this.memberManager.updateMemberCache(spaceId, updatedMembers);
  }

  /**
   * Join space
   */
  async joinSpace(spaceId: string): Promise<void> {
    if (!this.currentUserId) {
      throw new Error('User not authenticated');
    }

    const members = await this.memberManager.getSpaceMembers(spaceId);
    
    if (members.some(m => m.userId === this.currentUserId)) {
      console.log(`User ${this.currentUserId} is already a member of space ${spaceId}`);
      return;
    }

    const newMember: SpaceMember = {
      userId: this.currentUserId,
      role: 'member',
      joinedAt: new Date().toISOString()
    };

    const updatedMembers = [...members, newMember];
    await this.beaconOps.submitSpaceMemberBeacon(spaceId, updatedMembers);
    this.memberManager.updateMemberCache(spaceId, updatedMembers);
    await userDataManager.joinSpace(spaceId, 'member');

    console.log(`User ${this.currentUserId} joined space ${spaceId}`);
  }

  /**
   * Leave space
   */
  async leaveSpace(spaceId: string): Promise<void> {
    if (!this.currentUserId) {
      throw new Error('User not authenticated');
    }

    const members = await this.memberManager.getSpaceMembers(spaceId);
    const currentMember = members.find(m => m.userId === this.currentUserId);
    
    if (!currentMember) {
      console.log(`User ${this.currentUserId} is not a member of space ${spaceId}`);
      return;
    }

    if (currentMember.role === 'owner') {
      throw new Error('Space owner cannot leave. Transfer ownership or delete the space instead.');
    }

    const updatedMembers = members.filter(m => m.userId !== this.currentUserId);
    await this.beaconOps.submitSpaceMemberBeacon(spaceId, updatedMembers);
    this.memberManager.updateMemberCache(spaceId, updatedMembers);
    await userDataManager.leaveSpace(spaceId);

    console.log(`User ${this.currentUserId} left space ${spaceId}`);
  }

  /**
   * Get space members
   */
  async getSpaceMembers(spaceId: string): Promise<SpaceMember[]> {
    return this.memberManager.getSpaceMembers(spaceId);
  }

  /**
   * Check if user is member
   */
  async isMember(spaceId: string, userId: string): Promise<boolean> {
    return this.memberManager.isMember(spaceId, userId);
  }

  /**
   * Get user role
   */
  async getUserRole(spaceId: string, userId: string): Promise<SpaceRole | null> {
    return this.memberManager.getUserRole(spaceId, userId);
  }

  /**
   * Get user spaces (placeholder)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getUserSpaces(_userId: string): Promise<string[]> {
    return [];
  }

  /**
   * Clear space member cache
   */
  async clearSpaceMemberCache(spaceId: string): Promise<void> {
    this.memberManager.clearSpaceMemberCache(spaceId, this.currentUserId !== null);
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.currentUserId = null;
    this.spaceMetadata.clear();
    this.memberManager.clear();
    this.quantumOps.clear();
    this.isInitialized = false;
    this.initializationPromise = null;
    console.log('[SpaceManager] Cache cleared and initialization reset');
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): string | null {
    return this.currentUserId;
  }
}

// Export singleton instance for backward compatibility
export const spaceManager = new SpaceManager();