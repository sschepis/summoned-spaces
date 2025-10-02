import { useState } from 'react';
import { Users, Filter, ChevronDown } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { PostRenderer } from '../posts/PostRenderer';
import { Post, PostType, PostFilter } from '../../types/posts';

interface FlexibleSocialFeedCardProps {
  posts: Post[];
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
  onAuthorClick?: (authorId: string) => void;
  onSpaceClick?: (spaceId: string) => void;
  onLoadMore?: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
}

const postTypeLabels: Record<PostType, string> = {
  [PostType.RICH_TEXT]: 'Text Posts',
  [PostType.ARTICLE_LINK]: 'Articles',
  [PostType.YOUTUBE_VIDEO]: 'Videos',
  [PostType.BINARY_FILE]: 'Files'
};

export function FlexibleSocialFeedCard({
  posts,
  onLike,
  onComment,
  onShare,
  onAuthorClick,
  onSpaceClick,
  onLoadMore,
  isLoading = false,
  hasMore = true
}: FlexibleSocialFeedCardProps) {
  const [filter, setFilter] = useState<PostFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  
  // Apply filters to posts
  const filteredPosts = posts.filter(post => {
    if (filter.types && filter.types.length > 0 && !filter.types.includes(post.type)) {
      return false;
    }
    if (filter.spaceIds && filter.spaceIds.length > 0 && !filter.spaceIds.includes(post.spaceId)) {
      return false;
    }
    if (filter.authorIds && filter.authorIds.length > 0 && !filter.authorIds.includes(post.author.id)) {
      return false;
    }
    if (filter.dateRange) {
      const postDate = new Date(post.timestamp);
      if (postDate < filter.dateRange.start || postDate > filter.dateRange.end) {
        return false;
      }
    }
    if (filter.hasAttachments !== undefined) {
      const hasAttachments = post.type === PostType.BINARY_FILE ||
                            post.type === PostType.YOUTUBE_VIDEO ||
                            (post.type === PostType.ARTICLE_LINK && post.imageUrl);
      if (filter.hasAttachments !== hasAttachments) {
        return false;
      }
    }
    return true;
  });

  const togglePostTypeFilter = (type: PostType) => {
    setFilter(prev => {
      const currentTypes = prev.types || [];
      const newTypes = currentTypes.includes(type)
        ? currentTypes.filter(t => t !== type)
        : [...currentTypes, type];
      
      return {
        ...prev,
        types: newTypes.length === 0 ? undefined : newTypes
      };
    });
  };

  const clearFilters = () => {
    setFilter({});
  };

  const getPostTypeStats = () => {
    const stats: Record<PostType, number> = {
      [PostType.RICH_TEXT]: 0,
      [PostType.ARTICLE_LINK]: 0,
      [PostType.YOUTUBE_VIDEO]: 0,
      [PostType.BINARY_FILE]: 0
    };
    
    posts.forEach(post => {
      stats[post.type]++;
    });
    
    return stats;
  };

  const postTypeStats = getPostTypeStats();
  const activeFilters = (filter.types?.length || 0) + 
                       (filter.spaceIds?.length || 0) + 
                       (filter.authorIds?.length || 0) +
                       (filter.dateRange ? 1 : 0) +
                       (filter.hasAttachments !== undefined ? 1 : 0);

  return (
    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Your Feed</h3>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-xs text-gray-400">
            {filteredPosts.length} of {posts.length} posts
          </div>
          
          {/* Filter Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 ${
              activeFilters > 0 ? 'text-cyan-400' : 'text-gray-400'
            }`}
          >
            <Filter className="w-4 h-4" />
            {activeFilters > 0 && (
              <span className="bg-cyan-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilters}
              </span>
            )}
            <ChevronDown className={`w-3 h-3 transition-transform ${
              showFilters ? 'rotate-180' : ''
            }`} />
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-white">Filter Posts</h4>
            {activeFilters > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            )}
          </div>
          
          {/* Post Type Filters */}
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 font-medium mb-2 block">Post Types:</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(postTypeLabels).map(([type, label]) => {
                  const count = postTypeStats[type as PostType];
                  const isActive = filter.types?.includes(type as PostType) || false;
                  
                  return (
                    <button
                      key={type}
                      onClick={() => togglePostTypeFilter(type as PostType)}
                      disabled={count === 0}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : count > 0
                          ? 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
                          : 'bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed'
                      }`}
                    >
                      {label} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Quick Filters */}
            <div className="flex items-center space-x-4 pt-2 border-t border-white/10">
              <button
                onClick={() => setFilter(prev => ({
                  ...prev,
                  hasAttachments: prev.hasAttachments === true ? undefined : true
                }))}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  filter.hasAttachments === true
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                With Media
              </button>
              <button
                onClick={() => setFilter(prev => ({
                  ...prev,
                  hasAttachments: prev.hasAttachments === false ? undefined : false
                }))}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  filter.hasAttachments === false
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Text Only
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Posts Feed */}
      <div className="space-y-6">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <PostRenderer
              key={post.id}
              post={post}
              onLike={onLike}
              onComment={onComment}
              onShare={onShare}
              onAuthorClick={onAuthorClick}
              onSpaceClick={onSpaceClick}
            />
          ))
        ) : posts.length > 0 ? (
          // Has posts but all filtered out
          <div className="text-center py-12">
            <Filter className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h4 className="text-white font-medium mb-2">No posts match your filters</h4>
            <p className="text-gray-400 text-sm mb-4">
              Try adjusting your filters to see more content
            </p>
            <Button variant="secondary" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        ) : (
          // No posts at all
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h4 className="text-white font-medium mb-2">No posts yet</h4>
            <p className="text-gray-400 text-sm mb-4">
              Join some spaces or follow people to see posts in your feed
            </p>
            <Button variant="secondary" size="sm">
              Discover Spaces
            </Button>
          </div>
        )}
      </div>
      
      {/* Load More */}
      {filteredPosts.length > 0 && hasMore && (
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoadMore}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Loading...</span>
              </div>
            ) : (
              'Load More Posts'
            )}
          </Button>
        </div>
      )}
    </Card>
  );
}