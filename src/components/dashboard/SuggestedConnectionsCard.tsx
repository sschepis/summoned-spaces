import { useState } from 'react';
import {
  Users, Search, Star, MessageCircle, Globe,
  UserPlus, ChevronRight, Sparkles, TrendingUp,
  Eye, Heart, Zap, MapPin, Clock, RefreshCw
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { User } from '../../types/common';

interface SuggestedUser extends User {
  suggestedReason?: string;
  mutualConnections?: number;
  sharedSpaces?: number;
  activityScore?: number;
  lastSeen?: Date;
  location?: string;
  posts?: number;
  followers?: number;
  isOnline?: boolean;
}

interface SuggestedConnectionsCardProps {
  suggestedUsers: SuggestedUser[];
  onFollowToggle: (userId: string) => void;
  onUserClick?: (userId: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function SuggestedConnectionsCard({
  suggestedUsers,
  onFollowToggle,
  onUserClick,
  onRefresh,
  isLoading = false
}: SuggestedConnectionsCardProps) {
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  
  const displayUsers = showAll ? suggestedUsers : suggestedUsers.slice(0, 4);
  
  const getSuggestionIcon = (reason?: string) => {
    switch (reason) {
      case 'mutual_connections': return <Users className="w-3 h-3 text-blue-400" />;
      case 'shared_spaces': return <Globe className="w-3 h-3 text-green-400" />;
      case 'similar_interests': return <Heart className="w-3 h-3 text-pink-400" />;
      case 'trending': return <TrendingUp className="w-3 h-3 text-orange-400" />;
      default: return <Star className="w-3 h-3 text-yellow-400" />;
    }
  };

  const getSuggestionText = (user: SuggestedUser) => {
    switch (user.suggestedReason) {
      case 'mutual_connections':
        return `${user.mutualConnections} mutual connections`;
      case 'shared_spaces':
        return `${user.sharedSpaces} shared spaces`;
      case 'similar_interests':
        return 'Similar interests';
      case 'trending':
        return 'Trending in your network';
      default:
        return 'Suggested for you';
    }
  };

  const formatLastSeen = (lastSeen?: Date) => {
    if (!lastSeen) return 'Recently active';
    
    const now = new Date();
    const diff = now.getTime() - lastSeen.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 5) return 'Online now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return lastSeen.toLocaleDateString();
  };

  if (suggestedUsers.length === 0) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-pink-400" />
            <h3 className="text-lg font-semibold text-white">Suggested Connections</h3>
          </div>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="text-gray-400 hover:text-pink-400"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
        
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h4 className="text-white font-medium mb-2">No suggestions available</h4>
          <p className="text-gray-400 text-sm mb-4">
            We're looking for people you might want to connect with
          </p>
          <Button variant="secondary" size="sm" icon={Search}>
            Discover People
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-pink-400" />
          <h3 className="text-lg font-semibold text-white">Suggested Connections</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-xs text-gray-400">
            {suggestedUsers.length} suggestions
          </div>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="text-gray-400 hover:text-pink-400"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {displayUsers.map((suggestedUser) => (
          <div
            key={suggestedUser.id}
            className="group relative p-3 rounded-lg bg-white/5 hover:bg-white/10
                     transition-all duration-200 cursor-pointer border border-transparent
                     hover:border-white/20 hover:scale-[1.02]"
            onMouseEnter={() => setHoveredUser(suggestedUser.id)}
            onMouseLeave={() => setHoveredUser(null)}
            onClick={() => onUserClick?.(suggestedUser.id)}
          >
            <div className="flex items-start space-x-3">
              <div className="relative">
                <img
                  src={suggestedUser.avatar}
                  alt={suggestedUser.name}
                  className="w-12 h-12 rounded-full border border-white/20 transition-transform
                           group-hover:scale-110"
                />
                {suggestedUser.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full
                                border-2 border-black animate-pulse"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="text-white text-sm font-medium truncate group-hover:text-pink-300 transition-colors">
                    {suggestedUser.name}
                  </p>
                  {getSuggestionIcon(suggestedUser.suggestedReason)}
                </div>
                
                <div className="flex items-center space-x-2 text-xs text-gray-400 mb-1">
                  <span>{getSuggestionText(suggestedUser)}</span>
                </div>
                
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  {suggestedUser.posts !== undefined && (
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{suggestedUser.posts}</span>
                    </div>
                  )}
                  {suggestedUser.followers !== undefined && (
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{suggestedUser.followers}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatLastSeen(suggestedUser.lastSeen)}</span>
                  </div>
                </div>

                {suggestedUser.location && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>{suggestedUser.location}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-1">
                <Button
                  variant={suggestedUser.isFollowing ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFollowToggle(suggestedUser.id);
                  }}
                  className="transition-all duration-200 hover:scale-105"
                >
                  {suggestedUser.isFollowing ? (
                    <>
                      <Users className="w-3 h-3 mr-1" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3 mr-1" />
                      Follow
                    </>
                  )}
                </Button>
                
                {hoveredUser === suggestedUser.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUserClick?.(suggestedUser.id);
                    }}
                    className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Activity Score Indicator */}
            {suggestedUser.activityScore !== undefined && (
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  <Zap className="w-3 h-3" />
                  <span>Activity score</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-white/10 rounded-full h-1">
                    <div
                      className="h-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${(suggestedUser.activityScore / 100) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-pink-400 font-medium">
                    {suggestedUser.activityScore}%
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Show All/Less Toggle */}
        {suggestedUsers.length > 4 && (
          <Button
            variant="ghost"
            className="w-full mt-3 hover:scale-105 transition-transform"
            onClick={() => setShowAll(!showAll)}
          >
            <div className="flex items-center space-x-2">
              <span>{showAll ? 'Show Less' : `Show All ${suggestedUsers.length} Suggestions`}</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${showAll ? 'rotate-90' : ''}`} />
            </div>
          </Button>
        )}
        
        {/* Discover More Button */}
        <div className="pt-4 border-t border-white/10">
          <Button
            variant="secondary"
            icon={Search}
            className="w-full hover:scale-105 transition-transform"
          >
            Discover More People
          </Button>
        </div>
      </div>
    </Card>
  );
}