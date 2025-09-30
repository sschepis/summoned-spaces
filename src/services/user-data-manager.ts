import { holographicMemoryManager } from './holographic-memory';
import { webSocketService } from './websocket';

/**
 * UserDataManager - Manages user data as holographic beacons
 * All user data (following lists, space memberships, etc.) are encoded client-side
 * and stored as beacons. The server never sees the plaintext data.
 */
class UserDataManager {
    private followingList: string[] = [];
    private spacesList: Array<{ spaceId: string; role: string; joinedAt: string }> = [];

    /**
     * Add a user to the following list and submit updated beacon
     */
    async followUser(userIdToFollow: string): Promise<void> {
        if (this.followingList.includes(userIdToFollow)) {
            return; // Already following
        }

        this.followingList.push(userIdToFollow);
        await this.submitFollowingListBeacon();
    }

    /**
     * Remove a user from the following list and submit updated beacon
     */
    async unfollowUser(userId: string): Promise<void> {
        this.followingList = this.followingList.filter(id => id !== userId);
        await this.submitFollowingListBeacon();
    }

    /**
     * Encode the following list as a holographic beacon and submit to server
     */
    private async submitFollowingListBeacon(): Promise<void> {
        const listData = JSON.stringify({ following: this.followingList });
        const beacon = await holographicMemoryManager.encodeMemory(listData);
        
        if (beacon) {
            webSocketService.sendMessage({
                kind: 'submitPostBeacon',
                payload: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    beacon: beacon as any,
                    beaconType: 'user_following_list'
                }
            });
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
     */
    private async submitSpacesListBeacon(): Promise<void> {
        const listData = JSON.stringify({ spaces: this.spacesList });
        const beacon = await holographicMemoryManager.encodeMemory(listData);
        
        if (beacon) {
            webSocketService.sendMessage({
                kind: 'submitPostBeacon',
                payload: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    beacon: beacon as any,
                    beaconType: 'user_spaces_list'
                }
            });
        }
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

export const userDataManager = new UserDataManager();