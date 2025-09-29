import { useState } from 'react';
import { User } from 'lucide-react';
import { ContentComposer } from './ContentComposer';
import { ActivityCard } from './common/ActivityCard';
import { FeedLayout } from './layouts/FeedLayout';
import { UserNetworkSidebar } from './UserNetworkSidebar';
import { ActivityItem } from '../types/common';

const mockPersonalPosts: ActivityItem[] = [
  {
    id: '1',
    type: 'file_contributed',
    user: {
      id: 'current-user',
      name: 'You',
      username: '@you',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isFollowing: false
    },
    action: 'shared a breakthrough research paper 📚✨',
    target: 'quantum_computing_advances_2024.pdf',
    space: 'Your Personal Space',
    details: 'Just finished my latest research on quantum computing advances. This paper explores new algorithms for prime-resonant calculations that could revolutionize file sharing protocols. Excited to get feedback from the community!',
    timestamp: '1 hour ago',
    metrics: { likes: 23, comments: 8, shares: 4, hasLiked: false, hasBookmarked: false },
    isPinned: true,
    media: {
      type: 'image',
      url: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  },
  {
    id: '2',
    type: 'resonance_locked',
    user: {
      id: 'current-user',
      name: 'You',
      username: '@you',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isFollowing: false
    },
    action: 'achieved perfect resonance lock on a complex dataset! 🔥',
    target: 'machine_learning_models.zip',
    space: 'Your Personal Space',
    details: 'After hours of optimization, finally got a perfect lock on this ML dataset. The entropy convergence was incredible - locked in under a second!',
    timestamp: '3 hours ago',
    metrics: { likes: 45, comments: 12, shares: 8, hasLiked: false, hasBookmarked: false },
    resonanceData: { strength: 1.0, timeToLock: '0.7s' }
  },
  {
    id: '3',
    type: 'file_contributed',
    user: {
      id: 'current-user',
      name: 'You',
      username: '@you',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isFollowing: false
    },
    action: 'dropped some chill beats for the community 🎵',
    target: 'midnight_coding_session.mp3',
    space: 'Your Personal Space',
    details: 'Created this track during a late-night coding session. Perfect background music for deep work and quantum calculations 🎧',
    timestamp: '1 day ago',
    metrics: { likes: 67, comments: 19, shares: 25, hasLiked: false, hasBookmarked: false },
    media: {
      type: 'audio',
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      artist: 'You',
      duration: 240
    }
  },
  {
    id: '4',
    type: 'space_created',
    user: {
      id: 'current-user',
      name: 'You',
      username: '@you',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isFollowing: false
    },
    action: 'launched a new collaborative space',
    target: 'Quantum Researchers Hub',
    details: 'Created a dedicated space for quantum computing researchers to share papers, discuss theories, and collaborate on breakthrough projects. All quantum enthusiasts welcome! 🚀',
    timestamp: '2 days ago',
    metrics: { likes: 34, comments: 15, shares: 18, hasLiked: false, hasBookmarked: false }
  },
  {
    id: '5',
    type: 'file_summoned',
    user: {
      id: 'current-user',
      name: 'You',
      username: '@you',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isFollowing: false
    },
    action: 'discovered and summoned an amazing design system',
    target: 'quantum_ui_components.sketch',
    space: 'Design Systems Collective',
    details: 'Found this incredible quantum-inspired UI component library. The resonance patterns in the design elements are absolutely beautiful! 🎨',
    timestamp: '3 days ago',
    metrics: { likes: 29, comments: 7, shares: 12, hasLiked: true, hasBookmarked: true },
    resonanceData: { strength: 0.96, timeToLock: '1.1s' }
  }
];

export function PersonalHomeFeed() {
  const [posts, setPosts] = useState(mockPersonalPosts);
  
  const handleNewPost = (content: any) => {
    const newPost = {
      id: Date.now().toString(),
      type: 'file_contributed' as const,
      user: {
        id: 'current-user',
        name: 'You',
        username: '@you',
        avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        isFollowing: false
      },
      action: content.text || 'shared new content',
      details: content.text,
      space: content.feedName || 'Your Personal Space',
      timestamp: 'now',
      metrics: { likes: 0, comments: 0, shares: 0, hasLiked: false, hasBookmarked: false }
    };
    
    setPosts(prev => [newPost, ...prev]);
  };

  const handleLike = (postId: string) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? {
              ...post,
              metrics: post.metrics
                ? { 
                    ...post.metrics, 
                    likes: post.metrics.hasLiked 
                      ? post.metrics.likes - 1 
                      : post.metrics.likes + 1,
                    hasLiked: !post.metrics.hasLiked
                  }
                : { likes: 1, comments: 0, shares: 0, hasLiked: true }
            }
          : post
      )
    );
  };

  const handleBookmark = (postId: string) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? {
              ...post,
              metrics: post.metrics
                ? { ...post.metrics, hasBookmarked: !post.metrics.hasBookmarked }
                : { likes: 0, comments: 0, shares: 0, hasBookmarked: true }
            }
          : post
      )
    );
  };

  return (
    <FeedLayout
      title="Your Space"
      subtitle="Your personal public space and activity"
      icon={User}
      composer={<ContentComposer onPost={handleNewPost} />}
      sidebar={<UserNetworkSidebar />}
    >
      <div className="space-y-6">
        {posts.map((post) => (
          <ActivityCard
            key={post.id}
            activity={post}
            onLike={handleLike}
            onBookmark={handleBookmark}
            showFollowButton={false}
          />
        ))}
      </div>
    </FeedLayout>
  );
}