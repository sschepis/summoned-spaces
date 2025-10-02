/* eslint-disable @typescript-eslint/no-explicit-any */
import { Star, Settings } from 'lucide-react';
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
  return (
    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="flex items-center space-x-2 mb-4">
        <Star className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-semibold text-white">Your Quantum Universe</h3>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Following</span>
          <span className="text-white font-bold">
            {userDataManager.getFollowingList().length}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Spaces Joined</span>
          <span className="text-white font-bold">{spaces.length}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Followers</span>
          <span className="text-white font-bold">{followerCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Quantum Coherence</span>
          <span className="text-cyan-400 font-bold">
            {(quantumMetrics.phaseAlignment * 100).toFixed(0)}%
          </span>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-white/10">
        <Button
          variant="secondary"
          icon={Settings}
          onClick={onOpenSettings}
          className="w-full"
        >
          Manage Account
        </Button>
      </div>
    </Card>
  );
}