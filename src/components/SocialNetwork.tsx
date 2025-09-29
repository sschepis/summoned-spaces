import { useState } from 'react';
import { UserPlus, UserCheck, Search, Users, TrendingUp, Star, ArrowLeft } from 'lucide-react';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  isFollowing: boolean;
  followsMe: boolean;
  isVerified?: boolean;
  stats: {
    followers: number;
    following: number;
    spaces: number;
    resonanceScore: number;
  };
  recentActivity: string;
  tags: string[];
  mutualFollowers?: User[];
}

interface SocialNetworkProps {
  onBack: () => void;
}

const mockFollowing: User[] = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    username: '@sarahchen_quantum',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    bio: 'Quantum computing researcher at MIT. Pioneering work in prime-resonant algorithms.',
    isFollowing: true,
    followsMe: true,
    isVerified: true,
    stats: { followers: 2847, following: 342, spaces: 12, resonanceScore: 0.94 },
    recentActivity: 'Published breakthrough paper on quantum entanglement',
    tags: ['quantum-computing', 'research', 'algorithms']
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    username: '@marcustech',
    avatar: 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    bio: 'Full-stack developer building the next generation of collaborative platforms.',
    isFollowing: true,
    followsMe: true,
    stats: { followers: 892, following: 156, spaces: 15, resonanceScore: 0.91 },
    recentActivity: 'Achieved perfect resonance lock on complex dataset',
    tags: ['development', 'collaboration', 'full-stack']
  },
  {
    id: '3',
    name: 'Elena Kowalski',
    username: '@elenakdesign',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    bio: 'Senior UX Designer creating quantum-inspired interfaces.',
    isFollowing: true,
    followsMe: false,
    stats: { followers: 1203, following: 89, spaces: 8, resonanceScore: 0.87 },
    recentActivity: 'Created new design system for quantum interfaces',
    tags: ['design', 'ux', 'quantum-ui']
  }
];

const mockFollowers: User[] = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    username: '@sarahchen_quantum',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    bio: 'Quantum computing researcher at MIT.',
    isFollowing: true,
    followsMe: true,
    isVerified: true,
    stats: { followers: 2847, following: 342, spaces: 12, resonanceScore: 0.94 },
    recentActivity: 'Published breakthrough paper',
    tags: ['quantum-computing', 'research']
  },
  {
    id: '4',
    name: 'Dr. James Wilson',
    username: '@jwilson_research',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    bio: 'Physics researcher exploring quantum measurement theory.',
    isFollowing: false,
    followsMe: true,
    isVerified: true,
    stats: { followers: 1567, following: 203, spaces: 6, resonanceScore: 0.89 },
    recentActivity: 'Shared breakthrough measurement data',
    tags: ['physics', 'quantum-theory']
  },
  {
    id: '5',
    name: 'Alex Thompson',
    username: '@alexthompson_dev',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    bio: 'Software engineer interested in distributed systems.',
    isFollowing: false,
    followsMe: true,
    stats: { followers: 543, following: 127, spaces: 4, resonanceScore: 0.78 },
    recentActivity: 'Contributing to open source projects',
    tags: ['software', 'distributed-systems']
  }
];

const mockSuggested: User[] = [
  {
    id: '6',
    name: 'Dr. Maria Santos',
    username: '@mariasantos_ai',
    avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    bio: 'AI researcher working on quantum machine learning applications.',
    isFollowing: false,
    followsMe: false,
    isVerified: true,
    stats: { followers: 1834, following: 298, spaces: 9, resonanceScore: 0.92 },
    recentActivity: 'Published paper on quantum neural networks',
    tags: ['ai', 'machine-learning', 'quantum']
  },
  {
    id: '7',
    name: 'David Kim',
    username: '@davidkim_crypto',
    avatar: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    bio: 'Cryptography expert specializing in post-quantum security.',
    isFollowing: false,
    followsMe: false,
    stats: { followers: 967, following: 134, spaces: 7, resonanceScore: 0.85 },
    recentActivity: 'Speaking at quantum cryptography conference',
    tags: ['cryptography', 'security', 'quantum']
  }
];

