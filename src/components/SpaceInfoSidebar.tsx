import { useState, useEffect } from 'react';
import { Users, Calendar, Star, Shield, Settings, Plus, TrendingUp, Zap, Crown, Eye } from 'lucide-react';
import { ResonanceIndicator } from './ResonanceIndicator';
import { beaconCacheManager } from '../services/beacon-cache';
import { holographicMemoryManager } from '../services/holographic-memory';

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

export function SpaceInfoSidebar() {
  const [space, setSpace] = useState<SpaceInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSpaceInfo = async () => {
      try {
        // TODO: Implement real beacon-based space info loading
        // In a real implementation, this would:
        // 1. Fetch space metadata beacons
        // 2. Fetch space statistics beacons
        // 3. Fetch moderator list beacons for this space
        // 4. Decode all beacons and compile space info
        
        console.log('Loading space info from beacon system...');
        setLoading(false);
        
        // For now, use empty state until beacon infrastructure is implemented
        // Example implementation:
        // const spaceBeacon = await beaconCacheManager.getSpaceInfo('global-space');
        // const statsBeacon = await beaconCacheManager.getSpaceStats('global-space');
        // const moderatorsBeacon = await beaconCacheManager.getSpaceModerators('global-space');
        //
        // const decodedSpace = holographicMemoryManager.decodeMemory(spaceBeacon);
        // const decodedStats = holographicMemoryManager.decodeMemory(statsBeacon);
        // const decodedModerators = holographicMemoryManager.decodeMemory(moderatorsBeacon);
        //
        // setSpace({
        //   ...JSON.parse(decodedSpace),
        //   stats: JSON.parse(decodedStats),
        //   moderators: JSON.parse(decodedModerators)
        // });
        
      } catch (error) {
        console.error('Failed to load space info:', error);
        setLoading(false);
      }
    };

    loadSpaceInfo();
  }, []);

  if (loading) {
    return (
      <div className="w-80 space-y-4">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-white/10 rounded"></div>
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
            <div className="h-4 bg-white/10 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="w-80">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <p className="text-gray-400 text-center">No space information available</p>
          <p className="text-gray-500 text-sm text-center mt-2">
            Space data will be loaded from beacon system when implemented
          </p>
        </div>
      </div>
    );
  }

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