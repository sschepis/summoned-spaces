import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { FloatingMessenger } from './FloatingMessenger';
import { communicationManager } from '../services/communication-manager';
import { useAuth } from '../contexts/AuthContext';

export function MessengerButton() {
  const { user, isAuthenticated } = useAuth();
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const handleMessage = (message: { kind: string; payload: Record<string, unknown> }) => {
      if (message.kind === 'privateMessage') {
        const payload = message.payload;
        if (payload.recipientId === user.id && !isMessengerOpen) {
          setUnreadCount(prev => prev + 1);
          setHasNewMessage(true);
          
          // Reset animation after 3 seconds
          setTimeout(() => setHasNewMessage(false), 3000);
        }
      } else if (message.kind === 'unreadCountUpdate') {
        setUnreadCount(message.payload.count as number);
      }
    };

    communicationManager.onMessage(handleMessage);

    // Load initial unread count
    loadUnreadCount();
  }, [isAuthenticated, user, isMessengerOpen]);

  const loadUnreadCount = async () => {
    await communicationManager.send({
      kind: 'getUnreadCount',
      payload: {}
    });
  };

  const handleToggleMessenger = () => {
    setIsMessengerOpen(!isMessengerOpen);
    if (!isMessengerOpen) {
      setUnreadCount(0);
      setHasNewMessage(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={handleToggleMessenger}
          className={`relative p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 ${
            hasNewMessage ? 'animate-bounce' : ''
          }`}
        >
          <MessageCircle size={24} />
          
          {/* Unread Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
          
          {/* New Message Indicator */}
          {hasNewMessage && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></span>
          )}
        </button>
      </div>

      {/* Floating Messenger */}
      <FloatingMessenger 
        isOpen={isMessengerOpen} 
        onClose={() => setIsMessengerOpen(false)} 
      />
    </>
  );
}