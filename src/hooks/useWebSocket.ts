import { useState, useEffect, useRef, useCallback } from 'react';

// WebSocket connection states
type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

// WebSocket message types
interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
  id?: string;
}

// WebSocket hook configuration
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

// WebSocket hook return type
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
  const {
    url,
    protocols,
    onOpen,
    onClose,
    onError,
    onMessage,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    heartbeatInterval = 30000,
    shouldReconnect = (closeEvent) => closeEvent.code !== 1000,
  } = config;

  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [reconnectCount, setReconnectCount] = useState(0);

  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout>();
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
      }
      if (ws.current) {
        ws.current.close(1000, 'Component unmounted');
      }
    };
  }, []);

  // Heartbeat mechanism
  const startHeartbeat = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
    }

    heartbeatTimeoutRef.current = setTimeout(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }));
        startHeartbeat();
      }
    }, heartbeatInterval);
  }, [heartbeatInterval]);

  // Connect function
  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionState('connecting');

    try {
      ws.current = new WebSocket(url, protocols);

      ws.current.onopen = (event) => {
        if (isMountedRef.current) {
          setConnectionState('connected');
          setReconnectCount(0);
          startHeartbeat();
          onOpen?.(event);
        }
      };

      ws.current.onmessage = (event) => {
        if (isMountedRef.current) {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            setLastMessage(message);
            onMessage?.(message);
          } catch (error) {
            console.warn('Failed to parse WebSocket message:', error);
          }
        }
      };

      ws.current.onclose = (event) => {
        if (isMountedRef.current) {
          setConnectionState('disconnected');
          
          if (heartbeatTimeoutRef.current) {
            clearTimeout(heartbeatTimeoutRef.current);
          }

          onClose?.(event);

          // Attempt reconnection if needed
          if (shouldReconnect(event) && reconnectCount < reconnectAttempts) {
            setReconnectCount(prev => prev + 1);
            reconnectTimeoutRef.current = setTimeout(() => {
              if (isMountedRef.current) {
                connect();
              }
            }, reconnectInterval);
          }
        }
      };

      ws.current.onerror = (event) => {
        if (isMountedRef.current) {
          setConnectionState('error');
          onError?.(event);
        }
      };
    } catch (error) {
      if (isMountedRef.current) {
        setConnectionState('error');
        console.error('WebSocket connection error:', error);
      }
    }
  }, [url, protocols, onOpen, onMessage, onClose, onError, shouldReconnect, reconnectCount, reconnectAttempts, reconnectInterval, startHeartbeat]);

  // Disconnect function
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
    }
    if (ws.current) {
      ws.current.close(1000, 'Manual disconnect');
    }
    setConnectionState('disconnected');
    setReconnectCount(0);
  }, []);

  // Send message function
  const sendMessage = useCallback((type: string, data: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        data,
        timestamp: Date.now(),
        id: Math.random().toString(36).substr(2, 9),
      };
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Message not sent:', { type, data });
    }
  }, []);

  // Send JSON message function
  const sendJsonMessage = useCallback((message: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message);
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();
  }, [connect]);

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

// Hook for real-time activities
export function useRealtimeActivities() {
  const [activities, setActivities] = useState<any[]>([]);

  const { isConnected, lastMessage, sendMessage } = useWebSocket({
    url: process.env.NODE_ENV === 'development' 
      ? 'ws://localhost:8080/activities'
      : 'wss://api.summonedspaces.com/activities',
    onMessage: (message) => {
      switch (message.type) {
        case 'activity_created':
          setActivities(prev => [message.data, ...prev]);
          break;
        case 'activity_updated':
          setActivities(prev => 
            prev.map(activity => 
              activity.id === message.data.id 
                ? { ...activity, ...message.data.updates }
                : activity
            )
          );
          break;
        case 'activity_deleted':
          setActivities(prev => 
            prev.filter(activity => activity.id !== message.data.id)
          );
          break;
        case 'activities_batch':
          setActivities(message.data);
          break;
      }
    },
  });

  const subscribeToSpace = useCallback((spaceId: string) => {
    sendMessage('subscribe_space', { spaceId });
  }, [sendMessage]);

  const unsubscribeFromSpace = useCallback((spaceId: string) => {
    sendMessage('unsubscribe_space', { spaceId });
  }, [sendMessage]);

  const likeActivity = useCallback((activityId: string) => {
    sendMessage('like_activity', { activityId });
  }, [sendMessage]);

  const commentOnActivity = useCallback((activityId: string, comment: string) => {
    sendMessage('comment_activity', { activityId, comment });
  }, [sendMessage]);

  return {
    activities,
    isConnected,
    subscribeToSpace,
    unsubscribeFromSpace,
    likeActivity,
    commentOnActivity,
  };
}

