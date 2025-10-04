import { holographicMemoryManager } from './holographic-memory';
import webSocketService from './websocket';
import { beaconCacheManager } from './beacon-cache';
import { quantumNetworkOps, QuantumNode } from './quantum-network-operations-safe';
import { userDataManager } from './user-data-manager';
import { BEACON_TYPES } from '../constants/beaconTypes';

export type SpaceRole = 'owner' | 'admin' | 'member';

export interface SpaceMember {
  userId: string;
  role: SpaceRole;
  joinedAt: string;
}

export interface SpaceMetadata {
  spaceId: string;
  name: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
}

/**
 * SpaceManager - Manages space membership as holographic beacons
 * Space member lists are encoded and stored as beacons
 * Only members with the space phase key can decode the member list
 */
class SpaceManager {
  private currentUserId: string | null = null;
  private spaceMemberLists: Map<string, SpaceMember[]> = new Map();
  private spaceMetadata: Map<string, SpaceMetadata> = new Map();
  private spaceQuantumNodes: Map<string, QuantumNode> = new Map(); // Space quantum nodes
  private initializationPromise: Promise<void> | null = null;
  private isInitialized: boolean = false;

  /**
   * Initialize with current user ID
   */
  setCurrentUser(userId: string): void {
    this.currentUserId = userId;
    console.log(`[SpaceManager] Current user set to: ${userId}`);
    
    // Initialize user's quantum node if it doesn't exist
    let userNode = quantumNetworkOps.getNode(userId);
    if (!userNode) {
      userNode = quantumNetworkOps.createQuantumNode(userId);
      console.log(`[SpaceManager] Created quantum node for user ${userId}`);
    }
  }

  /**
   * Initialize SpaceManager for session restoration
   */
  async initializeForUser(userId: string): Promise<void> {
    console.log(`[SpaceManager] Initializing for user: ${userId}`);
    
    // If already initializing for this user, return the existing promise
    if (this.initializationPromise && this.currentUserId === userId) {
      console.log(`[SpaceManager] Already initializing for user ${userId}, waiting...`);
      return this.initializationPromise;
    }
    
    // If already initialized for this user, return immediately
    if (this.isInitialized && this.currentUserId === userId) {
      console.log(`[SpaceManager] Already initialized for user ${userId}`);
      return Promise.resolve();
    }
    
    // Reset initialization state for new user
    this.isInitialized = false;
    this.setCurrentUser(userId);
    
    // Create and store the initialization promise
    this.initializationPromise = (async () => {
      try {
        // CRITICAL FIX: Add delay to ensure beacon cache is populated first
        // This prevents race conditions that lose membership data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Pre-load user's space memberships
        await this.loadUserSpaces(userId);
        
        this.isInitialized = true;
        console.log(`[SpaceManager] Successfully initialized for user ${userId}`);
      } catch (error) {
        console.error(`[SpaceManager] Failed to initialize for user ${userId}:`, error);
        this.isInitialized = false;
        throw error; // Re-throw to let caller handle the error
      } finally {
        this.initializationPromise = null;
      }
    })();
    
    return this.initializationPromise;
  }

  /**
   * Wait for SpaceManager to be initialized
   */
  async waitForInitialization(): Promise<void> {
    if (this.isInitialized) {
      return Promise.resolve();
    }
    
    if (this.initializationPromise) {
      return this.initializationPromise;
    }
    
    // Not initialized and no initialization in progress
    throw new Error('SpaceManager not initialized. Call initializeForUser() first.');
  }

  /**
   * Check if SpaceManager is ready to use
   */
  isReady(): boolean {
    return this.isInitialized && this.currentUserId !== null;
  }

