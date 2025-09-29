import { useState } from 'react';
import { UserPlus, UserCheck, Star, Zap, Users, TrendingUp } from 'lucide-react';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  isFollowing: boolean;
  isVerified?: boolean;
  stats: {
    followers: number;
    following: number;
    spaces: number;
    resonanceScore: number;
  };
  recentActivity: string;
  tags: string[];
}

const suggestedUsers: User[] = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    username: '@sarahchen_quantum',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    bio: 'Quantum computing researcher at MIT. Pioneering work in prime-resonant algorithms.',
    isFollowing: false,
    isVerified: true,
    stats: { followers: 2847, following: 342, spaces: 12, resonanceScore: 0.94 },
    recentActivity: 'Published breakthrough paper on quantum entanglement',
    tags: ['quantum-computing', 'research', 'algorithms']
  },
  {
    id: '2',
    name: 'Elena Kowalski',
    username: '@elenakdesign',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    bio: 'Senior UX Designer creating quantum-inspired interfaces. Design systems enthusiast.',
    isFollowing: false,
    stats: { followers: 1203, following: 89, spaces: 8, resonanceScore: 0.87 },
    recentActivity: 'Created new design system for quantum interfaces',
    tags: ['design', 'ux', 'quantum-ui']
  },
  {
    id: '3',
    name: 'Marcus Rodriguez',
    username: '@marcustech',
    avatar: 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    bio: 'Full-stack developer building the next generation of collaborative platforms.',
    isFollowing: true,
    stats: { followers: 892, following: 156, spaces: 15, resonanceScore: 0.91 },
    recentActivity: 'Achieved perfect resonance lock on complex dataset',
    tags: ['development', 'collaboration', 'full-stack']
  },
  {
    id: '4',
    name: 'Dr. James Wilson',
    username: '@jwilson_research',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    bio: 'Physics researcher exploring quantum measurement theory and practical applications.',
    isFollowing: false,
    isVerified: true,
    stats: { followers: 1567, following: 203, spaces: 6, resonanceScore: 0.89 },
    recentActivity: 'Shared breakthrough measurement data',
    tags: ['physics', 'quantum-theory', 'measurements']
  }
];

export function UserDiscovery() {
  const [users, setUsers] = useState(suggestedUsers);

  const handleFollow = (userId: string) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === userId
          ? { 
              ...user, 
              isFollowing: !user.isFollowing,
              stats: {
                ...user.stats,
                followers: user.isFollowing ? user.stats.followers - 1 : user.stats.followers + 1
              }
            }
          : user
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">Discover People</h2>
          <p className="text-gray-400">Connect with creators, designers, and interesting people</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {users.map((user) => (
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
                  <button
                    onClick={() => handleFollow(user.id)}
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

                <p className="text-gray-300 text-sm mb-4 leading-relaxed">{user.bio}</p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-2 bg-white/5 rounded-lg">
                    <div className="text-lg font-bold text-white">{user.stats.followers.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Followers</div>
                  </div>
                  <div className="text-center p-2 bg-white/5 rounded-lg">
                    <div className="text-lg font-bold text-white">{user.stats.spaces}</div>
                    <div className="text-xs text-gray-400">Spaces</div>
                  </div>
                </div>

                {/* Resonance Score */}
                <div className="flex items-center justify-between mb-4 p-2 bg-black/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-gray-300">Resonance Score</span>
                  </div>
                  <span className="text-sm font-mono text-cyan-400">
                    {(user.stats.resonanceScore * 100).toFixed(1)}%
                  </span>
                </div>

                {/* Recent Activity */}
                <div className="mb-4">
                  <div className="flex items-center space-x-1 mb-1">
                    <TrendingUp className="w-3 h-3 text-green-400" />
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
    </div>
  );
}