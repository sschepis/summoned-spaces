import React, { useState, useRef, useEffect } from 'react';
import { X, Minimize2, Maximize2, Send, Search, MoreVertical } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { communicationManager, type CommunicationMessage } from '../services/communication-manager';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: number;
  read: boolean;
}

interface Conversation {
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage?: Message;
  unreadCount: number;
  messages: Message[];
}

interface Friend {
  userId: string;
  username: string;
  avatar?: string;
  isOnline?: boolean;
}

interface FloatingMessengerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FloatingMessenger({ isOpen, onClose }: FloatingMessengerProps) {
  const { user } = useAuth();
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Map<string, Conversation>>(new Map());
  const [friends, setFriends] = useState<Friend[]>([]);
  const [showFriendsList, setShowFriendsList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations, selectedConversation]);

  // Set up message listeners
  useEffect(() => {
    if (!isOpen || !user) return;

    const handleMessage = (message: CommunicationMessage) => {
      switch (message.kind) {
        case 'privateMessage':
          handlePrivateMessage(message.payload);
          break;
        case 'messageRead':
          handleMessageRead(message.payload);
          break;
        case 'userTyping':
          handleUserTyping(message.payload);
          break;
        case 'conversationHistory':
          handleConversationHistory(message.payload);
          break;
        case 'friendsList':
          handleFriendsList(message.payload);
          break;
      }
    };

    communicationManager.onMessage(handleMessage);

    // Load recent conversations and friends
    loadRecentConversations();
    loadFriends();

    return () => {
      // Cleanup if needed
    };
  }, [isOpen, user]);

  const handlePrivateMessage = (payload: Record<string, unknown>) => {
    const message: Message = {
      id: payload.messageId as string,
      senderId: payload.senderId as string,
      senderName: payload.senderName as string,
      senderAvatar: payload.senderAvatar as string | undefined,
      content: payload.content as string,
      timestamp: payload.timestamp as number,
      read: false
    };

    setConversations(prev => {
      const updated = new Map(prev);
      const senderId = payload.senderId as string;
      const recipientId = payload.recipientId as string;
      const conversationId = senderId === user?.id ? recipientId : senderId;
      
      if (!updated.has(conversationId)) {
        updated.set(conversationId, {
          userId: conversationId,
          userName: senderId === user?.id ? (payload.recipientName as string) : (payload.senderName as string),
          userAvatar: senderId === user?.id ? (payload.recipientAvatar as string | undefined) : (payload.senderAvatar as string | undefined),
          lastMessage: message,
          unreadCount: 1,
          messages: [message]
        });
      } else {
        const conversation = updated.get(conversationId)!;
        conversation.messages.push(message);
        conversation.lastMessage = message;
        if (senderId !== user?.id) {
          conversation.unreadCount++;
        }
      }
      
      return updated;
    });
  };

  const handleMessageRead = (payload: Record<string, unknown>) => {
    setConversations(prev => {
      const updated = new Map(prev);
      const userId = payload.userId as string;
      const messageId = payload.messageId as string;
      const conversation = updated.get(userId);
      
      if (conversation) {
        conversation.messages.forEach(msg => {
          if (msg.id === messageId) {
            msg.read = true;
          }
        });
        conversation.unreadCount = Math.max(0, conversation.unreadCount - 1);
      }
      
      return updated;
    });
  };

  const handleUserTyping = (payload: Record<string, unknown>) => {
    const userId = payload.userId as string;
    if (userId === selectedConversation) {
      setIsTyping(true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    }
  };

  const handleConversationHistory = (payload: Record<string, unknown>) => {
    const messages = payload.messages as Message[];
    const conversation: Conversation = {
      userId: payload.userId as string,
      userName: payload.userName as string,
      userAvatar: payload.userAvatar as string | undefined,
      lastMessage: messages[messages.length - 1],
      unreadCount: (payload.unreadCount as number) || 0,
      messages: messages
    };
    
    setConversations(prev => {
      const updated = new Map(prev);
      updated.set(conversation.userId, conversation);
      return updated;
    });
  };

  const handleFriendsList = (payload: Record<string, unknown>) => {
    const friendsList = payload.friends as Friend[];
    setFriends(friendsList);
    setLoadingFriends(false);
  };

  const loadRecentConversations = async () => {
    await communicationManager.send({
      kind: 'getRecentConversations',
      payload: {}
    });
  };

  const loadFriends = async () => {
    setLoadingFriends(true);
    await communicationManager.send({
      kind: 'getMutualFollows',
      payload: {}
    });
  };

  const startConversationWithFriend = (friendId: string) => {
    setSelectedConversation(friendId);
    setShowFriendsList(false);
    
    // Load conversation history if it exists
    const existingConversation = conversations.get(friendId);
    if (!existingConversation) {
      // Create a new conversation entry
      const friend = friends.find(f => f.userId === friendId);
      if (friend) {
        const newConversation: Conversation = {
          userId: friend.userId,
          userName: friend.username,
          userAvatar: friend.avatar,
          lastMessage: undefined,
          unreadCount: 0,
          messages: []
        };
        setConversations(prev => {
          const updated = new Map(prev);
          updated.set(friendId, newConversation);
          return updated;
        });
      }
    }
    
    // Load conversation history
    communicationManager.send({
      kind: 'getConversationHistory',
      payload: { userId: friendId }
    });
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || !user) return;

    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      id: tempId,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      content: messageInput,
      timestamp: Date.now(),
      read: false
    };

    // Optimistically add message to UI
    setConversations(prev => {
      const updated = new Map(prev);
      const conversation = updated.get(selectedConversation);
      
      if (conversation) {
        conversation.messages.push(tempMessage);
        conversation.lastMessage = tempMessage;
      }
      
      return updated;
    });

    setMessageInput('');

    // Send message via SSE
    await communicationManager.send({
      kind: 'sendPrivateMessage',
      payload: {
        recipientId: selectedConversation,
        content: messageInput,
        tempId
      }
    });
  };

  const markAsRead = async (conversationId: string) => {
    const conversation = conversations.get(conversationId);
    if (!conversation || conversation.unreadCount === 0) return;

    const unreadMessages = conversation.messages.filter(msg => !msg.read && msg.senderId !== user?.id);
    
    for (const msg of unreadMessages) {
      await communicationManager.send({
        kind: 'markMessageRead',
        payload: {
          messageId: msg.id,
          senderId: msg.senderId
        }
      });
    }
  };

  const handleConversationClick = (userId: string) => {
    setSelectedConversation(userId);
    markAsRead(userId);
  };

  const filteredConversations = Array.from(conversations.values()).filter(conv =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !conversations.has(friend.userId)
  );

  const selectedConv = selectedConversation ? conversations.get(selectedConversation) : null;

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-0 right-4 bg-gray-900/95 backdrop-blur-sm rounded-t-lg shadow-2xl border border-gray-700 transition-all duration-300 ${
      isMinimized ? 'h-14 w-80' : 'h-[500px] w-80'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700 cursor-pointer"
           onClick={() => setIsMinimized(!isMinimized)}>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <h3 className="text-white font-medium">
            {selectedConv ? selectedConv.userName : (showFriendsList ? 'Friends' : 'Messages')}
          </h3>
          {!selectedConv && !showFriendsList && conversations.size > 0 && (
            <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
              {Array.from(conversations.values()).reduce((sum, conv) => sum + conv.unreadCount, 0)}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="flex h-[calc(100%-56px)]">
          {/* Conversations/Friends List */}
          {!selectedConversation && (
            <div className="flex-1 flex flex-col">
              {/* Tabs */}
              <div className="flex border-b border-gray-700">
                <button
                  onClick={() => setShowFriendsList(false)}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    !showFriendsList
                      ? 'text-white border-b-2 border-blue-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Messages
                  {conversations.size > 0 && (
                    <span className="ml-2 text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                      {conversations.size}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setShowFriendsList(true)}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    showFriendsList
                      ? 'text-white border-b-2 border-blue-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Friends
                  {friends.length > 0 && (
                    <span className="ml-2 text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                      {friends.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Search */}
              <div className="p-3 border-b border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder={showFriendsList ? "Search friends..." : "Search conversations..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {!showFriendsList ? (
                  // Conversations List
                  filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
                      <p className="mb-2">No conversations yet</p>
                      <button
                        onClick={() => setShowFriendsList(true)}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Start a chat with friends →
                      </button>
                    </div>
                  ) : (
                    filteredConversations.map(conv => (
                      <div
                        key={conv.userId}
                        onClick={() => handleConversationClick(conv.userId)}
                        className="flex items-center p-3 hover:bg-gray-800 cursor-pointer transition-colors"
                      >
                        <div className="relative">
                          <img
                            src={conv.userAvatar || `/api/avatar/${conv.userId}`}
                            alt={conv.userName}
                            className="w-10 h-10 rounded-full"
                          />
                          {friends.find(f => f.userId === conv.userId)?.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 ml-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-white font-medium truncate">{conv.userName}</h4>
                            {conv.unreadCount > 0 && (
                              <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                          {conv.lastMessage && (
                            <p className="text-gray-400 text-sm truncate">
                              {conv.lastMessage.senderId === user?.id ? 'You: ' : ''}
                              {conv.lastMessage.content}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  // Friends List
                  loadingFriends ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-gray-400">Loading friends...</div>
                    </div>
                  ) : filteredFriends.length === 0 && searchQuery ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <p>No friends found matching "{searchQuery}"</p>
                    </div>
                  ) : friends.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <p>No mutual follows yet</p>
                    </div>
                  ) : (
                    <>
                      {/* Show filtered friends */}
                      {filteredFriends.map(friend => (
                        <div
                          key={friend.userId}
                          onClick={() => startConversationWithFriend(friend.userId)}
                          className="flex items-center p-3 hover:bg-gray-800 cursor-pointer transition-colors"
                        >
                          <div className="relative">
                            <img
                              src={friend.avatar || `/api/avatar/${friend.userId}`}
                              alt={friend.username}
                              className="w-10 h-10 rounded-full"
                            />
                            {friend.isOnline && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                            )}
                          </div>
                          <div className="flex-1 ml-3">
                            <h4 className="text-white font-medium">{friend.username}</h4>
                            <p className="text-gray-400 text-sm">
                              {friend.isOnline ? 'Online' : 'Offline'}
                            </p>
                          </div>
                          <button className="text-blue-400 hover:text-blue-300 text-sm">
                            Message
                          </button>
                        </div>
                      ))}
                      
                      {/* Show friends with existing conversations */}
                      {searchQuery === '' && (
                        <>
                          {Array.from(conversations.values()).filter(conv =>
                            friends.some(f => f.userId === conv.userId)
                          ).length > 0 && (
                            <div className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wider">
                              Active Conversations
                            </div>
                          )}
                          {Array.from(conversations.values()).filter(conv =>
                            friends.some(f => f.userId === conv.userId)
                          ).map(conv => {
                            const friend = friends.find(f => f.userId === conv.userId);
                            return (
                              <div
                                key={conv.userId}
                                onClick={() => handleConversationClick(conv.userId)}
                                className="flex items-center p-3 hover:bg-gray-800 cursor-pointer transition-colors opacity-60"
                              >
                                <div className="relative">
                                  <img
                                    src={conv.userAvatar || `/api/avatar/${conv.userId}`}
                                    alt={conv.userName}
                                    className="w-10 h-10 rounded-full"
                                  />
                                  {friend?.isOnline && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                                  )}
                                </div>
                                <div className="flex-1 ml-3">
                                  <h4 className="text-white font-medium">{conv.userName}</h4>
                                  <p className="text-gray-400 text-sm">View conversation</p>
                                </div>
                              </div>
                            );
                          })}
                        </>
                      )}
                    </>
                  )
                )}
              </div>
            </div>
          )}

          {/* Conversation View */}
          {selectedConversation && selectedConv && (
            <div className="flex-1 flex flex-col">
              {/* Conversation Header */}
              <div className="flex items-center p-3 border-b border-gray-700">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="text-gray-400 hover:text-white mr-3"
                >
                  ←
                </button>
                <img
                  src={selectedConv.userAvatar || `/api/avatar/${selectedConv.userId}`}
                  alt={selectedConv.userName}
                  className="w-8 h-8 rounded-full mr-3"
                />
                <h4 className="text-white font-medium flex-1">{selectedConv.userName}</h4>
                <button className="text-gray-400 hover:text-white">
                  <MoreVertical size={16} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {selectedConv.messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${
                      msg.senderId === user?.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-white'
                    } rounded-lg px-3 py-2`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {msg.read && msg.senderId === user?.id && ' ✓✓'}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700 rounded-lg px-3 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-3 border-t border-gray-700">
                <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}