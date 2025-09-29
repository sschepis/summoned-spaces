import { useState } from 'react';
import { Shield, MessageCircle } from 'lucide-react';
import { PageLayout } from './layouts/PageLayout';
import { ConversationList, MessageThread, MessageInput } from './common/messaging';
import type { Conversation, Message } from './common/messaging';
import { Alert } from './ui/feedback/Alert';

interface DirectMessagesProps {
  onBack: () => void;
}

// Mock data
const mockConversations: Conversation[] = [
  {
    id: '1',
    participant: {
      id: 'sarah-chen',
      name: 'Dr. Sarah Chen',
      username: '@sarahchen_quantum',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isOnline: true
    },
    lastMessage: {
      content: 'The latest quantum research results look very promising! Would love to discuss them with you.',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      isFromMe: false,
      isRead: false
    },
    unreadCount: 2,
    isEncrypted: true,
    quantumSignature: 'QE-7F2A9B4C'
  },
  {
    id: '2',
    participant: {
      id: 'marcus-rodriguez',
      name: 'Marcus Rodriguez',
      username: '@marcustech',
      avatar: 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isOnline: false,
      lastSeen: '2 hours ago'
    },
    lastMessage: {
      content: 'Thanks for sharing the resonance analysis! 🚀',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      isFromMe: true,
      isRead: true
    },
    unreadCount: 0,
    isEncrypted: true,
    quantumSignature: 'QE-3A8F1D6C'
  },
  {
    id: '3',
    participant: {
      id: 'elena-kowalski',
      name: 'Elena Kowalski',
      username: '@elenakdesign',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isOnline: true
    },
    lastMessage: {
      content: 'I\'ve uploaded the new design concepts to the shared space',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
      isFromMe: false,
      isRead: true
    },
    unreadCount: 0,
    isEncrypted: true,
    quantumSignature: 'QE-9E2C7F83'
  }
];

const mockMessages: Message[] = [
  {
    id: '1',
    senderId: 'sarah-chen',
    content: 'Hi! I saw your recent work on quantum algorithms. Really impressive results!',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    deliveryStatus: 'read',
    isEncrypted: true,
    quantumSignature: 'QE-7F2A9B4C'
  },
  {
    id: '2',
    senderId: 'current-user',
    content: 'Thank you! I\'d love to collaborate on expanding the research. Are you working on anything similar?',
    timestamp: new Date(Date.now() - 1000 * 60 * 12),
    deliveryStatus: 'read',
    isEncrypted: true,
    quantumSignature: 'QE-4C8A1F3E'
  },
  {
    id: '3',
    senderId: 'sarah-chen',
    content: 'Actually yes! I\'m exploring prime-resonant algorithms for quantum computing. The latest results look very promising! Would love to discuss them with you.',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    deliveryStatus: 'delivered',
    isEncrypted: true,
    quantumSignature: 'QE-7F2A9B4C'
  }
];

export function DirectMessages({ onBack }: DirectMessagesProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState(mockConversations);
  const [messages, setMessages] = useState(mockMessages);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participant.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  const handleSendMessage = (content: string) => {
    if (!selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: 'current-user',
      content,
      timestamp: new Date(),
      deliveryStatus: 'sending',
      isEncrypted: true,
      quantumSignature: `QE-${Math.random().toString(16).substr(2, 8).toUpperCase()}`
    };

    setMessages(prev => [...prev, message]);

    // Update conversation last message
    setConversations(prev => 
      prev.map(conv => 
        conv.id === selectedConversation
          ? {
              ...conv,
              lastMessage: {
                content,
                timestamp: new Date(),
                isFromMe: true,
                isRead: false
              }
            }
          : conv
      )
    );

    // Simulate delivery
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === message.id 
            ? { ...msg, deliveryStatus: 'delivered' as const }
            : msg
        )
      );
    }, 1000);
  };

  const conversationListFooter = (
    <div className="text-xs text-gray-500 flex items-center space-x-1">
      <Shield className="w-3 h-3 text-green-400" />
      <span>All messages are quantum-encrypted</span>
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
                placeholder="Type a quantum-encrypted message..."
                showAttachment={true}
                showEmoji={true}
                helperText="Messages are quantum-encrypted and distributed non-locally • Press Enter to send"
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
              <h4 className="font-medium text-cyan-300 mb-1">Mutual Following Required</h4>
              <p className="text-sm text-gray-300">
                You can only send direct messages to users who follow you back. This ensures privacy and reduces spam 
                while maintaining secure quantum-encrypted communication channels.
              </p>
            </div>
          </div>
        </Alert>
      </div>
    </PageLayout>
  );
}