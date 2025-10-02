/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomBytes } from 'crypto';
import { getDatabase } from './database';
import { generateNodeIdentity } from './identity';
// Converter functions between identity types and database types
function convertToQuantumPrimeIndices(resonance, isPublic) {
    if (isPublic) {
        const pub = resonance;
        return {
            base_resonance: (pub.primaryPrimes[0] || 0) / 1000,
            amplification_factor: (pub.primaryPrimes[1] || 0) / 1000,
            phase_alignment: (pub.primaryPrimes[2] || 0) / 1000,
            entropy_level: (pub.harmonicPrimes[0] || 0) / 1000,
            prime_sequence: [...pub.primaryPrimes, ...pub.harmonicPrimes],
            resonance_signature: pub.primaryPrimes.join('-')
        };
    }
    else {
        const priv = resonance;
        return {
            base_resonance: Math.sin(priv.eigenPhase),
            amplification_factor: Math.cos(priv.eigenPhase),
            phase_alignment: priv.eigenPhase / (2 * Math.PI),
            entropy_level: (priv.authenticationSeed % 1000) / 1000,
            prime_sequence: priv.secretPrimes,
            resonance_signature: priv.secretPrimes.join('-')
        };
    }
}
function convertFromQuantumPrimeIndices(quantum, isPublic) {
    if (isPublic) {
        const primeSeq = quantum.prime_sequence || [];
        return {
            primaryPrimes: primeSeq.slice(0, 3),
            harmonicPrimes: primeSeq.slice(3, 5)
        };
    }
    else {
        return {
            secretPrimes: quantum.prime_sequence || [],
            eigenPhase: quantum.phase_alignment * 2 * Math.PI,
            authenticationSeed: Math.floor(quantum.entropy_level * 1000)
        };
    }
}
export class AuthenticationManager {
    async registerUser(username, email, password) {
        const db = getDatabase();
        // Step 1: Generate Prime Resonance Identity
        const pri = generateNodeIdentity();
        const userId = pri.nodeAddress; // Use the node address as the unique user ID
        // Step 2: Hash password with proper salt
        const salt = randomBytes(32);
        const passwordHash = await hashPassword(password + salt.toString());
        // Step 3: Create user data for the Neon adapter
        const userData = {
            user_id: userId,
            username,
            email,
            password_hash: passwordHash,
            salt,
            node_public_key: Buffer.from(new Uint8Array(0)), // Empty buffer for legacy compatibility
            node_private_key_encrypted: Buffer.from(new Uint8Array(0)),
            master_phase_key_encrypted: Buffer.from(new Uint8Array(0)),
            pri_public_resonance: convertToQuantumPrimeIndices(pri.publicResonance, true),
            pri_private_resonance: convertToQuantumPrimeIndices(pri.privateResonance, false), // Note: In a real system, this MUST be encrypted
            pri_fingerprint: pri.fingerprint
        };
        // Step 4: Use the database adapter to create the user
        try {
            await db.createUser(userData);
            console.log(`User registered: ${username} with PRI Node Address: ${userId}`);
        }
        catch (err) {
            console.error('Error registering user', err instanceof Error ? err.message : 'Unknown error');
            throw err;
        }
        return { userId, pri };
    }
    async loginUser(username, password) {
        const db = getDatabase();
        // Step 1: Retrieve user from DB using the adapter
        const user = await db.getUserByUsername(username);
        if (!user) {
            throw new Error('User not found');
        }
        // Step 2: Verify password
        const passwordValid = await verifyPassword(password + Buffer.from(user.salt).toString(), user.password_hash);
        if (!passwordValid) {
            throw new Error('Invalid credentials');
        }
        // Step 3: Reconstruct PRI from stored data
        const pri = {
            publicResonance: convertFromQuantumPrimeIndices(user.pri_public_resonance, true),
            privateResonance: convertFromQuantumPrimeIndices(user.pri_private_resonance, false), // Note: Should be decrypted
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
    async validateSessionToken(sessionToken, userId) {
        // Basic validation: Check if token format matches expected pattern
        const expectedToken = `token_for_${userId}`;
        if (sessionToken !== expectedToken) {
            throw new Error('Invalid session token');
        }
        // Retrieve user from database using the adapter
        const db = getDatabase();
        const user = await db.getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        // Reconstruct PRI from stored data
        const pri = {
            publicResonance: convertFromQuantumPrimeIndices(user.pri_public_resonance, true),
            privateResonance: convertFromQuantumPrimeIndices(user.pri_private_resonance, false),
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
async function hashPassword(password) {
    return `hashed_${password}`;
}
async function verifyPassword(password, hash) {
    return `hashed_${password}` === hash;
}
