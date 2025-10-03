import { useState, useEffect } from 'react';
import { Server, Database, Users, Zap, Activity, Clock, Shield, RefreshCw, Globe, BarChart3 } from 'lucide-react';
import { ResonanceIndicator } from './ResonanceIndicator';
import { PageHeader } from './ui/PageHeader';
import { Tabs } from './ui/Tabs';
import { StatsGrid } from './common/StatsGrid';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface SystemAdminProps {
  onBack: () => void;
}

interface SystemMetrics {
  uptime: string;
  totalUsers: number;
  activeUsers: number;
  totalSpaces: number;
  totalFiles: number;
  storageUsed: string;
  storageCapacity: string;
  networkThroughput: string;
  avgResponseTime: string;
  resonanceSystemHealth: number;
  quantumProcessors: number;
  primeGenerators: number;
  activeResonanceLocks: number;
  pendingSummons: number;
}

interface SystemEvent {
  time: string;
  level: string;
  system: string;
  message: string;
  status: string;
}

interface NodeStatus {
  id: string;
  region: string;
  status: string;
  load: number;
  resonanceOps: number;
  uptime: string;
}

export function SystemAdmin({ onBack }: SystemAdminProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'nodes' | 'resonance' | 'users' | 'storage' | 'logs' | 'security'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [recentEvents, setRecentEvents] = useState<SystemEvent[]>([]);
  const [nodeStatus, setNodeStatus] = useState<NodeStatus[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load system metrics
  useEffect(() => {
    loadSystemData();
    // Set up polling for real-time updates
    const interval = setInterval(loadSystemData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSystemData = async () => {
    try {
      setError(null);
      
      // Load system metrics
      const [metricsRes, eventsRes, nodesRes] = await Promise.all([
        fetch('/api/admin/system/metrics'),
        fetch('/api/admin/system/events?limit=10'),
        fetch('/api/admin/system/nodes')
      ]);

      if (!metricsRes.ok || !eventsRes.ok || !nodesRes.ok) {
        throw new Error('Failed to load system data');
      }

      const [metrics, events, nodes] = await Promise.all([
        metricsRes.json(),
        eventsRes.json(),
        nodesRes.json()
      ]);

      setSystemMetrics(metrics);
      setRecentEvents(events);
      setNodeStatus(nodes);
    } catch (err) {
      console.error('Failed to load system data:', err);
      setError('Failed to load system data. Please check your permissions.');
      
      // Set default values on error
      setSystemMetrics({
        uptime: '0d 0h 0m',
        totalUsers: 0,
        activeUsers: 0,
        totalSpaces: 0,
        totalFiles: 0,
        storageUsed: '0 GB',
        storageCapacity: '0 GB',
        networkThroughput: '0 MB/s',
        avgResponseTime: '0ms',
        resonanceSystemHealth: 0,
        quantumProcessors: 0,
        primeGenerators: 0,
        activeResonanceLocks: 0,
        pendingSummons: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSystemData();
    setRefreshing(false);
  };

  const handleNodeAction = async (nodeId: string, action: 'restart' | 'maintenance' | 'deploy') => {
    try {
      const response = await fetch(`/api/admin/system/nodes/${nodeId}/${action}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${action} node`);
      }
      
      // Reload node status
      await loadSystemData();
    } catch (err) {
      console.error(`Failed to ${action} node:`, err);
      setError(`Failed to ${action} node. Please try again.`);
    }
  };

  const tabs = [
    { id: 'overview', label: 'System Overview', icon: BarChart3 },
    { id: 'nodes', label: 'Network Nodes', icon: Globe },
    { id: 'resonance', label: 'Resonance Engine', icon: Zap },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'storage', label: 'Storage Systems', icon: Database },
    { id: 'logs', label: 'System Logs', icon: Activity },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="System Administration"
        subtitle="Monitor and manage quantum-inspired infrastructure"
        onBack={onBack}
      />

      {/* Tab Navigation */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as 'overview' | 'nodes' | 'resonance' | 'users' | 'storage' | 'logs' | 'security')}
        className="mb-8"
      />

      {activeTab === 'overview' && (
        <div className="space-y-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400">{error}</p>
            </div>
          ) : systemMetrics && (
            <>
              {/* Key Metrics */}
              <StatsGrid
                stats={[
                  { label: 'Total Users', value: systemMetrics.totalUsers, icon: Users, color: 'text-cyan-400' },
                  { label: 'Active Spaces', value: systemMetrics.totalSpaces, icon: Globe, color: 'text-purple-400' },
                  { label: 'Files Managed', value: systemMetrics.totalFiles, icon: Database, color: 'text-green-400' },
                  { label: 'System Uptime', value: systemMetrics.uptime, icon: Clock, color: 'text-orange-400' }
                ]}
                cols={4}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* System Health */}
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                <span>Resonance System Health</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Overall Health</span>
                  <span className="text-cyan-400 font-mono text-lg">
                    {((systemMetrics?.resonanceSystemHealth || 0) * 100).toFixed(1)}%
                  </span>
                </div>
                <ResonanceIndicator strength={systemMetrics?.resonanceSystemHealth || 0} size="large" animated />
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-lg font-bold text-white">{systemMetrics?.quantumProcessors || 0}</div>
                    <div className="text-xs text-gray-400">Quantum Processors</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-lg font-bold text-white">{systemMetrics?.primeGenerators || 0}</div>
                    <div className="text-xs text-gray-400">Prime Generators</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Activity className="w-5 h-5 text-green-400" />
                <span>Live Activity</span>
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Active Users', value: systemMetrics?.activeUsers || 0, color: 'text-green-400' },
                  { label: 'Active Resonance Locks', value: systemMetrics?.activeResonanceLocks || 0, color: 'text-cyan-400' },
                  { label: 'Pending Summons', value: systemMetrics?.pendingSummons || 0, color: 'text-yellow-400' },
                  { label: 'Network Throughput', value: systemMetrics?.networkThroughput || '0 MB/s', color: 'text-purple-400' }
                ].map((metric) => (
                  <div key={metric.label} className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">{metric.label}</span>
                    <span className={`font-medium ${metric.color}`}>{metric.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Recent System Events */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Recent System Events</h3>
              <Button
                variant="secondary"
                size="sm"
                icon={RefreshCw}
                onClick={handleRefresh}
                disabled={refreshing}
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
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
          </Card>
            </>
          )}
        </div>
      )}

      {activeTab === 'nodes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-white">Network Nodes</h2>
              <p className="text-gray-400">Monitor global infrastructure status</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="success"
                size="sm"
                icon={Server}
                onClick={() => handleNodeAction('new', 'deploy')}
              >
                Deploy Node
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={RefreshCw}
                onClick={handleRefresh}
                disabled={refreshing}
              >
                {refreshing ? 'Refreshing...' : 'Refresh All'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {nodeStatus.map((node) => {
              const getStatusColor = (status: string) => {
                switch (status) {
                  case 'healthy': return 'success';
                  case 'warning': return 'warning';
                  case 'error': return 'error';
                  case 'maintenance': return 'info';
                  default: return 'default';
                }
              };

              return (
                <Card key={node.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-lg bg-white/10">
                        <Server className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{node.id}</h3>
                        <p className="text-sm text-gray-400">{node.region}</p>
                      </div>
                      <Badge variant={getStatusColor(node.status) as 'success' | 'warning' | 'error' | 'info' | 'default'}>
                        {node.status}
                      </Badge>
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
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'resonance' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-white mb-6">Resonance Engine Status</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
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
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">Quantum Processing</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Locks</span>
                  <span className="text-cyan-400">{systemMetrics?.activeResonanceLocks || 0}</span>
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
            </Card>

            <Card>
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
            </Card>
          </div>
        </div>
      )}

      {/* Add other tabs content as needed */}
    </div>
  );
}