import { UserPlus, UserCheck, Star, Zap } from 'lucide-react';
import { UserAvatar } from '../ui/UserAvatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { User } from '../../types/common';

interface UserCardProps {
  user: User;
  onFollow: (userId: string) => void;
  size?: 'sm' | 'md' | 'lg';
  showStats?: boolean;
  showActivity?: boolean;
  showTags?: boolean;
}

export function UserCard({ 
  user, 
  onFollow, 
  size = 'md',
  showStats = true,
  showActivity = true,
  showTags = true 
}: UserCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const avatarSize = size === 'sm' ? 'md' : size === 'lg' ? 'xl' : 'lg';
  
  return (
    <Card hover className="group">
      <div className="flex items-start space-x-4">
        <UserAvatar
          src={user.avatar}
          name={user.name}
          size={avatarSize}
          verified={user.isVerified}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-white">{user.name}</h3>
              <p className="text-sm text-gray-400">{user.username}</p>
            </div>
            <Button
              size="sm"
              variant={user.isFollowing ? 'success' : 'secondary'}
              icon={user.isFollowing ? UserCheck : UserPlus}
              onClick={() => onFollow(user.id)}
            >
              {user.isFollowing ? 'Following' : 'Follow'}
            </Button>
          </div>

          <p className="text-gray-300 text-sm mb-4 leading-relaxed line-clamp-2">
            {user.bio}
          </p>

          {showStats && (
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-sm font-bold text-white">{formatNumber(user.stats.followers)}</div>
                <div className="text-xs text-gray-400">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-white">{user.stats.following}</div>
                <div className="text-xs text-gray-400">Following</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-white">{user.stats.spaces}</div>
                <div className="text-xs text-gray-400">Spaces</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-cyan-400">
                  {(user.stats.resonanceScore * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-gray-400">Resonance</div>
              </div>
            </div>
          )}

          {showActivity && (
            <div className="mb-4">
              <div className="flex items-center space-x-1 mb-1">
                <Star className="w-3 h-3 text-yellow-400" />
                <span className="text-xs text-gray-400">Recent Activity</span>
              </div>
              <p className="text-sm text-gray-300">{user.recentActivity}</p>
            </div>
          )}

          {showTags && user.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {user.tags.map((tag) => (
                <Badge key={tag} variant="blue" size="sm">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}