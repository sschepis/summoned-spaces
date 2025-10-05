import { useState, useRef, useEffect } from 'react';
import { Search, Home, Zap, Settings, BarChart3, MessageCircle } from 'lucide-react';
import { Users, Database, User, LogOut, ChevronDown, Shield } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ResonanceIndicator } from './ResonanceIndicator';
import { useAuth } from '../contexts/AuthContext';
import { useNetworkState } from '../contexts/NetworkContext';
import { userDataManager } from '../services/user-data';

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { nodes, recentBeacons, connectedUsers } = useNetworkState();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [responseTime, setResponseTime] = useState(0);
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

  // Calculate response time based on recent beacon activity
  useEffect(() => {
    if (recentBeacons.length > 0) {
      const recentBeaconTimes = recentBeacons.slice(0, 5).map(b => b.receivedAt);
      if (recentBeaconTimes.length > 1) {
        const avgInterval = recentBeaconTimes.reduce((acc, time, index) => {
          if (index === 0) return acc;
          return acc + (recentBeaconTimes[index - 1] - time);
        }, 0) / (recentBeaconTimes.length - 1);
        setResponseTime(Math.min(avgInterval / 10, 999)); // Convert to reasonable ms range
      } else {
        setResponseTime(12); // Default when insufficient data
      }
    } else {
      setResponseTime(12); // Default when no beacons
    }
  }, [recentBeacons]);

  // Calculate network stats from real data
  const uniqueUsers = new Set();
  
  // Add current user
  if (user?.id) {
    uniqueUsers.add(user.id);
  }
  
  // Add users from network nodes
  nodes.forEach(node => {
    uniqueUsers.add(node.userId);
  });
  
  // Add users from recent beacon activity
  recentBeacons.forEach(beacon => {
    uniqueUsers.add(beacon.authorId);
  });
  
  // Debug logging
  console.log('Navigation Debug:', {
    currentUser: user?.id,
    nodes: nodes.length,
    recentBeacons: recentBeacons.length,
    connectedUsers,
    uniqueUsersSize: uniqueUsers.size,
    uniqueUsersList: Array.from(uniqueUsers)
  });
  
  // Calculate quantum metrics for compact display
  const followingCount = userDataManager.getFollowingList().length;
  const activeConnections = Math.max(0, nodes.length - 1);
  
  // Calculate phase alignment from network synchronization
  // Phase alignment represents how well-synchronized the network is based on recent beacon activity
  const calculatePhaseAlignment = (): number => {
    if (recentBeacons.length < 2) return 0;
    
    // Calculate variance in beacon timing (lower variance = better phase alignment)
    const recentTimes = recentBeacons.slice(0, 10).map(b => b.receivedAt);
    if (recentTimes.length < 2) return 0;
    
    const intervals = recentTimes.slice(0, -1).map((t, i) => recentTimes[i + 1] - t);
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => {
      return sum + Math.pow(interval - avgInterval, 2);
    }, 0) / intervals.length;
    
    // Convert variance to alignment score (0-1, where 1 is perfectly synchronized)
    const normalizedVariance = Math.min(1, variance / 1000000); // Normalize to 0-1 range
    return Math.max(0, 1 - normalizedVariance);
  };
  
  const quantumMetrics = {
    resonanceScore: Math.min(1.0, (followingCount * 0.1) + (activeConnections * 0.2) + 0.2),
    phaseAlignment: calculatePhaseAlignment(),
    connections: activeConnections,
    entropy: Math.max(0.1, followingCount > 0 ? Math.log2(followingCount + 1) / 10 : 0.1)
  };
  
  // Calculate historical phase alignment for sparkline (last 5 time windows)
  const phaseHistory = (() => {
    const history: number[] = [];
    const windowSize = 5; // number of beacons per window
    
    for (let i = 0; i < 5; i++) {
      const windowStart = i * windowSize;
      const windowBeacons = recentBeacons.slice(windowStart, windowStart + windowSize);
      
      if (windowBeacons.length < 2) {
        history.push(quantumMetrics.phaseAlignment);
        continue;
      }
      
      const times = windowBeacons.map(b => b.receivedAt);
      const intervals = times.slice(0, -1).map((t, idx) => times[idx + 1] - t);
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((sum, interval) => {
        return sum + Math.pow(interval - avgInterval, 2);
      }, 0) / intervals.length;
      
      const normalizedVariance = Math.min(1, variance / 1000000);
      history.push(Math.max(0, 1 - normalizedVariance));
    }
    
    return history.reverse(); // oldest to newest
  })();
  
  // Calculate network growth history (connections over time windows)
  const networkGrowthHistory = (() => {
    const history: number[] = [];
    const totalWindows = 8;
    const beaconsPerWindow = Math.max(1, Math.floor(recentBeacons.length / totalWindows));
    
    for (let i = 0; i < totalWindows; i++) {
      const windowStart = i * beaconsPerWindow;
      const windowBeacons = recentBeacons.slice(windowStart, windowStart + beaconsPerWindow);
      
      // Count unique authors in this window
      const uniqueAuthors = new Set(windowBeacons.map(b => b.authorId));
      const windowConnections = uniqueAuthors.size;
      
      // Normalize to 0-1 range based on current connections
      const normalized = activeConnections > 0
        ? Math.min(1, windowConnections / activeConnections)
        : 0.3;
      
      history.push(normalized);
    }
    
    // Ensure we have 8 values, fill with current level if needed
    while (history.length < 8) {
      history.unshift(0.3);
    }
    
    return history.slice(-8); // keep last 8
  })();

  const networkStats = {
    spaces: userDataManager.getSpacesList().length,
    members: Math.max(1, uniqueUsers.size),
    resonanceEvents: recentBeacons.length,
    responseTime: Math.round(responseTime),
    health: Math.min(0.95, Math.max(0.1, (nodes.length * 0.1) + (recentBeacons.length * 0.01) + 0.7))
  };

  // Map current route to determine active navigation item
  const getCurrentView = (pathname: string): string => {
    if (pathname.startsWith('/spaces')) return 'spaces';
    if (pathname.startsWith('/friends')) return 'friends';
    if (pathname.startsWith('/messages')) return 'messages';
    if (pathname.startsWith('/search')) return 'search';
    if (pathname.startsWith('/analytics')) return 'analytics';
    return 'dashboard';
  };

  const currentView = getCurrentView(location.pathname);

  const navItems = [
    { id: 'dashboard', route: '/dashboard', icon: Home, label: 'Home' },
    { id: 'spaces', route: '/spaces', icon: Database, label: 'Spaces' },
    { id: 'friends', route: '/friends', icon: Users, label: 'Friends' },
    { id: 'messages', route: '/messages', icon: MessageCircle, label: 'Messages' },
    { id: 'search', route: '/search', icon: Search, label: 'Semantic Search' },
    { id: 'analytics', route: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const handleLogout = () => {
    console.log('[Navigation] handleLogout called, user:', user?.id);
    logout();
    // Don't navigate here - let the ProtectedRoute handle it when isAuthenticated becomes false
    console.log('[Navigation] logout() called, auth state should change and ProtectedRoute will redirect');
  };

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
                onClick={() => navigate(item.route)}
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

          {/* User Profile with Username */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium text-white">{user?.name || 'Your Name'}</div>
              <div className="text-xs text-gray-400">{user?.username || '@yourhandle'}</div>
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
                        <div className="font-semibold text-white">{user?.name || 'Your Name'}</div>
                        <div className="text-sm text-gray-400">{user?.username || '@yourhandle'}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigate('/settings');
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
                        navigate('/admin/system');
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
                        navigate('/admin/content');
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
                        navigate('/profile');
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
                        handleLogout();
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
        </div>
        
        {/* Compact Metrics Row */}
        <div className="py-2">
          <div className="flex items-center justify-between text-xs">
            {/* Left side - quantum metrics as compact sparklines */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Zap className="w-3 h-3 text-cyan-400" />
                <span className="text-gray-400">Resonance:</span>
                <span className="text-cyan-400 font-mono">{(quantumMetrics.resonanceScore * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-12 h-4 bg-white/5 rounded overflow-hidden flex items-end">
                  {phaseHistory.map((h, i) => (
                    <div key={i} className="flex-1 bg-cyan-400/70 mx-px" style={{ height: `${h * 100}%` }} />
                  ))}
                </div>
                <span className="text-gray-400">Phase:</span>
                <span className="text-purple-400 font-mono">{(quantumMetrics.phaseAlignment * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-3 h-3 text-green-400" />
                <span className="text-white font-medium">{quantumMetrics.connections}</span>
                <span className="text-gray-400">connections</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">Entropy:</span>
                <span className="text-orange-400 font-mono">{quantumMetrics.entropy.toFixed(3)}</span>
              </div>
              {/* Network Growth Chart in subheader */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="text-xs text-green-400 font-medium">+{quantumMetrics.connections}</div>
                  <span className="text-gray-400">Network Growth</span>
                </div>
                <div className="w-12 h-4 bg-white/5 rounded flex items-end space-x-px overflow-hidden">
                  {networkGrowthHistory.map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-green-400/70 transition-all duration-300"
                      style={{ height: `${height * 100}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Right side - health indicator */}
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-400">
                <span className="text-white font-medium">{networkStats.spaces}</span> spaces •
                <span className="text-white font-medium ml-1">{networkStats.members}</span> members •
                <span className="text-white font-medium ml-1">{networkStats.responseTime}ms</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-sm font-bold text-cyan-400">{(networkStats.health * 100).toFixed(0)}%</div>
                <div className="w-24">
                  <ResonanceIndicator strength={networkStats.health} size="small" animated />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}