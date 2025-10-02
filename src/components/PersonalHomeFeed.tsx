import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { ContentComposer } from './ContentComposer';
import { ActivityCard } from './common/ActivityCard';
import { FeedLayout } from './layouts/FeedLayout';
import { UserNetworkSidebar } from './UserNetworkSidebar';
import { ActivityItem } from '../types/common';

// Initial empty posts array - will be populated from real activity beacons
const initialPersonalPosts: ActivityItem[] = [];

export function PersonalHomeFeed() {
  const [posts, setPosts] = useState(initialPersonalPosts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPersonalFeed = async () => {
      try {
        // TODO: Implement real beacon-based personal feed loading
        // In a real implementation, this would:
        // 1. Fetch activity beacons from user's personal space
        // 2. Fetch activity beacons from followed users
        // 3. Decode each beacon to get activity data using holographic memory
        // 4. Sort by timestamp and populate feed
        
        console.log('Loading personal feed from beacon system...');
        setLoading(false);
        
        // For now, start with empty state until beacon infrastructure is implemented
        // Example implementation:
        // const userActivityBeacons = await beaconCacheManager.getUserActivityBeacons(currentUserId);
        // const followedActivityBeacons = await beaconCacheManager.getFollowedUsersActivity(currentUserId);
        // const allBeacons = [...userActivityBeacons, ...followedActivityBeacons];
        // const decodedActivities = await Promise.all(
        //   allBeacons.map(beacon => holographicMemoryManager.decodeMemory(beacon))
        // );
        // const activities = decodedActivities.map(a => JSON.parse(a)).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        // setPosts(activities);
        
      } catch (error) {
        console.error('Failed to load personal feed:', error);
        setLoading(false);
      }
    };

    loadPersonalFeed();
  }, []);
  
  // handleNewPost removed - ContentComposer now handles posting via beacon system internally

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
      composer={<ContentComposer />}
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