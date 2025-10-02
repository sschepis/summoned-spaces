import { useState } from 'react';
import {
  Zap, MessageCircle, Search, Globe, Settings,
  Plus, Upload, Sparkles, Calendar, Bookmark, Bell,
  TrendingUp, Activity, Clock
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  onClick: () => void;
  shortcut?: string;
  badge?: number;
  featured?: boolean;
}

interface QuickActionsCardProps {
  onOpenDirectMessages: () => void;
  onOpenSearch: () => void;
  onCreateSpace: () => void;
  onOpenSettings: () => void;
  onCreatePost?: () => void;
  onUploadFile?: () => void;
  onViewNotifications?: () => void;
  onViewBookmarks?: () => void;
  onViewTrending?: () => void;
  onSchedulePost?: () => void;
  unreadMessages?: number;
  unreadNotifications?: number;
  recentActions?: string[];
}

export function QuickActionsCard({
  onOpenDirectMessages,
  onOpenSearch,
  onCreateSpace,
  onOpenSettings,
  onCreatePost,
  onUploadFile,
  onViewNotifications,
  onViewBookmarks,
  onViewTrending,
  onSchedulePost,
  unreadMessages = 0,
  unreadNotifications = 0,
  recentActions = []
}: QuickActionsCardProps) {
  const [showAllActions, setShowAllActions] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const primaryActions: QuickAction[] = [
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageCircle,
      color: 'blue',
      description: 'View direct messages',
      onClick: onOpenDirectMessages,
      shortcut: 'Ctrl+M',
      badge: unreadMessages,
      featured: unreadMessages > 0
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      color: 'purple',
      description: 'Search content and users',
      onClick: onOpenSearch,
      shortcut: 'Ctrl+K'
    },
    {
      id: 'new-space',
      label: 'New Space',
      icon: Globe,
      color: 'green',
      description: 'Create a new space',
      onClick: onCreateSpace,
      shortcut: 'Ctrl+N'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      color: 'gray',
      description: 'Manage your account',
      onClick: onOpenSettings
    }
  ];

  const secondaryActions: QuickAction[] = [
    ...(onCreatePost ? [{
      id: 'create-post',
      label: 'Create Post',
      icon: Plus,
      color: 'cyan',
      description: 'Share something new',
      onClick: onCreatePost,
      shortcut: 'Ctrl+P'
    }] : []),
    ...(onUploadFile ? [{
      id: 'upload-file',
      label: 'Upload',
      icon: Upload,
      color: 'orange',
      description: 'Upload files and media',
      onClick: onUploadFile
    }] : []),
    ...(onViewNotifications ? [{
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      color: 'red',
      description: 'View notifications',
      onClick: onViewNotifications,
      badge: unreadNotifications,
      featured: unreadNotifications > 0
    }] : []),
    ...(onViewBookmarks ? [{
      id: 'bookmarks',
      label: 'Bookmarks',
      icon: Bookmark,
      color: 'yellow',
      description: 'Saved content',
      onClick: onViewBookmarks
    }] : []),
    ...(onViewTrending ? [{
      id: 'trending',
      label: 'Trending',
      icon: TrendingUp,
      color: 'pink',
      description: 'What\'s trending',
      onClick: onViewTrending
    }] : []),
    ...(onSchedulePost ? [{
      id: 'schedule',
      label: 'Schedule',
      icon: Calendar,
      color: 'indigo',
      description: 'Schedule posts',
      onClick: onSchedulePost
    }] : [])
  ];

  const allActions = [...primaryActions, ...secondaryActions];
  const displayActions = showAllActions ? allActions : primaryActions;
  const featuredActions = allActions.filter(action => action.featured);

  const getActionBadge = (action: QuickAction) => {
    if (!action.badge || action.badge === 0) return null;
    
    return (
      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full
                    min-w-[1.25rem] h-5 flex items-center justify-center px-1 border border-black">
        {action.badge > 99 ? '99+' : action.badge}
      </div>
    );
  };

  return (
    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {featuredActions.length > 0 && (
            <div className="flex items-center space-x-1 text-xs text-yellow-400">
              <Sparkles className="w-3 h-3" />
              <span>{featuredActions.length}</span>
            </div>
          )}
          
          {secondaryActions.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllActions(!showAllActions)}
              className="text-gray-400 hover:text-yellow-400"
            >
              {showAllActions ? 'Show Less' : 'Show More'}
            </Button>
          )}
        </div>
      </div>

      {/* Recent Actions */}
      {recentActions.length > 0 && (
        <div className="mb-4 p-2 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400 font-medium">Recent</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {recentActions.slice(0, 3).map((action, index) => (
              <span key={index} className="text-xs bg-white/10 text-gray-300 rounded px-2 py-1">
                {action}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions Grid */}
      <div className={`grid gap-3 ${
        displayActions.length <= 4 ? 'grid-cols-2' :
        displayActions.length <= 6 ? 'grid-cols-3' : 'grid-cols-2'
      }`}>
        {displayActions.map((action) => (
          <div key={action.id} className="relative">
            <Button
              variant={action.featured ? 'primary' : 'secondary'}
              onClick={action.onClick}
              onMouseEnter={() => setHoveredAction(action.id)}
              onMouseLeave={() => setHoveredAction(null)}
              className={`flex flex-col h-16 text-xs w-full transition-all duration-200
                         hover:scale-105 ${action.featured ? 'ring-2 ring-yellow-400/50' : ''}`}
            >
              <action.icon className={`w-5 h-5 mb-1 ${
                action.featured ? 'text-white' : `text-${action.color}-400`
              }`} />
              <span className="font-medium">{action.label}</span>
              {action.shortcut && hoveredAction === action.id && (
                <span className="absolute bottom-1 right-1 text-xs text-gray-500">
                  {action.shortcut}
                </span>
              )}
            </Button>
            {getActionBadge(action)}
            
            {/* Tooltip */}
            {hoveredAction === action.id && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2
                            bg-black/90 text-white text-xs rounded px-2 py-1 whitespace-nowrap
                            border border-white/20 z-10">
                {action.description}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2
                              border-4 border-transparent border-t-black/90"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      {(unreadMessages > 0 || unreadNotifications > 0) && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center space-x-4">
              {unreadMessages > 0 && (
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-3 h-3 text-blue-400" />
                  <span>{unreadMessages} new messages</span>
                </div>
              )}
              {unreadNotifications > 0 && (
                <div className="flex items-center space-x-1">
                  <Bell className="w-3 h-3 text-red-400" />
                  <span>{unreadNotifications} notifications</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Activity className="w-3 h-3" />
              <span>Active now</span>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Hint */}
      {hoveredAction && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="text-xs text-gray-500 text-center">
            Press <kbd className="bg-white/10 rounded px-1">Ctrl + /</kbd> to see all shortcuts
          </div>
        </div>
      )}
    </Card>
  );
}