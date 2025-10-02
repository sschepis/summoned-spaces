/**
 * Vercel-compatible WebSocket Alternative using Server-Sent Events
 * Provides real-time functionality for Summoned Spaces quantum beacon system
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeDatabaseForEnvironment, getDatabase } from '../server/database';
import { AuthenticationManager } from '../server/auth';
import { ConnectionManager } from '../server/connections';
import { PostManager } from '../server/posts';
import { SpaceManager } from '../server/spaces';
import { SocialGraphManager } from '../server/social';
import { QuaternionicChatManager } from '../server/quaternionic-chat';

// Global managers (in production, you'd use Redis or similar)
let authManager: AuthenticationManager;
let connectionManager: ConnectionManager;
let postManager: PostManager;
let spaceManager: SpaceManager;
let socialGraphManager: SocialGraphManager;
let quaternionicChatManager: QuaternionicChatManager;

// Initialize managers once
let managersInitialized = false;

async function initializeManagers() {
  if (managersInitialized) return;
  
  await initializeDatabaseForEnvironment();
  
  authManager = new AuthenticationManager();
  connectionManager = new ConnectionManager();
  postManager = new PostManager(connectionManager);
  spaceManager = new SpaceManager(postManager);
  quaternionicChatManager = new QuaternionicChatManager(connectionManager);
  
  // Social graph manager with notification broadcaster
  socialGraphManager = new SocialGraphManager((targetUserId: string, message: any) => {
    // In production, you'd use a pub/sub system like Redis
    console.log(`[SSE] Would send notification to user ${targetUserId}:`, message);
  });
  
  managersInitialized = true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await initializeManagers();
  
  if (req.method === 'GET') {
    // Server-Sent Events endpoint for real-time updates
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ kind: 'connected', payload: { message: 'SSE connection established' } })}\n\n`);

    // Keep connection alive
    const keepAlive = setInterval(() => {
      res.write(`data: ${JSON.stringify({ kind: 'ping', payload: { timestamp: Date.now() } })}\n\n`);
    }, 30000);

    // Clean up on close
    req.on('close', () => {
      clearInterval(keepAlive);
    });

    return;
  }

  if (req.method === 'POST') {
    // Handle WebSocket-style messages via POST
    try {
      const message = req.body;
      const response = await handleMessage(message);
      
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        kind: 'error',
        payload: {
          message: error instanceof Error ? error.message : 'Internal server error'
        }
      });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}

async function handleMessage(message: any): Promise<any> {
  switch (message.kind) {
    case 'register': {
      const { username, email, password } = message.payload;
      const result = await authManager.registerUser(username, email, password);
      return {
        kind: 'registerSuccess',
        payload: { userId: result.userId }
      };
    }
    
    case 'login': {
      const { username, password } = message.payload;
      const session = await authManager.loginUser(username, password);
      
      return {
        kind: 'loginSuccess',
        payload: {
          sessionToken: session.sessionToken,
          userId: session.userId,
          pri: session.pri,
        }
      };
    }
    
    case 'submitPostBeacon': {
      const { sessionToken, userId, beacon, beaconType } = message.payload;
      
      // Validate session
      const validSession = await authManager.validateSessionToken(sessionToken, userId);
      if (!validSession) {
        throw new Error('Invalid session');
      }
      
      const result = await postManager.handleBeaconSubmission(userId, beacon, beaconType);
      return {
        kind: 'submitPostSuccess',
        payload: { ...result, timestamp: Date.now() }
      };
    }
    
    case 'follow': {
      const { sessionToken, userId, userIdToFollow } = message.payload;
      
      const validSession = await authManager.validateSessionToken(sessionToken, userId);
      if (!validSession) {
        throw new Error('Invalid session');
      }
      
      await socialGraphManager.addFollow(userIdToFollow, userId);
      
      return {
        kind: 'followSuccess',
        payload: { userIdToFollow }
      };
    }
    
    case 'getBeaconsByUser': {
      const { userId, beaconType } = message.payload;
      const db = getDatabase();
      
      let sql: string;
      const params: any[] = [];
      
      if (userId === '*') {
        sql = `
          SELECT b.*, u.username
          FROM beacons b
          LEFT JOIN users u ON b.author_id = u.user_id
          WHERE 1=1
        `;
      } else {
        sql = `
          SELECT b.*, u.username
          FROM beacons b
          LEFT JOIN users u ON b.author_id = u.user_id
          WHERE b.author_id = ?
        `;
        params.push(userId);
      }
      
      if (beaconType) {
        sql += ` AND b.beacon_type = ?`;
        params.push(beaconType);
      }
      
      sql += ` ORDER BY b.created_at DESC`;
      
      const beacons = await db.query(sql, params);
      
      return {
        kind: 'beaconsResponse',
        payload: { beacons }
      };
    }
    
    case 'search': {
      const { query, category } = message.payload;
      const db = getDatabase();
      
      const results: { users: any[], spaces: any[], beacons: any[] } = {
        users: [],
        spaces: [],
        beacons: []
      };

      if (category === 'all' || category === 'people') {
        const userSql = `SELECT user_id, username FROM users WHERE username ILIKE ? LIMIT 10`;
        results.users = await db.query(userSql, [`%${query}%`]);
      }

      if (category === 'all' || category === 'spaces') {
        const spaceSql = `SELECT space_id, name, description FROM spaces WHERE name ILIKE ? OR description ILIKE ? LIMIT 10`;
        results.spaces = await db.query(spaceSql, [`%${query}%`, `%${query}%`]);
      }

      if (category === 'all' || category === 'posts') {
        const beaconSql = `
          SELECT b.beacon_id, b.author_id, b.created_at, u.username
          FROM beacons b
          LEFT JOIN users u ON b.author_id = u.user_id
          WHERE b.beacon_type = 'post'
          LIMIT 10
        `;
        results.beacons = await db.query(beaconSql, []);
      }

      return {
        kind: 'searchResponse',
        payload: results
      };
    }
    
    case 'getPublicSpaces': {
      const spaces = await spaceManager.getPublicSpaces();
      return {
        kind: 'publicSpacesResponse',
        payload: { spaces }
      };
    }
    
    case 'createSpace': {
      const { sessionToken, userId, name, description, isPublic } = message.payload;
      
      const validSession = await authManager.validateSessionToken(sessionToken, userId);
      if (!validSession) {
        throw new Error('Invalid session');
      }
      
      const result = await spaceManager.createSpace(userId, name, description, isPublic);
      return {
        kind: 'createSpaceSuccess',
        payload: { spaceId: result.spaceId, name }
      };
    }
    
    default:
      throw new Error(`Unknown message kind: ${message.kind}`);
  }
}