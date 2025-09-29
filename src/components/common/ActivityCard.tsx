import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal } from 'lucide-react';
import { UserAvatar } from '../ui/UserAvatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ActivityItem } from '../../types/common';

interface ActivityCardProps {
  activity: ActivityItem;
  onLike?: (activityId: string) => void;
  onBookmark?: (activityId: string) => void;
  onFollow?: (userId: string) => void;
  showFollowButton?: boolean;
  compact?: boolean;
}

export function ActivityCard({ 
  activity, 
  onLike, 
  onBookmark, 
  onFollow, 
  showFollowButton = true,
  compact = false 
}: ActivityCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  if (compact) {
    return (
      <Card className="p-3">
        <div className="flex items-center space-x-3">
          <UserAvatar
            src={activity.user.avatar}
            name={activity.user.name}
            size="sm"
            verified={activity.user.verified}
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 text-sm">
              <span className="font-medium text-white truncate">{activity.user.name}</span>
              <span className="text-gray-400 truncate">{activity.action}</span>
              {activity.space && (
                <>
                  <span className="text-gray-500">in</span>
                  <span className="text-purple-300 truncate">{activity.space}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="text-gray-500">{activity.timestamp}</span>
            {activity.metrics && onLike && (
              <button
                onClick={() => onLike(activity.id)}
                className={`flex items-center space-x-1 ${
                  activity.metrics.hasLiked ? 'text-pink-400' : 'text-gray-500 hover:text-pink-400'
                }`}
              >
                <Heart className={`w-3 h-3 ${activity.metrics.hasLiked ? 'fill-current' : ''}`} />
                <span>{formatNumber(activity.metrics.likes)}</span>
              </button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative">
      {activity.isPinned && (
        <Badge variant="warning" size="sm" className="absolute top-4 right-4">
          Pinned
        </Badge>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <UserAvatar
            src={activity.user.avatar}
            name={activity.user.name}
            size="lg"
            verified={activity.user.verified}
          />
          
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-white">{activity.user.name}</span>
              <span className="text-sm text-gray-400">{activity.user.username}</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">{activity.timestamp}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {showFollowButton && onFollow && (
            <Button
              size="sm"
              variant={activity.user.isFollowing ? 'success' : 'secondary'}
              icon={activity.user.isFollowing ? undefined : undefined}
              onClick={() => onFollow(activity.user.id)}
            >
              {activity.user.isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
          
          <button className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <div className="text-white mb-3 leading-relaxed">
          <span>{activity.action}</span>
          {activity.space && (
            <>
              <span className="text-gray-400 mx-1">in</span>
              <span className="text-purple-300 font-medium">{activity.space}</span>
            </>
          )}
        </div>

        {activity.details && (
          <p className="text-gray-300 text-sm leading-relaxed">{activity.details}</p>
        )}
      </div>

      {/* Media */}
      {activity.media && activity.media.type === 'image' && (
        <div className="mb-4 rounded-xl overflow-hidden">
          <img
            src={activity.media.url}
            alt="Shared content"
            className="w-full max-h-96 object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Actions */}
      {activity.metrics && (
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center space-x-6">
            {onLike && (
              <button
                onClick={() => onLike(activity.id)}
                className={`flex items-center space-x-2 transition-colors group ${
                  activity.metrics.hasLiked ? 'text-pink-400' : 'text-gray-400 hover:text-pink-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${activity.metrics.hasLiked ? 'fill-current' : 'group-hover:fill-current'}`} />
                <span className="text-sm font-medium">{formatNumber(activity.metrics.likes)}</span>
              </button>
            )}
            
            <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{formatNumber(activity.metrics.comments)}</span>
            </button>
            
            <button className="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-colors">
              <Share className="w-5 h-5" />
              <span className="text-sm font-medium">{formatNumber(activity.metrics.shares)}</span>
            </button>
          </div>

          {onBookmark && (
            <button
              onClick={() => onBookmark(activity.id)}
              className={`p-2 rounded-full transition-colors ${
                activity.metrics.hasBookmarked 
                  ? 'text-yellow-400 bg-yellow-400/10' 
                  : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${activity.metrics.hasBookmarked ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
      )}
    </Card>
  );
}