// Hook for real-time chat
export function useRealtimeChat(spaceId: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const { isConnected, sendMessage } = useWebSocket({
    url: process.env.NODE_ENV === 'development'
      ? `ws://localhost:8080/chat/${spaceId}`
      : `wss://api.summonedspaces.com/chat/${spaceId}`,
    onMessage: (message) => {
      switch (message.type) {
        case 'message_received':
          setMessages(prev => [...prev, message.data]);
          break;
        case 'message_updated':
          setMessages(prev =>
            prev.map(msg =>
              msg.id === message.data.id
                ? { ...msg, ...message.data.updates }
                : msg
            )
          );
          break;
        case 'message_deleted':
          setMessages(prev =>
            prev.filter(msg => msg.id !== message.data.id)
          );
          break;
        case 'user_typing':
          setTypingUsers(prev => 
            prev.includes(message.data.userId) 
              ? prev 
              : [...prev, message.data.userId]
          );
          break;
        case 'user_stopped_typing':
          setTypingUsers(prev => 
            prev.filter(userId => userId !== message.data.userId)
          );
          break;
        case 'messages_history':
          setMessages(message.data);
          break;
      }
    },
  });

  const sendChatMessage = useCallback((content: string) => {
    sendMessage('send_message', { content });
  }, [sendMessage]);

  const startTyping = useCallback(() => {
    sendMessage('start_typing', {});
  }, [sendMessage]);

  const stopTyping = useCallback(() => {
    sendMessage('stop_typing', {});
  }, [sendMessage]);

  const editMessage = useCallback((messageId: string, newContent: string) => {
    sendMessage('edit_message', { messageId, content: newContent });
  }, [sendMessage]);

  const deleteMessage = useCallback((messageId: string) => {
    sendMessage('delete_message', { messageId });
  }, [sendMessage]);

  return {
    messages,
    typingUsers,
    isConnected,
    sendMessage: sendChatMessage,
    startTyping,
    stopTyping,
    editMessage,
    deleteMessage,
  };
}

// Hook for real-time resonance updates
export function useRealtimeResonance() {
  const [resonanceData, setResonanceData] = useState<Record<string, any>>({});

  const { isConnected, sendMessage } = useWebSocket({
    url: process.env.NODE_ENV === 'development'
      ? 'ws://localhost:8080/resonance'
      : 'wss://api.summonedspaces.com/resonance',
    onMessage: (message) => {
      switch (message.type) {
        case 'resonance_update':
          setResonanceData((prev: Record<string, any>) => ({
            ...prev,
            [message.data.id]: message.data.resonance,
          }));
          break;
        case 'resonance_lock':
          setResonanceData((prev: Record<string, any>) => ({
            ...prev,
            [message.data.id]: {
              ...prev[message.data.id],
              isLocked: true,
              lockStrength: message.data.strength,
            },
          }));
          break;
        case 'resonance_unlock':
          setResonanceData((prev: Record<string, any>) => ({
            ...prev,
            [message.data.id]: {
              ...prev[message.data.id],
              isLocked: false,
              lockStrength: 0,
            },
          }));
          break;
      }
    },
  });

  const subscribeToResonance = useCallback((entityId: string, entityType: 'space' | 'file' | 'user') => {
    sendMessage('subscribe_resonance', { entityId, entityType });
  }, [sendMessage]);

  const unsubscribeFromResonance = useCallback((entityId: string) => {
    sendMessage('unsubscribe_resonance', { entityId });
  }, [sendMessage]);

  return {
    resonanceData,
    isConnected,
    subscribeToResonance,
    unsubscribeFromResonance,
  };
}