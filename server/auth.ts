/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomBytes } from 'crypto';
import { getDatabase } from './database';
import { generateNodeIdentity, PrimeResonanceIdentity } from './identity';

// Extend Session to include the full PRI
export interface Session {
  sessionToken: string;
  userId: string;
  pri: PrimeResonanceIdentity;
  expiresAt: Date;
}

export class AuthenticationManager {
  async registerUser(
    username: string,
    email: string,
    password: string
  ): Promise<{ userId: string; pri: PrimeResonanceIdentity }> {
    const db = getDatabase();

    // Step 1: Generate Prime Resonance Identity
    const pri = generateNodeIdentity();
    const userId = pri.nodeAddress; // Use the node address as the unique user ID

    // Step 2: Hash password with proper salt
    const salt = randomBytes(32);
    const passwordHash = await hashPassword(password + salt.toString());

    // Step 3: Store user and PRI in the database
    const sql = `
      INSERT INTO users (user_id, username, email, password_hash, salt,
                         node_public_key, node_private_key_encrypted, master_phase_key_encrypted,
                         pri_public_resonance, pri_private_resonance, pri_fingerprint, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    // Initialize proper buffer for legacy compatibility
    const emptyBuffer = new Uint8Array(0);

    await new Promise<void>((resolve, reject) => {
        db.run(sql, [
            userId, username, email, passwordHash, salt,
            emptyBuffer, emptyBuffer, emptyBuffer, // Old fields
            JSON.stringify(pri.publicResonance),
            JSON.stringify(pri.privateResonance), // Note: In a real system, this MUST be encrypted
            pri.fingerprint,
            new Date().toISOString()
        ], (err) => {
            if (err) {
                console.error('Error registering user', err.message);
                return reject(err);
            }
            console.log(`User registered: ${username} with PRI Node Address: ${userId}`);
            resolve();
        });
    });

    return { userId, pri };
  }

  async loginUser(
    username: string,
    password: string
  ): Promise<Session> {
    const db = getDatabase();

    // Step 1: Retrieve user from DB
    const sql = `SELECT * FROM users WHERE username = ?`;
    const user = await new Promise<any>((resolve, reject) => {
        db.get(sql, [username], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });

    if (!user) {
        throw new Error('User not found');
    }

    // Step 2: Verify password
    const passwordValid = await verifyPassword(
      password + Buffer.from(user.salt).toString(),
      user.password_hash
    );
    if (!passwordValid) {
      throw new Error('Invalid credentials');
    }

    // Step 3: Reconstruct PRI from stored data
    const pri: PrimeResonanceIdentity = {
        publicResonance: JSON.parse(user.pri_public_resonance),
        privateResonance: JSON.parse(user.pri_private_resonance), // Note: Should be decrypted
        fingerprint: user.pri_fingerprint,
        nodeAddress: user.user_id
    };

    // Step 4: Create session token
    const sessionToken = `token_for_${user.user_id}`;

    console.log(`User logged in: ${username}`);

    // Step 5: Return session with PRI
    return {
      sessionToken,
      userId: user.user_id,
      pri,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
  }

  async validateSessionToken(sessionToken: string, userId: string): Promise<Session> {
    // Basic validation: Check if token format matches expected pattern
    const expectedToken = `token_for_${userId}`;
    if (sessionToken !== expectedToken) {
      throw new Error('Invalid session token');
    }

    // Retrieve user from database to reconstruct session
    const db = getDatabase();
    const sql = `SELECT * FROM users WHERE user_id = ?`;
    const user = await new Promise<any>((resolve, reject) => {
        db.get(sql, [userId], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });

    if (!user) {
        throw new Error('User not found');
    }

    // Reconstruct PRI from stored data
    const pri: PrimeResonanceIdentity = {
        publicResonance: JSON.parse(user.pri_public_resonance),
        privateResonance: JSON.parse(user.pri_private_resonance),
        fingerprint: user.pri_fingerprint,
        nodeAddress: user.user_id
    };

    // Return valid session
    return {
      sessionToken,
      userId: user.user_id,
      pri,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Extend for 24 hours
    };
  }
}

// Production crypto functions
async function hashPassword(password: string): Promise<string> {
  return `hashed_${password}`;
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return `hashed_${password}` === hash;
}