import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FlexibleSocialFeedCard } from './dashboard/FlexibleSocialFeedCard';
import { PostComposer } from './posts/PostComposer';
import { Post, PostType, RichTextPost, BinaryFilePost, CreatePost, CreateRichTextPost, CreateBinaryFilePost } from '../types/posts';
import { Card } from './ui/Card';
import { MessageSquare, Plus, X } from 'lucide-react';

interface SpacePostsProps {
  spaceId: string;
  spaceName: string;
  isUserMember: boolean;
}

export function SpacePosts({ spaceId, spaceName, isUserMember }: SpacePostsProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [showComposer, setShowComposer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading space posts
    const loadSpacePosts = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate sample space posts
      const spacePosts: Post[] = [
        {
          id: `space-post-1`,
          type: PostType.RICH_TEXT,
          author: {
            id: 'space-user-1',
            name: 'Alice Quantum',
            username: 'alice_q',
            avatar: 'https://api.dicebear.com/8.x/bottts/svg?seed=alice_space'
          },
          spaceId: spaceId,
          spaceName: spaceName,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          likes: 8,
          comments: 3,
          shares: 1,
          isLiked: false,
          content: `Welcome to ${spaceName}! 🚀 Excited to collaborate and share knowledge here. Looking forward to seeing what amazing projects we build together! #collaboration #innovation`,
          mentions: [],
          hashtags: [
            {
              id: 'tag-collab',
              tag: 'collaboration',
              position: 140,
              length: 13
            },
            {
              id: 'tag-innovation',
              tag: 'innovation',
              position: 155,
              length: 10
            }
          ],
          formatting: {
            bold: [],
            italic: [],
            code: [],
            links: []
          }
        } as RichTextPost,
        {
          id: `space-post-2`,
          type: PostType.BINARY_FILE,
          author: {
            id: 'space-user-2',
            name: 'Bob Engineer',
            username: 'bob_eng',
            avatar: 'https://api.dicebear.com/8.x/bottts/svg?seed=bob_space'
          },
          spaceId: spaceId,
          spaceName: spaceName,
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          likes: 12,
          comments: 5,
          shares: 3,
          isLiked: true,
          caption: 'Sharing the latest project documentation and specs. Please review and let me know your thoughts!',
          files: [
            {
              id: 'space-file-1',
              name: 'project-specs.pdf',
              type: 'application/pdf',
              size: 1536000, // 1.5MB
              url: '/space-docs/project-specs.pdf',
              mimeType: 'application/pdf',
              previewUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
              metadata: {
                pages: 18,
                title: 'Project Specifications Document'
              }
            }
          ]
        } as BinaryFilePost
      ];
      
      setPosts(spacePosts);
      setIsLoading(false);
    };

    loadSpacePosts();
  }, [spaceId, spaceName]);

  const handleCreatePost = (postData: CreatePost, type: PostType) => {
    if (!user) return;

    const basePost = {
      id: `space-post-${Date.now()}`,
      author: {
        id: user.id,
        name: user.name || 'You',
        username: user.username || 'you',
        avatar: user.avatar || 'https://api.dicebear.com/8.x/bottts/svg?seed=you'
      },
      spaceId,
      spaceName,
      timestamp: new Date(),
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false
    };

    let newPost: Post;

    switch (type) {
      case PostType.RICH_TEXT: {
        const richTextData = postData as CreateRichTextPost;
        newPost = {
          ...basePost,
          type: PostType.RICH_TEXT,
          content: richTextData.content,
          mentions: richTextData.mentions || [],
          hashtags: richTextData.hashtags || [],
          formatting: richTextData.formatting || {
            bold: [],
            italic: [],
            code: [],
            links: []
          }
        } as RichTextPost;
        break;
      }
      
      case PostType.BINARY_FILE: {
        const fileData = postData as CreateBinaryFilePost;
        newPost = {
          ...basePost,
          type: PostType.BINARY_FILE,
          caption: fileData.caption,
          files: fileData.files.map((file, index) => ({
            id: `file-${basePost.id}-${index}`,
            name: file.name,
            type: file.type,
            size: file.size,
            url: URL.createObjectURL(file),
            mimeType: file.type,
            previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
            metadata: {
              uploadedAt: new Date()
            }
          }))
        } as BinaryFilePost;
        break;
      }
      
      default:
        // Fallback to rich text
        newPost = {
          ...basePost,
          type: PostType.RICH_TEXT,
          content: 'New post',
          mentions: [],
          hashtags: [],
          formatting: {
            bold: [],
            italic: [],
            code: [],
            links: []
          }
        } as RichTextPost;
    }

    setPosts(prev => [newPost, ...prev]);
    setShowComposer(false);
  };

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post =>
      post.id === postId
        ? {
            ...post,
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const handleComment = (postId: string) => {
    console.log('Comment on post:', postId);
    // TODO: Implement comment functionality
  };

  const handleShare = (postId: string) => {
    console.log('Share post:', postId);
    // TODO: Implement share functionality
  };

  if (!isUserMember) {
    return (
      <div className="text-center py-16">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8 max-w-md mx-auto">
          <MessageSquare className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Join to See Posts</h3>
          <p className="text-gray-400">
            You need to be a member of this space to view and create posts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Post Composer */}
      {showComposer ? (
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Create Post in {spaceName}</h3>
            <button
              onClick={() => setShowComposer(false)}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <PostComposer
            spaces={[{
              id: spaceId,
              name: spaceName,
              description: '',
              isPublic: false,
              memberCount: 1,
              tags: []
            }]}
            defaultSpace={spaceId}
            onPost={handleCreatePost}
            onCancel={() => setShowComposer(false)}
          />
        </Card>
      ) : (
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
          <button
            onClick={() => setShowComposer(true)}
            className="w-full p-4 text-left text-gray-400 hover:text-white transition-colors
                     hover:bg-white/5 rounded-lg border border-white/10 border-dashed
                     flex items-center space-x-3"
          >
            <Plus className="w-5 h-5" />
            <span>Share something with {spaceName}...</span>
          </button>
        </Card>
      )}

      {/* Posts Feed */}
      <FlexibleSocialFeedCard
        posts={posts}
        onLike={handleLike}
        onComment={handleComment}
        onShare={handleShare}
        isLoading={isLoading}
        hasMore={false}
      />
    </div>
  );
}