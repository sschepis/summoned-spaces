import { useState } from 'react';
import { Play, Clock, Eye, User, ExternalLink } from 'lucide-react';
import { YouTubeVideoPost } from '../../types/posts';

interface YouTubeRendererProps {
  post: YouTubeVideoPost;
  autoPlay?: boolean;
  showFullPlayer?: boolean;
}

export function YouTubeRenderer({ 
  post, 
  autoPlay = false, 
  showFullPlayer = false 
}: YouTubeRendererProps) {
  const [isPlayerVisible, setIsPlayerVisible] = useState(showFullPlayer || autoPlay);
  const [isLoading, setIsLoading] = useState(false);

  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatDuration = (duration: string): string => {
    // Duration is already formatted (e.g., "12:34")
    return duration;
  };

  const handlePlayClick = () => {
    setIsLoading(true);
    setIsPlayerVisible(true);
  };

  const handlePlayerLoad = () => {
    setIsLoading(false);
  };

  const getEmbedUrl = () => {
    const baseUrl = 'https://www.youtube.com/embed/';
    const params = new URLSearchParams({
      autoplay: autoPlay ? '1' : '0',
      rel: '0', // Don't show related videos
      modestbranding: '1', // Reduce YouTube branding
    });
    return `${baseUrl}${post.videoId}?${params.toString()}`;
  };

  return (
    <div className="space-y-3">
      {/* Caption */}
      {post.caption && (
        <div className="text-gray-200 text-sm leading-relaxed">
          {post.caption}
        </div>
      )}

      {/* Video Player/Thumbnail */}
      <div className="bg-black rounded-lg overflow-hidden">
        {isPlayerVisible ? (
          <div className="relative aspect-video">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <iframe
              src={getEmbedUrl()}
              title={post.title}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={handlePlayerLoad}
            />
          </div>
        ) : (
          <div className="relative aspect-video bg-black group cursor-pointer" onClick={handlePlayClick}>
            {/* Thumbnail */}
            <img
              src={post.thumbnailUrl}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = `https://img.youtube.com/vi/${post.videoId}/hqdefault.jpg`;
              }}
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors">
              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg 
                              group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                </div>
              </div>
              
              {/* Duration Badge */}
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                {formatDuration(post.duration)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="space-y-3">
        {/* Title */}
        <h3 className="text-white font-semibold text-lg leading-snug">
          {post.title}
        </h3>

        {/* Channel Info */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300 text-sm font-medium">{post.channelName}</span>
          </div>
          
          {/* External Link */}
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-gray-400 hover:text-red-400 transition-colors text-xs"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Watch on YouTube</span>
          </a>
        </div>

        {/* Metadata */}
        <div className="flex items-center space-x-4 text-xs text-gray-400">
          {post.metadata?.viewCount && (
            <div className="flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>{formatViewCount(post.metadata.viewCount)} views</span>
            </div>
          )}
          {post.metadata?.publishedAt && (
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{post.metadata.publishedAt.toLocaleDateString()}</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{formatDuration(post.duration)}</span>
          </div>
        </div>

        {/* Description */}
        {post.description && (
          <div className="text-gray-300 text-sm leading-relaxed">
            <p className="line-clamp-3">
              {post.description}
            </p>
          </div>
        )}

        {/* Tags */}
        {post.metadata?.tags && post.metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.metadata.tags.slice(0, 5).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded-full hover:bg-white/20 
                         transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
            {post.metadata.tags.length > 5 && (
              <span className="text-xs text-gray-400">
                +{post.metadata.tags.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Compact version for smaller spaces
export function YouTubeRendererCompact({ post }: { post: YouTubeVideoPost }) {
  return (
    <div className="space-y-2">
      {post.caption && (
        <div className="text-gray-200 text-sm">
          {post.caption}
        </div>
      )}

      <a
        href={post.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="flex space-x-3 p-3 bg-white/5 border border-white/20 rounded-lg 
                       hover:bg-white/10 transition-colors group">
          {/* Thumbnail */}
          <div className="relative w-20 h-14 bg-black rounded overflow-hidden flex-shrink-0">
            <img
              src={post.thumbnailUrl}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = `https://img.youtube.com/vi/${post.videoId}/default.jpg`;
              }}
            />
            {/* Mini play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                <Play className="w-3 h-3 text-white ml-0.5" fill="currentColor" />
              </div>
            </div>
            {/* Duration */}
            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
              {post.duration}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-medium text-sm leading-snug mb-1 group-hover:text-red-300 
                          transition-colors line-clamp-2">
              {post.title}
            </h4>
            
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <User className="w-3 h-3" />
              <span>{post.channelName}</span>
              {post.metadata?.viewCount && (
                <>
                  <span>•</span>
                  <span>{formatViewCount(post.metadata.viewCount)} views</span>
                </>
              )}
            </div>
          </div>
        </div>
      </a>
    </div>
  );
}

// Helper function for view count formatting (shared)
function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}