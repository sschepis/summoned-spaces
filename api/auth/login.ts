/**
 * Vercel API Route: User Authentication
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeDatabaseForEnvironment } from '../../server/database.js';
import { AuthenticationManager } from '../../server/auth.js';

let authManager: AuthenticationManager;
let initialized = false;

async function initialize() {
  if (initialized) return;
  await initializeDatabaseForEnvironment();
  authManager = new AuthenticationManager();
  initialized = true;
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
    await initialize();

    const { action, username, email, password } = req.body;

    switch (action) {
      case 'register': {
        const result = await authManager.registerUser(username, email, password);
        res.status(200).json({
          success: true,
          kind: 'registerSuccess',
          payload: { userId: result.userId }
        });
        break;
      }

      case 'login': {
        const session = await authManager.loginUser(username, password);
        res.status(200).json({
          success: true,
          kind: 'loginSuccess',
          payload: {
            sessionToken: session.sessionToken,
            userId: session.userId,
            pri: session.pri,
          }
        });
        break;
      }

      case 'validateSession': {
        const { sessionToken, userId } = req.body;
        const validSession = await authManager.validateSessionToken(sessionToken, userId);
        res.status(200).json({
          success: true,
          kind: 'sessionValidated',
          payload: { valid: !!validSession }
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
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}