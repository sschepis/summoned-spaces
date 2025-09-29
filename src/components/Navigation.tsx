import { useState, useRef, useEffect } from 'react';
import { Search, Home, Zap, Settings, BarChart3, MessageCircle } from 'lucide-react';
import { Users, Database, Clock, User, LogOut, ChevronDown, Shield } from 'lucide-react';
import { ResonanceIndicator } from './ResonanceIndicator';
import { View } from '../App';

interface NavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'feed' as View, icon: Home, label: 'Home' },
    { id: 'dashboard' as View, icon: Database, label: 'Spaces' },
    { id: 'friends' as View, icon: Users, label: 'Friends' },
    { id: 'messages' as View, icon: MessageCircle, label: 'Messages' },
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
              <p className="text-xs text-cyan-300 opacity-80">Social File Sharing Network</p>
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
          </div>

          {/* User Avatar & Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg text-gray-300 hover:text-cyan-300 
                       hover:bg-white/5 transition-all duration-200 group"
            >
              <img
                src="https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2"
                alt="Your avatar"
                className="w-8 h-8 rounded-full object-cover border-2 border-white/10 
                         group-hover:border-cyan-400/50 transition-colors"
              />
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                showUserMenu ? 'rotate-180' : ''
              }`} />
            </button>
            
            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-12 w-64 bg-slate-800/95 backdrop-blur-xl 
                           rounded-xl shadow-2xl border border-white/10 py-2 z-50 
                           animate-in slide-in-from-top-2 duration-200">
                
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-white/10">
                  <div className="flex items-center space-x-3">
                    <img
                      src="https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2"
                      alt="Your avatar"
                      className="w-10 h-10 rounded-full object-cover border-2 border-white/10"
                    />
                    <div>
                      <div className="font-semibold text-white">Your Name</div>
                      <div className="text-sm text-gray-400">@yourhandle</div>
                    </div>
                  </div>
                </div>
                
                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      onViewChange('settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-300 hover:text-white 
                             hover:bg-white/10 transition-colors flex items-center space-x-3"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  
                  <div className="my-1 border-t border-white/10"></div>
                  
                  <button
                    onClick={() => {
                      onViewChange('system-admin');
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-300 hover:text-white 
                             hover:bg-white/10 transition-colors flex items-center space-x-3"
                  >
                    <Database className="w-4 h-4" />
                    <span>System Admin</span>
                  </button>
                  <button
                    onClick={() => {
                      onViewChange('content-admin');
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-300 hover:text-white 
                             hover:bg-white/10 transition-colors flex items-center space-x-3"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Content Admin</span>
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Navigate to user profile
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-300 hover:text-white 
                             hover:bg-white/10 transition-colors flex items-center space-x-3"
                  >
                    <User className="w-4 h-4" />
                    <span>Your Profile</span>
                  </button>
                  
                  <div className="my-1 border-t border-white/10"></div>
                  
                  <button
                    onClick={() => {
                      // TODO: Handle sign out
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-red-400 hover:text-red-300 
                             hover:bg-red-500/10 transition-colors flex items-center space-x-3"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-300">
              <span className="text-white font-medium">12</span> spaces, <span className="text-white font-medium">247</span> members, <span className="text-white font-medium">1.2k</span> resonance events, <span className="text-white font-medium">12ms</span> response, health:
            </div>
            <div className="flex items-center space-x-4">
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