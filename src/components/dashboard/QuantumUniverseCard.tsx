/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Star, Settings, Users, Globe, TrendingUp, Activity, Eye, EyeOff } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { userDataManager } from '../../services/user-data-manager';

interface QuantumUniverseCardProps {
  spaces: any[];
  followerCount: number;
  quantumMetrics: {
    resonanceScore: number;
    phaseAlignment: number;
    entanglements: number;
    entropy: number;
  };
  onOpenSettings: () => void;
}

export function QuantumUniverseCard({
  spaces,
  followerCount,
  quantumMetrics,
  onOpenSettings
}: QuantumUniverseCardProps) {
  const [showDetailed, setShowDetailed] = useState(false);
  
  const followingCount = userDataManager.getFollowingList().length;
  const totalConnections = followingCount + followerCount;
  const networkScore = Math.round((quantumMetrics.resonanceScore + quantumMetrics.phaseAlignment) * 50);

  const getStatTrend = (current: number, previous = current * 0.8) => {
    const change = current - previous;
    return {
      isUp: change > 0,
      percentage: Math.abs((change / (previous || 1)) * 100).toFixed(1)
    };
  };

  const followingTrend = getStatTrend(followingCount);
  const followerTrend = getStatTrend(followerCount);

  return (
    <Card className="bg-white/5 backdrop-blur-sm border border-white/10 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-400/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Quantum Universe</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetailed(!showDetailed)}
            className="text-gray-400 hover:text-white"
          >
            {showDetailed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>

        <div className="space-y-4">
          {/* Main Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Users className="w-4 h-4 text-cyan-400" />
                <span className="text-2xl font-bold text-white">{followingCount}</span>
                {followingTrend.isUp && (
                  <TrendingUp className="w-3 h-3 text-green-400" />
                )}
              </div>
              <div className="text-xs text-gray-400">Following</div>
            </div>
            
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="text-2xl font-bold text-white">{followerCount}</span>
                {followerTrend.isUp && (
                  <TrendingUp className="w-3 h-3 text-green-400" />
                )}
              </div>
              <div className="text-xs text-gray-400">Followers</div>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300 text-sm">Spaces Joined</span>
              </div>
              <span className="text-white font-bold">{spaces.length}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300 text-sm">Network Score</span>
              </div>
              <span className="text-yellow-400 font-bold">{networkScore}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Quantum Coherence</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-white/10 rounded-full h-2">
                  <div
                    className="bg-cyan-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${quantumMetrics.phaseAlignment * 100}%` }}
                  ></div>
                </div>
                <span className="text-cyan-400 font-bold text-sm">
                  {(quantumMetrics.phaseAlignment * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Detailed View */}
          {showDetailed && (
            <div className="mt-4 pt-4 border-t border-white/10 space-y-3 animate-fade-in">
              <div className="text-sm text-gray-400 font-medium mb-2">Network Analytics</div>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white/5 rounded p-2">
                  <div className="text-gray-400">Connections</div>
                  <div className="text-white font-bold">{totalConnections}</div>
                </div>
                <div className="bg-white/5 rounded p-2">
                  <div className="text-gray-400">Entanglements</div>
                  <div className="text-white font-bold">{quantumMetrics.entanglements}</div>
                </div>
                <div className="bg-white/5 rounded p-2">
                  <div className="text-gray-400">Resonance</div>
                  <div className="text-white font-bold">{(quantumMetrics.resonanceScore * 100).toFixed(1)}%</div>
                </div>
                <div className="bg-white/5 rounded p-2">
                  <div className="text-gray-400">Entropy</div>
                  <div className="text-white font-bold">{(quantumMetrics.entropy * 10).toFixed(1)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Following Growth</span>
                <span className={`font-bold ${followingTrend.isUp ? 'text-green-400' : 'text-red-400'}`}>
                  {followingTrend.isUp ? '+' : '-'}{followingTrend.percentage}%
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Follower Growth</span>
                <span className={`font-bold ${followerTrend.isUp ? 'text-green-400' : 'text-red-400'}`}>
                  {followerTrend.isUp ? '+' : '-'}{followerTrend.percentage}%
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 pt-4 border-t border-white/10">
          <Button
            variant="secondary"
            icon={Settings}
            onClick={onOpenSettings}
            className="w-full hover:scale-105 transition-transform"
          >
            Manage Account
          </Button>
        </div>
      </div>
    </Card>
  );
}