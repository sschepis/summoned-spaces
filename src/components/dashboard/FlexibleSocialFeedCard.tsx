import { useState, useMemo } from 'react';
import {
  Users, Filter, ChevronDown, TrendingUp, Clock, Heart,
  MessageCircle, Share2, Bookmark, BarChart3, Zap,
  SortAsc, SortDesc, RefreshCw, Search, Settings
} from 'lucide-react';
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
  lastUpdated?: Date;
  onRefresh?: () => void;
  onBookmark?: (postId: string) => void;
}

type SortOption = 'newest' | 'oldest' | 'trending' | 'engagement';

const postTypeLabels: Record<PostType, string> = {
  [PostType.RICH_TEXT]: 'Text Posts',
  [PostType.ARTICLE_LINK]: 'Articles',
  [PostType.YOUTUBE_VIDEO]: 'Videos',
  [PostType.BINARY_FILE]: 'Files'
};

const sortOptions = [
  { value: 'newest' as SortOption, label: 'Newest First', icon: Clock },
  { value: 'trending' as SortOption, label: 'Trending', icon: TrendingUp },
  { value: 'engagement' as SortOption, label: 'Most Engaged', icon: Heart },
  { value: 'oldest' as SortOption, label: 'Oldest First', icon: SortAsc }
];

export function FlexibleSocialFeedCard({
  posts,
  onLike,
  onComment,
  onShare,
  onAuthorClick,
  onSpaceClick,
  onLoadMore,
  isLoading = false,
  hasMore = true,
  lastUpdated,
  onRefresh,
  onBookmark
}: FlexibleSocialFeedCardProps) {
  const [filter, setFilter] = useState<PostFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Enhanced filtering and sorting
  const processedPosts = useMemo(() => {
    const filtered = posts.filter(post => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const postContent = post.type === PostType.RICH_TEXT ? (post as { content: string }).content :
                           post.type === PostType.ARTICLE_LINK ? (post as { title: string }).title :
                           post.type === PostType.YOUTUBE_VIDEO ? (post as { title: string }).title :
                           (post as { fileName?: string }).fileName || '';
        
        const searchableText = [
          postContent,
          post.author.name,
          post.author.username,
          post.spaceId
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(query)) {
          return false;
        }
      }
      
      // Existing filters
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

    // Sort posts
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'oldest':
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        case 'trending': {
          // Calculate trending score based on recent engagement
          const scoreA = (a.likes + a.comments) / Math.max(1, Math.floor((Date.now() - new Date(a.timestamp).getTime()) / (1000 * 60 * 60)));
          const scoreB = (b.likes + b.comments) / Math.max(1, Math.floor((Date.now() - new Date(b.timestamp).getTime()) / (1000 * 60 * 60)));
          return scoreB - scoreA;
        }
        case 'engagement':
          return (b.likes + b.comments) - (a.likes + a.comments);
        default:
          return 0;
      }
    });
  }, [posts, filter, sortBy, searchQuery]);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
  };

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
                       (filter.hasAttachments !== undefined ? 1 : 0) +
                       (searchQuery ? 1 : 0);

  const formatLastUpdated = () => {
    if (!lastUpdated) return null;
    const now = new Date();
    const diff = now.getTime() - lastUpdated.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return lastUpdated.toLocaleDateString();
  };

  return (
    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Your Feed</h3>
          {lastUpdated && (
            <span className="text-xs text-gray-400">
              • Updated {formatLastUpdated()}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-xs text-gray-400">
            {processedPosts.length} of {posts.length} posts
          </div>
          
          {/* Search Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSearch(!showSearch)}
            className={`${searchQuery ? 'text-cyan-400' : 'text-gray-400'}`}
          >
            <Search className="w-4 h-4" />
          </Button>
          
          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white
                     focus:outline-none focus:ring-1 focus:ring-cyan-400"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value} className="bg-slate-800">
                {option.label}
              </option>
            ))}
          </select>
          
          {/* Refresh Button */}
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-gray-400 hover:text-cyan-400"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          )}
          
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

      {/* Search Bar */}
      {showSearch && (
        <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts by content, author, or space..."
              className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white text-sm
                       placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                ×
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Feed Stats */}
      {processedPosts.length > 0 && (
        <div className="mb-4 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <BarChart3 className="w-3 h-3" />
              <span>Sorted by {sortOptions.find(s => s.value === sortBy)?.label}</span>
            </div>
            {searchQuery && (
              <div className="flex items-center space-x-1">
                <Search className="w-3 h-3" />
                <span>"{searchQuery}"</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <span>{processedPosts.reduce((sum, post) => sum + post.likes, 0)} total likes</span>
            <span>{processedPosts.reduce((sum, post) => sum + post.comments, 0)} total comments</span>
          </div>
        </div>
      )}

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
      
      {/* Enhanced Posts Feed */}
      <div className="space-y-6">
        {processedPosts.length > 0 ? (
          processedPosts.map((post: Post) => (
            <div key={post.id} className="group relative">
              <PostRenderer
                post={post}
                onLike={onLike}
                onComment={onComment}
                onShare={onShare}
                onAuthorClick={onAuthorClick}
                onSpaceClick={onSpaceClick}
              />
              
              {/* Bookmark button */}
              {onBookmark && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onBookmark(post.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity
                           text-gray-400 hover:text-yellow-400"
                >
                  <Bookmark className="w-4 h-4" />
                </Button>
              )}
              
              {/* Enhanced interaction stats */}
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <Heart className="w-3 h-3" />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="w-3 h-3" />
                    <span>{post.comments}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Share2 className="w-3 h-3" />
                    <span>{post.shares || 0}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(post.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))
        ) : posts.length > 0 ? (
          // Has posts but all filtered out
          <div className="text-center py-12">
            <Filter className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h4 className="text-white font-medium mb-2">No posts match your criteria</h4>
            <p className="text-gray-400 text-sm mb-4">
              {searchQuery ? `No posts found for "${searchQuery}"` : 'Try adjusting your filters to see more content'}
            </p>
            <div className="flex items-center justify-center space-x-2">
              {searchQuery && (
                <Button variant="secondary" size="sm" onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
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
      
      {/* Enhanced Load More */}
      {processedPosts.length > 0 && hasMore && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-gray-400">
              Showing {processedPosts.length} posts
            </div>
            <div className="text-xs text-gray-400">
              {posts.length - processedPosts.length > 0 &&
                `${posts.length - processedPosts.length} filtered out`}
            </div>
          </div>
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLoadMore}
              disabled={isLoading}
              className="hover:scale-105 transition-transform"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading more posts...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>Load More Posts</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}