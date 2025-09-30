import { getDatabase } from './database';

export class SocialGraphManager {
    constructor() {
        console.log('SocialGraphManager initialized');
    }

    async addFollow(userIdToFollow: string, followerId: string): Promise<void> {
        const db = getDatabase();
        const sql = `INSERT INTO follows (follower_id, following_id, created_at) VALUES (?, ?, ?)`;
        const params = [followerId, userIdToFollow, new Date().toISOString()];

        return new Promise((resolve, reject) => {
            db.run(sql, params, (err) => {
                if (err) {
                    console.error('Error adding follow relationship', err.message);
                    return reject(err);
                }
                console.log(`User ${followerId} is now following ${userIdToFollow}`);
                resolve();
            });
        });
    }

    async getFollowers(userId: string): Promise<string[]> {
        const db = getDatabase();
        const sql = `SELECT follower_id FROM follows WHERE following_id = ?`;

        return new Promise((resolve, reject) => {
            db.all(sql, [userId], (err, rows: { follower_id: string }[]) => {
                if (err) {
                    console.error('Error getting followers', err.message);
                    return reject(err);
                }
                resolve(rows.map(row => row.follower_id));
            });
        });
    }

    async getFollowing(userId: string): Promise<string[]> {
        const db = getDatabase();
        const sql = `SELECT following_id FROM follows WHERE follower_id = ?`;

        return new Promise((resolve, reject) => {
            db.all(sql, [userId], (err, rows: { following_id: string }[]) => {
                if (err) {
                    console.error('Error getting following', err.message);
                    return reject(err);
                }
                resolve(rows.map(row => row.following_id));
            });
        });
    }
}