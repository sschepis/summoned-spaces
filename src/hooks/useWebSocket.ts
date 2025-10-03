// DEPRECATED: WebSocket hooks have been replaced with SSE-based communication
// This file provides compatibility shims for the migration period
// All functionality now uses the communication manager with SSE

import { useState, useEffect, useCallback } from 'react';
import { communicationManager, type CommunicationMessage } from '../services/communication-manager';

// Legacy WebSocket message types for backward compatibility
interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
  id?: string;
}

// Legacy connection states
type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

// Legacy hook configuration
interface UseWebSocketConfig {
  url: string;
  protocols?: string | string[];
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
  shouldReconnect?: (closeEvent: CloseEvent) => boolean;
}

// Legacy hook return type
interface UseWebSocketReturn {
  connectionState: ConnectionState;
  lastMessage: WebSocketMessage | null;
  sendMessage: (type: string, data: any) => void;
  sendJsonMessage: (message: any) => void;
  connect: () => void;
  disconnect: () => void;
  isConnected: boolean;
  reconnectCount: number;
}

export function useWebSocket(config: UseWebSocketConfig): UseWebSocketReturn {
  console.log('[useWebSocket] DEPRECATED: WebSocket hooks replaced with SSE communication');
  
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [reconnectCount] = useState(0);

  // Set up communication manager
  useEffect(() => {
    const handleMessage = (message: CommunicationMessage) => {
      const wsMessage: WebSocketMessage = {
        type: message.kind,
        data: message.payload,
        timestamp: Date.now(),
        id: Math.random().toString(36).substr(2, 9),
      };
      
      setLastMessage(wsMessage);
      config.onMessage?.(wsMessage);
    };

    // Connect and set up message handling
    communicationManager.connect()
      .then(() => {
        setConnectionState('connected');
        config.onOpen?.(new Event('open'));
      })
      .catch((error) => {
        setConnectionState('error');
        config.onError?.(new Event('error'));
      });

    communicationManager.onMessage(handleMessage);

    return () => {
      // Cleanup handled by communication manager
    };
  }, [config]);

  const sendMessage = useCallback((type: string, data: any) => {
    const message: CommunicationMessage = {
      kind: type,
      payload: data
    };
    
    communicationManager.send(message).catch(error => {
      console.error('[useWebSocket] Error sending message:', error);
    });
  }, []);

  const sendJsonMessage = useCallback((message: any) => {
    const commMessage: CommunicationMessage = {
      kind: message.type || 'message',
      payload: message
    };
    
    communicationManager.send(commMessage).catch(error => {
      console.error('[useWebSocket] Error sending JSON message:', error);
    });
  }, []);

  const connect = useCallback(() => {
    setConnectionState('connecting');
    communicationManager.connect()
      .then(() => setConnectionState('connected'))
      .catch(() => setConnectionState('error'));
  }, []);

  const disconnect = useCallback(() => {
    communicationManager.disconnect();
    setConnectionState('disconnected');
  }, []);

  return {
    connectionState,
    lastMessage,
    sendMessage,
    sendJsonMessage,
    connect,
    disconnect,
    isConnected: connectionState === 'connected',
    reconnectCount,
  };
}

// Hook for real-time activities - replaced with SSE
export function useRealtimeActivities() {
  console.log('[useRealtimeActivities] DEPRECATED: Using SSE-based communication instead');
  
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const handleMessage = (message: CommunicationMessage) => {
      switch (message.kind) {
        case 'activity_created':
        case 'activityCreated':
          setActivities(prev => [message.payload, ...prev]);
          break;
        case 'activity_updated':
        case 'activityUpdated':
          setActivities(prev => 
            prev.map(activity => 
              activity.id === (message.payload as any).id 
                ? { ...activity, ...(message.payload as any).updates }
                : activity
            )
          );
          break;
        case 'activity_deleted':
        case 'activityDeleted':
          setActivities(prev => 
            prev.filter(activity => activity.id !== (message.payload as any).id)
          );
          break;
        case 'activities_batch':
        case 'activitiesBatch':
          setActivities(message.payload as any);
          break;
      }
    };

    communicationManager.connect();
    communicationManager.onMessage(handleMessage);
  }, []);

  const subscribeToSpace = useCallback((spaceId: string) => {
    communicationManager.send({
      kind: 'subscribe_space',
      payload: { spaceId }
    });
  }, []);

  const unsubscribeFromSpace = useCallback((spaceId: string) => {
    communicationManager.send({
      kind: 'unsubscribe_space',
      payload: { spaceId }
    });
  }, []);

  const likeActivity = useCallback((activityId: string) => {
    communicationManager.send({
      kind: 'like_activity',
      payload: { activityId }
    });
  }, []);

  const commentOnActivity = useCallback((activityId: string, comment: string) => {
    communicationManager.send({
      kind: 'comment_activity',
      payload: { activityId, comment }
    });
  }, []);

  return {
    activities,
    isConnected: communicationManager.isConnected(),
    subscribeToSpace,
    unsubscribeFromSpace,
    likeActivity,
    commentOnActivity,
  };
}