  /**
   * Load all spaces a user is a member of
   */
  private async loadUserSpaces(userId: string): Promise<void> {
    try {
      // CRITICAL FIX: Don't clear existing membership data during initialization
      // This was causing membership loss on session restoration
      
      // Get all space_members beacons to find user's memberships
      const allSpaceMemberBeacons = await beaconCacheManager.getBeaconsByType(BEACON_TYPES.SPACE_MEMBERS);
      console.log(`[SpaceManager] Found ${allSpaceMemberBeacons.length} space member beacons for loading`);
      
      const userSpaces = new Set<string>();
      
      for (const beacon of allSpaceMemberBeacons) {
        try {
          const decoded = holographicMemoryManager.decodeMemory(beacon as any);
          if (decoded) {
            // ROBUST JSON PARSING: Handle truncated/malformed JSON gracefully
            let data;
            try {
              data = JSON.parse(decoded);
            } catch (jsonError) {
              // Try to repair common JSON truncation issues
              let repairedJson = decoded.trim();
              
              // Handle incomplete objects by closing them
              if (repairedJson.endsWith('{') || repairedJson.endsWith('{"')) {
                console.warn(`[SpaceManager] Skipping severely truncated beacon: ${repairedJson.substring(0, 50)}...`);
                continue;
              }
              
              // Try to close incomplete JSON objects
              let openBraces = 0;
              let openSquares = 0;
              for (const char of repairedJson) {
                if (char === '{') openBraces++;
                else if (char === '}') openBraces--;
                else if (char === '[') openSquares++;
                else if (char === ']') openSquares--;
              }
              
              // Close missing brackets
              while (openSquares > 0) {
                repairedJson += ']';
                openSquares--;
              }
              while (openBraces > 0) {
                repairedJson += '}';
                openBraces--;
              }
              
              try {
                data = JSON.parse(repairedJson);
                console.log(`[SpaceManager] Successfully repaired truncated JSON for beacon`);
              } catch (repairError) {
                console.warn(`[SpaceManager] Cannot repair malformed JSON: ${decoded.substring(0, 100)}...`);
                continue;
              }
            }
            
            if (data && data.spaceId && data.members) {
              // Check if user is a member of this space
              const isMember = data.members.some((member: SpaceMember) => member.userId === userId);
              if (isMember) {
                userSpaces.add(data.spaceId);
                
                // CRITICAL FIX: Only update cache if we don't already have this data
                // This prevents overwriting newer membership data with stale data
                if (!this.spaceMemberLists.has(data.spaceId)) {
                  this.spaceMemberLists.set(data.spaceId, data.members);
                  console.log(`[SpaceManager] Cached membership for space ${data.spaceId}`);
                } else {
                  console.log(`[SpaceManager] Already have membership data for space ${data.spaceId}, keeping existing`);
                }
              }
            }
          }
        } catch (error) {
          // Skip invalid beacons
          console.warn(`[SpaceManager] Could not decode beacon during space loading:`, error);
        }
      }
      
      console.log(`[SpaceManager] User ${userId} is member of ${userSpaces.size} spaces:`, Array.from(userSpaces));
    } catch (error) {
      console.error(`[SpaceManager] Error loading user spaces:`, error);
    }
  }

