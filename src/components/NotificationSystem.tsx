import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, Zap, UserPlus, UserMinus, MessageCircle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'resonance' | 'follow' | 'unfollow' | 'message';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  userId?: string; // For follow notifications
  senderId?: string; // For message notifications
  isQuantum?: boolean; // For quantum message indicators
}

interface NotificationSystemProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const notificationIcons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  resonance: Zap,
  follow: UserPlus,
  unfollow: UserMinus,
  message: MessageCircle
};

const notificationStyles = {
  success: 'bg-green-500/30 border-green-500/50 text-green-100',
  error: 'bg-red-500/30 border-red-500/50 text-red-100',
  info: 'bg-blue-500/30 border-blue-500/50 text-blue-100',
  resonance: 'bg-blue-500/30 border-blue-500/50 text-blue-100',
  follow: 'bg-green-500/30 border-green-500/50 text-green-100',
  unfollow: 'bg-orange-500/30 border-orange-500/50 text-orange-100',
  message: 'bg-cyan-500/30 border-cyan-500/50 text-cyan-100'
};

export function NotificationSystem({ notifications, onDismiss }: NotificationSystemProps) {
  useEffect(() => {
    const timers = notifications.map((notification) => {
      if (notification.duration) {
        return setTimeout(() => {
          onDismiss(notification.id);
        }, notification.duration);
      }
      return null;
    }).filter(Boolean);

    return () => {
      timers.forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    };
  }, [notifications, onDismiss]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-96">
      {notifications.map((notification) => {
        const Icon = notificationIcons[notification.type];
        return (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border backdrop-blur-md shadow-xl animate-in slide-in-from-right duration-300 ${
              notificationStyles[notification.type]
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="relative">
                <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                {notification.type === 'message' && notification.isQuantum && (
                  <Zap className="w-3 h-3 absolute -top-1 -right-1 text-purple-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white mb-1">{notification.title}</h4>
                <p className="text-sm text-gray-300">{notification.message}</p>
                {notification.action && (
                  <button
                    onClick={notification.action.onClick}
                    className="mt-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    {notification.action.label}
                  </button>
                )}
              </div>
              <button
                onClick={() => onDismiss(notification.id)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const showSuccess = (title: string, message: string, duration = 5000) => {
    addNotification({ type: 'success', title, message, duration });
  };

  const showError = (title: string, message: string, duration = 7000) => {
    addNotification({ type: 'error', title, message, duration });
  };

  const showInfo = (title: string, message: string, duration = 5000) => {
    addNotification({ type: 'info', title, message, duration });
  };

  const showResonance = (title: string, message: string, action?: Notification['action']) => {
    addNotification({ type: 'resonance', title, message, action });
  };

  const showFollow = (title: string, message: string, userId?: string, action?: Notification['action']) => {
    addNotification({ type: 'follow', title, message, userId, action, duration: 6000 });
  };

  const showUnfollow = (title: string, message: string, userId?: string, action?: Notification['action']) => {
    addNotification({ type: 'unfollow', title, message, userId, action, duration: 6000 });
  };

  const showMessage = (title: string, message: string, senderId?: string, isQuantum?: boolean, action?: Notification['action']) => {
    addNotification({
      type: 'message',
      title,
      message,
      senderId,
      isQuantum,
      action,
      duration: 0 // Persistent until manually dismissed or action is taken
    });
  };

  return {
    notifications,
    addNotification,
    dismissNotification,
    showSuccess,
    showError,
    showInfo,
    showResonance,
    showFollow,
    showUnfollow,
    showMessage
  };
}