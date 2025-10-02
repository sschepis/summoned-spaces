/* eslint-disable @typescript-eslint/no-explicit-any */
import { Search, MessageCircle, Plus, Shield, Network, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { User } from '../../types/common';

interface HeroSectionProps {
  user: User | null;
  quantumMetrics: {
    resonanceScore: number;
    phaseAlignment: number;
    entanglements: number;
    entropy: number;
  };
  nodes: any[];
  onOpenSearch: () => void;
  onOpenDirectMessages: () => void;
  onCreateSpace: () => void;
}

export function HeroSection({ 
  user, 
  quantumMetrics, 
  nodes, 
  onOpenSearch, 
  onOpenDirectMessages, 
  onCreateSpace 
}: HeroSectionProps) {
  return (
    <div className="bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-blue-500/10 
                    backdrop-blur-sm rounded-2xl border border-white/10 p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <img
            src={user?.avatar || 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'}
            alt="User Avatar"
            className="w-20 h-20 rounded-full object-cover border-4 border-cyan-400/50"
          />
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              Welcome back, {user?.name || 'Quantum Explorer'}! 🌌
            </h1>
            <p className="text-gray-300 text-lg">
              Your quantum network is resonating at {(quantumMetrics.resonanceScore * 100).toFixed(1)}%
            </p>
            <div className="flex items-center space-x-4 mt-2">
              <Badge variant="success" icon={Shield}>Quantum-Secured</Badge>
              <Badge variant="info" icon={Network}>
                {nodes.length} Active Nodes
              </Badge>
              <Badge variant="warning" icon={Zap}>
                Phase-Locked
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            icon={Search}
            onClick={onOpenSearch}
            className="hidden md:flex"
          >
            Search
          </Button>
          <Button
            variant="secondary"
            icon={MessageCircle}
            onClick={onOpenDirectMessages}
          >
            Messages
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={onCreateSpace}
          >
            Create Space
          </Button>
        </div>
      </div>
    </div>
  );
}