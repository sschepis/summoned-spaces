import { Users, TrendingUp, Star, Zap, MessageCircle, UserCheck, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNetworkState } from '../contexts/NetworkContext';
import { userDataManager } from '../services/user-data-manager';

interface Connection {
  name: string;
  avatar: string;
  isFollowing: boolean;
  timeAgo: string;
}

export function UserNetworkSidebar() {
  const { user } = useAuth();
  const { nodes, recentBeacons } = useNetworkState();

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const networkStats = {
    following: userDataManager.getFollowingList().length,
    followers: 0, // TODO: Implement followers count
    mutualConnections: 0, // TODO: Implement mutual connections
    activeToday: nodes.length,
    weeklyEngagement: recentBeacons.length,
    topSpaces: userDataManager.getSpacesList().slice(0, 3).map(s => ({
      name: `Space ${s.spaceId.substring(0, 8)}`,
      members: 1, // TODO: Implement member count
      role: s.role
    })),
    recentConnections: nodes.slice(0, 3).map(node => ({
      name: node.username || node.userId.substring(0, 8),
      avatar: `https://api.dicebear.com/8.x/bottts/svg?seed=${node.userId}`,
      isFollowing: userDataManager.getFollowingList().includes(node.userId),
      timeAgo: 'Online' // Since these are active connections
    }))
  };

  return (
    <div className="w-80 space-y-4">
      {/* User Profile Card */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <div className="flex items-center space-x-4 mb-4">
          <img
            src={user?.avatar || 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'}
            alt="You"
            className="w-16 h-16 rounded-full object-cover border-2 border-white/10"
          />
          <div>
            <h2 className="text-xl font-bold text-white">{user?.name || 'Your Profile'}</h2>
            <p className="text-gray-400 text-sm">{user?.username || '@yourhandle'}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-white">{formatNumber(networkStats.following)}</div>
            <div className="text-xs text-gray-400">Following</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">{formatNumber(networkStats.followers)}</div>
            <div className="text-xs text-gray-400">Followers</div>
          </div>
        </div>
      </div>

      {/* Network Activity */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <TrendingUp className="w-4 h-4" />
          <span>Network Activity</span>
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Active Today</span>
            <span className="text-green-400 font-medium">{networkStats.activeToday}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Weekly Engagement</span>
            <span className="text-cyan-400 font-medium">{networkStats.weeklyEngagement}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Mutual Connections</span>
            <span className="text-purple-400 font-medium">{networkStats.mutualConnections}</span>
          </div>
        </div>
      </div>

      {/* Your Top Spaces */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Your Top Spaces</h3>
        
        <div className="space-y-3">
          {networkStats.topSpaces.map((space, index) => (
            <div key={space.name} className="flex items-center justify-between">
              <div>
                <div className="text-white text-sm font-medium">{space.name}</div>
                <div className="text-gray-400 text-xs">{formatNumber(space.members)} members</div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                space.role === 'admin' ? 'bg-red-400/10 text-red-400' :
                space.role === 'contributor' ? 'bg-blue-400/10 text-blue-400' :
                'bg-gray-400/10 text-gray-400'
              }`}>
                {space.role}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Connections */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Connections</h3>

        <div className="space-y-3">
          {networkStats.recentConnections.length > 0 ? (
            networkStats.recentConnections.map((connection) => (
              <div key={connection.name} className="flex items-center space-x-3">
                <img
                  src={connection.avatar}
                  alt={connection.name}
                  className="w-8 h-8 rounded-full object-cover border border-white/10"
                />
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">{connection.name}</div>
                  <div className="text-gray-400 text-xs">{connection.timeAgo}</div>
                </div>
                {connection.isFollowing ? (
                  <UserCheck className="w-4 h-4 text-green-400" />
                ) : (
                  <Users className="w-4 h-4 text-gray-400" />
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm">No recent connections.</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
        <div className="grid grid-cols-2 gap-2">
          <button className="px-3 py-2 text-sm text-gray-300 hover:text-white bg-white/5 
                           hover:bg-white/10 rounded-lg transition-colors flex items-center 
                           justify-center space-x-2">
            <MessageCircle className="w-4 h-4" />
            <span>Messages</span>
          </button>
          <button className="px-3 py-2 text-sm text-gray-300 hover:text-white bg-white/5 
                           hover:bg-white/10 rounded-lg transition-colors flex items-center 
                           justify-center space-x-2">
            <Star className="w-4 h-4" />
            <span>Favorites</span>
          </button>
        </div>
      </div>
    </div>
  );
}