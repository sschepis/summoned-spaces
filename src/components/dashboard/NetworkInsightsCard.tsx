/* eslint-disable @typescript-eslint/no-explicit-any */
import { TrendingUp, Users, Eye, Activity } from 'lucide-react';
import { Card } from '../ui/Card';
import { userDataManager } from '../../services/user-data-manager';

interface ActivityItem {
  id: string;
  type: string;
  user: { name: string; avatar: string };
  content: string;
  timestamp: Date;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface NetworkInsightsCardProps {
  nodes: any[];
  recentActivity: ActivityItem[];
  quantumMetrics: {
    resonanceScore: number;
    phaseAlignment: number;
    entanglements: number;
    entropy: number;
  };
}

export function NetworkInsightsCard({ nodes, recentActivity, quantumMetrics }: NetworkInsightsCardProps) {
  return (
    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="flex items-center space-x-2 mb-4">
        <TrendingUp className="w-5 h-5 text-orange-400" />
        <h3 className="text-lg font-semibold text-white">Network Insights</h3>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-300">Active Connections</span>
          </div>
          <span className="text-white font-bold">{nodes.length}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-purple-400" />
            <span className="text-gray-300">Beacons Created</span>
          </div>
          <span className="text-white font-bold">{recentActivity.length}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-gray-300">Network Growth</span>
          </div>
          <span className="text-green-400 font-bold">
            +{Math.max(0, quantumMetrics.entanglements - userDataManager.getFollowingList().length)}
          </span>
        </div>

        <div className="pt-3 border-t border-white/10">
          <div className="text-xs text-gray-400 mb-2">Recent Activity Pattern</div>
          <div className="h-16 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-blue-500/20
                        rounded-lg flex items-end justify-center space-x-1 p-2">
              {recentActivity.slice(0, 7).map((activity, i) => {
                const activityAge = Date.now() - activity.timestamp.getTime();
                const height = Math.max(0.2, 1 - (activityAge / (24 * 60 * 60 * 1000))); // Fresher = taller
                return (
                  <div
                    key={i}
                    className="bg-cyan-400/50 rounded-sm"
                    style={{
                      height: `${height * 100}%`,
                      width: '12px'
                    }}
                  />
                );
              })}
              {recentActivity.length === 0 && (
                <div className="text-gray-400 text-xs">No activity yet</div>
              )}
            </div>
        </div>
      </div>
    </Card>
  );
}