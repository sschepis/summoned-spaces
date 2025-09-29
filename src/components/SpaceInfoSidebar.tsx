import { Users, Calendar, Star, Shield, Settings, Plus, TrendingUp, Zap, Crown, Eye } from 'lucide-react';
import { ResonanceIndicator } from './ResonanceIndicator';

interface SpaceInfo {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  createdDate: string;
  resonanceStrength: number;
  isPublic: boolean;
  userRole?: 'owner' | 'admin' | 'contributor' | 'viewer';
  isMember: boolean;
  rules: string[];
  moderators: {
    id: string;
    name: string;
    avatar: string;
    role: 'owner' | 'admin';
  }[];
  stats: {
    totalFiles: number;
    activeToday: number;
    weeklyGrowth: number;
  };
}

const mockSpaceInfo: SpaceInfo = {
  id: 'global-space',
  name: 'Global Space',
  description: 'The main public space where everyone can share content, discover new creators, and connect with the broader community. A place for general discussions, trending topics, and serendipitous discoveries.',
  memberCount: 12847,
  createdDate: 'January 2024',
  resonanceStrength: 0.89,
  isPublic: true,
  userRole: 'contributor',
  isMember: true,
  rules: [
    'Be respectful and kind to all community members',
    'No spam, self-promotion, or off-topic content',
    'Share high-quality content that adds value',
    'Use appropriate tags and descriptions',
    'Respect intellectual property and attribution'
  ],
  moderators: [
    {
      id: 'admin-1',
      name: 'Sarah Chen',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      role: 'owner'
    },
    {
      id: 'admin-2', 
      name: 'Marcus Rodriguez',
      avatar: 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      role: 'admin'
    }
  ],
  stats: {
    totalFiles: 45729,
    activeToday: 1247,
    weeklyGrowth: 12.4
  }
};

export function SpaceInfoSidebar() {
  const space = mockSpaceInfo;

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return Crown;
      case 'admin': return Shield;
      default: return Users;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'text-yellow-400';
      case 'admin': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="w-80 space-y-4">
      {/* Main Space Info Card */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-1">{space.name}</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Users className="w-4 h-4" />
              <span>{formatNumber(space.memberCount)} members</span>
              {space.isPublic ? (
                <>
                  <span>•</span>
                  <Eye className="w-4 h-4" />
                  <span>Public</span>
                </>
              ) : (
                <>
                  <span>•</span>
                  <Shield className="w-4 h-4" />
                  <span>Private</span>
                </>
              )}
            </div>
          </div>
          
          {!space.isMember ? (
            <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white 
                             rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all 
                             duration-200 text-sm font-medium flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Join Space</span>
            </button>
          ) : (
            <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10">
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className="text-gray-300 text-sm leading-relaxed mb-4">
          {space.description}
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Created</span>
            <span className="text-white">{space.createdDate}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Your Role</span>
            <div className="flex items-center space-x-1">
              {space.userRole && (
                <>
                  {(() => {
                    const RoleIcon = getRoleIcon(space.userRole);
                    return <RoleIcon className={`w-3 h-3 ${getRoleColor(space.userRole)}`} />;
                  })()}
                  <span className="text-white capitalize">{space.userRole}</span>
                </>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400">Resonance Strength</span>
              <span className="text-cyan-400 font-mono">
                {(space.resonanceStrength * 100).toFixed(1)}%
              </span>
            </div>
            <ResonanceIndicator strength={space.resonanceStrength} animated />
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <TrendingUp className="w-4 h-4" />
          <span>Space Stats</span>
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Total Files</span>
            <span className="text-white font-medium">{formatNumber(space.stats.totalFiles)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Active Today</span>
            <span className="text-green-400 font-medium">{formatNumber(space.stats.activeToday)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Weekly Growth</span>
            <span className="text-cyan-400 font-medium">+{space.stats.weeklyGrowth}%</span>
          </div>
        </div>
      </div>

      {/* Moderators Card */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Moderators</h3>
        
        <div className="space-y-3">
          {space.moderators.map((mod) => {
            const RoleIcon = getRoleIcon(mod.role);
            return (
              <div key={mod.id} className="flex items-center space-x-3">
                <img
                  src={mod.avatar}
                  alt={mod.name}
                  className="w-8 h-8 rounded-full object-cover border border-white/10"
                />
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">{mod.name}</div>
                </div>
                <RoleIcon className={`w-4 h-4 ${getRoleColor(mod.role)}`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Rules Card */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Shield className="w-4 h-4" />
          <span>Space Rules</span>
        </h3>
        
        <div className="space-y-3">
          {space.rules.map((rule, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center 
                            text-cyan-400 text-xs font-medium mt-0.5 flex-shrink-0">
                {index + 1}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{rule}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
        <div className="grid grid-cols-2 gap-2">
          <button className="px-3 py-2 text-sm text-gray-300 hover:text-white bg-white/5 
                           hover:bg-white/10 rounded-lg transition-colors flex items-center 
                           justify-center space-x-2">
            <Star className="w-4 h-4" />
            <span>Favorite</span>
          </button>
          <button className="px-3 py-2 text-sm text-gray-300 hover:text-white bg-white/5 
                           hover:bg-white/10 rounded-lg transition-colors flex items-center 
                           justify-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Boost</span>
          </button>
        </div>
      </div>
    </div>
  );
}