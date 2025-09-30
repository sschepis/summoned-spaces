import sqlite3 from 'sqlite3';

const DB_PATH = './summoned-spaces.db';

let db: sqlite3.Database;

export function initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(DB_PATH, (err) => {
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

                // Spaces table - minimal metadata for discovery only
                // Membership, roles, etc. are stored as holographic beacons
                const createSpacesTableSql = `
                    CREATE TABLE IF NOT EXISTS spaces (
                        space_id TEXT PRIMARY KEY,
                        name TEXT NOT NULL,
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
                    console.log('HOLOGRAPHIC ARCHITECTURE: User data (follows, memberships, likes, comments) stored as beacons only.');
                    resolve();
                });
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