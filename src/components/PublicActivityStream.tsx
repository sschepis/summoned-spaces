import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { ContentComposer } from './ContentComposer';
import { UserNetworkSidebar } from './UserNetworkSidebar';
import { ActivityList, ViewModeSelector } from './common/lists/ActivityList';
import { FeedLayout } from './layouts/FeedLayout';
import { ActivityItem } from '../types/common';
import { useNetworkState } from '../contexts/NetworkContext';
import { useAuth } from '../contexts/AuthContext';
import { holographicMemoryManager } from '../services/holographic-memory';
import { userDataManager } from '../services/user-data';

export function PublicActivityStream() {
  const { recentBeacons } = useNetworkState();
  useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [viewMode, setViewMode] = useState<'card' | 'compact' | 'minimal'>('card');

  // Convert beacons to activity items
  useEffect(() => {
    const convertedActivities: ActivityItem[] = recentBeacons.map((beaconInfo) => {
      const decodedContent = holographicMemoryManager.decodeMemory(beaconInfo.beacon);
      const followingList = userDataManager.getFollowingList();
      
      return {
        id: beaconInfo.receivedAt.toString(),
        type: 'file_contributed',
        user: {
          id: beaconInfo.authorId,
          name: beaconInfo.authorId.substring(0, 8),
          username: `@${beaconInfo.authorId.substring(0, 8)}`,
          avatar: `https://api.dicebear.com/8.x/bottts/svg?seed=${beaconInfo.authorId}`,
          isFollowing: followingList.includes(beaconInfo.authorId),
        },
        action: 'shared a holographic beacon',
        details: decodedContent || 'Encrypted content',
        timestamp: new Date(beaconInfo.receivedAt).toLocaleTimeString(),
        metrics: { likes: 0, comments: 0, shares: 0, hasLiked: false, hasBookmarked: false }
      };
    });
    
    setActivities(convertedActivities);
  }, [recentBeacons]);
  

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
      composer={<ContentComposer />}
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
