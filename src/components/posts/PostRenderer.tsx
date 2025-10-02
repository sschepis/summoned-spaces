import { Heart, MessageCircle, Share, MoreHorizontal, Clock } from 'lucide-react';
import { Post, PostType } from '../../types/posts';
import { Button } from '../ui/Button';
import { RichTextRenderer } from './RichTextRenderer';
import { ArticleLinkRenderer } from './ArticleLinkRenderer';
import { YouTubeRenderer } from './YouTubeRenderer';
import { BinaryFileRenderer } from './BinaryFileRenderer';

interface PostRendererProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
  onAuthorClick?: (authorId: string) => void;
  onSpaceClick?: (spaceId: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export function PostRenderer({
  post,
  onLike,
  onComment,
  onShare,
  onAuthorClick,
  onSpaceClick,
  showActions = true,
  compact = false
}: PostRendererProps) {
  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const renderPostContent = () => {
    switch (post.type) {
      case PostType.RICH_TEXT:
        return <RichTextRenderer post={post} />;
      case PostType.ARTICLE_LINK:
        return <ArticleLinkRenderer post={post} />;
      case PostType.YOUTUBE_VIDEO:
        return <YouTubeRenderer post={post} />;
      case PostType.BINARY_FILE:
        return <BinaryFileRenderer post={post} />;
      default:
        return <div className="text-gray-400 text-sm">Unsupported post type</div>;
    }
  };

  return (
    <article className={`border-b border-white/10 ${compact ? 'pb-4' : 'pb-6'} last:border-b-0 last:pb-0`}>
      {/* Post Header */}
      <header className={`flex items-center space-x-3 ${compact ? 'mb-2' : 'mb-3'}`}>
        <button
          onClick={() => onAuthorClick?.(post.author.id)}
          className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
        >
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-full border border-white/20`}
          />
          <div className="text-left">
            <div className="flex items-center space-x-2">
              <span className={`text-white font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
                {post.author.name}
              </span>
              <span className={`text-gray-400 ${compact ? 'text-xs' : 'text-xs'}`}>
                @{post.author.username}
              </span>
              <span className="text-gray-500 text-xs">•</span>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className={`text-gray-400 ${compact ? 'text-xs' : 'text-xs'}`}>
                  {formatTimeAgo(post.timestamp)}
                </span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSpaceClick?.(post.spaceId);
              }}
              className={`text-cyan-400 hover:text-cyan-300 transition-colors ${compact ? 'text-xs' : 'text-xs'}`}
            >
              in {post.spaceName}
            </button>
          </div>
        </button>
        
        <div className="flex-1"></div>
        
        {!compact && (
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        )}
      </header>

      {/* Post Content */}
      <main className={compact ? 'mb-2' : 'mb-4'}>
        {renderPostContent()}
      </main>

      {/* Post Actions */}
      {showActions && (
        <footer className="flex items-center space-x-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(post.id)}
            className={`flex items-center space-x-2 ${
              post.isLiked ? 'text-pink-400' : 'text-gray-400'
            } hover:text-pink-400 transition-colors group`}
          >
            <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''} group-hover:scale-110 transition-transform`} />
            <span className={compact ? 'text-xs' : 'text-sm'}>{post.likes}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onComment(post.id)}
            className="flex items-center space-x-2 text-gray-400 hover:text-cyan-400 transition-colors group"
          >
            <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className={compact ? 'text-xs' : 'text-sm'}>{post.comments}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onShare(post.id)}
            className="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-colors group"
          >
            <Share className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className={compact ? 'text-xs' : 'text-sm'}>
              {post.shares > 0 ? post.shares : 'Share'}
            </span>
          </Button>

          {/* Bookmark */}
          {post.isBookmarked !== undefined && (
            <Button
              variant="ghost"
              size="sm"
              className={`ml-auto ${
                post.isBookmarked ? 'text-yellow-400' : 'text-gray-400'
              } hover:text-yellow-400 transition-colors`}
            >
              <svg className="w-4 h-4" fill={post.isBookmarked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </Button>
          )}
        </footer>
      )}
    </article>
  );
}