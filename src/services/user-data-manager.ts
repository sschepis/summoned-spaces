/* eslint-disable @typescript-eslint/no-explicit-any */
import type { HolographicMemoryManager } from './holographic-memory';
import type { WebSocketService } from './websocket';
import { beaconCacheManager } from './beacon-cache';
import { BEACON_TYPES } from '../constants/beaconTypes';
import { communicationManager } from './communication-manager';
import type { CommunicationMessage } from './communication-manager';

/**
 * UserDataManager - Manages user data as holographic beacons
 * All user data (following lists, space memberships, etc.) are encoded client-side
 * and stored as beacons. The server never sees the plaintext data.
 */
export class UserDataManager {
    private followingList: string[] = [];
    private spacesList: Array<{ spaceId: string; role: string; joinedAt: string }> = [];
    private currentUserId: string | null = null;
    private webSocketService: WebSocketService;
    private holographicMemoryManager: HolographicMemoryManager;

    constructor(
        webSocketService: WebSocketService,
        holographicMemoryManager: HolographicMemoryManager
    ) {
        this.webSocketService = webSocketService;
        this.holographicMemoryManager = holographicMemoryManager;
        
        // Add listener for beacon submission responses
        this.webSocketService.addMessageListener((message) => {
            if (message.kind === 'submitPostSuccess') {
                console.log(`[UserDataManager] Beacon submission successful:`, message.payload);
            } else if (message.kind === 'error') {
                console.error(`[UserDataManager] Server error:`, message.payload);
            }
        });
    }

    /**
     * Initialize the manager with the current user's ID
     */
    setCurrentUser(userId: string): void {
        this.currentUserId = userId;
    }

