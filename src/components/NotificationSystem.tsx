import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, Zap } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'resonance';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationSystemProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const notificationIcons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  resonance: Zap
};

const notificationStyles = {
  info: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
  resonance: 'bg-blue-500/10 border-blue-500/20 text-blue-300'
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
            className={`p-4 rounded-lg border backdrop-blur-sm shadow-lg animate-in slide-in-from-right duration-300 ${
              notificationStyles[notification.type]
            }`}
          >
            <div className="flex items-start space-x-3">
              <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
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

  return {
    notifications,
    addNotification,
    dismissNotification,
    showSuccess,
    showError,
    showInfo,
    showResonance
  };
}