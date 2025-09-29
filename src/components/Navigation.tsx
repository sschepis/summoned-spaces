import { Search, Home, Zap, Settings } from 'lucide-react';
import { View } from '../App';

interface NavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const navItems = [
    { id: 'dashboard' as View, icon: Home, label: 'Spaces' },
    { id: 'search' as View, icon: Search, label: 'Semantic Search' },
  ];

  return (
    <nav className="relative z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
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
      </div>
    </nav>
  );
}