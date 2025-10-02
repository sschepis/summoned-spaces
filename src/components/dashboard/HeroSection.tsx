/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Search, MessageCircle, Plus, Shield, Network, TrendingUp, Activity } from 'lucide-react';
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
  const [timeOfDay, setTimeOfDay] = useState('');
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('morning');
    else if (hour < 18) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');
  }, []);

  useEffect(() => {
    // Animate the resonance score
    const target = quantumMetrics.resonanceScore * 100;
    const increment = target / 50;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      setAnimatedScore(current);
    }, 20);

    return () => clearInterval(timer);
  }, [quantumMetrics.resonanceScore]);

  const getGreeting = () => {
    const greetings = {
      morning: ['Good morning', '🌅'],
      afternoon: ['Good afternoon', '☀️'],
      evening: ['Good evening', '🌙']
    };
    return greetings[timeOfDay as keyof typeof greetings] || ['Welcome back', '🌌'];
  };

  const [greeting, emoji] = getGreeting();

  const getResonanceColor = () => {
    if (animatedScore >= 80) return 'text-green-400';
    if (animatedScore >= 60) return 'text-yellow-400';
    if (animatedScore >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getPhaseStatus = () => {
    if (quantumMetrics.phaseAlignment >= 0.8) return { label: 'Optimal', color: 'bg-green-500' };
    if (quantumMetrics.phaseAlignment >= 0.6) return { label: 'Stable', color: 'bg-blue-500' };
    if (quantumMetrics.phaseAlignment >= 0.4) return { label: 'Syncing', color: 'bg-yellow-500' };
    return { label: 'Unstable', color: 'bg-red-500' };
  };

  const phaseStatus = getPhaseStatus();

  return (
    <div className="bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-blue-500/10
                    backdrop-blur-sm rounded-2xl border border-white/10 p-8 relative overflow-hidden">
      
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400/20 rounded-full animate-pulse"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: '3s'
            }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <img
              src={user?.avatar || 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'}
              alt="User Avatar"
              className="w-20 h-20 rounded-full object-cover border-4 border-cyan-400/50 shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {greeting}, {user?.name || 'Quantum Explorer'}! {emoji}
            </h1>
            
            <div className="flex items-center space-x-4 mb-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <span className="text-gray-300">Resonance:</span>
                <span className={`font-bold text-xl ${getResonanceColor()}`}>
                  {animatedScore.toFixed(1)}%
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${phaseStatus.color} animate-pulse`}></div>
                <span className="text-gray-300 text-sm">{phaseStatus.label} Phase</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="success" icon={Shield}>
                Quantum-Secured
              </Badge>
              <Badge variant="info" icon={Network}>
                {nodes.length} Active Node{nodes.length !== 1 ? 's' : ''}
              </Badge>
              <Badge variant="warning" icon={Activity}>
                {quantumMetrics.entanglements} Entanglement{quantumMetrics.entanglements !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Enhanced Quick Actions */}
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            icon={Search}
            onClick={onOpenSearch}
            className="hidden md:flex hover:scale-105 transition-transform"
          >
            Search
          </Button>
          <Button
            variant="secondary"
            icon={MessageCircle}
            onClick={onOpenDirectMessages}
            className="hover:scale-105 transition-transform"
          >
            Messages
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={onCreateSpace}
            className="hover:scale-105 transition-transform shadow-lg"
          >
            Create Space
          </Button>
        </div>
      </div>

      {/* Quantum Metrics Visualization */}
      <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10 relative z-10">
        <div className="text-center">
          <div className="text-2xl font-bold text-cyan-400">{(quantumMetrics.resonanceScore * 100).toFixed(1)}%</div>
          <div className="text-xs text-gray-400">Resonance</div>
          <div className="w-full bg-white/10 rounded-full h-2 mt-1">
            <div
              className="bg-cyan-400 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${quantumMetrics.resonanceScore * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">{(quantumMetrics.phaseAlignment * 100).toFixed(0)}%</div>
          <div className="text-xs text-gray-400">Phase Sync</div>
          <div className="w-full bg-white/10 rounded-full h-2 mt-1">
            <div
              className="bg-purple-400 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${quantumMetrics.phaseAlignment * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{quantumMetrics.entanglements}</div>
          <div className="text-xs text-gray-400">Entanglements</div>
          <div className="w-full bg-white/10 rounded-full h-2 mt-1">
            <div
              className="bg-green-400 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(quantumMetrics.entanglements * 10, 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">{(quantumMetrics.entropy * 10).toFixed(1)}</div>
          <div className="text-xs text-gray-400">Entropy</div>
          <div className="w-full bg-white/10 rounded-full h-2 mt-1">
            <div
              className="bg-yellow-400 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${quantumMetrics.entropy * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}