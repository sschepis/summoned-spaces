import { useState } from 'react';
import { Heart, MessageCircle, Share, UserPlus, UserCheck, Zap, Upload, Download, Users, Settings, Trash2, Star, MoreHorizontal, Bookmark } from 'lucide-react';
import { ContentComposer } from './ContentComposer';
import { VideoPlayer } from './VideoPlayer';

interface ActivityItem {
  id: string;
  type: 'file_contributed' | 'file_summoned' | 'space_created' | 'member_joined' | 'resonance_locked' | 'file_starred' | 'space_updated' | 'collaboration_started' | 'user_followed' | 'space_joined';
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isFollowing: boolean;
    verified?: boolean;
  };
  action: string;
  target?: string;
  space?: string;
  details?: string;
  timestamp: string;
  metrics?: {
    likes: number;
    comments: number;
    shares: number;
    hasLiked?: boolean;
    hasBookmarked?: boolean;
  };
  resonanceData?: {
    strength: number;
    timeToLock: string;
  };
  media?: {
    type: 'image' | 'video' | 'file';
    url: string;
    thumbnail?: string;
    filename?: string;
  };
}

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

const activityIcons = {
  file_contributed: Upload,
  file_summoned: Download,
  space_created: Settings,
  member_joined: Users,
  user_followed: UserPlus,
  resonance_locked: Zap,
  file_starred: Star,
  space_updated: Settings,
  collaboration_started: Users,
  space_joined: Users
};

const activityColors = {
  file_contributed: 'text-blue-400',
  file_summoned: 'text-green-400',
  space_created: 'text-purple-400',
  member_joined: 'text-cyan-400',
  user_followed: 'text-pink-400',
  resonance_locked: 'text-yellow-400',
  file_starred: 'text-orange-400',
  collaboration_started: 'text-emerald-400',
  space_joined: 'text-indigo-400'
};

export function PublicActivityStream() {
  const [activities, setActivities] = useState(mockActivityStream);
  
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
    <div className="max-w-2xl mx-auto">
      {/* Feed Header */}
      <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 p-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Feed</h1>
        <p className="text-gray-400 text-sm">See what's happening in your network</p>
      </div>

      {/* Content Composer */}
      <div className="mb-8">
        <ContentComposer onPost={handleNewPost} />
      </div>

      <div className="space-y-6">
        {activities.map((activity) => {
          const ActivityIcon = activityIcons[activity.type];
          const iconColor = activityColors[activity.type];

          return (
            <div
              key={activity.id}
              className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/8 
                       transition-all duration-200 overflow-hidden"
            >
              {/* Post Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {/* User Avatar with Activity Icon */}
                    <div className="relative">
                      <img
                        src={activity.user.avatar}
                        alt={activity.user.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white/10"
                      />
                      <div className={`absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-800 border border-white/10 ${iconColor}`}>
                        <ActivityIcon className="w-3 h-3" />
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-white">{activity.user.name}</span>
                        <span className="text-sm text-gray-400">{activity.user.username}</span>
                        {activity.user.verified && (
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        )}
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{activity.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Follow Button & More Menu */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleFollow(activity.user.id)}
                      className={`px-3 py-1.5 text-xs rounded-full transition-colors font-medium ${
                        activity.user.isFollowing
                          ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30'
                      }`}
                    >
                      {activity.user.isFollowing ? (
                        <><UserCheck className="w-3 h-3 inline mr-1" />Following</>
                      ) : (
                        <><UserPlus className="w-3 h-3 inline mr-1" />Follow</>
                      )}
                    </button>
                    
                    <button className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="px-6 pb-4">
                <div className="text-white mb-3 leading-relaxed">
                  <span>{activity.action}</span>
                  {activity.target && (
                    <>
                      {activity.space && (
                        <>
                          <span className="text-gray-400 mx-1">in</span>
                          <span className="text-purple-300 font-medium">{activity.space}</span>
                        </>
                      )}
                    </>
                  )}
                </div>

                {activity.details && (
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">{activity.details}</p>
                )}

                {/* Media Content */}
                {activity.media && activity.media.type === 'image' && (
                  <div className="mb-4 rounded-xl overflow-hidden">
                    <img
                      src={activity.media.url}
                      alt="Shared content"
                      className="w-full max-h-96 object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {activity.media && activity.media.type === 'video' && (
                  <div className="mb-4">
                    <VideoPlayer
                      src={activity.media.url}
                      thumbnail={activity.media.thumbnail}
                      title={activity.target}
                      className="w-full"
                    />
                  </div>
                )}

                {/* Resonance Data */}
                {activity.resonanceData && (
                  <div className="flex items-center space-x-4 mb-4 p-3 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 
                                rounded-lg border border-cyan-500/20">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm text-gray-300">Resonance Lock:</span>
                      <span className="text-sm font-mono text-cyan-400">
                        {(activity.resonanceData.strength * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-300">Time:</span>
                      <span className="text-sm font-mono text-green-400">
                        {activity.resonanceData.timeToLock}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Post Actions */}
              {activity.metrics && (
                <div className="px-6 py-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    {/* Engagement Actions */}
                    <div className="flex items-center space-x-6">
                      <button
                        onClick={() => handleLike(activity.id)}
                        className={`flex items-center space-x-2 transition-colors group ${
                          activity.metrics.hasLiked ? 'text-pink-400' : 'text-gray-400 hover:text-pink-400'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${activity.metrics.hasLiked ? 'fill-current' : 'group-hover:fill-current'}`} />
                        <span className="text-sm font-medium">{formatNumber(activity.metrics.likes)}</span>
                      </button>
                      
                      <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">{formatNumber(activity.metrics.comments)}</span>
                      </button>
                      
                      <button className="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-colors">
                        <Share className="w-5 h-5" />
                        <span className="text-sm font-medium">{formatNumber(activity.metrics.shares)}</span>
                      </button>
                    </div>

                    {/* Save/Bookmark */}
                    <button
                      onClick={() => handleBookmark(activity.id)}
                      className={`p-2 rounded-full transition-colors ${
                        activity.metrics.hasBookmarked 
                          ? 'text-yellow-400 bg-yellow-400/10' 
                          : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${activity.metrics.hasBookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Load More */}
      <div className="mt-8 text-center">
        <button className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white 
                         rounded-xl hover:from-cyan-400 hover:to-purple-400 transition-all 
                         duration-200 font-medium shadow-lg hover:shadow-xl">
          Load More Posts
        </button>
      </div>
    </div>
  );
}