  /**
   * Create a new space and initialize its member list beacon
   */
  async createSpace(name: string, description: string, isPublic: boolean, userId?: string): Promise<string> {
    // Wait for initialization to complete before proceeding
    try {
      await this.waitForInitialization();
    } catch (error) {
      console.error('[SpaceManager] Cannot create space - SpaceManager not initialized:', error);
      throw new Error('System is still initializing. Please wait a moment and try again.');
    }
    
    // Use provided userId or fall back to currentUserId
    const effectiveUserId = userId || this.currentUserId;
    
    console.log('[SpaceManager] createSpace called, userId param:', userId, 'currentUserId:', this.currentUserId, 'effectiveUserId:', effectiveUserId);
    
    if (!effectiveUserId) {
      console.error('[SpaceManager] User not authenticated - currentUserId:', this.currentUserId);
      throw new Error('User not authenticated. Please log in and try again.');
    }
    
    // Ensure currentUserId is set for this operation
    if (!this.currentUserId) {
      console.log('[SpaceManager] Setting currentUserId from parameter:', effectiveUserId);
      this.setCurrentUser(effectiveUserId);
    }

    // Wait for WebSocket connection
    await webSocketService.waitForConnection();
    console.log('WebSocket connected, creating space...');

    return new Promise((resolve, reject) => {
      const handleMessage = (message: any) => {
        if (message.kind === 'createSpaceSuccess') {
          const spaceId = message.payload.spaceId;
          
          // Create quantum node for the space using ResoLang
          const spaceNode = quantumNetworkOps.createQuantumNode(spaceId);
          this.spaceQuantumNodes.set(spaceId, spaceNode);
          
          // Initialize space metadata
          this.spaceMetadata.set(spaceId, {
            spaceId,
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

          // Create quantum entanglement between user and space
          this.createUserSpaceEntanglement(effectiveUserId, spaceId).then(async () => {
            // Submit initial member list beacon with quantum encoding
            await this.submitSpaceMemberBeacon(spaceId, initialMembers);
            this.spaceMemberLists.set(spaceId, initialMembers);
            
            // Add the space to creator's personal spaces list for persistence
            await userDataManager.joinSpace(spaceId, 'owner');
            
            webSocketService.removeMessageListener(handleMessage);
            console.log(`Space ${spaceId} created with quantum node coherence: ${spaceNode.coherence}`);
            console.log(`Creator automatically added to space ${spaceId} as owner`);
            resolve(spaceId);
          }).catch(reject);
        } else if (message.kind === 'error') {
          webSocketService.removeMessageListener(handleMessage);
          reject(new Error(message.payload.message));
        }
      };

      webSocketService.addMessageListener(handleMessage);
      webSocketService.sendMessage({
        kind: 'createSpace',
        payload: { name, description, isPublic }
      });
    });
  }

  /**
   * Create quantum entanglement between user and space
   */
  private async createUserSpaceEntanglement(userId: string, spaceId: string): Promise<void> {
    try {
      // Create or get user quantum node
      let userNode = quantumNetworkOps.getNode(userId);
      if (!userNode) {
        userNode = quantumNetworkOps.createQuantumNode(userId);
      }

      // Create entanglement between user and space
      const entanglementResult = await quantumNetworkOps.createEntanglement(userId, spaceId);
      
      if (entanglementResult.success) {
        console.log(`Quantum entanglement created between user ${userId} and space ${spaceId}:`,
          `strength=${entanglementResult.metadata.get('strength')}, coherence=${entanglementResult.coherence}`);
      } else {
        console.warn(`Failed to create quantum entanglement between user ${userId} and space ${spaceId}`);
      }
    } catch (error) {
      console.error('Error creating user-space entanglement:', error);
      throw error;
    }
  }

  /**
   * Add a member to a space
   */
  async addMember(spaceId: string, userId: string, role: SpaceRole = 'member'): Promise<void> {
    if (!this.currentUserId) {
      throw new Error('User not authenticated');
    }

    // Get current member list
    const members = await this.getSpaceMembers(spaceId);
    
    // Check if user is already a member
    if (members.some(m => m.userId === userId)) {
      console.log(`User ${userId} is already a member of space ${spaceId}`);
      return;
    }

    // Use quantum consensus to validate permission
    const permissionValid = await this.validatePermissionWithConsensus(
      spaceId, this.currentUserId, 'addMember', { targetUserId: userId, role }
    );

    if (!permissionValid) {
      throw new Error('Insufficient permissions to add members (quantum consensus failed)');
    }

    // Create quantum entanglement between new member and space
    await this.createUserSpaceEntanglement(userId, spaceId);

    // Add new member
    const newMember: SpaceMember = {
      userId,
      role,
      joinedAt: new Date().toISOString()
    };

    const updatedMembers = [...members, newMember];
    
    // Use quantum teleportation to update member list
    await this.quantumUpdateMemberList(spaceId, updatedMembers);
    this.spaceMemberLists.set(spaceId, updatedMembers);
    
    console.log(`User ${userId} added to space ${spaceId} with quantum entanglement`);
  }

  /**
   * Validate permissions using quantum consensus
   */
  private async validatePermissionWithConsensus(
    spaceId: string,
    userId: string,
    action: string,
    context: any
  ): Promise<boolean> {
    try {
      const spaceNode = this.spaceQuantumNodes.get(spaceId);
      if (!spaceNode) {
        return false; // Fallback to traditional permission check
      }

      // Get admin/owner nodes for consensus
      const members = await this.getSpaceMembers(spaceId);
      const adminMemberIds = members
        .filter(m => m.role === 'owner' || m.role === 'admin')
        .map(m => m.userId);

      if (adminMemberIds.length === 0) {
        return false;
      }

      // Create proposal for the action
      const proposal = JSON.stringify({ action, userId, context, timestamp: Date.now() });
      
      // Achieve quantum consensus
      const consensusResult = await quantumNetworkOps.achieveConsensus(adminMemberIds, proposal);
      
      return consensusResult.success && (consensusResult.metadata.get('confidence') || 0) > 0.6;
    } catch (error) {
      console.error('Quantum consensus validation failed:', error);
      return false; // Fallback to traditional validation
    }
  }

  /**
   * Update member list using quantum teleportation
   */
  private async quantumUpdateMemberList(spaceId: string, members: SpaceMember[]): Promise<void> {
    try {
      const memberListData = JSON.stringify({
        spaceId,
        members,
        version: Date.now()
      });

      // Use quantum teleportation to distribute the update
      const spaceNode = this.spaceQuantumNodes.get(spaceId);
      if (spaceNode && spaceNode.entanglements.size > 0) {
        const entangledNodes = Array.from(spaceNode.entanglements.keys());
        
        for (const nodeId of entangledNodes) {
          const teleportResult = await quantumNetworkOps.teleportMemory(memberListData, spaceId, nodeId);
          if (teleportResult.success) {
            console.log(`Member list teleported to node ${nodeId} with fidelity ${teleportResult.fidelity}`);
          }
        }
      }

      // Still submit beacon for persistence
      await this.submitSpaceMemberBeacon(spaceId, members);
    } catch (error) {
      console.error('Quantum member list update failed:', error);
      // Fallback to regular beacon submission
      await this.submitSpaceMemberBeacon(spaceId, members);
    }
  }

  /**
   * Remove a member from a space
   */
  async removeMember(spaceId: string, userId: string): Promise<void> {
    if (!this.currentUserId) {
      throw new Error('User not authenticated');
    }

    // Get current member list
    const members = await this.getSpaceMembers(spaceId);
    
    // Check if current user has permission to remove members
    const currentUserMember = members.find(m => m.userId === this.currentUserId);
    if (!currentUserMember || (currentUserMember.role !== 'owner' && currentUserMember.role !== 'admin')) {
      throw new Error('Insufficient permissions to remove members');
    }

    // Cannot remove the owner
    const targetMember = members.find(m => m.userId === userId);
    if (targetMember?.role === 'owner') {
      throw new Error('Cannot remove space owner');
    }

    // Remove member
    const updatedMembers = members.filter(m => m.userId !== userId);
    await this.submitSpaceMemberBeacon(spaceId, updatedMembers);
    this.spaceMemberLists.set(spaceId, updatedMembers);
  }

  /**
   * Update a member's role
   */
  async updateMemberRole(spaceId: string, userId: string, newRole: SpaceRole): Promise<void> {
    if (!this.currentUserId) {
      throw new Error('User not authenticated');
    }

    const members = await this.getSpaceMembers(spaceId);
    
    // Only owner can change roles
    const currentUserMember = members.find(m => m.userId === this.currentUserId);
    if (!currentUserMember || currentUserMember.role !== 'owner') {
      throw new Error('Only space owner can change member roles');
    }

    // Cannot change owner role
    const targetMember = members.find(m => m.userId === userId);
    if (targetMember?.role === 'owner') {
      throw new Error('Cannot change owner role');
    }

    // Update role
    const updatedMembers = members.map(m => 
      m.userId === userId ? { ...m, role: newRole } : m
    );

    await this.submitSpaceMemberBeacon(spaceId, updatedMembers);
    this.spaceMemberLists.set(spaceId, updatedMembers);
  }

  /**
   * Clear cached member list for a space (used when receiving updates from other users)
   */
  async clearSpaceMemberCache(spaceId: string): Promise<void> {
    console.log(`[SpaceManager] Clearing member cache for space: ${spaceId}`);
    
    // CRITICAL FIX: Only clear cache if we're not in the middle of session restoration
    // Check if we have a current user to avoid clearing during initialization
    if (this.currentUserId) {
      this.spaceMemberLists.delete(spaceId);
      
      // Don't invalidate beacon cache during session restoration
      // This prevents loss of membership data
      console.log(`[SpaceManager] Cache cleared for space: ${spaceId}`);
    } else {
      console.log(`[SpaceManager] Skipping cache clear during initialization for space: ${spaceId}`);
    }
  }

  /**
   * Get members of a space
   */
  async getSpaceMembers(spaceId: string): Promise<SpaceMember[]> {
    // Check cache first
    if (this.spaceMemberLists.has(spaceId)) {
      return this.spaceMemberLists.get(spaceId)!;
    }

    try {
      console.log(`[SpaceManager] Fetching members for space ${spaceId}`);
      
      // Since beacons are authored by users, not spaces, we need to get all space_members beacons
      // and filter for ones that contain this spaceId
      const allSpaceMemberBeacons = await beaconCacheManager.getBeaconsByType(BEACON_TYPES.SPACE_MEMBERS);
      console.log(`[SpaceManager] Found ${allSpaceMemberBeacons.length} space_members beacons`);
      
      let latestBeacon = null;
      let latestTimestamp = 0;
      
      // Find the most recent beacon for this specific space
      for (const beacon of allSpaceMemberBeacons) {
        try {
          const decoded = holographicMemoryManager.decodeMemory(beacon as any);
          if (decoded) {
            const data = JSON.parse(decoded);
            if (data.spaceId === spaceId && data.version > latestTimestamp) {
              latestBeacon = beacon;
              latestTimestamp = data.version;
            }
          }
        } catch (error) {
          // Skip invalid beacons
          console.warn(`[SpaceManager] Could not decode beacon for space filtering:`, error);
        }
      }
      
      if (!latestBeacon) {
        console.log(`[SpaceManager] No member list beacon found for space ${spaceId}`);
        return [];
      }

      // Decode the latest beacon for this space
      const decoded = holographicMemoryManager.decodeMemory(latestBeacon as any);
      
      if (!decoded) {
        console.log(`[SpaceManager] Could not decode member list for space ${spaceId}`);
        return [];
      }

      const data = JSON.parse(decoded);
      const members = data.members || [];
      
      console.log(`[SpaceManager] Found ${members.length} members for space ${spaceId}`);
      
      // Update cache
      this.spaceMemberLists.set(spaceId, members);
      
      return members;
    } catch (error) {
      console.error(`[SpaceManager] Error getting space members for ${spaceId}:`, error);
      return [];
    }
  }

  /**
   * Join a space (user joins themselves)
   */
  async joinSpace(spaceId: string): Promise<void> {
    if (!this.currentUserId) {
      throw new Error('User not authenticated');
    }

    // Get current member list
    const members = await this.getSpaceMembers(spaceId);
    
    // Check if user is already a member
    if (members.some(m => m.userId === this.currentUserId)) {
      console.log(`User ${this.currentUserId} is already a member of space ${spaceId}`);
      return;
    }

    // Add user as a member
    const newMember: SpaceMember = {
      userId: this.currentUserId,
      role: 'member',
      joinedAt: new Date().toISOString()
    };

    const updatedMembers = [...members, newMember];
    await this.submitSpaceMemberBeacon(spaceId, updatedMembers);
    this.spaceMemberLists.set(spaceId, updatedMembers);

    // Also update the user's personal spaces list for persistence
    await userDataManager.joinSpace(spaceId, 'member');

    console.log(`User ${this.currentUserId} joined space ${spaceId}`);
  }

  /**
   * Leave a space (user removes themselves)
   */
  async leaveSpace(spaceId: string): Promise<void> {
    if (!this.currentUserId) {
      throw new Error('User not authenticated');
    }

    // Get current member list
    const members = await this.getSpaceMembers(spaceId);
    
    // Check if user is a member
    const currentMember = members.find(m => m.userId === this.currentUserId);
    if (!currentMember) {
      console.log(`User ${this.currentUserId} is not a member of space ${spaceId}`);
      return;
    }

    // Cannot leave if you're the owner
    if (currentMember.role === 'owner') {
      throw new Error('Space owner cannot leave. Transfer ownership or delete the space instead.');
    }

    // Remove user from member list
    const updatedMembers = members.filter(m => m.userId !== this.currentUserId);
    await this.submitSpaceMemberBeacon(spaceId, updatedMembers);
    this.spaceMemberLists.set(spaceId, updatedMembers);

    // Also update the user's personal spaces list for persistence
    await userDataManager.leaveSpace(spaceId);

    console.log(`User ${this.currentUserId} left space ${spaceId}`);
  }

  /**
   * Check if user is a member of a space
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
   * Get all spaces a user is a member of
   */
  async getUserSpaces(userId: string): Promise<string[]> {
    // This would need to iterate through all spaces and check membership
    // For now, we rely on the user's spaces list beacon in user-data-manager
    // This is a placeholder for future enhancement
    return [];
  }

  /**
   * Submit space member list beacon to server
   * The beacon is submitted with the spaceId as the "author" since spaces own their member lists
   */
  private async submitSpaceMemberBeacon(spaceId: string, members: SpaceMember[]): Promise<void> {
    const listData = JSON.stringify({
      spaceId, // Include spaceId in the data for reference
      members,
      version: Date.now()
    });

    const beacon = await holographicMemoryManager.encodeMemory(listData);
    
    if (beacon) {
      // CRITICAL FIX: Properly serialize beacon for server transmission
      // Convert Uint8Arrays to regular arrays for JSON serialization
      // PRESERVE DECODING-CRITICAL FIELD: originalText (required for beacon decoding)
      const serializableBeacon = {
        ...beacon,
        fingerprint: Array.from(beacon.fingerprint),
        signature: Array.from(beacon.signature),
        // Preserve originalText field - CRITICAL for beacon decoding
        originalText: beacon.originalText,
        // Remove only non-serializable complex objects
        coeffs: undefined,
        center: undefined,
        entropy: undefined,
        primeResonance: undefined,
        holographicField: undefined
      };

      console.log(`[SpaceManager] Serializing beacon for space ${spaceId}:`, {
        indexLength: serializableBeacon.index.length,
        fingerprintLength: serializableBeacon.fingerprint.length,
        signatureLength: serializableBeacon.signature.length,
        epoch: serializableBeacon.epoch
      });

      // Ensure we're connected before sending
      if (webSocketService.isReady()) {
        webSocketService.sendMessage({
          kind: 'submitPostBeacon',
          payload: {
            beacon: serializableBeacon as any,
            beaconType: BEACON_TYPES.SPACE_MEMBERS
          }
        });
      } else {
        console.error('[SpaceManager] WebSocket not ready, cannot send beacon');
      }

      console.log(`[SpaceManager] Submitted membership beacon for space ${spaceId}`);
    } else {
      console.error(`[SpaceManager] Failed to encode beacon for space ${spaceId}`);
    }
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.currentUserId = null;
    this.spaceMemberLists.clear();
    this.spaceMetadata.clear();
    this.spaceQuantumNodes.clear();
    this.isInitialized = false;
    this.initializationPromise = null;
    console.log('[SpaceManager] Cache cleared and initialization reset');
  }
  
  /**
   * Get current user ID (for debugging and verification)
   */
  getCurrentUserId(): string | null {
    return this.currentUserId;
  }
}

export const spaceManager = new SpaceManager();