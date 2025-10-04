/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Vercel API Function: Handle REST messages for production communication
 * TypeScript version with proper typing for quantum beacon operations
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// For now, authentication is handled by dedicated /api/auth/login endpoint
// This file handles other message types
const initialized = false;

interface CommunicationMessage {
  kind: string;
  payload: Record<string, unknown>;
}

interface CommunicationResponse {
  kind: string;
  payload: Record<string, unknown>;
}

// In-memory message queue for polling (in production, use Redis or similar)
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
  const { userId } = payload;
  // sessionToken validation will be implemented with production database
  
  // In production, validate session and store to Neon database
  return {
    kind: 'submitPostSuccess',
    payload: { 
      message: 'Post beacon submitted (production mode)',
      timestamp: Date.now(),
      beaconId: `beacon_${Math.random().toString(36).substring(2, 15)}`,
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
  // In production, this would query the Neon database for public spaces
  // For now, return empty array with proper structure
  return {
    kind: 'publicSpacesResponse',
    payload: {
      spaces: [],
      totalSpaces: 0,
      page: 1,
      hasMore: false
    }
  };
}

async function handleCreateSpace(payload: Record<string, unknown>): Promise<CommunicationResponse> {
  const { name, description, isPublic, userId } = payload;
  // sessionToken validation will be implemented with production database
  
  return {
    kind: 'createSpaceSuccess',
    payload: { 
      spaceId: `space_${Math.random().toString(36).substring(2, 15)}`,
      name: name as string,
      description: description as string,
      isPublic: isPublic as boolean,
      owner: userId as string,
      message: 'Space created (production mode)'
    }
  };
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