export function SocialNetwork({ onBack }: SocialNetworkProps) {
  const [activeTab, setActiveTab] = useState<'following' | 'followers' | 'suggested'>('following');
  const [searchQuery, setSearchQuery] = useState('');
  const [following, setFollowing] = useState(mockFollowing);
  const [followers, setFollowers] = useState(mockFollowers);
  const [suggested, setSuggested] = useState(mockSuggested);

  const handleFollow = (userId: string, listName: 'following' | 'followers' | 'suggested') => {
    const updateUser = (user: User) => 
      user.id === userId
        ? { 
            ...user, 
            isFollowing: !user.isFollowing,
            stats: {
              ...user.stats,
              followers: user.isFollowing ? user.stats.followers - 1 : user.stats.followers + 1
            }
          }
        : user;

    if (listName === 'following') {
      setFollowing(prev => prev.map(updateUser));
    } else if (listName === 'followers') {
      setFollowers(prev => prev.map(updateUser));
    } else if (listName === 'suggested') {
      setSuggested(prev => prev.map(updateUser));
    }
  };

  const getCurrentList = () => {
    switch (activeTab) {
      case 'followers': return followers;
      case 'suggested': return suggested;
      default: return following;
    }
  };

  const filteredUsers = getCurrentList().filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const stats = {
    following: following.length,
    followers: followers.length,
    mutualFollows: following.filter(u => u.followsMe).length
  };

  const tabs = [
    { id: 'following', label: `Following (${stats.following})`, count: stats.following },
    { id: 'followers', label: `Followers (${stats.followers})`, count: stats.followers },
    { id: 'suggested', label: 'Suggested', count: suggested.length }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Social Network</h1>
          <p className="text-gray-400">Manage your connections and discover collaborators</p>
        </div>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-cyan-400" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.following}</div>
              <div className="text-sm text-gray-400">Following</div>
            </div>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.followers}</div>
              <div className="text-sm text-gray-400">Followers</div>
            </div>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-purple-400" />
            <div>
              <div className="text-2xl font-bold text-white">{stats.mutualFollows}</div>
              <div className="text-sm text-gray-400">Mutual Follows</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 
                     rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                     focus:ring-cyan-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* User List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 
                     hover:bg-white/10 transition-all duration-300"
          >
            <div className="flex items-start space-x-4">
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white/10"
                />
                {user.isVerified && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full 
                                flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-white">{user.name}</h3>
                    <p className="text-sm text-gray-400">{user.username}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {user.followsMe && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                        Follows you
                      </span>
                    )}
                    <button
                      onClick={() => handleFollow(user.id, activeTab)}
                      className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                        user.isFollowing
                          ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30'
                      }`}
                    >
                      {user.isFollowing ? (
                        <><UserCheck className="w-4 h-4 inline mr-1" />Following</>
                      ) : (
                        <><UserPlus className="w-4 h-4 inline mr-1" />Follow</>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-gray-300 text-sm mb-4 leading-relaxed">{user.bio}</p>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-sm font-bold text-white">{user.stats.followers.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-white">{user.stats.following.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-white">{user.stats.spaces}</div>
                    <div className="text-xs text-gray-400">Spaces</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-cyan-400">{(user.stats.resonanceScore * 100).toFixed(0)}%</div>
                    <div className="text-xs text-gray-400">Resonance</div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="mb-4">
                  <div className="flex items-center space-x-1 mb-1">
                    <Star className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs text-gray-400">Recent Activity</span>
                  </div>
                  <p className="text-sm text-gray-300">{user.recentActivity}</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {user.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full 
                               border border-purple-500/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400">
            {searchQuery ? 
              `No users found matching "${searchQuery}"` : 
              `No ${activeTab} yet`
            }
          </div>
        </div>
      )}
    </div>
  );
}