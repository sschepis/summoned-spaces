import { useState, useMemo } from 'react';
import {
  Clock, Filter, ChevronDown, Users, MessageCircle,
  Heart, Share, Globe, FileText, Image,
  TrendingUp, Calendar, RefreshCw, Eye, MoreHorizontal
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface ActivityItem {
  id: string;
  type: string;
  user: { name: string; avatar: string; id?: string };
  content: string;
  timestamp: Date;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  target?: {
    type: 'post' | 'space' | 'user';
    id: string;
    name: string;
  };
  metadata?: {
    spaceId?: string;
    spaceName?: string;
    postId?: string;
    fileType?: string;
  };
}

interface RecentActivityCardProps {
  recentActivity: ActivityItem[];
  onActivityClick?: (activity: ActivityItem) => void;
  onUserClick?: (userId: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  showLoadMore?: boolean;
  onLoadMore?: () => void;
}

const activityTypeConfig = {
  like: { icon: Heart, color: 'red', label: 'liked' },
  comment: { icon: MessageCircle, color: 'blue', label: 'commented on' },
  share: { icon: Share, color: 'green', label: 'shared' },
  follow: { icon: Users, color: 'purple', label: 'followed' },
  post: { icon: FileText, color: 'cyan', label: 'posted' },
  join_space: { icon: Globe, color: 'orange', label: 'joined' },
  file_upload: { icon: Image, color: 'pink', label: 'uploaded' }
};

export function RecentActivityCard({
  recentActivity,
  onActivityClick,
  onUserClick,
  onRefresh,
  isLoading = false,
  showLoadMore = false,
  onLoadMore
}: RecentActivityCardProps) {
  const [filter, setFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [groupByTime, setGroupByTime] = useState(true);
  const [hoveredActivity, setHoveredActivity] = useState<string | null>(null);

  // Filter activities first
  const filteredActivities = useMemo(() => {
    if (filter === 'all') return recentActivity;
    return recentActivity.filter(activity => activity.type === filter);
  }, [recentActivity, filter]);

  // Then group activities by time periods
  const groupedActivities = useMemo(() => {
    if (!groupByTime) {
      return { 'All Activity': filteredActivities };
    }

    const now = new Date();
    const groups: Record<string, ActivityItem[]> = {
      'Today': [],
      'Yesterday': [],
      'This Week': [],
      'Earlier': []
    };

    filteredActivities.forEach(activity => {
      const activityDate = new Date(activity.timestamp);
      const diffDays = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        groups['Today'].push(activity);
      } else if (diffDays === 1) {
        groups['Yesterday'].push(activity);
      } else if (diffDays <= 7) {
        groups['This Week'].push(activity);
      } else {
        groups['Earlier'].push(activity);
      }
    });

    // Remove empty groups
    Object.keys(groups).forEach(key => {
      if (groups[key].length === 0) {
        delete groups[key];
      }
    });

    return groups;
  }, [filteredActivities, groupByTime]);

  const getActivityTypes = () => {
    const types = new Set(recentActivity.map(a => a.type));
    return Array.from(types);
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    if (minutes < 10080) return `${Math.floor(minutes / 1440)}d ago`;
    return timestamp.toLocaleDateString();
  };

  const getActivityIcon = (type: string) => {
    const config = activityTypeConfig[type as keyof typeof activityTypeConfig];
    return config ? config.icon : FileText;
  };

  const getActivityColor = (type: string) => {
    const config = activityTypeConfig[type as keyof typeof activityTypeConfig];
    return config ? config.color : 'gray';
  };

  if (recentActivity.length === 0) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          </div>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="text-gray-400 hover:text-purple-400"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
        
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h4 className="text-white font-medium mb-2">No activity yet</h4>
          <p className="text-gray-400 text-sm">
            Activity from your network will appear here
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          <span className="text-xs text-gray-400 bg-white/10 rounded-full px-2 py-1">
            {recentActivity.length}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* View Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setGroupByTime(!groupByTime)}
            className="text-gray-400 hover:text-purple-400"
          >
            <Calendar className="w-4 h-4" />
          </Button>
          
          {/* Filter Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-gray-400 hover:text-purple-400"
          >
            <Filter className="w-4 h-4" />
            <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
          
          {/* Refresh */}
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="text-gray-400 hover:text-purple-400"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                filter === 'all'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
              }`}
            >
              All ({recentActivity.length})
            </button>
            {getActivityTypes().map(type => {
              const count = recentActivity.filter(a => a.type === type).length;
              const config = activityTypeConfig[type as keyof typeof activityTypeConfig];
              
              return (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1 rounded-full text-xs transition-colors flex items-center space-x-1 ${
                    filter === type
                      ? `bg-${config?.color || 'gray'}-500/20 text-${config?.color || 'gray'}-300 border border-${config?.color || 'gray'}-500/30`
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
                  }`}
                >
                  {config && <config.icon className="w-3 h-3" />}
                  <span>{config?.label || type} ({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Activity List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {Object.entries(groupedActivities).map(([timeGroup, activities]) => (
          <div key={timeGroup}>
            {groupByTime && (
              <div className="flex items-center space-x-2 mb-3">
                <div className="text-xs font-medium text-gray-400">{timeGroup}</div>
                <div className="flex-1 h-px bg-white/10"></div>
                <div className="text-xs text-gray-500">{activities.length}</div>
              </div>
            )}
            
            <div className="space-y-3">
              {activities.map((activity) => {
                const ActivityIcon = getActivityIcon(activity.type);
                const color = getActivityColor(activity.type);
                
                return (
                  <div
                    key={activity.id}
                    className="group flex items-start space-x-3 p-2 rounded-lg hover:bg-white/5
                             transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredActivity(activity.id)}
                    onMouseLeave={() => setHoveredActivity(null)}
                    onClick={() => onActivityClick?.(activity)}
                  >
                    <div className="relative">
                      <img
                        src={activity.user.avatar}
                        alt={activity.user.name}
                        className="w-8 h-8 rounded-full border border-white/20"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-${color}-500/20
                                     flex items-center justify-center border border-black`}>
                        <ActivityIcon className={`w-2 h-2 text-${color}-400`} />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <button
                          className="text-sm text-white font-medium hover:text-purple-300 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (activity.user.id) {
                              onUserClick?.(activity.user.id);
                            }
                          }}
                        >
                          {activity.user.name}
                        </button>
                        <span className="text-sm text-gray-300">{activity.content}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <span>{formatTimestamp(activity.timestamp)}</span>
                        {activity.metadata?.spaceName && (
                          <>
                            <span>•</span>
                            <div className="flex items-center space-x-1">
                              <Globe className="w-3 h-3" />
                              <span>{activity.metadata.spaceName}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Menu */}
                    {hoveredActivity === activity.id && (
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onActivityClick?.(activity);
                          }}
                          className="text-gray-400 hover:text-white p-1"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white p-1"
                        >
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {showLoadMore && onLoadMore && (
        <div className="mt-4 pt-4 border-t border-white/10 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoadMore}
            disabled={isLoading}
            className="hover:scale-105 transition-transform"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Loading...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Load More Activity</span>
              </div>
            )}
          </Button>
        </div>
      )}
    </Card>
  );
}