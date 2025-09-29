import { useState } from 'react';
import { Heart, MessageCircle, Share, UserPlus, UserCheck, Zap, Upload, Download, Users, Settings, Trash2, Star } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'file_summoned' | 'file_contributed' | 'space_created' | 'member_joined' | 'resonance_locked' | 'file_starred' | 'space_updated' | 'collaboration_started';
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
  };
  resonanceData?: {
    strength: number;
    timeToLock: string;
  };
}

const mockActivityStream: ActivityItem[] = [
  {
    id: '1',
    type: 'file_contributed',
    user: {
      id: 'sarah-chen',
      name: 'Dr. Sarah Chen',
      username: '@sarahchen_quantum',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isFollowing: true,
      verified: true
    },
    action: 'contributed a breakthrough paper on quantum algorithms',
    target: 'quantum_breakthrough_2024.pdf',
    space: 'Quantum Research Lab',
    details: 'New theoretical framework for prime-resonant quantum computing architectures',
    timestamp: '2 minutes ago',
    metrics: { likes: 23, comments: 8, shares: 5 },
    resonanceData: { strength: 0.96, timeToLock: '1.2s' }
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
    action: 'achieved perfect resonance lock',
    target: 'complex_dataset.csv',
    space: 'Data Science Collective',
    details: 'First successful 100% resonance lock in the network this month!',
    timestamp: '15 minutes ago',
    metrics: { likes: 47, comments: 12, shares: 8 },
    resonanceData: { strength: 1.0, timeToLock: '0.8s' }
  },
  {
    id: '3',
    type: 'space_created',
    user: {
      id: 'amanda-liu',
      name: 'Dr. Amanda Liu',
      username: '@amandal_research',
      avatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isFollowing: true,
      verified: true
    },
    action: 'created a new collaborative space',
    target: 'AI Ethics Research Hub',
    details: 'Bringing together researchers to discuss ethical implications of quantum AI',
    timestamp: '1 hour ago',
    metrics: { likes: 31, comments: 15, shares: 12 }
  },
  {
    id: '4',
    type: 'collaboration_started',
    user: {
      id: 'elena-kowalski',
      name: 'Elena Kowalski',
      username: '@elenakdesign',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isFollowing: false
    },
    action: 'started a collaboration session',
    space: 'Design System Collective',
    details: 'Live design session: Quantum UI components v2.0 - join the resonance!',
    timestamp: '2 hours ago',
    metrics: { likes: 18, comments: 6, shares: 3 }
  },
  {
    id: '5',
    type: 'file_summoned',
    user: {
      id: 'james-wilson',
      name: 'James Wilson',
      username: '@jwilson_dev',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      isFollowing: true
    },
    action: 'successfully summoned a large dataset',
    target: 'quantum_measurements_2024.zip',
    space: 'Physics Research Network',
    details: '15GB dataset summoned in record time through parallel resonance locking',
    timestamp: '3 hours ago',
    metrics: { likes: 42, comments: 9, shares: 7 },
    resonanceData: { strength: 0.94, timeToLock: '45s' }
  }
];

const activityIcons = {
  file_contributed: Upload,
  file_summoned: Download,
  space_created: Settings,
  member_joined: Users,
  resonance_locked: Zap,
  file_starred: Star,
  space_updated: Settings,
  collaboration_started: Users
};

const activityColors = {
  file_contributed: 'text-blue-400',
  file_summoned: 'text-green-400',
  space_created: 'text-purple-400',
  member_joined: 'text-cyan-400',
  resonance_locked: 'text-yellow-400',
  file_starred: 'text-pink-400',
  space_updated: 'text-orange-400',
  collaboration_started: 'text-emerald-400'
};

export function PublicActivityStream() {
  const [activities, setActivities] = useState(mockActivityStream);

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
                ? { ...activity.metrics, likes: activity.metrics.likes + 1 }
                : { likes: 1, comments: 0, shares: 0 }
            }
          : activity
      )
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-1">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Network Activity</h2>
        <p className="text-gray-400">Real-time feed of quantum collaboration across all spaces</p>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => {
          const ActivityIcon = activityIcons[activity.type];
          const iconColor = activityColors[activity.type];

          return (
            <div
              key={activity.id}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 
                       transition-all duration-200"
            >
              <div className="flex space-x-4">
                {/* User Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={activity.user.avatar}
                    alt={activity.user.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/10"
                  />
                  <div className={`absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-800 border border-white/10 ${iconColor}`}>
                    <ActivityIcon className="w-3 h-3" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-white">{activity.user.name}</span>
                    <span className="text-sm text-gray-400">{activity.user.username}</span>
                    {activity.user.verified && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{activity.timestamp}</span>
                    
                    {/* Follow Button */}
                    <button
                      onClick={() => handleFollow(activity.user.id)}
                      className={`ml-auto px-3 py-1 text-xs rounded-full transition-colors ${
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
                  </div>

                  <div className="text-white mb-2">
                    <span>{activity.action}</span>
                    {activity.target && (
                      <>
                        <span className="mx-1">•</span>
                        <span className="font-mono text-cyan-300 text-sm">{activity.target}</span>
                      </>
                    )}
                    {activity.space && (
                      <>
                        <span className="text-gray-400 mx-1">in</span>
                        <span className="text-purple-300">{activity.space}</span>
                      </>
                    )}
                  </div>

                  {activity.details && (
                    <p className="text-gray-300 text-sm mb-3 leading-relaxed">{activity.details}</p>
                  )}

                  {/* Resonance Data */}
                  {activity.resonanceData && (
                    <div className="flex items-center space-x-4 mb-3 p-2 bg-black/20 rounded-lg">
                      <div className="flex items-center space-x-1">
                        <Zap className="w-3 h-3 text-cyan-400" />
                        <span className="text-xs text-gray-400">Resonance:</span>
                        <span className="text-xs font-mono text-cyan-400">
                          {(activity.resonanceData.strength * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-400">Lock Time:</span>
                        <span className="text-xs font-mono text-green-400">
                          {activity.resonanceData.timeToLock}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Engagement Metrics */}
                  {activity.metrics && (
                    <div className="flex items-center space-x-6 text-gray-400">
                      <button
                        onClick={() => handleLike(activity.id)}
                        className="flex items-center space-x-1 hover:text-pink-400 transition-colors group"
                      >
                        <Heart className="w-4 h-4 group-hover:fill-current" />
                        <span className="text-sm">{activity.metrics.likes}</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-blue-400 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">{activity.metrics.comments}</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-green-400 transition-colors">
                        <Share className="w-4 h-4" />
                        <span className="text-sm">{activity.metrics.shares}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white 
                         rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all 
                         duration-200 font-medium">
          Load More Activity
        </button>
      </div>
    </div>
  );
}