    /**
     * Load user's existing beacons from the server
     */
    async loadUserData(): Promise<void> {
        if (!this.currentUserId) {
            console.error('Cannot load user data: currentUserId not set');
            return;
        }

        try {
            // Wait for WebSocket connection before trying to load data
            await this.webSocketService.waitForConnection();
            console.log('WebSocket connected, loading user data...');
            
            // Add a small delay to ensure session restoration completes
            // This is a temporary fix - ideally we'd have a proper event system
            await new Promise(resolve => setTimeout(resolve, 500));

            // Load following list beacon
            const followingBeacon = await beaconCacheManager.getMostRecentBeacon(
                this.currentUserId,
                BEACON_TYPES.USER_FOLLOWING_LIST
            );

            if (followingBeacon) {
                const decoded = this.holographicMemoryManager.decodeMemory(followingBeacon as any);
                if (decoded) {
                    const payload = typeof decoded === 'string'
                        ? this.extractJsonPayload(decoded)
                        : null;

                    if (payload && Array.isArray(payload.following)) {
                        this.followingList = (payload.following as unknown[])
                            .filter((id): id is string => typeof id === 'string');
                        console.log('Loaded following list:', this.followingList);
                    } else {
                        console.warn('Decoded following beacon but could not extract following list payload', decoded);
                        this.followingList = [];
                    }
                } else {
                    console.log('No data decoded from following beacon');
                    this.followingList = [];
                }
            }

            // Load spaces list beacon
            const spacesBeacon = await beaconCacheManager.getMostRecentBeacon(
                this.currentUserId,
                BEACON_TYPES.USER_SPACES_LIST
            );

            if (spacesBeacon) {
                const decoded = this.holographicMemoryManager.decodeMemory(spacesBeacon as any);
                if (decoded) {
                    const payload = typeof decoded === 'string'
                        ? this.extractJsonPayload(decoded)
                        : null;

                    if (payload && Array.isArray(payload.spaces)) {
                        this.spacesList = (payload.spaces as unknown[])
                            .filter((space): space is { spaceId: string; role: string; joinedAt: string } =>
                                typeof space === 'object' && space !== null &&
                                typeof (space as { spaceId?: unknown }).spaceId === 'string' &&
                                typeof (space as { role?: unknown }).role === 'string' &&
                                typeof (space as { joinedAt?: unknown }).joinedAt === 'string'
                            );
                        console.log('Loaded spaces list:', this.spacesList);
                    } else {
                        console.warn('Decoded spaces beacon but could not extract spaces list payload', decoded);
                        this.spacesList = [];
                    }
                } else {
                    console.log('No data decoded from spaces beacon');
                    this.spacesList = [];
                }
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
        }
    }

    /**
     * Add a user to the following list and submit updated beacon
     */
    async followUser(userIdToFollow: string): Promise<void> {
        console.log(`[UserDataManager] followUser called for: ${userIdToFollow}`);
        
        if (this.followingList.includes(userIdToFollow)) {
            console.log(`[UserDataManager] Already following ${userIdToFollow}`);
            return; // Already following
        }

        this.followingList.push(userIdToFollow);
        console.log(`[UserDataManager] Updated following list:`, this.followingList);
        
        // Send follow message to server for social graph and notifications
        // Use communication manager to support both WebSocket and REST/SSE
        try {
            if (this.webSocketService.isReady()) {
                // Use WebSocket service directly if available (development)
                this.webSocketService.sendFollowMessage(userIdToFollow);
            } else {
                // Use communication manager for production/SSE
                const followMessage: CommunicationMessage = {
                    kind: 'follow',
                    payload: { userIdToFollow }
                };
                await communicationManager.send(followMessage);
            }
        } catch (error) {
            console.error('[UserDataManager] Error sending follow message:', error);
        }
        
        await this.submitFollowingListBeacon();
    }

    /**
     * Remove a user from the following list and submit updated beacon
     */
    async unfollowUser(userId: string): Promise<void> {
        if (!this.followingList.includes(userId)) {
            return; // Not following
        }

        this.followingList = this.followingList.filter(id => id !== userId);
        
        // Send unfollow message to server for social graph and notifications
        // Use communication manager to support both WebSocket and REST/SSE
        try {
            if (this.webSocketService.isReady()) {
                // Use WebSocket service directly if available (development)
                this.webSocketService.sendUnfollowMessage(userId);
            } else {
                // Use communication manager for production/SSE
                const unfollowMessage: CommunicationMessage = {
                    kind: 'unfollow',
                    payload: { userIdToUnfollow: userId }
                };
                await communicationManager.send(unfollowMessage);
            }
        } catch (error) {
            console.error('[UserDataManager] Error sending unfollow message:', error);
        }
        
        await this.submitFollowingListBeacon();
    }

    /**
     * Encode the following list as a holographic beacon and submit to server
     * This replaces any previous following list beacon
     */
    private async submitFollowingListBeacon(): Promise<void> {
        console.log(`[UserDataManager] submitFollowingListBeacon called`);
        
        const listData = JSON.stringify({
            following: this.followingList
        });
        console.log(`[UserDataManager] Encoding following list data:`, listData);
        
        try {
            const beacon = await this.holographicMemoryManager.encodeMemory(listData);
            console.log(`[UserDataManager] Beacon encoded:`, beacon ? 'Success' : 'Failed');
            
            if (beacon) {
                console.log(`[UserDataManager] Sending beacon to server...`);
                
                // Convert Uint8Arrays to regular arrays for JSON serialization
                const serializableBeacon = {
                    ...beacon,
                    fingerprint: Array.from(beacon.fingerprint),
                    signature: Array.from(beacon.signature),
                    // Remove non-serializable fields
                    coeffs: undefined,
                    center: undefined,
                    entropy: undefined,
                    primeResonance: undefined,
                    holographicField: undefined,
                    originalText: undefined
                };
                
                console.log(`[UserDataManager] Serializable beacon prepared:`, {
                    indexLength: serializableBeacon.index.length,
                    fingerprintLength: serializableBeacon.fingerprint.length,
                    signatureLength: serializableBeacon.signature.length,
                    epoch: serializableBeacon.epoch
                });
                
                // Ensure we're connected before sending
                if (this.webSocketService.isReady()) {
                    this.webSocketService.sendMessage({
                        kind: 'submitPostBeacon',
                        payload: {
                            beacon: serializableBeacon as any,
                            beaconType: BEACON_TYPES.USER_FOLLOWING_LIST
                        }
                    });
                } else {
                    console.error('[UserDataManager] WebSocket not ready, cannot send beacon');
                }

                // Invalidate cache for this user's following list
                if (this.currentUserId) {
                    beaconCacheManager.invalidateUserBeacons(this.currentUserId);
                }
            } else {
                console.error(`[UserDataManager] Failed to encode beacon`);
            }
        } catch (error) {
            console.error(`[UserDataManager] Error encoding beacon:`, error);
        }
    }

    /**
     * Join a space and update spaces list beacon
     */
    async joinSpace(spaceId: string, role: string = 'member'): Promise<void> {
        if (this.spacesList.some(s => s.spaceId === spaceId)) {
            return; // Already in space
        }

        this.spacesList.push({
            spaceId,
            role,
            joinedAt: new Date().toISOString()
        });

        await this.submitSpacesListBeacon();
    }

    /**
     * Leave a space and update spaces list beacon
     */
    async leaveSpace(spaceId: string): Promise<void> {
        this.spacesList = this.spacesList.filter(s => s.spaceId !== spaceId);
        await this.submitSpacesListBeacon();
    }

    /**
     * Encode the spaces list as a holographic beacon and submit to server
     * This replaces any previous spaces list beacon
     */
    private async submitSpacesListBeacon(): Promise<void> {
        const listData = JSON.stringify({
            spaces: this.spacesList,
            version: Date.now() // Track version for updates
        });
        const beacon = await this.holographicMemoryManager.encodeMemory(listData);
        
        if (beacon) {
            // Convert Uint8Arrays to regular arrays for JSON serialization
            const serializableBeacon = {
                ...beacon,
                fingerprint: Array.from(beacon.fingerprint),
                signature: Array.from(beacon.signature),
                // Remove non-serializable fields
                coeffs: undefined,
                center: undefined,
                entropy: undefined,
                primeResonance: undefined,
                holographicField: undefined,
                originalText: undefined
            };
            
            // Ensure we're connected before sending
            if (this.webSocketService.isReady()) {
                this.webSocketService.sendMessage({
                    kind: 'submitPostBeacon',
                    payload: {
                        beacon: serializableBeacon as any,
                        beaconType: BEACON_TYPES.USER_SPACES_LIST
                    }
                });
            } else {
                console.error('[UserDataManager] WebSocket not ready, cannot send beacon');
            }

            // Invalidate cache for this user's spaces list
            if (this.currentUserId) {
                beaconCacheManager.invalidateUserBeacons(this.currentUserId);
            }
        }
    }

    private tryParseJson<T>(text: string): T | null {
        try {
            return JSON.parse(text) as T;
        } catch {
            return null;
        }
    }

    private extractJsonPayload(raw: string): Record<string, unknown> | null {
        // Remove null characters from the string
        const nullChar = String.fromCharCode(0);
        const sanitized = raw.replace(new RegExp(nullChar, 'g'), '').trim();
        if (!sanitized) {
            return null;
        }

        const directObject = this.tryParseJson<Record<string, unknown>>(sanitized);
        if (directObject && typeof directObject === 'object') {
            return directObject;
        }

        const fragment = this.extractFirstJsonStructure(sanitized);
        if (fragment) {
            const parsed = this.tryParseJson<Record<string, unknown>>(fragment);
            if (parsed && typeof parsed === 'object') {
                return parsed;
            }
        }

        return null;
    }

    private extractFirstJsonStructure(text: string): string | null {
        const objectFragment = this.extractDelimitedJson(text, '{', '}');
        if (objectFragment) {
            return objectFragment;
        }

        return this.extractDelimitedJson(text, '[', ']');
    }

    private extractDelimitedJson(text: string, open: '{' | '[', close: '}' | ']'): string | null {
        const start = text.indexOf(open);
        if (start === -1) {
            return null;
        }

        let depth = 0;
        for (let i = start; i < text.length; i++) {
            const char = text[i];
            if (char === open) {
                depth++;
            } else if (char === close) {
                depth--;
                if (depth === 0) {
                    return text.slice(start, i + 1);
                }
            }
        }

        return null;
    }

    /**
     * Get the current following list (local cache)
     */
    getFollowingList(): string[] {
        return [...this.followingList];
    }

    /**
     * Get the current spaces list (local cache)
     */
    getSpacesList() {
        return [...this.spacesList];
    }
}

// Export a singleton instance
import webSocketService from './websocket';
import { holographicMemoryManager } from './holographic-memory';
export const userDataManager = new UserDataManager(webSocketService, holographicMemoryManager);
