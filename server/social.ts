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
        // Use INSERT OR IGNORE to prevent duplicate follow relationships
        const sql = `INSERT OR IGNORE INTO follows (follower_id, following_id, created_at) VALUES (?, ?, ?)`;
        const params = [followerId, userIdToFollow, new Date().toISOString()];

        return new Promise((resolve, reject) => {
            db.run(sql, params, (err: Error | null) => {
                if (err) {
                    console.error('Error adding follow relationship', err.message);
                    return reject(err);
                }
                
                // Check if a new row was actually inserted using lastID or changes
                // Note: We'll assume it's a new follow since we're using INSERT OR IGNORE
                console.log(`User ${followerId} is now following ${userIdToFollow}`);
                
                // Send notification to the user being followed
                this.sendFollowNotification(userIdToFollow, followerId, 'follow');
                
                resolve();
            });
        });
    }

    async removeFollow(userIdToUnfollow: string, followerId: string): Promise<void> {
        const db = getDatabase();
        const sql = `DELETE FROM follows WHERE follower_id = ? AND following_id = ?`;
        const params = [followerId, userIdToUnfollow];

        return new Promise((resolve, reject) => {
            db.run(sql, params, (err: Error | null) => {
                if (err) {
                    console.error('Error removing follow relationship', err.message);
                    return reject(err);
                }
                
                console.log(`User ${followerId} unfollowed ${userIdToUnfollow}`);
                
                // Send notification to the user being unfollowed
                this.sendFollowNotification(userIdToUnfollow, followerId, 'unfollow');
                
                resolve();
            });
        });
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
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [recipientId, type, title, message, senderId || null, senderUsername || null, new Date().toISOString()];

        return new Promise((resolve, reject) => {
            db.run(sql, params, (err) => {
                if (err) {
                    console.error('Error storing notification', err.message);
                    return reject(err);
                }
                console.log(`Notification stored for user ${recipientId}`);
                resolve();
            });
        });
    }

    async getNotifications(userId: string, limit: number = 50): Promise<any[]> {
        const db = getDatabase();
        const sql = `
            SELECT * FROM notifications
            WHERE recipient_id = ?
            ORDER BY created_at DESC
            LIMIT ?
        `;

        return new Promise((resolve, reject) => {
            db.all(sql, [userId, limit], (err, rows: any[]) => {
                if (err) {
                    console.error('Error getting notifications', err.message);
                    return reject(err);
                }
                resolve(rows || []);
            });
        });
    }

    async markNotificationAsRead(notificationId: number): Promise<void> {
        const db = getDatabase();
        const sql = `UPDATE notifications SET read = 1 WHERE id = ?`;

        return new Promise((resolve, reject) => {
            db.run(sql, [notificationId], (err) => {
                if (err) {
                    console.error('Error marking notification as read', err.message);
                    return reject(err);
                }
                resolve();
            });
        });
    }

    private async getUsernameById(userId: string): Promise<string | null> {
        const db = getDatabase();
        const sql = `SELECT username FROM users WHERE user_id = ?`;

        return new Promise((resolve, reject) => {
            db.get(sql, [userId], (err, row: { username: string } | undefined) => {
                if (err) {
                    console.error('Error getting username', err.message);
                    return reject(err);
                }
                resolve(row?.username || null);
            });
        });
    }

    async getFollowers(userId: string): Promise<{ userId: string, username: string }[]> {
        const db = getDatabase();
        const sql = `
            SELECT u.user_id, u.username
            FROM users u
            JOIN follows f ON u.user_id = f.follower_id
            WHERE f.following_id = ?
        `;
        
        return new Promise((resolve, reject) => {
            db.all(sql, [userId], (err, rows: { user_id: string, username: string }[]) => {
                if (err) {
                    console.error('Error getting followers', err.message);
                    return reject(err);
                }
                resolve(rows.map(row => ({ userId: row.user_id, username: row.username })));
            });
        });
    }

    async getFollowing(userId: string): Promise<{ userId: string, username: string }[]> {
        const db = getDatabase();
        const sql = `
            SELECT u.user_id, u.username
            FROM users u
            JOIN follows f ON u.user_id = f.following_id
            WHERE f.follower_id = ?
        `;
        
        return new Promise((resolve, reject) => {
            db.all(sql, [userId], (err, rows: { user_id: string, username: string }[]) => {
                if (err) {
                    console.error('Error getting following', err.message);
                    return reject(err);
                }
                resolve(rows.map(row => ({ userId: row.user_id, username: row.username })));
            });
        });
    }
}