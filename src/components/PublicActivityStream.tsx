import { useState } from 'react';
import { Globe, List, Grid3x3 as Grid3X3, Minimize2 } from 'lucide-react';
import { ContentComposer } from './ContentComposer';
import { VideoPlayer } from './VideoPlayer';
import { AudioPlayer } from './AudioPlayer';
import { UserNetworkSidebar } from './UserNetworkSidebar';
import { ActivityCard } from './common/ActivityCard';
import { FeedLayout } from './layouts/FeedLayout';
import { Tabs } from './ui/Tabs';
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
    id: '1.5',
    type: 'file_contributed',
    user: {
      id: 'maya-patel',
      name: 'Maya Patel',
      username: '@mayap_music',
      avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isFollowing: true,
      verified: true
    },
    action: 'just dropped a fire music video! 🔥🎵',
    target: 'studio_session_beats.mp4',
    space: 'Beat Makers United',
    details: 'Been working on this track for weeks - finally ready to share! Turn up the volume 🎧',
    timestamp: '8 minutes ago',
    metrics: { likes: 127, comments: 34, shares: 28, hasLiked: false, hasBookmarked: false },
    media: {
      type: 'video',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnail: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=800'
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
  },
  {
    id: '3',
    type: 'space_created',
    user: {
      id: 'amanda-liu',
      name: 'Amanda Liu',
      username: '@amandal_creates',
      avatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isFollowing: true,
      verified: false
    },
    action: 'started a new creative space',
    target: 'Digital Art Collective',
    details: 'A place for digital artists to share work, get feedback, and collaborate on projects! Everyone welcome 🎨',
    timestamp: '1 hour ago',
    metrics: { likes: 31, comments: 8, shares: 12, hasLiked: false, hasBookmarked: false }
  },
  {
    id: '4',
    type: 'user_followed',
    user: {
      id: 'elena-kowalski',
      name: 'Elena Kowalski',
      username: '@elenakdesign',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isFollowing: false
    },
    action: 'followed @creativecoder and 12 other amazing creators',
    details: 'Loving the creative energy on this platform lately! So many talented people sharing incredible work 🌟',
    timestamp: '2 hours ago',
    metrics: { likes: 18, comments: 4, shares: 2, hasLiked: false, hasBookmarked: false }
  },
  {
    id: '5',
    type: 'file_summoned',
    user: {
      id: 'james-wilson',
      name: 'James Wilson',
      username: '@jwilson_creates',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isFollowing: true
    },
    action: 'discovered and summoned an incredible soundtrack',
    target: 'lo_fi_study_beats.mp3',
    space: 'Chill Vibes Only',
    details: 'This is going straight to my study playlist! Perfect for coding sessions ⌨️🎵',
    timestamp: '3 hours ago',
    metrics: { likes: 56, comments: 19, shares: 31, hasLiked: false, hasBookmarked: false },
    resonanceData: { strength: 0.94, timeToLock: '1.2s' }
  },
  {
    id: '6',
    type: 'collaboration_started',
    user: {
      id: 'maya-patel',
      name: 'Maya Patel',
      username: '@mayap_music',
      avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isFollowing: true,
      verified: true
    },
    action: 'started a live collaboration session',
    space: 'Music Production Hub',
    details: 'Working on a new track - come join the creative process! Live resonance session happening now 🎼',
    timestamp: '4 hours ago',
    metrics: { likes: 73, comments: 27, shares: 18, hasLiked: true, hasBookmarked: false }
  }
];

type ViewMode = 'card' | 'thumbnail' | 'compact';

