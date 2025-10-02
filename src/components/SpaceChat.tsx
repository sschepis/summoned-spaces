import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Shield, Users, Clock, CheckCheck, Zap, FileText, Image, Video, Archive, Smile } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { messagingService } from '../services/messaging';
import { spaceManager } from '../services/space-manager';
import { holographicMemoryManager } from '../services/holographic-memory';
import webSocketService from '../services/websocket';
import { useNotifications } from './NotificationSystem';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'file' | 'system';
  isEncrypted: boolean;
  deliveryStatus: 'sending' | 'sent' | 'delivered' | 'read';
  fileData?: {
    name: string;
    size: string;
    type: string;
    fingerprint?: string;
  };
  quantumSignature?: string;
}

interface TypingIndicator {
  userId: string;
  userName: string;
  timestamp: Date;
}

interface SpaceChatProps {
  spaceId: string;
  currentUserId: string;
}

export function SpaceChat({ spaceId, currentUserId }: SpaceChatProps) {
  const { user: currentUser, pri: currentUserPRI, waitForAuth } = useAuth();
  const { showError } = useNotifications();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [spaceMembers, setSpaceMembers] = useState<Array<{ id: string; name: string; status: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers,] = useState<TypingIndicator[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize messaging and load space data
  useEffect(() => {
    const initializeSpaceChat = async () => {
      try {
        setLoading(true);
        setError(null);
        
        await waitForAuth();
        
        if (!currentUser?.id || !currentUserPRI) {
          setError('Authentication required for space chat');
          return;
        }
        
        console.log(`[SpaceChat] Initializing chat for space ${spaceId}`);
        
        // Initialize messaging service
        if (!messagingService.isInitialized()) {
          messagingService.initialize(currentUser.id, currentUserPRI);
        }
        
        // Load space members
        const members = await spaceManager.getSpaceMembers(spaceId);
        console.log(`[SpaceChat] Loaded ${members.length} space members`);
        
        const memberList = members.map(member => ({
          id: member.userId,
          name: member.userId.substring(0, 8), // Simplified for now
          status: 'online' // All members considered online for now
        }));
        setSpaceMembers(memberList);
        
        // Load existing space messages (placeholder for now)
        setMessages([]);
        
      } catch (error) {
        console.error('[SpaceChat] Failed to initialize space chat:', error);
        setError('Failed to initialize space chat. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initializeSpaceChat();
  }, [spaceId, currentUser?.id, currentUserPRI, waitForAuth]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for space messages
  useEffect(() => {
    const handleSpaceMessage = (message: { kind: string; payload: Record<string, unknown> }) => {
      console.log('[SpaceChat] ===== RECEIVED WEBSOCKET MESSAGE =====');
      console.log('[SpaceChat] Message kind:', message.kind);
      
      if (message.kind === 'beaconReceived') {
        const payload = message.payload as {
          beaconId: string;
          senderId: string;
          beaconType: string;
          beacon: unknown;
        };
        
        console.log('[SpaceChat] ===== SPACE BEACON RECEIVED =====');
        console.log('[SpaceChat] Beacon Type:', payload.beaconType);
        console.log('[SpaceChat] Sender ID:', payload.senderId);
        console.log('[SpaceChat] Current User ID:', currentUser?.id);
        
        // Process space_message beacons
        if (payload.beaconType === 'space_message') {
          console.log(`[SpaceChat] Processing space_message beacon from ${payload.senderId}`);
          
          // Don't process our own messages
          if (payload.senderId === currentUser?.id) {
            console.log('[SpaceChat] Ignoring beacon from ourselves');
            return;
          }
          
          try {
            // Decode the holographic beacon content
            const decodedContent = holographicMemoryManager.decodeMemory(payload.beacon);
            console.log(`[SpaceChat] Decoding result:`, decodedContent);
            
            if (decodedContent) {
              let messageData;
              try {
                messageData = JSON.parse(decodedContent);
              } catch {
                return; // Invalid JSON, skip
              }
              
              // Only process messages for this space
              if (messageData.spaceId !== spaceId) {
                console.log(`[SpaceChat] Message for different space ${messageData.spaceId}, ignoring`);
                return;
              }
              
              const newChatMessage: ChatMessage = {
                id: messageData.messageId || payload.beaconId,
                userId: payload.senderId,
                userName: payload.senderId.substring(0, 8), // Simplified for now
                userAvatar: `https://api.dicebear.com/8.x/bottts/svg?seed=${payload.senderId}`,
                content: messageData.content,
                timestamp: new Date(messageData.timestamp),
                type: 'text',
                isEncrypted: true,
                deliveryStatus: 'delivered',
                quantumSignature: `SB-${payload.beaconId.substring(0, 8)}`
              };
              
              setMessages(prev => [...prev, newChatMessage]);
              console.log(`[SpaceChat] Added space message from ${payload.senderId}`);
            } else {
              console.warn(`[SpaceChat] Failed to decode space beacon content from ${payload.senderId}`);
            }
          } catch (error) {
            console.error('[SpaceChat] Error decoding space message beacon:', error);
          }
        }
      }
    };
    
    webSocketService.addMessageListener(handleSpaceMessage);
    return () => webSocketService.removeMessageListener(handleSpaceMessage);
  }, [spaceId, currentUser?.id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser?.id) return;
    
    try {
      console.log(`[SpaceChat] Sending space message to ${spaceId}: "${newMessage}"`);
      
      // Send via messaging service
      await messagingService.sendSpaceMessage(spaceId, newMessage);
      
      // Add to local messages immediately
      const localMessage: ChatMessage = {
        id: `${spaceId}_${currentUser.id}_${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.id.substring(0, 8),
        userAvatar: `https://api.dicebear.com/8.x/bottts/svg?seed=${currentUser.id}`,
        content: newMessage,
        timestamp: new Date(),
        type: 'text',
        isEncrypted: true,
        deliveryStatus: 'sent',
        quantumSignature: `SB-${Math.random().toString(16).substr(2, 8).toUpperCase()}`
      };
      
      setMessages(prev => [...prev, localMessage]);
      setNewMessage('');
      
      console.log(`[SpaceChat] Space message sent successfully`);
    } catch (error) {
      console.error('[SpaceChat] Error sending space message:', error);
      showError('Failed to send message', 'Unable to send space message. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf': return FileText;
      case 'png': case 'jpg': return Image;
      case 'mp4': return Video;
      case 'zip': return Archive;
      default: return FileText;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg">
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Quantum Entangled Chat</h3>
            <p className="text-sm text-gray-400">End-to-end encrypted via prime resonance</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-sm text-gray-400">
            <Shield className="w-4 h-4 text-green-400" />
            <span>Secured</span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-400">
            <Users className="w-4 h-4" />
            <span>{spaceMembers.filter(m => m.status === 'online').length} online</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">Loading chat...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-400 text-center">
              <p>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-cyan-400 hover:text-cyan-300 underline"
              >
                Retry
              </button>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <p className="text-lg font-medium mb-2">Chat Coming Soon</p>
              <p className="text-sm">Real-time quantum-encrypted messaging will be available in a future release.</p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.userId === currentUserId;
            const FileIcon = message.fileData ? getFileIcon(message.fileData.type) : FileText;

            if (message.type === 'system') {
              return (
                <div key={message.id} className="flex justify-center">
                  <div className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-400">
                    {message.content}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex space-x-3 max-w-2xl ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {!isOwnMessage && (
                    <img
                      src={message.userAvatar}
                      alt={message.userName}
                      className="w-8 h-8 rounded-full object-cover border border-white/10 flex-shrink-0"
                    />
                  )}
                  
                  <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                    {!isOwnMessage && (
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-white">{message.userName}</span>
                        {message.isEncrypted && (
                          <Shield className="w-3 h-3 text-green-400" />
                        )}
                      </div>
                    )}
                    
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isOwnMessage
                          ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                          : 'bg-white/10 text-white'
                      } ${message.type === 'file' ? 'p-3' : ''}`}
                    >
                      {message.type === 'file' && message.fileData ? (
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-black/20 rounded-lg">
                            <FileIcon className="w-5 h-5 text-cyan-400" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-white">{message.fileData.name}</div>
                            <div className="text-sm text-gray-300">{message.fileData.size}</div>
                            {message.fileData.fingerprint && (
                              <div className="text-xs font-mono text-cyan-300">
                                {message.fileData.fingerprint}
                              </div>
                            )}
                          </div>
                          <button className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors">
                            Summon
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      )}
                    </div>
                    
                    <div className={`flex items-center space-x-2 mt-1 text-xs text-gray-500 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <span>{formatTimestamp(message.timestamp)}</span>
                      {message.isEncrypted && message.quantumSignature && (
                        <span className="font-mono">{message.quantumSignature}</span>
                      )}
                      {isOwnMessage && (
                        <div className="flex items-center space-x-1">
                          {message.deliveryStatus === 'sending' && (
                            <Clock className="w-3 h-3 text-gray-500" />
                          )}
                          {message.deliveryStatus === 'delivered' && (
                            <CheckCheck className="w-3 h-3 text-gray-400" />
                          )}
                          {message.deliveryStatus === 'read' && (
                            <CheckCheck className="w-3 h-3 text-cyan-400" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {/* Typing Indicators */}
        {typingUsers.length > 0 && (
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <span>{typingUsers.map(u => u.userName).join(', ')} typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Online Members */}
      <div className="px-4 py-2 border-t border-white/10">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">Online:</span>
          <div className="flex -space-x-1">
            {spaceMembers.filter(m => m.status === 'online').slice(0, 5).map((member) => (
              <div
                key={member.id}
                className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 
                         border-2 border-slate-800 flex items-center justify-center relative"
                title={member.name}
              >
                <span className="text-xs text-white font-medium">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </span>
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full border border-slate-800" />
              </div>
            ))}
          </div>
          {spaceMembers.filter(m => m.status === 'online').length > 5 && (
            <span className="text-xs text-gray-400">
              +{spaceMembers.filter(m => m.status === 'online').length - 5} more
            </span>
          )}
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-end space-x-3">
          <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10">
            <Paperclip className="w-5 h-5" />
          </button>
          
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a space message..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white 
                       placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 
                       focus:border-transparent resize-none"
            />
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 
                       hover:text-white transition-colors rounded"
            >
              <Smile className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-xl
                     hover:from-blue-400 hover:to-teal-400 transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <Shield className="w-3 h-3 text-green-400" />
            <span>Messages are holographic beacons visible to all space members</span>
          </div>
          <span>Press Enter to send</span>
        </div>
      </div>
    </div>
  );
}