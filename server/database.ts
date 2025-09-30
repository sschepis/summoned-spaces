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
            resolve();
        });
    });
}

export function getDatabase(): sqlite3.Database {
    if (!db) {
        throw new Error('Database has not been initialized. Please call initializeDatabase() first.');
    }
    return db;
}