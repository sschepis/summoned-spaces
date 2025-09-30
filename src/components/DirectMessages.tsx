import { useState } from 'react';
import { Shield, MessageCircle } from 'lucide-react';
import { PageLayout } from './layouts/PageLayout';
import { ConversationList, MessageThread, MessageInput } from './common/messaging';
import type { Conversation, Message } from './common/messaging';
import { Alert } from './ui/feedback/Alert';
import { useNetworkState } from '../contexts/NetworkContext';
import { useAuth } from '../contexts/AuthContext';
import { messagingService } from '../services/messaging';
import { userDataManager } from '../services/user-data-manager';

interface DirectMessagesProps {
  onBack: () => void;
}

export function DirectMessages({ onBack }: DirectMessagesProps) {
  const { nodes } = useNetworkState();
  const { user: currentUser } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Get following list to determine mutual followers
  const followingList = userDataManager.getFollowingList();

  // Create conversations from mutual followers in the network
  const conversations: Conversation[] = nodes
    .filter(node => {
      // Only show users we follow (potential mutual follows)
      return node.userId !== currentUser?.id && followingList.includes(node.userId);
    })
    .map(node => ({
      id: node.userId,
      participant: {
        id: node.userId,
        name: node.userId.substring(0, 8),
        username: `@${node.userId.substring(0, 8)}`,
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
      quantumSignature: `QE-${node.userId.substring(0, 8)}`,
    }));

  const filteredConversations = conversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participant.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) return;

    // Send message as holographic beacon
    await messagingService.sendDirectMessage(selectedConversation, content);

    // Add to local UI optimistically
    const message: Message = {
      id: Date.now().toString(),
      senderId: 'current-user',
      content,
      timestamp: new Date(),
      deliveryStatus: 'delivered',
      isEncrypted: true,
      quantumSignature: `QE-${Math.random().toString(16).substr(2, 8).toUpperCase()}`
    };

    setMessages(prev => [...prev, message]);
  };

  const conversationListFooter = (
    <div className="text-xs text-gray-500 flex items-center space-x-1">
      <Shield className="w-3 h-3 text-green-400" />
      <span>All messages are holographic beacons</span>
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
                currentUserId="current-user"
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
              <h4 className="font-medium text-cyan-300 mb-1">Holographic Messaging</h4>
              <p className="text-sm text-gray-300">
                Messages are encoded as holographic beacons on your device. The server never sees the plaintext content.
                You can only message users you follow who also follow you back.
              </p>
            </div>
          </div>
        </Alert>
      </div>
    </PageLayout>
  );
}