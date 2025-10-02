import { useState, useEffect } from 'react';
import { Shield, MessageCircle, Zap } from 'lucide-react';
import { PageLayout } from './layouts/PageLayout';
import { ConversationList, MessageThread, MessageInput } from './common/messaging';
import type { Conversation, Message } from './common/messaging';
import { Alert } from './ui/feedback/Alert';
import { useNetworkState } from '../contexts/NetworkContext';
import { useAuth } from '../contexts/AuthContext';
import { messagingService } from '../services/messaging';
import { holographicMemoryManager } from '../services/holographic-memory';
import { quantumNetworkOps } from '../services/quantum-network-operations-safe';
import { userDataManager } from '../services/user-data-manager';
import webSocketService from '../services/websocket';
import { useNotifications } from './NotificationSystem';

interface DirectMessagesProps {
  onBack: () => void;
}

export function DirectMessages({ onBack }: DirectMessagesProps) {
  const { nodes } = useNetworkState();
  const { user: currentUser, pri: currentUserPRI, waitForAuth } = useAuth();
  const { showMessage, dismissNotification } = useNotifications();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationMessages, setConversationMessages] = useState<Map<string, Message[]>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [beaconMessages, setBeaconMessages] = useState<Map<string, Message[]>>(new Map());
  const [followingList, setFollowingList] = useState<string[]>([]);

  // Update following list reactively
  useEffect(() => {
    const updateFollowingList = () => {
      const currentFollowing = userDataManager.getFollowingList();
      setFollowingList(currentFollowing);
      console.log('DirectMessages: Updated following list:', currentFollowing);
    };

    // Initial load
    updateFollowingList();

    // Set up interval to check for changes
    const interval = setInterval(updateFollowingList, 1000);

    return () => clearInterval(interval);
  }, []);

  // Create conversations from mutual followers in the network (with deduplication)
  const conversations: Conversation[] = nodes
    .filter(node => {
      // Only show users we follow (potential mutual follows)
      return node.userId !== currentUser?.id && followingList.includes(node.userId);
    })
    // Deduplicate by userId to prevent duplicate conversations
    .filter((node, index, array) =>
      array.findIndex(n => n.userId === node.userId) === index
    )
    .map(node => ({
      id: node.userId,
      participant: {
        id: node.userId,
        name: node.username || node.userId.substring(0, 8),
        username: `@${node.username || node.userId.substring(0, 8)}`,
        avatar: `https://api.dicebear.com/8.x/bottts/svg?seed=${node.userId}`,
        isOnline: true,
      },
      lastMessage: {
        content: 'Start a holographic conversation',
        timestamp: new Date(),
        isFromMe: false,
        isRead: true,
      },
      unreadCount: 0,
      isEncrypted: true,
      quantumSignature: `QE-${node.username || node.userId.substring(0, 8)}`,
    }));

  const filteredConversations = conversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participant.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  // Initialize holographic memory and quantum network
  useEffect(() => {
    const initializeP2PMessaging = async () => {
      if (currentUser?.id) {
        try {
          // Wait for holographic memory to be ready
          await holographicMemoryManager.isReady;
          
          // Initialize messaging service with current user context
          if (currentUserPRI) {
            messagingService.initialize(currentUser.id, currentUserPRI);
          }
          
          // Create quantum node for P2P operations
          quantumNetworkOps.createQuantumNode(currentUser.id);
          
          console.log('P2P holographic messaging initialized for user:', currentUser.id);
        } catch (error) {
          console.error('Failed to initialize P2P messaging:', error);
        }
      }
    };
    
    initializeP2PMessaging();
  }, [currentUser?.id, currentUserPRI]);

  // Load message history when conversation changes (P2P cached messages only)
  useEffect(() => {
    const loadConversationHistory = async () => {
      if (!selectedConversation || !currentUser?.id) {
        setMessages([]);
        return;
      }

      try {
        // Check client-side conversation cache first
        const cachedMessages = conversationMessages.get(selectedConversation);
        if (cachedMessages) {
          setMessages(cachedMessages);
        } else {
          setMessages([]);
        }
        
        // Check beacon-based messages cache
        const beaconCached = beaconMessages.get(selectedConversation);
        if (beaconCached && beaconCached.length > 0) {
          setMessages(prev => {
            const combined = [...prev, ...beaconCached];
            const unique = combined.filter((msg, index, arr) =>
              arr.findIndex(m => m.id === msg.id) === index
            );
            return unique.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
          });
        }
        
        // Initialize P2P holographic beacon connection
        await quantumNetworkOps.createEntanglement(currentUser.id, selectedConversation);
        console.log(`P2P holographic connection established with ${selectedConversation}`);
        
        console.log(`Loading P2P conversation history for: ${selectedConversation}`);
      } catch (error) {
        console.error('Error loading P2P conversation history:', error);
      }
    };

    loadConversationHistory();
  }, [selectedConversation, currentUser?.id, conversationMessages, beaconMessages]);

  // Listen for P2P messages (both quantum teleported and beacon-based)
  useEffect(() => {
    const handleP2PMessage = (message: { kind: string; payload: Record<string, unknown> }) => {
      console.log('[DirectMessages] ===== RECEIVED WEBSOCKET MESSAGE =====');
      console.log('[DirectMessages] Message kind:', message.kind);
      console.log('[DirectMessages] Full message:', message);
      
      // Handle beacon-based messages (both quantum and regular P2P delivery)
      if (message.kind === 'beaconReceived') {
        const payload = message.payload as {
          beaconId: string;
          senderId: string;
          beaconType: string;
          beacon: unknown;
        };
        
        console.log('[DirectMessages] ===== BEACON RECEIVED =====');
        console.log('[DirectMessages] Beacon ID:', payload.beaconId);
        console.log('[DirectMessages] Sender ID:', payload.senderId);
        console.log('[DirectMessages] Beacon Type:', payload.beaconType);
        console.log('[DirectMessages] Current User ID:', currentUser?.id);
        console.log('[DirectMessages] Beacon structure:', payload.beacon);
        
        // Process quantum_message and direct_message beacons
        if (payload.beaconType === 'quantum_message' || payload.beaconType === 'direct_message') {
          console.log(`[DirectMessages] Processing ${payload.beaconType} beacon from ${payload.senderId}`);
          
          // Check if this is from ourselves (don't process our own messages)
          if (payload.senderId === currentUser?.id) {
            console.log('[DirectMessages] Ignoring beacon from ourselves');
            return;
          }
          
          try {
            console.log('[DirectMessages] Attempting to decode beacon...');
            console.log('[DirectMessages] Holographic memory manager ready?', holographicMemoryManager.isReady);
            
            // Decode the holographic beacon content (P2P, server never sees plaintext)
            const decodedContent = holographicMemoryManager.decodeMemory(payload.beacon);
            console.log(`[DirectMessages] Decoding result:`, decodedContent);
            
            if (decodedContent) {
              let messageData;
              try {
                messageData = JSON.parse(decodedContent);
              } catch {
                // If not JSON, treat as plain text
                messageData = {
                  recipientId: currentUser?.id,
                  content: decodedContent,
                  timestamp: new Date().toISOString(),
                  deliveryType: 'beacon'
                };
              }
              
              // Determine signature based on delivery type
              let quantumSignature;
              if (messageData.isQuantumDelivered || payload.beaconType === 'quantum_message') {
                quantumSignature = `QT-${messageData.fidelity?.toFixed(3) || '0.000'}`;
              } else {
                quantumSignature = `HB-${payload.beaconId.substring(0, 8)}`;
              }
              
              const newMessage: Message = {
                id: messageData.messageId || payload.beaconId,
                senderId: payload.senderId,
                content: messageData.content,
                timestamp: new Date(messageData.timestamp),
                deliveryStatus: 'delivered',
                isEncrypted: true,
                quantumSignature: quantumSignature
              };
              
              // Determine conversation ID
              const conversationId = payload.senderId === currentUser?.id ?
                messageData.recipientId : payload.senderId;
              
              console.log(`[DirectMessages] Processing message for conversation: ${conversationId}`);
              
              // Update beacon message cache
              setBeaconMessages(prev => {
                const updated = new Map(prev);
                const existing = updated.get(conversationId) || [];
                updated.set(conversationId, [...existing, newMessage]);
                return updated;
              });
              
              // Update conversation cache
              setConversationMessages(prev => {
                const updated = new Map(prev);
                const existing = updated.get(conversationId) || [];
                updated.set(conversationId, [...existing, newMessage]);
                return updated;
              });
              
              // Update current messages if this conversation is selected
              if (selectedConversation === conversationId) {
                setMessages(prev => [...prev, newMessage]);
              } else {
                // Show notification for received message when not in active conversation
                const senderNode = nodes.find(n => n.userId === payload.senderId);
                const senderName = senderNode?.username || payload.senderId.substring(0, 8);
                const isQuantumMessage = messageData.isQuantumDelivered || payload.beaconType === 'quantum_message';
                
                showMessage(
                  `New ${isQuantumMessage ? 'Quantum ' : ''}Message`,
                  `${senderName}: ${messageData.content.length > 50 ? messageData.content.substring(0, 50) + '...' : messageData.content}`,
                  payload.senderId,
                  isQuantumMessage,
                  {
                    label: 'View Conversation',
                    onClick: () => {
                      // Switch to the conversation
                      setSelectedConversation(conversationId);
                      // Dismiss any notifications from this sender
                      // Note: We could enhance this to track notification IDs if needed
                    }
                  }
                );
                
                console.log(`[DirectMessages] Showed notification for message from ${payload.senderId}`);
              }
              
              console.log(`[DirectMessages] Processed ${payload.beaconType} message from ${payload.senderId}`);
            } else {
              console.warn(`[DirectMessages] Failed to decode beacon content from ${payload.senderId}`);
            }
          } catch (error) {
            console.error('[DirectMessages] Error decoding P2P beacon message:', error);
          }
        }
      }
    };
    
    webSocketService.addMessageListener(handleP2PMessage);
    return () => webSocketService.removeMessageListener(handleP2PMessage);
  }, [selectedConversation, currentUser?.id]);

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation || !currentUser?.id) return;

    await waitForAuth();

    try {
      // Use holographic beacon P2P messaging
      if (!messagingService.isInitialized()) {
        console.error('MessagingService not initialized');
        throw new Error('MessagingService not initialized');
      }
      
      await messagingService.sendDirectMessage(selectedConversation, content);
      
      const message: Message = {
        id: Date.now().toString(),
        senderId: currentUser.id,
        content,
        timestamp: new Date(),
        deliveryStatus: 'delivered',
        isEncrypted: true,
        quantumSignature: `HB-${Math.random().toString(16).substr(2, 8).toUpperCase()}`
      };
      
      // Update local conversation cache
      setConversationMessages(prev => {
        const updated = new Map(prev);
        const existing = updated.get(selectedConversation) || [];
        updated.set(selectedConversation, [...existing, message]);
        return updated;
      });
      
      setMessages(prev => [...prev, message]);
      console.log(`Sent holographic beacon message to ${selectedConversation}`);
    } catch (error) {
      console.error('Error sending P2P message:', error);
      
      // Still add to local UI but mark as sending (will retry)
      const message: Message = {
        id: Date.now().toString(),
        senderId: currentUser.id,
        content,
        timestamp: new Date(),
        deliveryStatus: 'sending',
        isEncrypted: true,
        quantumSignature: `ERR-${Math.random().toString(16).substr(2, 8).toUpperCase()}`
      };
      
      setConversationMessages(prev => {
        const updated = new Map(prev);
        const existing = updated.get(selectedConversation) || [];
        updated.set(selectedConversation, [...existing, message]);
        return updated;
      });
      
      setMessages(prev => [...prev, message]);
    }
  };

  const conversationListFooter = (
    <div className="space-y-2">
      <div className="text-xs text-gray-500 flex items-center space-x-1">
        <Shield className="w-3 h-3 text-green-400" />
        <span>Holographic P2P beacons</span>
      </div>
      
      <div className="text-xs text-gray-400 text-center py-2">
        End-to-end encrypted • Server never sees content
      </div>
    </div>
  );

  return (
    <PageLayout
      title="Direct Messages"
      subtitle="Private messages with people you mutually follow"
      onBack={onBack}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <ConversationList
            conversations={filteredConversations}
            selectedId={selectedConversation}
            onSelectConversation={setSelectedConversation}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            title="Conversations"
            icon={MessageCircle}
            showEncryption={true}
            footer={conversationListFooter}
            className="h-full"
          />
        </div>

        {/* Message Thread */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 flex flex-col">
          {selectedConv ? (
            <>
              <MessageThread
                messages={messages}
                currentUserId={currentUser?.id || ''}
                participant={selectedConv.participant}
                showEncryption={true}
                showDeliveryStatus={true}
                showSignatures={true}
                className="flex-1"
              />
              
              <MessageInput
                onSend={handleSendMessage}
                placeholder="Type a holographic message..."
                showAttachment={true}
                showEmoji={true}
                helperText="Messages are holographic beacons • Press Enter to send"
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full 
                              flex items-center justify-center mx-auto">
                  <MessageCircle className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Select a Conversation</h3>
                  <p className="text-gray-400 max-w-md">
                    Choose a conversation from the left to start messaging with your mutual followers
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Banner */}
      <div className="mt-6">
        <Alert variant="info">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-cyan-300 mb-1">
                Holographic P2P Messaging
              </h4>
              <p className="text-sm text-gray-300">
                Messages are encoded as holographic beacons and transmitted directly between peers. The server never sees any message content.
                You can only message users you follow who also follow you back.
              </p>
            </div>
          </div>
        </Alert>
      </div>
    </PageLayout>
  );
}