import { getDatabase } from './database';

export class SpaceManager {
    constructor() {
        console.log('SpaceManager initialized');
    }

    async createSpace(ownerId: string, name: string, description: string, isPublic: boolean): Promise<{ spaceId: string }> {
        const db = getDatabase();
        const spaceId = `space_${Math.random().toString(36).substr(2, 9)}`;
        
        const sql = `
            INSERT INTO spaces (space_id, name, description, owner_id, is_public, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            spaceId,
            name,
            description,
            ownerId,
            isPublic ? 1 : 0,
            new Date().toISOString()
        ];

        return new Promise((resolve, reject) => {
            db.run(sql, params, (err: Error | null) => {
                if (err) {
                    console.error('Error creating space', err.message);
                    return reject(err);
                }
                console.log(`Space created: ${name} (${spaceId}) by ${ownerId}`);
                
                // Automatically add the owner as a member
                const memberSql = `INSERT INTO space_members (space_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)`;
                db.run(memberSql, [spaceId, ownerId, 'owner', new Date().toISOString()], (memberErr) => {
                    if (memberErr) {
                        console.error('Error adding owner to space', memberErr.message);
                        return reject(memberErr);
                    }
                    console.log(`Owner ${ownerId} added to space ${spaceId}`);
                    resolve({ spaceId });
                });
            });
        });
    }

    async joinSpace(spaceId: string, userId: string): Promise<void> {
        const db = getDatabase();
        const sql = `INSERT INTO space_members (space_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)`;
        
        return new Promise((resolve, reject) => {
            db.run(sql, [spaceId, userId, 'member', new Date().toISOString()], (err: Error | null) => {
                if (err) {
                    console.error('Error joining space', err.message);
                    return reject(err);
                }
                console.log(`User ${userId} joined space ${spaceId}`);
                resolve();
            });
        });
    }

    async leaveSpace(spaceId: string, userId: string): Promise<void> {
        const db = getDatabase();
        const sql = `DELETE FROM space_members WHERE space_id = ? AND user_id = ?`;
        
        return new Promise((resolve, reject) => {
            db.run(sql, [spaceId, userId], (err: Error | null) => {
                if (err) {
                    console.error('Error leaving space', err.message);
                    return reject(err);
                }
                console.log(`User ${userId} left space ${spaceId}`);
                resolve();
            });
        });
    }

    async getUserSpaces(userId: string): Promise<Array<{
        space_id: string;
        name: string;
        description: string;
        owner_id: string;
        is_public: number;
        created_at: string;
    }>> {
        const db = getDatabase();
        const sql = `SELECT * FROM spaces WHERE owner_id = ? ORDER BY created_at DESC`;

        return new Promise((resolve, reject) => {
            db.all(sql, [userId], (err, rows: Array<{
                space_id: string;
                name: string;
                description: string;
                owner_id: string;
                is_public: number;
                created_at: string;
            }>) => {
                if (err) {
                    console.error('Error getting user spaces', err.message);
                    return reject(err);
                }
                resolve(rows);
            });
        });
    }

    async getPublicSpaces(): Promise<Array<{
        space_id: string;
        name: string;
        description: string;
        owner_id: string;
        is_public: number;
        created_at: string;
    }>> {
        const db = getDatabase();
        const sql = `SELECT * FROM spaces WHERE is_public = 1 ORDER BY created_at DESC`;

        return new Promise((resolve, reject) => {
            db.all(sql, [], (err, rows: Array<{
                space_id: string;
                name: string;
                description: string;
                owner_id: string;
                is_public: number;
                created_at: string;
            }>) => {
                if (err) {
                    console.error('Error getting public spaces', err.message);
                    return reject(err);
                }
                resolve(rows);
            });
        });
    }
}