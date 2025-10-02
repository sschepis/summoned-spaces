import { useState, useEffect } from 'react';
import { Video, Play, Clock, Eye, User } from 'lucide-react';
import { CreateYouTubeVideoPost } from '../../types/posts';

interface YouTubeComposerProps {
  onChange: (data: Partial<CreateYouTubeVideoPost>, isValid: boolean) => void;
}

interface VideoPreview {
  videoId: string;
  url: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  channelName: string;
  channelId: string;
  viewCount?: number;
  publishedAt?: Date;
  tags?: string[];
}

export function YouTubeComposer({ onChange }: YouTubeComposerProps) {
  const [videoUrl, setVideoUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [preview, setPreview] = useState<VideoPreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const isValid = !!videoUrl && !!preview && isValidYouTubeUrl(videoUrl);
    onChange({ videoUrl, caption: caption || undefined }, isValid);
  }, [videoUrl, caption, preview, onChange]);

  const isValidYouTubeUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
    return youtubeRegex.test(url);
  };

  const extractVideoId = (url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const fetchVideoPreview = async (url: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const videoId = extractVideoId(url);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }

      // Simulate API call to YouTube Data API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate basic video preview
      const basicPreview = generateVideoPreview(videoId, url);
      setPreview(basicPreview);
    } catch {
      setError('Failed to fetch video information. Please check the URL and try again.');
      setPreview(null);
    } finally {
      setIsLoading(false);
    }
  };

  const generateVideoPreview = (videoId: string, url: string): VideoPreview => {
    // TODO: In a real implementation, this would call the YouTube Data API
    // For now, create a basic preview with the video ID and thumbnail
    return {
      videoId,
      url,
      title: 'YouTube Video',
      description: 'Video description would be fetched from YouTube API',
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      duration: '0:00',
      channelName: 'YouTube Channel',
      channelId: 'unknown',
      viewCount: undefined,
      publishedAt: new Date(),
      tags: []
    };
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setVideoUrl(newUrl);
    setPreview(null);
    setError(null);
    
    if (isValidYouTubeUrl(newUrl)) {
      fetchVideoPreview(newUrl);
    } else if (newUrl.length > 0) {
      setError('Please enter a valid YouTube URL');
    }
  };

  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCaption(e.target.value);
  };

  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="space-y-4">
      {/* YouTube URL Input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          YouTube URL:
        </label>
        <div className="relative">
          <input
            type="url"
            value={videoUrl}
            onChange={handleUrlChange}
            placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
            className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-3 py-3 text-white text-sm
                     placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
          />
          <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-400">{error}</p>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2 text-gray-400">
            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Fetching video information...</span>
          </div>
        </div>
      )}

      {/* Video Preview */}
      {preview && !isLoading && (
        <div className="bg-white/5 border border-white/20 rounded-lg overflow-hidden">
          {/* Video Thumbnail */}
          <div className="relative aspect-video bg-black">
            <img
              src={preview.thumbnailUrl}
              alt={preview.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/640x360/000000/ffffff?text=Video+Thumbnail';
              }}
            />
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
              </div>
            </div>
            {/* Duration Badge */}
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
              {preview.duration}
            </div>
          </div>

          {/* Video Info */}
          <div className="p-4">
            <h3 className="text-white font-semibold text-lg leading-snug mb-2">
              {preview.title}
            </h3>

            <div className="flex items-center space-x-2 mb-3">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300 text-sm font-medium">{preview.channelName}</span>
            </div>

            <p className="text-gray-300 text-sm leading-relaxed mb-3 line-clamp-2">
              {preview.description}
            </p>

            {/* Video Metadata */}
            <div className="flex items-center space-x-4 text-xs text-gray-400">
              {preview.viewCount && (
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{formatViewCount(preview.viewCount)} views</span>
                </div>
              )}
              {preview.publishedAt && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{preview.publishedAt.toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {preview.tags && preview.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {preview.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Caption Input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Add your thoughts (optional):
        </label>
        <textarea
          value={caption}
          onChange={handleCaptionChange}
          placeholder="Why are you sharing this video? What did you find interesting?"
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-3 text-white text-sm
                   placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400 
                   focus:border-transparent"
          rows={3}
          maxLength={280}
        />
        <div className="flex justify-between items-center mt-2">
          <div className="text-xs text-gray-400">
            Optional caption to add context or your perspective
          </div>
          <div className="text-xs text-gray-400">
            {caption.length}/280
          </div>
        </div>
      </div>

      {/* Instructions */}
      {!videoUrl && (
        <div className="text-center py-8">
          <Video className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h4 className="text-white font-medium mb-2">Share a YouTube Video</h4>
          <p className="text-gray-400 text-sm mb-2">
            Paste a YouTube URL to automatically fetch video information and thumbnail.
          </p>
          <div className="text-xs text-gray-500">
            Supports: youtube.com/watch?v=... and youtu.be/... formats
          </div>
        </div>
      )}
    </div>
  );
}