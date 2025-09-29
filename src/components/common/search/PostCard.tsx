import { Heart, MessageCircle, Share } from 'lucide-react';
import { Card } from '../../ui/Card';
import { UserAvatar } from '../../ui/UserAvatar';
import { Badge } from '../../ui/Badge';

export interface PostResult {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  hasLiked: boolean;
  space?: string;
  media?: {
    type: 'image' | 'video' | 'audio';
    url: string;
    thumbnail?: string;
  };
  tags: string[];
}

interface PostCardProps {
  post: PostResult;
  onLike: (postId: string) => void;
}

export function PostCard({ post, onLike }: PostCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <Card hover>
      <div className="flex items-start space-x-4">
        <UserAvatar
          src={post.author.avatar}
          name={post.author.name}
          size="lg"
          verified={post.author.verified}
        />

        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-semibold text-white">{post.author.name}</span>
            <span className="text-sm text-gray-400">{post.author.username}</span>
            <span className="text-sm text-gray-500">•</span>
            <span className="text-sm text-gray-500">{post.timestamp}</span>
            {post.space && (
              <>
                <span className="text-sm text-gray-500">in</span>
                <span className="text-sm text-purple-300">{post.space}</span>
              </>
            )}
          </div>

          <p className="text-white mb-4 leading-relaxed">{post.content}</p>

          {post.media && (
            <div className="mb-4 rounded-lg overflow-hidden">
              <img
                src={post.media.url}
                alt="Post media"
                className="w-full max-h-64 object-cover"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => onLike(post.id)}
                className={`flex items-center space-x-2 transition-colors ${
                  post.hasLiked ? 'text-pink-400' : 'text-gray-400 hover:text-pink-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${post.hasLiked ? 'fill-current' : ''}`} />
                <span className="text-sm">{formatNumber(post.likes)}</span>
              </button>
              
              <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">{formatNumber(post.comments)}</span>
              </button>
              
              <button className="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-colors">
                <Share className="w-5 h-5" />
                <span className="text-sm">{formatNumber(post.shares)}</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="purple" size="sm">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}