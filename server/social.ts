// Mock implementation of a social graph

export class SocialGraphManager {
    // userId -> Set<followerId>
    private followers: Map<string, Set<string>> = new Map();
    // userId -> Set<followingId>
    private following: Map<string, Set<string>> = new Map();

    constructor() {
        console.log('SocialGraphManager initialized');
        // Pre-populate with some mock data for testing
        // User 'user_a' is followed by 'user_b' and 'user_c'
        this.addFollow('user_a', 'user_b');
        this.addFollow('user_a', 'user_c');
    }

    addFollow(userIdToFollow: string, followerId: string): void {
        if (!this.followers.has(userIdToFollow)) {
            this.followers.set(userIdToFollow, new Set());
        }
        this.followers.get(userIdToFollow)!.add(followerId);

        if (!this.following.has(followerId)) {
            this.following.set(followerId, new Set());
        }
        this.following.get(followerId)!.add(userIdToFollow);

        console.log(`User ${followerId} is now following ${userIdToFollow}`);
    }

    getFollowers(userId: string): string[] {
        return Array.from(this.followers.get(userId) || []);
    }

    getFollowing(userId: string): string[] {
        return Array.from(this.following.get(userId) || []);
    }
}