import { Heart, MessageCircle, Share, MoreHorizontal, Users } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface Post {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  spaceName: string;
  timestamp: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
  attachments?: {
    type: 'image' | 'file';
    url: string;
    name: string;
  }[];
}

interface SocialFeedCardProps {
  posts: Post[];
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
}

export function SocialFeedCard({ posts, onLike, onComment, onShare }: SocialFeedCardProps) {
  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="flex items-center space-x-2 mb-6">
        <Users className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-semibold text-white">Your Feed</h3>
        <div className="flex-1"></div>
        <div className="text-xs text-gray-400">
          {posts.length} new {posts.length === 1 ? 'post' : 'posts'}
        </div>
      </div>
      
      <div className="space-y-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="border-b border-white/10 pb-6 last:border-b-0 last:pb-0">
              {/* Post Header */}
              <div className="flex items-center space-x-3 mb-3">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-10 h-10 rounded-full border border-white/20"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium text-sm">{post.author.name}</span>
                    <span className="text-gray-400 text-xs">@{post.author.username}</span>
                    <span className="text-gray-500 text-xs">•</span>
                    <span className="text-gray-400 text-xs">{formatTimeAgo(post.timestamp)}</span>
                  </div>
                  <div className="text-xs text-cyan-400">
                    in {post.spaceName}
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <p className="text-gray-200 text-sm leading-relaxed">{post.content}</p>
                
                {/* Attachments */}
                {post.attachments && post.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {post.attachments.map((attachment, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-cyan-500/20 rounded flex items-center justify-center">
                            <span className="text-cyan-400 text-xs font-mono">
                              {attachment.type === 'image' ? '🖼️' : '📄'}
                            </span>
                          </div>
                          <div>
                            <p className="text-white text-xs font-medium">{attachment.name}</p>
                            <p className="text-gray-400 text-xs">{attachment.type}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Post Actions */}
              <div className="flex items-center space-x-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onLike(post.id)}
                  className={`flex items-center space-x-2 ${
                    post.isLiked ? 'text-pink-400' : 'text-gray-400'
                  } hover:text-pink-400 transition-colors`}
                >
                  <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                  <span className="text-xs">{post.likes}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onComment(post.id)}
                  className="flex items-center space-x-2 text-gray-400 hover:text-cyan-400 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-xs">{post.comments}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onShare(post.id)}
                  className="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-colors"
                >
                  <Share className="w-4 h-4" />
                  <span className="text-xs">Share</span>
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h4 className="text-white font-medium mb-2">No posts yet</h4>
            <p className="text-gray-400 text-sm mb-4">
              Join some spaces to see posts in your feed
            </p>
            <Button variant="secondary" size="sm">
              Discover Spaces
            </Button>
          </div>
        )}
      </div>
      
      {posts.length > 0 && (
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <Button variant="ghost" size="sm">
            Load More Posts
          </Button>
        </div>
      )}
    </Card>
  );
}