import sqlite3 from 'sqlite3';

const DB_PATH = './summoned-spaces.db';

let db: sqlite3.Database;

export function initializeDatabase(dbPath: string = DB_PATH): Promise<void> {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error opening database', err.message);
                return reject(err);
            }
            console.log('Connected to the SQLite database.');
        });

        const createUserTableSql = `
            CREATE TABLE IF NOT EXISTS users (
                user_id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                salt BLOB NOT NULL,
                node_public_key BLOB NOT NULL,
                node_private_key_encrypted BLOB NOT NULL,
                master_phase_key_encrypted BLOB NOT NULL,
                pri_public_resonance TEXT NOT NULL,
                pri_private_resonance TEXT NOT NULL,
                pri_fingerprint TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
        `;

        db.run(createUserTableSql, (err) => {
            if (err) {
                console.error('Error creating users table', err.message);
                return reject(err);
            }
            console.log('Users table is ready.');

            const createBeaconsTableSql = `
                CREATE TABLE IF NOT EXISTS beacons (
                    beacon_id TEXT PRIMARY KEY,
                    beacon_type TEXT NOT NULL,
                    author_id TEXT NOT NULL,
                    prime_indices TEXT NOT NULL,
                    epoch INTEGER NOT NULL,
                    fingerprint BLOB NOT NULL,
                    signature BLOB NOT NULL,
                    metadata TEXT,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY (author_id) REFERENCES users (user_id)
                );
            `;

            db.run(createBeaconsTableSql, (err) => {
                if (err) {
                    console.error('Error creating beacons table', err.message);
                    return reject(err);
                }
                console.log('Beacons table is ready.');

                // Check if beacon_type column exists, add it if missing (migration)
                db.all("PRAGMA table_info(beacons)", (err, rows) => {
                    if (err) {
                        console.error('Error checking beacons table schema', err.message);
                        return reject(err);
                    }
                    
                    const hasBeaconType = rows.some((row: any) => row.name === 'beacon_type');
                    
                    if (!hasBeaconType) {
                        console.log('Adding beacon_type column to existing beacons table...');
                        db.run("ALTER TABLE beacons ADD COLUMN beacon_type TEXT DEFAULT 'post'", (err) => {
                            if (err) {
                                console.error('Error adding beacon_type column', err.message);
                                return reject(err);
                            }
                            console.log('beacon_type column added successfully.');
                            createSpacesTable();
                        });
                    } else {
                        createSpacesTable();
                    }
                });

                function createSpacesTable() {
                    // Spaces table - minimal metadata for discovery only
                    // Membership, roles, etc. are stored as holographic beacons
                    const createSpacesTableSql = `
                        CREATE TABLE IF NOT EXISTS spaces (
                            space_id TEXT PRIMARY KEY,
                            name TEXT NOT NULL UNIQUE,
                            description TEXT,
                            is_public INTEGER NOT NULL,
                            created_at TEXT NOT NULL
                        );
                    `;

                    db.run(createSpacesTableSql, (err) => {
                        if (err) {
                            console.error('Error creating spaces table', err.message);
                            return reject(err);
                        }
                        console.log('Spaces table is ready.');
                        
                        // Create missing tables for likes and comments if they don't exist
                        const createLikesTableSql = `
                            CREATE TABLE IF NOT EXISTS likes (
                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                post_beacon_id TEXT NOT NULL,
                                user_id TEXT NOT NULL,
                                created_at TEXT NOT NULL,
                                UNIQUE(post_beacon_id, user_id),
                                FOREIGN KEY (user_id) REFERENCES users (user_id)
                            );
                        `;
                        
                        const createCommentsTableSql = `
                            CREATE TABLE IF NOT EXISTS comments (
                                comment_id TEXT PRIMARY KEY,
                                post_beacon_id TEXT NOT NULL,
                                author_id TEXT NOT NULL,
                                comment_beacon_id TEXT NOT NULL,
                                created_at TEXT NOT NULL,
                                FOREIGN KEY (author_id) REFERENCES users (user_id)
                            );
                        `;
                        
                        db.run(createLikesTableSql, (err) => {
                            if (err) {
                                console.error('Error creating likes table', err.message);
                                return reject(err);
                            }
                            console.log('Likes table is ready.');
                            
                            db.run(createCommentsTableSql, (err) => {
                                if (err) {
                                    console.error('Error creating comments table', err.message);
                                    return reject(err);
                                }
                                console.log('Comments table is ready.');
                                
                                const createFollowsTableSql = `
                                    CREATE TABLE IF NOT EXISTS follows (
                                        follower_id TEXT NOT NULL,
                                        following_id TEXT NOT NULL,
                                        created_at TEXT NOT NULL,
                                        PRIMARY KEY (follower_id, following_id),
                                        FOREIGN KEY (follower_id) REFERENCES users (user_id),
                                        FOREIGN KEY (following_id) REFERENCES users (user_id)
                                    );
                                `;

                                db.run(createFollowsTableSql, (err) => {
                                    if (err) {
                                        console.error('Error creating follows table', err.message);
                                        return reject(err);
                                    }
                                    console.log('Follows table is ready.');

                                    // Create notifications table
                                    const createNotificationsTableSql = `
                                        CREATE TABLE IF NOT EXISTS notifications (
                                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                                            recipient_id TEXT NOT NULL,
                                            type TEXT NOT NULL,
                                            title TEXT NOT NULL,
                                            message TEXT NOT NULL,
                                            sender_id TEXT,
                                            sender_username TEXT,
                                            read INTEGER DEFAULT 0,
                                            created_at TEXT NOT NULL,
                                            FOREIGN KEY (recipient_id) REFERENCES users (user_id),
                                            FOREIGN KEY (sender_id) REFERENCES users (user_id)
                                        );
                                    `;
                                    
                                    db.run(createNotificationsTableSql, (err) => {
                                        if (err) {
                                            console.error('Error creating notifications table', err.message);
                                            return reject(err);
                                        }
                                        console.log('Notifications table is ready.');
                                        
                                        // Create quaternionic messages table
                                        const createQuaternionicMessagesTableSql = `
                                            CREATE TABLE IF NOT EXISTS quaternionic_messages (
                                                message_id TEXT PRIMARY KEY,
                                                sender_id TEXT NOT NULL,
                                                receiver_id TEXT NOT NULL,
                                                content TEXT NOT NULL,
                                                room_id TEXT,
                                                phase_alignment REAL NOT NULL,
                                                entropy_level REAL NOT NULL,
                                                twist_angle REAL NOT NULL,
                                                is_quantum_delivered INTEGER NOT NULL,
                                                created_at TEXT NOT NULL,
                                                FOREIGN KEY (sender_id) REFERENCES users (user_id),
                                                FOREIGN KEY (receiver_id) REFERENCES users (user_id)
                                            );
                                        `;
                                        
                                        db.run(createQuaternionicMessagesTableSql, (err) => {
                                            if (err) {
                                                console.error('Error creating quaternionic_messages table', err.message);
                                                return reject(err);
                                            }
                                            console.log('Quaternionic messages table is ready.');

                                            console.log('HOLOGRAPHIC ARCHITECTURE: User data (follows, memberships, likes, comments) stored as beacons only.');
                                            console.log('QUATERNIONIC ARCHITECTURE: Messages transmitted via split-prime quaternionic entanglement.');
                                            resolve();
                                        });
                                    });
                                });
                            });
                        });
                    });
                }
            });
        });
    });
}

export function getDatabase(): sqlite3.Database {
    if (!db) {
        throw new Error('Database has not been initialized. Please call initializeDatabase() first.');
    }
    return db;
}

export function closeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (db) {
            db.close((err) => {
                if (err) {
                    console.error('Error closing database', err.message);
                    return reject(err);
                }
                console.log('Database connection closed.');
                resolve();
            });
        } else {
            resolve();
        }
    });
}

export function clearDatabase(): Promise<void> {
    const tables = ['notifications', 'follows', 'comments', 'likes', 'beacons', 'spaces', 'users'];
    const db = getDatabase();

    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('PRAGMA foreign_keys = OFF');

            for (const table of tables) {
                db.run(`DELETE FROM ${table}`, (err) => {
                    if (err) {
                        console.error(`Error clearing table ${table}`, err.message);
                    }
                });
                db.run(`DELETE FROM sqlite_sequence WHERE name = ?`, [table], (err) => {
                    // This may fail if table doesn't use AUTOINCREMENT, which is fine.
                });
            }

            db.run('PRAGMA foreign_keys = ON', (err) => {
                if (err) {
                    console.error('Error re-enabling foreign keys', err.message);
                    return reject(err);
                }
                console.log('Database cleared.');
                resolve();
            });
        });
    });
}