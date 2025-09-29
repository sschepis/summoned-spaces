import { useState } from 'react';
import { Heart, MessageCircle, Share, UserPlus, UserCheck, Zap, Upload, Download, Users, Settings, Trash2, Star, MoreHorizontal, Bookmark, Grid3x3 as Grid3X3, List, Minimize2, Pin, CreditCard as Edit, Globe } from 'lucide-react';
import { ContentComposer } from './ContentComposer';
import { VideoPlayer } from './VideoPlayer';
import { AudioPlayer } from './AudioPlayer';

interface PersonalPost {
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
    type: 'image' | 'video' | 'audio' | 'file';
    url: string;
    thumbnail?: string;
    filename?: string;
    artist?: string;
    duration?: number;
  };
  isPinned?: boolean;
}

const mockPersonalPosts: PersonalPost[] = [
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

type ViewMode = 'card' | 'thumbnail' | 'compact';

export function PersonalHomeFeed() {
  const [posts, setPosts] = useState(mockPersonalPosts);
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  
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

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed Column */}
        <div className="lg:col-span-2">
          {/* Feed Header */}
          <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 p-4 mb-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3">
                  <Globe className="w-6 h-6 text-cyan-400" />
                  <div>
                    <h1 className="text-2xl font-bold text-white">Your Space</h1>
                    <p className="text-gray-400 text-sm">Your personal public space and activity</p>
                  </div>
                </div>
              </div>
              
              {/* View Mode Toolbar */}
              <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('card')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'card'
                      ? 'bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/20'
                      : 'text-gray-400 hover:text-cyan-300 hover:bg-white/10'
                  }`}
                  title="Card View"
                >
                  <List className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => setViewMode('thumbnail')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'thumbnail'
                      ? 'bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/20'
                      : 'text-gray-400 hover:text-cyan-300 hover:bg-white/10'
                  }`}
                  title="Thumbnail View"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => setViewMode('compact')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'compact'
                      ? 'bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/20'
                      : 'text-gray-400 hover:text-cyan-300 hover:bg-white/10'
                  }`}
                  title="Compact View"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Content Composer */}
          <div className="mb-8">
            <ContentComposer onPost={handleNewPost} />
          </div>

          <div className="space-y-6">
            {posts.map((post) => {
              const ActivityIcon = activityIcons[post.type];
              const iconColor = activityColors[post.type];

              // Card View - Full detailed layout
              if (viewMode === 'card') {
                return (
                  <div
                    key={post.id}
                    className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/8 
                             transition-all duration-200 overflow-hidden relative"
                  >
                    {/* Pinned Badge */}
                    {post.isPinned && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-500/20 text-yellow-300 
                                      text-xs rounded-full border border-yellow-500/30">
                          <Pin className="w-3 h-3" />
                          <span>Pinned</span>
                        </div>
                      </div>
                    )}

                    {/* Post Header */}
                    <div className="p-6 pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          {/* User Avatar with Activity Icon */}
                          <div className="relative">
                            <img
                              src={post.user.avatar}
                              alt={post.user.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-white/10"
                            />
                            <div className={`absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-800 border border-white/10 ${iconColor}`}>
                              <ActivityIcon className="w-3 h-3" />
                            </div>
                          </div>

                          {/* User Info */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-white">{post.user.name}</span>
                              <span className="text-sm text-gray-400">{post.user.username}</span>
                              <span className="text-sm text-gray-500">•</span>
                              <span className="text-sm text-gray-500">{post.timestamp}</span>
                            </div>
                          </div>
                        </div>

                        {/* More Menu */}
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                            <Edit className="w-4 h-4" />
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
                        <span>{post.action}</span>
                        {post.target && (
                          <>
                            {post.space && (
                              <>
                                <span className="text-gray-400 mx-1">in</span>
                                <span className="text-purple-300 font-medium">{post.space}</span>
                              </>
                            )}
                          </>
                        )}
                      </div>

                      {post.details && (
                        <p className="text-gray-300 text-sm mb-4 leading-relaxed">{post.details}</p>
                      )}

                      {/* Media Content */}
                      {post.media && post.media.type === 'image' && (
                        <div className="mb-4 rounded-xl overflow-hidden">
                          <img
                            src={post.media.url}
                            alt="Shared content"
                            className="w-full max-h-96 object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      {post.media && post.media.type === 'video' && (
                        <div className="mb-4">
                          <VideoPlayer
                            src={post.media.url}
                            thumbnail={post.media.thumbnail}
                            title={post.target}
                            className="w-full"
                          />
                        </div>
                      )}

                      {post.media && post.media.type === 'audio' && (
                        <div className="mb-4">
                          <AudioPlayer
                            src={post.media.url}
                            title={post.target || 'Audio Track'}
                            artist={post.media.artist || post.user.name}
                            artwork={post.user.avatar}
                            duration={post.media.duration}
                            showDownload={true}
                            onLike={() => handleLike(post.id)}
                            onShare={() => console.log('Share audio:', post.id)}
                          />
                        </div>
                      )}

                      {/* Resonance Data */}
                      {post.resonanceData && (
                        <div className="flex items-center space-x-4 mb-4 p-3 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 
                                      rounded-lg border border-cyan-500/20">
                          <div className="flex items-center space-x-2">
                            <Zap className="w-4 h-4 text-cyan-400" />
                            <span className="text-sm text-gray-300">Resonance Lock:</span>
                            <span className="text-sm font-mono text-cyan-400">
                              {(post.resonanceData.strength * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-300">Time:</span>
                            <span className="text-sm font-mono text-green-400">
                              {post.resonanceData.timeToLock}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Post Actions */}
                    {post.metrics && (
                      <div className="px-6 py-4 border-t border-white/10">
                        <div className="flex items-center justify-between">
                          {/* Engagement Actions */}
                          <div className="flex items-center space-x-6">
                            <button
                              onClick={() => handleLike(post.id)}
                              className={`flex items-center space-x-2 transition-colors group ${
                                post.metrics.hasLiked ? 'text-pink-400' : 'text-gray-400 hover:text-pink-400'
                              }`}
                            >
                              <Heart className={`w-5 h-5 ${post.metrics.hasLiked ? 'fill-current' : 'group-hover:fill-current'}`} />
                              <span className="text-sm font-medium">{formatNumber(post.metrics.likes)}</span>
                            </button>
                            
                            <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors">
                              <MessageCircle className="w-5 h-5" />
                              <span className="text-sm font-medium">{formatNumber(post.metrics.comments)}</span>
                            </button>
                            
                            <button className="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-colors">
                              <Share className="w-5 h-5" />
                              <span className="text-sm font-medium">{formatNumber(post.metrics.shares)}</span>
                            </button>
                          </div>

                          {/* Save/Bookmark */}
                          <button
                            onClick={() => handleBookmark(post.id)}
                            className={`p-2 rounded-full transition-colors ${
                              post.metrics.hasBookmarked 
                                ? 'text-yellow-400 bg-yellow-400/10' 
                                : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10'
                            }`}
                          >
                            <Bookmark className={`w-4 h-4 ${post.metrics.hasBookmarked ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              // Thumbnail View - Condensed layout (~50% height)
              if (viewMode === 'thumbnail') {
                return (
                  <div
                    key={post.id}
                    className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/8 
                             transition-all duration-200 p-4 relative"
                  >
                    {post.isPinned && (
                      <div className="absolute top-2 right-2">
                        <Pin className="w-3 h-3 text-yellow-400" />
                      </div>
                    )}

                    <div className="flex items-start space-x-3">
                      {/* Smaller Avatar */}
                      <div className="relative">
                        <img
                          src={post.user.avatar}
                          alt={post.user.name}
                          className="w-8 h-8 rounded-full object-cover border border-white/10"
                        />
                        <div className={`absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full bg-slate-800 border border-white/10 ${iconColor}`}>
                          <ActivityIcon className="w-2 h-2" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* User Info */}
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-white text-sm">{post.user.name}</span>
                          <span className="text-xs text-gray-500">{post.timestamp}</span>
                          {post.user.verified && (
                            <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                              <div className="w-1 h-1 bg-white rounded-full" />
                            </div>
                          )}
                        </div>

                        {/* Action */}
                        <div className="text-sm text-gray-300 mb-2">
                          <span>{post.action}</span>
                          {post.space && (
                            <>
                              <span className="text-gray-500 mx-1">in</span>
                              <span className="text-purple-300">{post.space}</span>
                            </>
                          )}
                        </div>

                        {/* Media Preview */}
                        {post.media && (
                          <div className="flex items-center space-x-2 mb-2">
                            {post.media.type === 'image' && (
                              <img
                                src={post.media.url}
                                alt="Preview"
                                className="w-12 h-8 object-cover rounded border border-white/10"
                              />
                            )}
                            {post.media.type === 'video' && (
                              <div className="relative w-12 h-8 bg-black rounded border border-white/10">
                                <img
                                  src={post.media.thumbnail}
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
                            <span className="text-xs text-gray-400">{post.target}</span>
                          </div>
                        )}

                        {/* Condensed Metrics */}
                        {post.metrics && (
                          <div className="flex items-center space-x-4 text-xs">
                            <button
                              onClick={() => handleLike(post.id)}
                              className={`flex items-center space-x-1 ${
                                post.metrics.hasLiked ? 'text-pink-400' : 'text-gray-500 hover:text-pink-400'
                              }`}
                            >
                              <Heart className={`w-3 h-3 ${post.metrics.hasLiked ? 'fill-current' : ''}`} />
                              <span>{formatNumber(post.metrics.likes)}</span>
                            </button>
                            
                            <div className="flex items-center space-x-1 text-gray-500">
                              <MessageCircle className="w-3 h-3" />
                              <span>{formatNumber(post.metrics.comments)}</span>
                            </div>
                            
                            <div className="flex items-center space-x-1 text-gray-500">
                              <Share className="w-3 h-3" />
                              <span>{formatNumber(post.metrics.shares)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              // Compact View - Minimal single-line layout (~25% height)
              return (
                <div
                  key={post.id}
                  className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/8 
                           transition-all duration-200 p-3"
                >
                  <div className="flex items-center space-x-3">
                    {/* Tiny Avatar */}
                    <div className="relative">
                      <img
                        src={post.user.avatar}
                        alt={post.user.name}
                        className="w-6 h-6 rounded-full object-cover border border-white/10"
                      />
                      <div className={`absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full bg-slate-800 ${iconColor}`}>
                        <ActivityIcon className="w-1.5 h-1.5" />
                      </div>
                      {post.isPinned && (
                        <Pin className="absolute -top-1 -left-1 w-2 h-2 text-yellow-400" />
                      )}
                    </div>

                    {/* Media Micro-preview */}
                    {post.media && (
                      <div className="w-8 h-8 rounded border border-white/10 bg-black/20 flex-shrink-0">
                        {post.media.type === 'image' && (
                          <img
                            src={post.media.url}
                            alt="Preview"
                            className="w-full h-full object-cover rounded"
                          />
                        )}
                        {post.media.type === 'video' && (
                          <div className="relative w-full h-full">
                            <img
                              src={post.media.thumbnail}
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
                        {post.media.type === 'audio' && (
                          <div className="w-full h-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded flex items-center justify-center">
                            <div className="w-3 h-3 text-cyan-400">♪</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Compact Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="font-medium text-white truncate">{post.user.name}</span>
                        <span className="text-gray-400 truncate">{post.action}</span>
                        {post.space && (
                          <>
                            <span className="text-gray-500">in</span>
                            <span className="text-purple-300 truncate">{post.space}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Minimal Actions */}
                    <div className="flex items-center space-x-3 text-xs">
                      <span className="text-gray-500">{post.timestamp}</span>
                      {post.metrics && (
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center space-x-1 ${
                            post.metrics.hasLiked ? 'text-pink-400' : 'text-gray-500 hover:text-pink-400'
                          }`}
                        >
                          <Heart className={`w-3 h-3 ${post.metrics.hasLiked ? 'fill-current' : ''}`} />
                          <span>{formatNumber(post.metrics.likes)}</span>
                        </button>
                      )}
                    </div>
                  </div>
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

        {/* Personal Stats Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-4">
            {/* Personal Stats */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <span>Your Impact</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Total Posts</span>
                  <span className="text-white font-medium">{posts.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Total Likes</span>
                  <span className="text-pink-400 font-medium">
                    {posts.reduce((sum, post) => sum + (post.metrics?.likes || 0), 0)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Total Shares</span>
                  <span className="text-green-400 font-medium">
                    {posts.reduce((sum, post) => sum + (post.metrics?.shares || 0), 0)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Followers</span>
                  <span className="text-cyan-400 font-medium">1,247</span>
                </div>
              </div>
            </div>

            {/* Recent Activity Summary */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3 text-sm">
                <div className="text-gray-300">
                  • Perfect resonance lock achieved
                </div>
                <div className="text-gray-300">
                  • 3 new followers this week
                </div>
                <div className="text-gray-300">
                  • Research paper shared 23 times
                </div>
                <div className="text-gray-300">
                  • New space created: Quantum Researchers Hub
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}