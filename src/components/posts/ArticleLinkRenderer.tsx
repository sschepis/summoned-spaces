import { ExternalLink, Clock, User, Eye } from 'lucide-react';
import { ArticleLinkPost } from '../../types/posts';

interface ArticleLinkRendererProps {
  post: ArticleLinkPost;
  onLinkClick?: (url: string) => void;
}

export function ArticleLinkRenderer({ post, onLinkClick }: ArticleLinkRendererProps) {
  const handleLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onLinkClick) {
      onLinkClick(post.url);
    } else {
      window.open(post.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-3">
      {/* Caption */}
      {post.caption && (
        <div className="text-gray-200 text-sm leading-relaxed">
          {post.caption}
        </div>
      )}

      {/* Link Preview Card */}
      <div 
        className="bg-white/5 border border-white/20 rounded-lg overflow-hidden hover:bg-white/10 
                   transition-colors cursor-pointer group"
        onClick={handleLinkClick}
      >
        {/* Preview Image */}
        {post.imageUrl && (
          <div className="aspect-video bg-gradient-to-r from-slate-600/20 to-slate-700/20 overflow-hidden">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {/* Site Info */}
          <div className="flex items-center space-x-2 mb-2">
            <ExternalLink className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">
              {post.siteName}
            </span>
            {post.metadata?.publishedAt && (
              <>
                <span className="text-gray-500">•</span>
                <span className="text-xs text-gray-400">
                  {post.metadata.publishedAt.toLocaleDateString()}
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="text-white font-semibold text-lg leading-snug mb-2 group-hover:text-cyan-300 transition-colors">
            {post.title}
          </h3>

          {/* Description */}
          <p className="text-gray-300 text-sm leading-relaxed mb-3 line-clamp-3">
            {post.description}
          </p>

          {/* Metadata */}
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            {post.metadata?.author && (
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>{post.metadata.author}</span>
              </div>
            )}
            {post.metadata?.readTime && (
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{post.metadata.readTime} min read</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>Click to read</span>
            </div>
          </div>

          {/* URL Display */}
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 truncate">
                {new URL(post.url).hostname}
              </span>
              <ExternalLink className="w-3 h-3 text-gray-500 flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact version for smaller spaces
export function ArticleLinkRendererCompact({ post, onLinkClick }: ArticleLinkRendererProps) {
  const handleLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onLinkClick) {
      onLinkClick(post.url);
    } else {
      window.open(post.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-2">
      {post.caption && (
        <div className="text-gray-200 text-sm">
          {post.caption}
        </div>
      )}

      <div 
        className="flex space-x-3 p-3 bg-white/5 border border-white/20 rounded-lg 
                   hover:bg-white/10 transition-colors cursor-pointer group"
        onClick={handleLinkClick}
      >
        {/* Thumbnail */}
        {post.imageUrl && (
          <div className="w-16 h-16 bg-gradient-to-r from-slate-600/20 to-slate-700/20 rounded overflow-hidden flex-shrink-0">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <ExternalLink className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400 uppercase tracking-wide">
              {post.siteName}
            </span>
          </div>
          
          <h4 className="text-white font-medium text-sm leading-snug mb-1 group-hover:text-cyan-300 transition-colors line-clamp-2">
            {post.title}
          </h4>
          
          <p className="text-gray-400 text-xs line-clamp-1">
            {post.description}
          </p>
        </div>
      </div>
    </div>
  );
}