// Hook for real-time chat - replaced with SSE
export function useRealtimeChat(spaceId: string) {
  console.log('[useRealtimeChat] DEPRECATED: Using SSE-based communication instead');
  
  const [messages, setMessages] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    const handleMessage = (message: CommunicationMessage) => {
      switch (message.kind) {
        case 'message_received':
        case 'messageReceived':
          setMessages(prev => [...prev, message.payload]);
          break;
        case 'message_updated':
        case 'messageUpdated':
          setMessages(prev =>
            prev.map(msg =>
              msg.id === (message.payload as any).id
                ? { ...msg, ...(message.payload as any).updates }
                : msg
            )
          );
          break;
        case 'message_deleted':
        case 'messageDeleted':
          setMessages(prev =>
            prev.filter(msg => msg.id !== (message.payload as any).id)
          );
          break;
        case 'user_typing':
        case 'userTyping':
          setTypingUsers(prev => 
            prev.includes((message.payload as any).userId) 
              ? prev 
              : [...prev, (message.payload as any).userId]
          );
          break;
        case 'user_stopped_typing':
        case 'userStoppedTyping':
          setTypingUsers(prev => 
            prev.filter(userId => userId !== (message.payload as any).userId)
          );
          break;
        case 'messages_history':
        case 'messagesHistory':
          setMessages(message.payload as any);
          break;
      }
    };

    communicationManager.connect();
    communicationManager.onMessage(handleMessage);
  }, [spaceId]);

  const sendChatMessage = useCallback((content: string) => {
    communicationManager.send({
      kind: 'send_message',
      payload: { content, spaceId }
    });
  }, [spaceId]);

  const startTyping = useCallback(() => {
    communicationManager.send({
      kind: 'start_typing',
      payload: { spaceId }
    });
  }, [spaceId]);

  const stopTyping = useCallback(() => {
    communicationManager.send({
      kind: 'stop_typing',
      payload: { spaceId }
    });
  }, [spaceId]);

  const editMessage = useCallback((messageId: string, newContent: string) => {
    communicationManager.send({
      kind: 'edit_message',
      payload: { messageId, content: newContent, spaceId }
    });
  }, [spaceId]);

  const deleteMessage = useCallback((messageId: string) => {
    communicationManager.send({
      kind: 'delete_message',
      payload: { messageId, spaceId }
    });
  }, [spaceId]);

  return {
    messages,
    typingUsers,
    isConnected: communicationManager.isConnected(),
    sendMessage: sendChatMessage,
    startTyping,
    stopTyping,
    editMessage,
    deleteMessage,
  };
}

// Hook for real-time resonance updates - replaced with SSE
export function useRealtimeResonance() {
  console.log('[useRealtimeResonance] DEPRECATED: Using SSE-based communication instead');
  
  const [resonanceData, setResonanceData] = useState<Record<string, any>>({});

  useEffect(() => {
    const handleMessage = (message: CommunicationMessage) => {
      switch (message.kind) {
        case 'resonance_update':
        case 'resonanceUpdate':
          setResonanceData((prev: Record<string, any>) => ({
            ...prev,
            [(message.payload as any).id]: (message.payload as any).resonance,
          }));
          break;
        case 'resonance_lock':
        case 'resonanceLock':
          setResonanceData((prev: Record<string, any>) => ({
            ...prev,
            [(message.payload as any).id]: {
              ...prev[(message.payload as any).id],
              isLocked: true,
              lockStrength: (message.payload as any).strength,
            },
          }));
          break;
        case 'resonance_unlock':
        case 'resonanceUnlock':
          setResonanceData((prev: Record<string, any>) => ({
            ...prev,
            [(message.payload as any).id]: {
              ...prev[(message.payload as any).id],
              isLocked: false,
              lockStrength: 0,
            },
          }));
          break;
      }
    };

    communicationManager.connect();
    communicationManager.onMessage(handleMessage);
  }, []);

  const subscribeToResonance = useCallback((entityId: string, entityType: 'space' | 'file' | 'user') => {
    communicationManager.send({
      kind: 'subscribe_resonance',
      payload: { entityId, entityType }
    });
  }, []);

  const unsubscribeFromResonance = useCallback((entityId: string) => {
    communicationManager.send({
      kind: 'unsubscribe_resonance',
      payload: { entityId }
    });
  }, []);

  return {
    resonanceData,
    isConnected: communicationManager.isConnected(),
    subscribeToResonance,
    unsubscribeFromResonance,
  };
}