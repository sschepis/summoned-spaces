import { useState } from 'react';
import { Globe } from 'lucide-react';
import { ContentComposer } from './ContentComposer';
import { UserNetworkSidebar } from './UserNetworkSidebar';
import { ActivityList, ViewModeSelector } from './common/lists/ActivityList';
import { FeedLayout } from './layouts/FeedLayout';
import { ActivityItem } from '../types/common';

// Mock data - in a real app this would come from an API or state management
const mockActivityStream: ActivityItem[] = [
  {
    id: '1',
    type: 'file_contributed',
    user: {
      id: 'sarah-chen',
      name: 'Sarah Chen',
      username: '@sarahc',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isFollowing: true,
      verified: true
    },
    action: 'shared some epic photos from their weekend trip',
    target: 'mountain_adventure_2024.zip',
    space: 'Photography Collective',
    details: 'Amazing mountain shots with perfect lighting! Check out these captures from the summit 📸✨',
    timestamp: '2 minutes ago',
    metrics: { likes: 47, comments: 12, shares: 8, hasLiked: false, hasBookmarked: false },
    media: {
      type: 'image',
      url: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=800',
      thumbnail: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  },
  {
    id: '2',
    type: 'resonance_locked',
    user: {
      id: 'marcus-rodriguez',
      name: 'Marcus Rodriguez',
      username: '@marcustech',
      avatar: 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isFollowing: false
    },
    action: 'just achieved a perfect resonance lock! 🔥',
    target: 'music_collection_remix.mp3',
    space: 'Beat Makers United',
    details: 'First perfect lock this month - the algorithm is getting better at matching vibes!',
    timestamp: '15 minutes ago',
    metrics: { likes: 89, comments: 23, shares: 15, hasLiked: true, hasBookmarked: true },
    resonanceData: { strength: 1.0, timeToLock: '0.8s' }
  }
];

export function PublicActivityStream() {
  const [activities, setActivities] = useState<ActivityItem[]>(mockActivityStream);
  const [viewMode, setViewMode] = useState<'card' | 'compact' | 'minimal'>('card');
  
  const handleNewPost = (content: any) => {
    const newActivity: ActivityItem = {
      id: Date.now().toString(),
      type: 'file_contributed',
      user: {
        id: 'current-user',
        name: 'You',
        username: '@you',
        avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        isFollowing: false
      },
      action: content.text || 'shared new content',
      details: content.text,
      timestamp: 'now',
      metrics: { likes: 0, comments: 0, shares: 0, hasLiked: false, hasBookmarked: false }
    };
    
    setActivities(prev => [newActivity, ...prev]);
  };

  const handleFollow = (userId: string) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.user.id === userId 
          ? { ...activity, user: { ...activity.user, isFollowing: !activity.user.isFollowing } }
          : activity
      )
    );
  };

  const handleLike = (activityId: string) => {
    setActivities(prev =>
      prev.map(activity =>
        activity.id === activityId && activity.metrics
          ? {
              ...activity,
              metrics: {
                ...activity.metrics,
                likes: activity.metrics.hasLiked 
                  ? activity.metrics.likes - 1 
                  : activity.metrics.likes + 1,
                hasLiked: !activity.metrics.hasLiked
              }
            }
          : activity
      )
    );
  };

  const handleBookmark = (activityId: string) => {
    setActivities(prev =>
      prev.map(activity =>
        activity.id === activityId && activity.metrics
          ? {
              ...activity,
              metrics: {
                ...activity.metrics,
                hasBookmarked: !activity.metrics.hasBookmarked
              }
            }
          : activity
      )
    );
  };

  return (
    <FeedLayout
      title="Your Network"
      subtitle="Posts from people you follow and spaces you're in"
      icon={Globe}
      composer={<ContentComposer onPost={handleNewPost} />}
      sidebar={<UserNetworkSidebar />}
    >
      {/* Feed Header with View Controls */}
      <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 p-4 mb-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-white">Activity Feed</h2>
          </div>
          
          <ViewModeSelector 
            mode={viewMode} 
            onChange={setViewMode} 
          />
        </div>
      </div>

      {/* Activity List */}
      <ActivityList
        activities={activities}
        onLike={handleLike}
        onBookmark={handleBookmark}
        onFollow={handleFollow}
        compact={viewMode === 'compact'}
        showFollowButton={viewMode !== 'minimal'}
        paginate={activities.length > 20}
        itemsPerPage={20}
      />
    </FeedLayout>
  );
}
