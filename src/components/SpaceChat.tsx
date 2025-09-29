import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Shield, Users, Clock, CheckCheck, Zap, FileText, Image, Video, Archive, Smile } from 'lucide-react';

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

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    userId: 'sarah-chen',
    userName: 'Dr. Sarah Chen',
    userAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    content: 'Just uploaded the latest quantum algorithm research. The resonance patterns look promising!',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    type: 'text',
    isEncrypted: true,
    deliveryStatus: 'read',
    quantumSignature: 'QE-7F2A9B4C'
  },
  {
    id: '2',
    userId: 'marcus-rodriguez',
    userName: 'Marcus Rodriguez',
    userAvatar: 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    content: 'Excellent work! I achieved a 94% resonance lock on the dataset. Sharing the analysis now.',
    timestamp: new Date(Date.now() - 1000 * 60 * 12),
    type: 'text',
    isEncrypted: true,
    deliveryStatus: 'read',
    quantumSignature: 'QE-3A8F1D6C'
  },
  {
    id: '3',
    userId: 'marcus-rodriguez',
    userName: 'Marcus Rodriguez',
    userAvatar: 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    content: '',
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    type: 'file',
    isEncrypted: true,
    deliveryStatus: 'read',
    fileData: {
      name: 'resonance_analysis_2024.pdf',
      size: '2.8 MB',
      type: 'pdf',
      fingerprint: 'FA7B9C2D3E8A1F5B'
    },
    quantumSignature: 'QE-8B3F2A1D'
  },
  {
    id: '4',
    userId: 'system',
    userName: 'Quantum System',
    userAvatar: '',
    content: 'Elena Kowalski joined the space',
    timestamp: new Date(Date.now() - 1000 * 60 * 8),
    type: 'system',
    isEncrypted: false,
    deliveryStatus: 'delivered'
  },
  {
    id: '5',
    userId: 'elena-kowalski',
    userName: 'Elena Kowalski',
    userAvatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    content: 'Thanks for adding me! Excited to collaborate on this quantum research. 🚀',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    type: 'text',
    isEncrypted: true,
    deliveryStatus: 'read',
    quantumSignature: 'QE-9E2C7F83'
  },
  {
    id: '6',
    userId: 'current-user',
    userName: 'You',
    userAvatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    content: 'The resonance patterns in the new dataset are fascinating. Has anyone tried cross-referencing with the previous experiments?',
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    type: 'text',
    isEncrypted: true,
    deliveryStatus: 'delivered',
    quantumSignature: 'QE-4C8A1F3E'
  }
];

const onlineMembers = [
  { id: 'sarah-chen', name: 'Dr. Sarah Chen', status: 'online' },
  { id: 'elena-kowalski', name: 'Elena Kowalski', status: 'online' },
  { id: 'marcus-rodriguez', name: 'Marcus Rodriguez', status: 'away' },
  { id: 'james-wilson', name: 'James Wilson', status: 'offline' }
];

export function SpaceChat({ spaceId, currentUserId }: SpaceChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: currentUserId,
      userName: 'You',
      userAvatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      content: newMessage,
      timestamp: new Date(),
      type: 'text',
      isEncrypted: true,
      deliveryStatus: 'sending',
      quantumSignature: `QE-${Math.random().toString(16).substr(2, 8).toUpperCase()}`
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate message delivery
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
            <span>{onlineMembers.filter(m => m.status === 'online').length} online</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
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
        })}
        
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
            {onlineMembers.filter(m => m.status === 'online').slice(0, 5).map((member) => (
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
          {onlineMembers.filter(m => m.status === 'online').length > 5 && (
            <span className="text-xs text-gray-400">
              +{onlineMembers.filter(m => m.status === 'online').length - 5} more
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
              placeholder="Type a quantum-encrypted message..."
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
            className="p-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl
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
            <span>Messages are quantum-encrypted and distributed non-locally</span>
          </div>
          <span>Press Enter to send</span>
        </div>
      </div>
    </div>
  );
}