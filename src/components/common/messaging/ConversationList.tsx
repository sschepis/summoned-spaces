import { ReactNode } from 'react';
import { Search, Shield, LucideIcon } from 'lucide-react';
import { SearchInput } from '../../ui/SearchInput';

interface Participant {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface LastMessage {
  content: string;
  timestamp: Date;
  isFromMe: boolean;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participant: Participant;
  lastMessage: LastMessage;
  unreadCount: number;
  isEncrypted?: boolean;
  quantumSignature?: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelectConversation: (id: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  title?: string;
  icon?: LucideIcon;
  showEncryption?: boolean;
  footer?: ReactNode;
  className?: string;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelectConversation,
  searchQuery = '',
  onSearchChange,
  title = 'Conversations',
  icon: Icon,
  showEncryption = true,
  footer,
  className = ''
}: ConversationListProps) {
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
    <div className={`bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center space-x-3 mb-4">
          {Icon && <Icon className="w-5 h-5 text-cyan-400" />}
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
        
        {onSearchChange && (
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search conversations..."
            size="sm"
          />
        )}
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-2">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                selectedId === conversation.id
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
                      {showEncryption && conversation.isEncrypted && (
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
      
      {/* Footer */}
      {footer && (
        <div className="p-3 border-t border-white/10">
          {footer}
        </div>
      )}
    </div>
  );
}