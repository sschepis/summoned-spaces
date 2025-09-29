import { ReactNode } from 'react';
import { Shield, Clock, CheckCheck, MessageCircle } from 'lucide-react';
import { EmptyState } from '../../ui/EmptyState';

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  deliveryStatus?: 'sending' | 'sent' | 'delivered' | 'read';
  isEncrypted?: boolean;
  quantumSignature?: string;
}

export interface ThreadParticipant {
  id: string;
  name: string;
  username?: string;
  avatar: string;
  isOnline?: boolean;
  lastSeen?: string;
}

interface MessageThreadProps {
  messages: Message[];
  currentUserId: string;
  participant?: ThreadParticipant;
  showEncryption?: boolean;
  showDeliveryStatus?: boolean;
  showSignatures?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function MessageThread({
  messages,
  currentUserId,
  participant,
  showEncryption = true,
  showDeliveryStatus = true,
  showSignatures = true,
  emptyMessage = 'No messages yet',
  className = ''
}: MessageThreadProps) {
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

  if (messages.length === 0) {
    return (
      <EmptyState
        icon={MessageCircle}
        title={emptyMessage}
        description="Start the conversation by sending a message"
        className={className}
      />
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Thread Header (if participant provided) */}
      {participant && (
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={participant.avatar}
                alt={participant.name}
                className="w-10 h-10 rounded-full object-cover border border-white/10"
              />
              {participant.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-800" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-white">{participant.name}</h3>
              <p className="text-sm text-gray-400">
                {participant.isOnline ? 'Online' : `Last seen ${participant.lastSeen}`}
              </p>
            </div>
          </div>
          
          {showEncryption && (
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Shield className="w-4 h-4 text-green-400" />
              <span>Encrypted</span>
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwnMessage = message.senderId === currentUserId;
          
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
                  {showSignatures && message.quantumSignature && (
                    <span className="font-mono">{message.quantumSignature}</span>
                  )}
                  {isOwnMessage && showDeliveryStatus && message.deliveryStatus && (
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
    </div>
  );
}