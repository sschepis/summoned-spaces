/**
 * Vercel API Route: User Authentication
 * Self-contained implementation without server/ dependencies
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import { randomBytes } from 'crypto';
import { pbkdf2 } from 'crypto';
import { promisify } from 'util';

const pbkdf2Async = promisify(pbkdf2);

// Database connection pool (reused across invocations)
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL or NEON_DATABASE_URL environment variable is required');
    }
    
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

// Password hashing
async function hashPassword(password: string): Promise<string> {
  const iterations = 100000;
  const keylen = 64;
  const digest = 'sha512';
  const derivedKey = await pbkdf2Async(password, 'static-salt', iterations, keylen, digest);
  return derivedKey.toString('hex');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// Generate PRI (simplified version)
function generatePRI() {
  const userId = 'user_' + randomBytes(16).toString('hex');
  return {
    nodeAddress: userId,
    publicResonance: {
      primaryPrimes: [2, 3, 5, 7, 11],
      harmonicPrimes: [13, 17, 19, 23]
    },
    privateResonance: {
      secretPrimes: [29, 31, 37, 41],
      eigenPhase: Math.random() * Math.PI * 2,
      authenticationSeed: Math.floor(Math.random() * 1000)
    },
    fingerprint: 'fp_' + randomBytes(16).toString('hex')
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { action, username, email, password } = req.body;
    const db = getPool();

    switch (action) {
      case 'register': {
        // Generate PRI
        const pri = generatePRI();
        const userId = pri.nodeAddress;

        // Hash password
        const salt = randomBytes(32);
        const passwordHash = await hashPassword(password + salt.toString());

        // Insert user
        await db.query(`
          INSERT INTO users (
            user_id, username, email, password_hash, salt,
            node_public_key, node_private_key_encrypted, master_phase_key_encrypted,
            pri_public_resonance, pri_private_resonance, pri_fingerprint
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          userId,
          username,
          email,
          passwordHash,
          salt,
          Buffer.from(pri.fingerprint, 'utf8'),
          Buffer.from(JSON.stringify(pri.privateResonance), 'utf8'),
          Buffer.from(JSON.stringify(pri.publicResonance), 'utf8'),
          JSON.stringify({
            base_resonance: 0.8,
            amplification_factor: 0.7,
            phase_alignment: 0.9,
            entropy_level: 0.6,
            prime_sequence: pri.publicResonance.primaryPrimes,
            resonance_signature: pri.publicResonance.primaryPrimes.join('-')
          }),
          JSON.stringify({
            base_resonance: 0.75,
            amplification_factor: 0.65,
            phase_alignment: 0.85,
            entropy_level: 0.55,
            prime_sequence: pri.privateResonance.secretPrimes,
            resonance_signature: pri.privateResonance.secretPrimes.join('-')
          }),
          pri.fingerprint
        ]);

        res.status(200).json({
          success: true,
          kind: 'registerSuccess',
          payload: { userId }
        });
        break;
      }

      case 'login': {
        // Get user
        const result = await db.query(
          'SELECT * FROM users WHERE username = $1',
          [username]
        );

        if (result.rows.length === 0) {
          throw new Error('User not found');
        }

        const user = result.rows[0];

        // Verify password
        const passwordValid = await verifyPassword(
          password + Buffer.from(user.salt).toString(),
          user.password_hash
        );

        if (!passwordValid) {
          throw new Error('Invalid credentials');
        }

        // Reconstruct PRI
        const pri = {
          publicResonance: typeof user.pri_public_resonance === 'string' 
            ? JSON.parse(user.pri_public_resonance) 
            : user.pri_public_resonance,
          privateResonance: typeof user.pri_private_resonance === 'string'
            ? JSON.parse(user.pri_private_resonance)
            : user.pri_private_resonance,
          fingerprint: user.pri_fingerprint,
          nodeAddress: user.user_id
        };

        // Create session token
        const sessionToken = randomBytes(32).toString('hex');

        res.status(200).json({
          success: true,
          kind: 'loginSuccess',
          payload: {
            sessionToken,
            userId: user.user_id,
            pri,
          }
        });
        break;
      }

      case 'validateSession': {
        const { sessionToken, userId } = req.body;
        
        if (!sessionToken || sessionToken.length !== 64) {
          throw new Error('Invalid session token');
        }

        // Get user
        const result = await db.query(
          'SELECT * FROM users WHERE user_id = $1',
          [userId]
        );

        if (result.rows.length === 0) {
          throw new Error('User not found');
        }

        res.status(200).json({
          success: true,
          kind: 'sessionValidated',
          payload: { valid: true }
        });
        break;
      }

      default:
        res.status(400).json({
          success: false,
          error: 'Unknown action'
        });
    }
  } catch (error) {
    console.error('[AUTH] Error:', error);
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}