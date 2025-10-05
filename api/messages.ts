/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Vercel API Function: Handle REST messages for production communication
 * TypeScript version with proper typing for quantum beacon operations
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { queueMessage as sseQueueMessage } from './events';
import { DatabaseFactory } from '../lib/database/database-factory';
import type { DatabaseAdapter } from '../lib/database/abstract-adapter';

// For now, authentication is handled by dedicated /api/auth/login endpoint
// This file handles other message types
let dbInstance: DatabaseAdapter | null = null;

async function getDatabase(): Promise<DatabaseAdapter> {
  if (!dbInstance) {
    dbInstance = await DatabaseFactory.createFromEnvironment();
  }
  return dbInstance;
}

interface CommunicationMessage {
  kind: string;
  payload: Record<string, unknown>;
}

interface CommunicationResponse {
  kind: string;
  payload: Record<string, unknown>;
}

interface StoredBeacon {
  beaconId: string;
  beaconType: string;
  authorId: string;
  data: unknown;
  createdAt: string;
}

interface StoredSpace {
  spaceId: string;
  name: string;
  description: string;
  isPublic: boolean;
  owner: string;
  createdAt: string;
  memberBeaconId?: string;
}

// In-memory storage for beacons and message queues only
// Spaces are now stored in the database
const beaconStore = new Map<string, StoredBeacon>();
const messageQueues = new Map<string, CommunicationMessage[]>();

function queueMessage(userId: string, message: CommunicationMessage): void {
  if (!messageQueues.has(userId)) {
    messageQueues.set(userId, []);
  }
  const queue = messageQueues.get(userId)!;
  queue.push(message);
  
  // Keep only last 100 messages per user to prevent memory issues
  if (queue.length > 100) {
    queue.shift();
  }
  
  // Also queue for SSE delivery
  try {
    sseQueueMessage(userId, message);
  } catch (error) {
    console.error('[API] Failed to queue message for SSE:', error);
  }
}

function getQueuedMessages(userId: string): CommunicationMessage[] {
  const messages = messageQueues.get(userId) || [];
  messageQueues.set(userId, []); // Clear after retrieval
  return messages;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    const message = req.body;
    if (!message) {
      throw new Error('No message body provided');
    }

    console.log('[API] Received message:', message.kind);
    
    // Check database configuration for auth operations
    if ((message.kind === 'login' || message.kind === 'register') &&
        !process.env.DATABASE_URL && !process.env.NEON_DATABASE_URL) {
      console.error('[API] Database not configured for authentication');
      const errorResponse: CommunicationResponse = {
        kind: 'error',
        payload: {
          requestKind: message.kind,
          message: 'Database not configured. Please set DATABASE_URL environment variable in Vercel settings.',
          details: 'See VERCEL_SETUP.md for configuration instructions'
        }
      };
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(errorResponse));
      return;
    }

    // Route messages to appropriate handlers
    const response = await handleMessage(message);
    
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
  } catch (error) {
    console.error('[API] Error handling message:', error);
    console.error('[API] Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    const errorResponse: CommunicationResponse = {
      kind: 'error',
      payload: {
        message: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : undefined
      }
    };
    
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(errorResponse));
  }
}

async function handleMessage(message: CommunicationMessage): Promise<CommunicationResponse> {
  // Handle different types of quantum beacon and social operations
  switch (message.kind) {
    case 'ping':
      return {
        kind: 'pong',
        payload: { timestamp: Date.now() }
      };
      
    case 'login':
    case 'register':
      // Auth messages should use dedicated auth endpoint
      return {
        kind: 'error',
        payload: {
          requestKind: message.kind,
          message: 'Please use /api/auth/login for authentication',
          redirect: '/api/auth/login'
        }
      };
      
    case 'submitPostBeacon':
      return handleSubmitPostBeacon(message.payload);
      
    case 'follow':
      return handleFollow(message.payload);
      
    case 'getQueuedMessages':
      return handleGetQueuedMessages(message.payload);
      
    case 'unfollow':
      return handleUnfollow(message.payload);
      
    case 'getBeaconsByUser':
      return handleGetBeaconsByUser(message.payload);
      
    case 'search':
      return handleSearch(message.payload);
      
    case 'getPublicSpaces':
      return handleGetPublicSpaces();
      
    case 'createSpace':
      return handleCreateSpace(message.payload);
      
    case 'submitCommentBeacon':
      return handleSubmitCommentBeacon(message.payload);
      
    case 'likePost':
      return handleLikePost(message.payload);
      
    default:
      return {
        kind: 'echo',
        payload: { 
          message: `Received ${message.kind} (production mode)`,
          note: 'Connect to full backend with Neon database for complete functionality',
          original: message.payload
        }
      };
  }
}

