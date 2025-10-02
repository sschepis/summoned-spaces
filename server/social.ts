import { getDatabase } from './database';
import { FollowNotificationMessage } from './protocol';

export class SocialGraphManager {
    private notificationBroadcaster?: (targetUserId: string, message: FollowNotificationMessage) => void;

    constructor(notificationBroadcaster?: (targetUserId: string, message: FollowNotificationMessage) => void) {
        console.log('SocialGraphManager initialized');
        this.notificationBroadcaster = notificationBroadcaster;
    }

    async addFollow(userIdToFollow: string, followerId: string): Promise<void> {
        const db = getDatabase();
        
        try {
            const success = await db.createFollow(followerId, userIdToFollow);
            if (success) {
                console.log(`User ${followerId} is now following ${userIdToFollow}`);
                // Send notification to the user being followed
                this.sendFollowNotification(userIdToFollow, followerId, 'follow');
            }
        } catch (err) {
            console.error('Error adding follow relationship', err instanceof Error ? err.message : err);
            throw err;
        }
    }

    async removeFollow(userIdToUnfollow: string, followerId: string): Promise<void> {
        const db = getDatabase();
        
        try {
            const success = await db.removeFollow(followerId, userIdToUnfollow);
            if (success) {
                console.log(`User ${followerId} unfollowed ${userIdToUnfollow}`);
                // Send notification to the user being unfollowed
                this.sendFollowNotification(userIdToUnfollow, followerId, 'unfollow');
            }
        } catch (err) {
            console.error('Error removing follow relationship', err instanceof Error ? err.message : err);
            throw err;
        }
    }

    private async sendFollowNotification(targetUserId: string, followerId: string, type: 'follow' | 'unfollow'): Promise<void> {
        try {
            // Get follower's username for the notification
            const followerUsername = await this.getUsernameById(followerId);
            if (!followerUsername) return;

            const title = type === 'follow' ? 'New Follower!' : 'Follower Update';
            const message = type === 'follow'
                ? `${followerUsername} started following you`
                : `${followerUsername} unfollowed you`;

            // Store notification in database for persistence
            await this.storeNotification(targetUserId, type, title, message, followerId, followerUsername);

            // Broadcast to connected users
            if (this.notificationBroadcaster) {
                const notificationMessage: FollowNotificationMessage = {
                    kind: 'followNotification',
                    payload: {
                        followerId,
                        followerUsername,
                        type
                    }
                };
                
                this.notificationBroadcaster(targetUserId, notificationMessage);
            }
        } catch (error) {
            console.error('Failed to send follow notification:', error);
        }
    }

    private async storeNotification(
        recipientId: string,
        type: string,
        title: string,
        message: string,
        senderId?: string,
        senderUsername?: string
    ): Promise<void> {
        const db = getDatabase();
        const sql = `
            INSERT INTO notifications (recipient_id, type, title, message, sender_id, sender_username, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        const params = [recipientId, type, title, message, senderId || null, senderUsername || null, new Date().toISOString()];

        try {
            await db.query(sql, params);
            console.log(`Notification stored for user ${recipientId}`);
        } catch (err) {
            console.error('Error storing notification', err instanceof Error ? err.message : err);
            throw err;
        }
    }

    async getNotifications(userId: string, limit: number = 50): Promise<unknown[]> {
        const db = getDatabase();
        const sql = `
            SELECT * FROM notifications
            WHERE recipient_id = $1
            ORDER BY created_at DESC
            LIMIT $2
        `;

        try {
            const result = await db.query(sql, [userId, limit]);
            return result || [];
        } catch (err) {
            console.error('Error getting notifications', err instanceof Error ? err.message : err);
            throw err;
        }
    }

    async markNotificationAsRead(notificationId: number): Promise<void> {
        const db = getDatabase();
        const sql = `UPDATE notifications SET read = true WHERE id = $1`;

        try {
            await db.query(sql, [notificationId]);
        } catch (err) {
            console.error('Error marking notification as read', err instanceof Error ? err.message : err);
            throw err;
        }
    }

    private async getUsernameById(userId: string): Promise<string | null> {
        const db = getDatabase();
        
        try {
            const user = await db.getUserById(userId);
            return user?.username || null;
        } catch (err) {
            console.error('Error getting username', err instanceof Error ? err.message : err);
            return null;
        }
    }

    async getFollowers(userId: string): Promise<{ userId: string, username: string }[]> {
        const db = getDatabase();
        
        try {
            const followers = await db.getFollowers(userId);
            return followers.map(user => ({ userId: user.user_id, username: user.username }));
        } catch (err) {
            console.error('Error getting followers', err instanceof Error ? err.message : err);
            return [];
        }
    }

    async getFollowing(userId: string): Promise<{ userId: string, username: string }[]> {
        const db = getDatabase();
        
        try {
            const following = await db.getFollowing(userId);
            return following.map(user => ({ userId: user.user_id, username: user.username }));
        } catch (err) {
            console.error('Error getting following', err instanceof Error ? err.message : err);
            return [];
        }
    }
}