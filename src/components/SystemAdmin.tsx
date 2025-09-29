import { useState } from 'react';
import { ArrowLeft, Server, Database, Users, Zap, AlertTriangle, CheckCircle, Activity, Clock, Shield, Settings, Trash2, RefreshCw, Download, Upload, Globe, Lock, Eye, TrendingUp, BarChart3 } from 'lucide-react';
import { ResonanceIndicator } from './ResonanceIndicator';

interface SystemAdminProps {
  onBack: () => void;
}

const systemMetrics = {
  uptime: '23d 14h 32m',
  totalUsers: 15847,
  activeUsers: 3241,
  totalSpaces: 2847,
  totalFiles: 125394,
  storageUsed: '2.4 TB',
  storageCapacity: '10 TB',
  networkThroughput: '1.2 GB/s',
  avgResponseTime: '12ms',
  resonanceSystemHealth: 0.94,
  quantumProcessors: 8,
  primeGenerators: 16,
  activeResonanceLocks: 1247,
  pendingSummons: 43
};

const recentEvents = [
  { time: '14:32:15', level: 'INFO', system: 'Resonance Engine', message: 'Quantum lock achieved for user_7234 in 0.8s', status: 'success' },
  { time: '14:31:42', level: 'WARN', system: 'Prime Generator', message: 'Prime pool running low (< 1000 remaining)', status: 'warning' },
  { time: '14:30:18', level: 'INFO', system: 'File System', message: 'Beacon cache cleaned, freed 2.3GB', status: 'info' },
  { time: '14:28:55', level: 'ERROR', system: 'Network Layer', message: 'Gossip protocol timeout for node_42', status: 'error' },
  { time: '14:27:33', level: 'INFO', system: 'User Manager', message: 'New user registered: quantum_researcher_89', status: 'success' },
  { time: '14:25:17', level: 'INFO', system: 'Space Manager', message: 'Space "AI Research Hub" created by user_3456', status: 'info' }
];

const nodeStatus = [
  { id: 'node-1', region: 'US-East', status: 'healthy', load: 0.23, resonanceOps: 145, uptime: '45d 2h' },
  { id: 'node-2', region: 'US-West', status: 'healthy', load: 0.34, resonanceOps: 198, uptime: '32d 14h' },
  { id: 'node-3', region: 'EU-Central', status: 'warning', load: 0.78, resonanceOps: 89, uptime: '12d 8h' },
  { id: 'node-4', region: 'Asia-Pacific', status: 'healthy', load: 0.45, resonanceOps: 167, uptime: '28d 19h' },
  { id: 'node-5', region: 'Canada', status: 'maintenance', load: 0.12, resonanceOps: 23, uptime: '3h 12m' }
];