// Individual message handlers with proper typing

async function handleSubmitPostBeacon(payload: Record<string, unknown>): Promise<CommunicationResponse> {
  const { userId, beacon, beaconType } = payload;
  
  const beaconId = `beacon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  // Store beacon in memory
  const storedBeacon: StoredBeacon = {
    beaconId,
    beaconType: beaconType as string,
    authorId: userId as string,
    data: beacon,
    createdAt: new Date().toISOString()
  };
  
  beaconStore.set(beaconId, storedBeacon);
  console.log(`[API] Stored beacon ${beaconId} of type ${beaconType} for user ${userId}`);
  
  // If it's a space member beacon, we could update the space metadata in the database
  // For now, just log it - member count will be calculated from beacons when needed
  if (beaconType === 'SPACE_MEMBERS' && beacon && typeof beacon === 'object') {
    const beaconData = beacon as Record<string, unknown>;
    // Extract spaceId from signature if available
    if ('signature' in beaconData && beaconData.signature) {
      try {
        // Decode signature to get original text
        const signature = beaconData.signature as number[];
        const textLength = new DataView(new Uint8Array(signature.slice(0, 4)).buffer).getUint32(0, true);
        const textBytes = signature.slice(4, 4 + textLength);
        const originalText = new TextDecoder().decode(new Uint8Array(textBytes));
        const data = JSON.parse(originalText) as { spaceId?: string };
        
        if (data.spaceId) {
          console.log(`[API] Space member beacon ${beaconId} linked to space ${data.spaceId}`);
          // TODO: Could update space metadata in database here if needed
        }
      } catch (error) {
        console.error('[API] Error parsing beacon signature:', error);
      }
    }
  }
  
  return {
    kind: 'submitPostSuccess',
    payload: {
      message: 'Post beacon submitted and stored',
      timestamp: Date.now(),
      beaconId,
      userId: userId as string
    }
  };
}

async function handleFollow(payload: Record<string, unknown>): Promise<CommunicationResponse> {
  const { userIdToFollow, userId } = payload;
  // sessionToken validation will be implemented with production database
  
  // In production, this would:
  // 1. Update the database follow relationship
  // 2. Send a real-time notification to the target user
  // 3. Trigger follower count update
  
  // Queue notification for the target user
  if (userIdToFollow && userIdToFollow !== userId) {
    queueMessage(userIdToFollow as string, {
      kind: 'followNotification',
      payload: {
        followerId: userId as string,
        followerUsername: `user_${(userId as string).substring(0, 8)}`,
        type: 'follow',
        timestamp: Date.now()
      }
    });
  }
  
  // For now, simulate the success response
  return {
    kind: 'followSuccess',
    payload: {
      userIdToFollow: userIdToFollow as string,
      message: 'Follow action completed (production mode)',
      follower: userId as string,
      // Include notification data that would be sent via SSE
      notification: {
        kind: 'followNotification',
        payload: {
          followerId: userId as string,
          followerUsername: `user_${(userId as string).substring(0, 8)}`,
          type: 'follow'
        }
      }
    }
  };
}

async function handleUnfollow(payload: Record<string, unknown>): Promise<CommunicationResponse> {
  const { userIdToUnfollow, userId } = payload;
  // sessionToken validation will be implemented with production database
  
  // In production, this would:
  // 1. Remove the database follow relationship
  // 2. Send a real-time notification to the target user
  // 3. Trigger follower count update
  
  // Queue notification for the target user
  if (userIdToUnfollow && userIdToUnfollow !== userId) {
    queueMessage(userIdToUnfollow as string, {
      kind: 'followNotification',
      payload: {
        followerId: userId as string,
        followerUsername: `user_${(userId as string).substring(0, 8)}`,
        type: 'unfollow',
        timestamp: Date.now()
      }
    });
  }
  
  return {
    kind: 'unfollowSuccess',
    payload: {
      userIdToUnfollow: userIdToUnfollow as string,
      message: 'Unfollow action completed (production mode)',
      follower: userId as string,
      // Include notification data that would be sent via SSE
      notification: {
        kind: 'followNotification',
        payload: {
          followerId: userId as string,
          followerUsername: `user_${(userId as string).substring(0, 8)}`,
          type: 'unfollow'
        }
      }
    }
  };
}

async function handleGetBeaconsByUser(payload: Record<string, unknown>): Promise<CommunicationResponse> {
  const { userId, beaconType } = payload;
  
  // In production, this would query the Neon database
  // For now, return empty array with proper structure
  return {
    kind: 'beaconsResponse',
    payload: {
      beacons: [],
      userId: userId as string,
      beaconType: beaconType as string,
      count: 0,
      hasMore: false
    }
  };
}

async function handleSearch(payload: Record<string, unknown>): Promise<CommunicationResponse> {
  const { query, category } = payload;
  
  // In production, this would query the Neon database
  // For now, return empty results with proper structure
  return {
    kind: 'searchResponse',
    payload: {
      users: [],
      spaces: [],
      beacons: [],
      query: query as string,
      category: category as string,
      totalResults: 0,
      page: 1,
      hasMore: false
    }
  };
}

async function handleGetPublicSpaces(): Promise<CommunicationResponse> {
  try {
    const db = await getDatabase();
    
    // Get all public spaces from database
    const spaces = await db.getPublicSpaces(100); // Limit to 100 for now
    
    const publicSpaces = spaces.map(space => ({
      space_id: space.space_id,
      name: space.name,
      description: space.description,
      is_public: space.is_public ? 1 : 0,
      member_count: 1, // TODO: Calculate from member beacons
      created_at: space.created_at,
      owner: space.owner_id
    }));
    
    console.log(`[API] Returning ${publicSpaces.length} public spaces from database`);
    
    return {
      kind: 'publicSpacesResponse',
      payload: {
        spaces: publicSpaces,
        totalSpaces: publicSpaces.length,
        page: 1,
        hasMore: false
      }
    };
  } catch (error) {
    console.error('[API] Error getting public spaces:', error);
    return {
      kind: 'error',
      payload: {
        message: 'Failed to retrieve public spaces',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

async function handleCreateSpace(payload: Record<string, unknown>): Promise<CommunicationResponse> {
  try {
    const { name, description, isPublic, userId } = payload;
    
    // Generate a unique space ID
    const spaceId = `space_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    console.log(`[API] Creating space: ${name} with ID: ${spaceId} for user: ${userId}, isPublic: ${isPublic}`);
    
    const db = await getDatabase();
    
    // Store space in database
    const newSpace = await db.createSpace({
      space_id: spaceId,
      name: name as string,
      description: description as string,
      is_public: isPublic as boolean,
      owner_id: userId as string,
      metadata: {}
    });
    
    console.log(`[API] Space created in database:`, newSpace);
    
    // Queue the success notification for SSE delivery
    if (userId) {
      const createSpaceMessage: CommunicationMessage = {
        kind: 'createSpaceSuccess',
        payload: {
          spaceId: newSpace.space_id,
          name: newSpace.name,
          description: newSpace.description,
          isPublic: newSpace.is_public,
          owner: newSpace.owner_id,
          createdAt: newSpace.created_at,
          memberCount: 1,
          role: 'owner'
        }
      };
      
      console.log(`[API] Queueing createSpaceSuccess message for user ${userId}`);
      queueMessage(userId as string, createSpaceMessage);
    }
    
    return {
      kind: 'createSpaceSuccess',
      payload: {
        spaceId: newSpace.space_id,
        name: newSpace.name,
        description: newSpace.description,
        isPublic: newSpace.is_public,
        owner: newSpace.owner_id,
        createdAt: newSpace.created_at,
        memberCount: 1,
        role: 'owner',
        message: 'Space created successfully in database'
      }
    };
  } catch (error) {
    console.error('[API] Error creating space:', error);
    return {
      kind: 'error',
      payload: {
        message: 'Failed to create space',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

async function handleSubmitCommentBeacon(payload: Record<string, unknown>): Promise<CommunicationResponse> {
  const { postBeaconId, userId } = payload;
  // sessionToken validation will be implemented with production database
  
  return {
    kind: 'submitCommentSuccess',
    payload: { 
      commentId: `comment_${Math.random().toString(36).substring(2, 15)}`,
      postBeaconId: postBeaconId as string,
      author: userId as string,
      message: 'Comment beacon submitted (production mode)'
    }
  };
}

async function handleLikePost(payload: Record<string, unknown>): Promise<CommunicationResponse> {
  const { postBeaconId, userId } = payload;
  // sessionToken validation will be implemented with production database
  
  return {
    kind: 'likePostSuccess',
    payload: {
      postBeaconId: postBeaconId as string,
      liked: true,
      user: userId as string,
      message: 'Like action completed (production mode)'
    }
  };
}

async function handleGetQueuedMessages(payload: Record<string, unknown>): Promise<CommunicationResponse> {
  const { userId } = payload;
  
  if (!userId) {
    return {
      kind: 'error',
      payload: {
        message: 'User ID required for polling messages'
      }
    };
  }
  
  const messages = getQueuedMessages(userId as string);
  
  return {
    kind: 'queuedMessages',
    payload: {
      messages,
      count: messages.length,
      timestamp: Date.now()
    }
  };
}

// Auth functions removed - use /api/auth/login instead