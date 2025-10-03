/**
 * Vercel API Function: Polling endpoint for real-time updates
 * Works within Vercel's function execution limits
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

interface PollRequest {
  userId?: string;
  lastMessageTime?: number;
}

interface CommunicationMessage {
  kind: string;
  payload: Record<string, unknown>;
}

interface QueuedMessage {
  id: string;
  userId: string;
  message: CommunicationMessage;
  timestamp: number;
}

// In production, this would be Redis or a database
// For now, using in-memory storage (resets on each deployment)
const messageQueue: Map<string, QueuedMessage[]> = new Map();

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
    const { userId, lastMessageTime = 0 } = req.body as PollRequest;
    
    // Get messages for this user since last poll
    const userMessages = userId ? (messageQueue.get(userId) || []) : [];
    const newMessages = userMessages.filter(msg => msg.timestamp > lastMessageTime);
    
    // Clean up old messages (older than 5 minutes)
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    if (userId && userMessages.length > 0) {
      const cleanedMessages = userMessages.filter(msg => msg.timestamp > fiveMinutesAgo);
      if (cleanedMessages.length !== userMessages.length) {
        messageQueue.set(userId, cleanedMessages);
      }
    }
    
    // Return new messages
    res.status(200).json({
      messages: newMessages.map(m => m.message),
      timestamp: Date.now(),
      count: newMessages.length
    });
    
  } catch (error) {
    console.error('[Poll] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper function to queue a message for a user
// This would be called by other API endpoints when they need to send real-time updates
export function queueMessageForUser(userId: string, message: CommunicationMessage) {
  const userMessages = messageQueue.get(userId) || [];
  userMessages.push({
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    message,
    timestamp: Date.now()
  });
  messageQueue.set(userId, userMessages);
}