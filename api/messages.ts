/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Vercel API Function: Handle REST messages for production communication
 * TypeScript version with proper typing for quantum beacon operations
 */

import type { IncomingMessage, ServerResponse } from 'http';

interface VercelRequest extends IncomingMessage {
  query: Record<string, string | string[]>;
  body?: CommunicationMessage;
}

interface CommunicationMessage {
  kind: string;
  payload: Record<string, unknown>;
}

interface CommunicationResponse {
  kind: string;
  payload: Record<string, unknown>;
}

export default async function handler(req: VercelRequest, res: ServerResponse): Promise<void> {
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

    // Route messages to appropriate handlers
    const response = await handleMessage(message);
    
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
  } catch (error) {
    console.error('[API] Error handling message:', error);
    
    const errorResponse: CommunicationResponse = {
      kind: 'error',
      payload: {
        message: error instanceof Error ? error.message : 'Internal server error'
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
      // Auth messages should be handled by dedicated auth endpoint
      return {
        kind: 'redirect',
        payload: { 
          endpoint: '/api/auth',
          message: 'Please use dedicated auth endpoint for authentication'
        }
      };
      
    case 'submitPostBeacon':
      return handleSubmitPostBeacon(message.payload);
      
    case 'follow':
      return handleFollow(message.payload);
      
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
      beaconId: `beacon_${Date.now()}`,
      userId: userId as string
    }
  };
}

async function handleFollow(payload: Record<string, unknown>): Promise<CommunicationResponse> {
  const { userIdToFollow, userId } = payload;
  // sessionToken validation will be implemented with production database
  
  return {
    kind: 'followSuccess',
    payload: { 
      userIdToFollow: userIdToFollow as string,
      message: 'Follow action completed (production mode)',
      follower: userId as string
    }
  };
}

async function handleUnfollow(payload: Record<string, unknown>): Promise<CommunicationResponse> {
  const { userIdToUnfollow, userId } = payload;
  // sessionToken validation will be implemented with production database
  
  return {
    kind: 'unfollowSuccess',
    payload: { 
      userIdToUnfollow: userIdToUnfollow as string,
      message: 'Unfollow action completed (production mode)',
      follower: userId as string
    }
  };
}

async function handleGetBeaconsByUser(payload: Record<string, unknown>): Promise<CommunicationResponse> {
  const { userId, beaconType } = payload;
  
  return {
    kind: 'beaconsResponse',
    payload: { 
      beacons: [],
      message: 'Production mode: Connect Neon database for real beacon data',
      userId: userId as string,
      beaconType: beaconType as string
    }
  };
}

async function handleSearch(payload: Record<string, unknown>): Promise<CommunicationResponse> {
  const { query, category } = payload;
  
  return {
    kind: 'searchResponse',
    payload: { 
      users: [],
      spaces: [],
      beacons: [],
      query: query as string,
      category: category as string,
      message: 'Production mode: Connect Neon database for real search results'
    }
  };
}

async function handleGetPublicSpaces(): Promise<CommunicationResponse> {
  return {
    kind: 'publicSpacesResponse',
    payload: { 
      spaces: [],
      message: 'Production mode: Connect Neon database for real space data'
    }
  };
}

async function handleCreateSpace(payload: Record<string, unknown>): Promise<CommunicationResponse> {
  const { name, description, isPublic, userId } = payload;
  // sessionToken validation will be implemented with production database
  
  return {
    kind: 'createSpaceSuccess',
    payload: { 
      spaceId: `space_${Date.now()}`,
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
      commentId: `comment_${Date.now()}`,
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