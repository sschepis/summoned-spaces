import { useState, useEffect } from 'react';
import { Link, ExternalLink, Image, Clock, User } from 'lucide-react';
import { CreateArticleLinkPost } from '../../types/posts';

interface ArticleLinkComposerProps {
  onChange: (data: Partial<CreateArticleLinkPost>, isValid: boolean) => void;
}

interface LinkPreview {
  url: string;
  title: string;
  description: string;
  imageUrl?: string;
  siteName: string;
  author?: string;
  publishedAt?: Date;
  readTime?: number;
}

export function ArticleLinkComposer({ onChange }: ArticleLinkComposerProps) {
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [preview, setPreview] = useState<LinkPreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const isValid = !!url && isValidUrl(url) && !!preview;
    onChange({ url, caption: caption || undefined }, isValid);
  }, [url, caption, preview, onChange]);

  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const fetchLinkPreview = async (urlToFetch: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call to fetch link metadata
      // In real implementation, this would call your backend service
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      
      // Generate basic preview data - TODO: implement real link scraping
      const basicPreview = generateBasicPreview(urlToFetch);
      setPreview(basicPreview);
    } catch {
      setError('Failed to fetch link preview. Please check the URL and try again.');
      setPreview(null);
    } finally {
      setIsLoading(false);
    }
  };

  const generateBasicPreview = (urlString: string): LinkPreview => {
    const url = new URL(urlString);
    const domain = url.hostname.replace('www.', '');
    
    // TODO: In a real implementation, this would scrape the URL for Open Graph tags
    // or use a service like Microlink or similar to get real metadata
    return {
      url: urlString,
      title: `Article from ${domain}`,
      description: 'Article description would be fetched from Open Graph meta tags',
      siteName: domain,
      author: undefined,
      imageUrl: undefined,
      publishedAt: new Date(),
      readTime: undefined
    };
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    setPreview(null);
    setError(null);
    
    if (isValidUrl(newUrl)) {
      fetchLinkPreview(newUrl);
    }
  };

  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCaption(e.target.value);
  };

  return (
    <div className="space-y-4">
      {/* URL Input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Article URL:
        </label>
        <div className="relative">
          <input
            type="url"
            value={url}
            onChange={handleUrlChange}
            placeholder="https://example.com/article"
            className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-3 py-3 text-white text-sm
                     placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
          />
          <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-400">{error}</p>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2 text-gray-400">
            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Fetching link preview...</span>
          </div>
        </div>
      )}

      {/* Link Preview */}
      {preview && !isLoading && (
        <div className="bg-white/5 border border-white/20 rounded-lg overflow-hidden">
          {/* Preview Image */}
          {preview.imageUrl && (
            <div className="aspect-video bg-gradient-to-r from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
              <img
                src={preview.imageUrl}
                alt={preview.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Image className="w-12 h-12 text-white/50" />
              </div>
            </div>
          )}

          {/* Preview Content */}
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <ExternalLink className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400 uppercase tracking-wide">
                {preview.siteName}
              </span>
            </div>

            <h3 className="text-white font-semibold text-lg leading-snug mb-2">
              {preview.title}
            </h3>

            <p className="text-gray-300 text-sm leading-relaxed mb-3">
              {preview.description}
            </p>

            {/* Metadata */}
            <div className="flex items-center space-x-4 text-xs text-gray-400">
              {preview.author && (
                <div className="flex items-center space-x-1">
                  <User className="w-3 h-3" />
                  <span>{preview.author}</span>
                </div>
              )}
              {preview.readTime && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{preview.readTime} min read</span>
                </div>
              )}
              {preview.publishedAt && (
                <span>{preview.publishedAt.toLocaleDateString()}</span>
              )}
            </div>
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
          placeholder="What do you think about this article? Why are you sharing it?"
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
      {!url && (
        <div className="text-center py-8">
          <Link className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h4 className="text-white font-medium mb-2">Share an Article</h4>
          <p className="text-gray-400 text-sm">
            Paste a URL to automatically generate a preview with title, description, and image.
          </p>
        </div>
      )}
    </div>
  );
}