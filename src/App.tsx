import React from 'react';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NetworkProvider } from './contexts/NetworkContext';
import { AppProvider } from './contexts/AppContext';
import { Navigation } from './components/Navigation';
import { NotificationSystem, useNotifications } from './components/NotificationSystem';
import { AppRoutes } from './routes/AppRoutes';
import { MessengerButton } from './components/MessengerButton';
import webSocketService from './services/websocket';
import { holographicMemoryManager } from './services/holographic-memory';
import { FollowNotificationMessage } from '../server/protocol';

// Main application content component
const AppContent: React.FC = () => {
  const { isAuthenticated, loading, sessionRestoring, user: currentUser } = useAuth();
  const { notifications, dismissNotification, showFollow, showUnfollow, showMessage } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect authenticated users away from auth pages
  React.useEffect(() => {
    if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password')) {
      console.log('[App] Redirecting authenticated user from auth page to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  // Listen for follow notifications from WebSocket
  React.useEffect(() => {
    const handleFollowNotification = (notification: FollowNotificationMessage) => {
      if (notification.kind === 'followNotification') {
        const { followerId, followerUsername, type } = notification.payload;
        
        if (type === 'follow') {
          showFollow(
            'New Follower!',
            `${followerUsername} started following you`,
            followerId,
            {
              label: 'View Profile',
              onClick: () => {
                // Navigation will be handled by React Router
                window.location.href = '/friends';
              }
            }
          );
        } else {
          showUnfollow(
            'Follower Update',
            `${followerUsername} unfollowed you`,
            followerId
          );
        }
      }
    };

    webSocketService.addNotificationListener(handleFollowNotification);

    return () => {
      webSocketService.removeNotificationListener(handleFollowNotification);
    };
  }, [showFollow, showUnfollow]);

  // Listen for global message notifications
  React.useEffect(() => {
    const handleGlobalMessageNotification = (message: { kind: string; payload: Record<string, unknown> }) => {
      if (message.kind === 'beaconReceived') {
        const payload = message.payload as {
          beaconId: string;
          senderId: string;
          beaconType: string;
          beacon: unknown;
        };
        
        // Process quantum_message and direct_message beacons
        if (payload.beaconType === 'quantum_message' || payload.beaconType === 'direct_message') {
          console.log(`[App] Global message notification from ${payload.senderId}`);
          
          try {
            const decodedContent = holographicMemoryManager.decodeMemory(payload.beacon);
            
            if (decodedContent) {
              let messageData;
              try {
                messageData = JSON.parse(decodedContent);
              } catch {
                messageData = {
                  content: decodedContent,
                  timestamp: new Date().toISOString()
                };
              }
              
              // Use simplified sender name (first 8 chars of user ID)
              const senderName = payload.senderId.substring(0, 8);
              const isQuantumMessage = messageData.isQuantumDelivered || payload.beaconType === 'quantum_message';
              
              showMessage(
                `New ${isQuantumMessage ? 'Quantum ' : ''}Message`,
                `${senderName}: ${messageData.content.length > 50 ? messageData.content.substring(0, 50) + '...' : messageData.content}`,
                payload.senderId,
                isQuantumMessage,
                {
                  label: 'Open Messages',
                  onClick: () => {
                    window.location.href = `/messages/${payload.senderId}`;
                  }
                }
              );
              
              console.log(`[App] Showed global notification for message from ${payload.senderId}`);
            }
          } catch (error) {
            console.error('[App] Error processing global message notification:', error);
          }
        }
      }
    };

    webSocketService.addMessageListener(handleGlobalMessageNotification);

    return () => {
      webSocketService.removeMessageListener(handleGlobalMessageNotification);
    };
  }, [showMessage, currentUser?.id]);

  // Show loading state while checking authentication or restoring session
  if (loading || sessionRestoring) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">
            {sessionRestoring ? 'Restoring quantum connection...' : 'Entering the quantum realm...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2523ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>
      
      {isAuthenticated && <Navigation />}
      
      <main className="relative">
        <AppRoutes />
      </main>
      
      <NotificationSystem
        notifications={notifications}
        onDismiss={dismissNotification}
      />
      
      {isAuthenticated && <MessengerButton />}
    </div>
  );
};

// Main App component with all providers
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NetworkProvider>
          <AppProvider>
            <AppContent />
          </AppProvider>
        </NetworkProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;