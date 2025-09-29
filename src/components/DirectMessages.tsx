import { useState } from 'react';
import { Search, MessageCircle, Shield, Clock, CheckCheck, ArrowLeft, Send, Paperclip, Smile } from 'lucide-react';

interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isOnline: boolean;
    lastSeen?: string;
  };
  lastMessage: {
    content: string;
    timestamp: Date;
    isFromMe: boolean;
    isRead: boolean;
  };
  unreadCount: number;
  isEncrypted: boolean;
  quantumSignature: string;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  deliveryStatus: 'sending' | 'sent' | 'delivered' | 'read';
  isEncrypted: boolean;
  quantumSignature: string;
}

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

interface DirectMessagesProps {
  onBack: () => void;
}

export function DirectMessages({ onBack }: DirectMessagesProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState(mockConversations);
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participant.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: 'current-user',
      content: newMessage,
      timestamp: new Date(),
      deliveryStatus: 'sending',
      isEncrypted: true,
      quantumSignature: `QE-${Math.random().toString(16).substr(2, 8).toUpperCase()}`
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Update conversation last message
    setConversations(prev => 
      prev.map(conv => 
        conv.id === selectedConversation
          ? {
              ...conv,
              lastMessage: {
                content: newMessage,
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Private Messages</h1>
          <p className="text-gray-400">Quantum-encrypted direct messages with mutual followers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
        {/* Conversations List */}
        <div className="lg:col-span-1 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <MessageCircle className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-white">Conversations</h2>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white 
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="space-y-1 p-2">
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                    selectedConversation === conversation.id
                      ? 'bg-cyan-500/20 border border-cyan-500/30'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <img
                        src={conversation.participant.avatar}
                        alt={conversation.participant.name}
                        className="w-12 h-12 rounded-full object-cover border border-white/10"
                      />
                      {conversation.participant.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-800" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-white truncate">
                          {conversation.participant.name}
                        </span>
                        <div className="flex items-center space-x-1">
                          {conversation.unreadCount > 0 && (
                            <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                          )}
                          <span className="text-xs text-gray-400">
                            {formatTimestamp(conversation.lastMessage.timestamp)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-400 truncate">
                        {conversation.lastMessage.isFromMe && 'You: '}
                        {conversation.lastMessage.content}
                      </p>
                      
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">
                          {conversation.participant.username}
                        </span>
                        <div className="flex items-center space-x-1">
                          {conversation.isEncrypted && (
                            <Shield className="w-3 h-3 text-green-400" />
                          )}
                          {conversation.unreadCount > 0 && (
                            <div className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-xs rounded-full">
                              {conversation.unreadCount}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-3 border-t border-white/10">
            <div className="text-xs text-gray-500 flex items-center space-x-1">
              <Shield className="w-3 h-3 text-green-400" />
              <span>All messages are quantum-encrypted</span>
            </div>
          </div>
        </div>

        {/* Message Thread */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 flex flex-col">
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={selectedConv.participant.avatar}
                      alt={selectedConv.participant.name}
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                    />
                    {selectedConv.participant.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-800" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{selectedConv.participant.name}</h3>
                    <p className="text-sm text-gray-400">
                      {selectedConv.participant.isOnline ? 'Online' : `Last seen ${selectedConv.participant.lastSeen}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span>Quantum Encrypted</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                  const isOwnMessage = message.senderId === 'current-user';
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            isOwnMessage
                              ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                              : 'bg-white/10 text-white'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                        
                        <div className={`flex items-center space-x-2 mt-1 text-xs text-gray-500 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                          <span>{formatTimestamp(message.timestamp)}</span>
                          <span className="font-mono">{message.quantumSignature}</span>
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
                  );
                })}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex items-center space-x-3">
                  <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a quantum-encrypted message..."
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white 
                               placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors">
                      <Smile className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl
                             hover:from-cyan-400 hover:to-purple-400 transition-all duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>Messages are quantum-encrypted and distributed non-locally</span>
                  <span>Press Enter to send</span>
                </div>
              </div>
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
      <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-cyan-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-cyan-300 mb-1">Mutual Following Required</h4>
            <p className="text-sm text-gray-300">
              You can only send direct messages to users who follow you back. This ensures privacy and reduces spam 
              while maintaining secure quantum-encrypted communication channels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}