export function PublicActivityStream() {
  const [activities, setActivities] = useState(mockActivityStream);
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  
  const handleNewPost = (content: any) => {
    // Create new activity from the post content
    const newActivity = {
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
        activity.id === activityId
          ? {
              ...activity,
              metrics: activity.metrics
                ? { 
                    ...activity.metrics, 
                    likes: activity.metrics.hasLiked 
                      ? activity.metrics.likes - 1 
                      : activity.metrics.likes + 1,
                    hasLiked: !activity.metrics.hasLiked
                  }
                : { likes: 1, comments: 0, shares: 0, hasLiked: true }
            }
          : activity
      )
    );
  };

  const handleBookmark = (activityId: string) => {
    setActivities(prev =>
      prev.map(activity =>
        activity.id === activityId
          ? {
              ...activity,
              metrics: activity.metrics
                ? { ...activity.metrics, hasBookmarked: !activity.metrics.hasBookmarked }
                : { likes: 0, comments: 0, shares: 0, hasBookmarked: true }
            }
          : activity
      )
    );
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <FeedLayout
      title="Your Network"
      subtitle="Posts from people you follow and spaces you're in"
      icon={Globe}
      composer={<ContentComposer onPost={handleNewPost} />}
      sidebar={<UserNetworkSidebar />}
    >
      {/* View Mode Controls */}
      <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 p-4 mb-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full 
          <h2 className="text-lg font-semibold text-white">Activity Feed</h2>
          
          {/* View Mode Toolbar */}
          <Tabs
            variant="pills"
            tabs={[
              { id: 'card', label: 'Cards', icon: List },
              { id: 'thumbnail', label: 'Thumbnails', icon: Grid3X3 },
              { id: 'compact', label: 'Compact', icon: Minimize2 }
            ]}
            activeTab={viewMode}
            onTabChange={(mode) => setViewMode(mode as ViewMode)}
          />
        </div>
      </div>

      <div className="space-y-6">
        {activities.map((activity) => {
          if (viewMode === 'card') {
            return (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onLike={handleLike}
                onBookmark={handleBookmark}
                onFollow={handleFollow}
              />
            );
          }

          // Thumbnail View - Condensed layout (~50% height)
          if (viewMode === 'thumbnail') {
            return (
              <div
                key={activity.id}
                className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/8 
                         transition-all duration-200 p-4"
              >
                <div className="flex items-start space-x-3">
                  {/* Smaller Avatar */}
                  <div className="relative">
                    <img
                      src={activity.user.avatar}
                      alt={activity.user.name}
                      className="w-8 h-8 rounded-full object-cover border border-white/10"
                    />
                    <div className={`absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full bg-slate-800 border border-white/10 ${iconColor}`}>
                      <ActivityIcon className="w-2 h-2" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* User Info */}
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-white text-sm">{activity.user.name}</span>
                      <span className="text-xs text-gray-500">{activity.timestamp}</span>
                      {activity.user.verified && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="w-1 h-1 bg-white rounded-full" />
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    <div className="text-sm text-gray-300 mb-2">
                      <span>{activity.action}</span>
                      {activity.space && (
                        <>
                          <span className="text-gray-500 mx-1">in</span>
                          <span className="text-purple-300">{activity.space}</span>
                        </>
                      )}
                    </div>

                    {/* Media Preview */}
                    {activity.media && (
                      <div className="flex items-center space-x-2 mb-2">
                        {activity.media.type === 'image' && (
                          <img
                            src={activity.media.url}
                            alt="Preview"
                            className="w-12 h-8 object-cover rounded border border-white/10"
                          />
                        )}
                        {activity.media.type === 'video' && (
                          <div className="relative w-12 h-8 bg-black rounded border border-white/10">
                            <img
                              src={activity.media.thumbnail}
                              alt="Video"
                              className="w-full h-full object-cover rounded"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-4 h-4 bg-white/80 rounded-full flex items-center justify-center">
                                <div className="w-0 h-0 border-l-2 border-l-black border-y-1 border-y-transparent ml-0.5" />
                              </div>
                            </div>
                          </div>
                        )}
                        <span className="text-xs text-gray-400">{activity.target}</span>
                      </div>
                    )}

                    {/* Condensed Metrics */}
                    {activity.metrics && (
                      <div className="flex items-center space-x-4 text-xs">
                        <button
                          onClick={() => handleLike(activity.id)}
                          className={`flex items-center space-x-1 ${
                            activity.metrics.hasLiked ? 'text-pink-400' : 'text-gray-500 hover:text-pink-400'
                          }`}
                        >
                          <Heart className={`w-3 h-3 ${activity.metrics.hasLiked ? 'fill-current' : ''}`} />
                          <span>{formatNumber(activity.metrics.likes)}</span>
                        </button>
                        
                        <div className="flex items-center space-x-1 text-gray-500">
                          <MessageCircle className="w-3 h-3" />
                          <span>{formatNumber(activity.metrics.comments)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Share className="w-3 h-3" />
                          <span>{formatNumber(activity.metrics.shares)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Follow Button */}
                  <button
                    onClick={() => handleFollow(activity.user.id)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      activity.user.isFollowing
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    {activity.user.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              </div>
            );
          }

          // Compact View - Minimal single-line layout (~25% height)
          return (
            <div
              key={activity.id}
              className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/8 
                       transition-all duration-200 p-3"
            >
              <div className="flex items-center space-x-3">
                {/* Tiny Avatar */}
                <div className="relative">
                  <img
                    src={activity.user.avatar}
                    alt={activity.user.name}
                    className="w-6 h-6 rounded-full object-cover border border-white/10"
                  />
                  <div className={`absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full bg-slate-800 ${iconColor}`}>
                    <ActivityIcon className="w-1.5 h-1.5" />
                  </div>
                </div>

                {/* Media Micro-preview */}
                {activity.media && (
                  <div className="w-8 h-8 rounded border border-white/10 bg-black/20 flex-shrink-0">
                    {activity.media.type === 'image' && (
                      <img
                        src={activity.media.url}
                        alt="Preview"
                        className="w-full h-full object-cover rounded"
                      />
                    )}
                    {activity.media.type === 'video' && (
                      <div className="relative w-full h-full">
                        <img
                          src={activity.media.thumbnail}
                          alt="Video"
                          className="w-full h-full object-cover rounded"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white/80 rounded-full flex items-center justify-center">
                            <div className="w-0 h-0 border-l-1 border-l-black border-y-0.5 border-y-transparent ml-px" />
                          </div>
                        </div>
                      </div>
                    )}
                    {activity.media.type === 'audio' && (
                      <div className="w-full h-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded flex items-center justify-center">
                        <div className="w-3 h-3 text-cyan-400">♪</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Compact Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="font-medium text-white truncate">{activity.user.name}</span>
                    <span className="text-gray-400 truncate">{activity.action}</span>
                    {activity.space && (
                      <>
                        <span className="text-gray-500">in</span>
                        <span className="text-purple-300 truncate">{activity.space}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Minimal Actions */}
                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-gray-500">{activity.timestamp}</span>
                  {activity.metrics && (
                    <button
                      onClick={() => handleLike(activity.id)}
                      className={`flex items-center space-x-1 ${
                        activity.metrics.hasLiked ? 'text-pink-400' : 'text-gray-500 hover:text-pink-400'
                      }`}
                    >
                      <Heart className={`w-3 h-3 ${activity.metrics.hasLiked ? 'fill-current' : ''}`} />
                      <span>{formatNumber(activity.metrics.likes)}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </FeedLayout>
  );
}