export function SystemAdmin({ onBack }: SystemAdminProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'nodes' | 'resonance' | 'users' | 'storage' | 'logs' | 'security'>('overview');

  const tabs = [
    { id: 'overview', label: 'System Overview', icon: BarChart3 },
    { id: 'nodes', label: 'Network Nodes', icon: Globe },
    { id: 'resonance', label: 'Resonance Engine', icon: Zap },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'storage', label: 'Storage Systems', icon: Database },
    { id: 'logs', label: 'System Logs', icon: Activity },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      case 'maintenance': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return AlertTriangle;
      case 'maintenance': return Settings;
      default: return Activity;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">System Administration</h1>
          <p className="text-gray-400">Monitor and manage quantum-inspired infrastructure</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-white/10 mb-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Users', value: formatNumber(systemMetrics.totalUsers), icon: Users, color: 'text-cyan-400' },
              { label: 'Active Spaces', value: formatNumber(systemMetrics.totalSpaces), icon: Globe, color: 'text-purple-400' },
              { label: 'Files Managed', value: formatNumber(systemMetrics.totalFiles), icon: Database, color: 'text-green-400' },
              { label: 'System Uptime', value: systemMetrics.uptime, icon: Clock, color: 'text-orange-400' }
            ].map((metric) => (
              <div key={metric.label} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <metric.icon className={`w-8 h-8 ${metric.color}`} />
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{metric.value}</div>
                    <div className="text-sm text-gray-400">{metric.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* System Health */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                <span>Resonance System Health</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Overall Health</span>
                  <span className="text-cyan-400 font-mono text-lg">
                    {(systemMetrics.resonanceSystemHealth * 100).toFixed(1)}%
                  </span>
                </div>
                <ResonanceIndicator strength={systemMetrics.resonanceSystemHealth} size="large" animated />
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-lg font-bold text-white">{systemMetrics.quantumProcessors}</div>
                    <div className="text-xs text-gray-400">Quantum Processors</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-lg font-bold text-white">{systemMetrics.primeGenerators}</div>
                    <div className="text-xs text-gray-400">Prime Generators</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Activity className="w-5 h-5 text-green-400" />
                <span>Live Activity</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Active Users</span>
                  <span className="text-green-400 font-medium">{formatNumber(systemMetrics.activeUsers)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Active Resonance Locks</span>
                  <span className="text-cyan-400 font-medium">{formatNumber(systemMetrics.activeResonanceLocks)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Pending Summons</span>
                  <span className="text-yellow-400 font-medium">{systemMetrics.pendingSummons}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Network Throughput</span>
                  <span className="text-purple-400 font-medium">{systemMetrics.networkThroughput}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent System Events */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Recent System Events</h3>
              <button className="px-3 py-1.5 bg-cyan-500/20 text-cyan-300 text-sm rounded-lg hover:bg-cyan-500/30 transition-colors">
                <RefreshCw className="w-4 h-4 inline mr-1" />
                Refresh
              </button>
            </div>
            <div className="space-y-3">
              {recentEvents.map((event, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg">
                  <div className="text-xs font-mono text-gray-500 w-20 flex-shrink-0">{event.time}</div>
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    event.status === 'success' ? 'bg-green-400' :
                    event.status === 'warning' ? 'bg-yellow-400' :
                    event.status === 'error' ? 'bg-red-400' : 'bg-blue-400'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-xs px-2 py-1 rounded font-mono ${
                        event.level === 'ERROR' ? 'bg-red-500/20 text-red-300' :
                        event.level === 'WARN' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {event.level}
                      </span>
                      <span className="text-sm text-purple-300">{event.system}</span>
                    </div>
                    <div className="text-sm text-white">{event.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'nodes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Network Nodes</h2>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 bg-green-500/20 text-green-300 text-sm rounded-lg hover:bg-green-500/30 transition-colors">
                <Server className="w-4 h-4 inline mr-1" />
                Deploy Node
              </button>
              <button className="px-4 py-2 bg-cyan-500/20 text-cyan-300 text-sm rounded-lg hover:bg-cyan-500/30 transition-colors">
                <RefreshCw className="w-4 h-4 inline mr-1" />
                Refresh All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {nodeStatus.map((node) => {
              const StatusIcon = getStatusIcon(node.status);
              return (
                <div key={node.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${
                        node.status === 'healthy' ? 'bg-green-500/20' :
                        node.status === 'warning' ? 'bg-yellow-500/20' :
                        node.status === 'error' ? 'bg-red-500/20' : 'bg-blue-500/20'
                      }`}>
                        <StatusIcon className={`w-6 h-6 ${getStatusColor(node.status)}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{node.id}</h3>
                        <p className="text-sm text-gray-400">{node.region}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-8 text-center">
                      <div>
                        <div className="text-sm font-bold text-white">{(node.load * 100).toFixed(0)}%</div>
                        <div className="text-xs text-gray-400">CPU Load</div>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-cyan-400">{node.resonanceOps}</div>
                        <div className="text-xs text-gray-400">Resonance Ops/s</div>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{node.uptime}</div>
                        <div className="text-xs text-gray-400">Uptime</div>
                      </div>
                      <div>
                        <div className={`text-sm font-bold capitalize ${getStatusColor(node.status)}`}>
                          {node.status}
                        </div>
                        <div className="text-xs text-gray-400">Status</div>
                      </div>
                    </div>
                  </div>

                  {/* Load Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">Resource Usage</span>
                      <span className="text-xs text-white">{(node.load * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          node.load > 0.8 ? 'bg-red-400' :
                          node.load > 0.6 ? 'bg-yellow-400' : 'bg-green-400'
                        }`}
                        style={{ width: `${node.load * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'resonance' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-white">Resonance Engine Status</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Prime Generation</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Pool Size</span>
                  <span className="text-cyan-400">847</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Generation Rate</span>
                  <span className="text-green-400">23/min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Largest Prime</span>
                  <span className="text-purple-400 font-mono">982,451,653</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Quantum Processing</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Locks</span>
                  <span className="text-cyan-400">{systemMetrics.activeResonanceLocks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Success Rate</span>
                  <span className="text-green-400">94.7%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Lock Time</span>
                  <span className="text-orange-400">1.2s</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">System Load</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">CPU Usage</span>
                  <span className="text-yellow-400">34%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Memory Usage</span>
                  <span className="text-red-400">67%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Queue Depth</span>
                  <span className="text-blue-400">12</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add other tabs content as needed */}
    </div>
  );
}