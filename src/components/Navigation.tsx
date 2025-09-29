import { Search, Home, Zap, Settings, BarChart3 } from 'lucide-react';
import { Users, Database, Clock } from 'lucide-react';
import { ResonanceIndicator } from './ResonanceIndicator';
import { View } from '../App';

interface NavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const navItems = [
    { id: 'dashboard' as View, icon: Home, label: 'Spaces' },
    { id: 'search' as View, icon: Search, label: 'Semantic Search' },
    { id: 'analytics' as View, icon: BarChart3, label: 'Analytics' },
  ];

  const stats = [
    {
      label: 'Total Spaces',
      value: '12',
      icon: Database,
      change: '+2 this week',
      color: 'text-cyan-400'
    },
    {
      label: 'Active Members',
      value: '247',
      icon: Users,
      change: '+18 today',
      color: 'text-green-400'
    },
    {
      label: 'Resonance Events',
      value: '1.2k',
      icon: Zap,
      change: '+156 today',
      color: 'text-purple-400'
    },
    {
      label: 'Avg Response Time',
      value: '12ms',
      icon: Clock,
      change: '-5ms improved',
      color: 'text-orange-400'
    }
  ];

  return (
    <nav className="relative z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Navigation Row */}
        <div className="flex items-center justify-between h-16 border-b border-white/5">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Zap className="w-8 h-8 text-cyan-400" />
              <div className="absolute inset-0 animate-pulse">
                <Zap className="w-8 h-8 text-cyan-300 opacity-50" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">summoned.spaces</h1>
              <p className="text-xs text-cyan-300 opacity-80">Quantum-Inspired Collaboration</p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
                  currentView === item.id
                    ? 'bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/20'
                    : 'text-gray-300 hover:text-cyan-300 hover:bg-white/5'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
            <button className="p-2 rounded-lg text-gray-300 hover:text-cyan-300 hover:bg-white/5 transition-all duration-200">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {stats.map((stat, index) => (
                <div key={stat.label} className="flex items-center space-x-2">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <div className="flex items-baseline space-x-2">
                    <span className="text-sm font-bold text-white">{stat.value}</span>
                    <span className="text-xs text-gray-400">{stat.label}</span>
                  </div>
                  <span className="text-xs text-green-400">{stat.change}</span>
                </div>
              ))}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-xs font-medium text-white">Global Resonance Health</div>
                <div className="text-xs text-gray-400">Network-wide quantum coherence</div>
              </div>
              <div className="text-sm font-bold text-cyan-400">94.7%</div>
              <div className="w-32">
                <ResonanceIndicator strength={0.947} size="small" animated />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}