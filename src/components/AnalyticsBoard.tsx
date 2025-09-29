import { TrendingUp, Users, Database, Zap, Clock, Activity, BarChart3, PieChart } from 'lucide-react';
import { ResonanceIndicator } from './ResonanceIndicator';

const analyticsData = {
  overview: {
    totalSpaces: 12,
    totalFiles: 1247,
    activeUsers: 89,
    avgResonance: 0.847,
    totalStorage: '15.6 GB',
    summonSuccess: 94.2
  },
  trends: [
    { label: 'Files Summoned', value: 156, change: +12, period: 'today' },
    { label: 'New Contributions', value: 43, change: +8, period: 'today' },
    { label: 'Active Sessions', value: 28, change: -3, period: 'now' },
    { label: 'Avg Response Time', value: '12ms', change: -2, period: 'today' }
  ],
  resonanceHealth: [
    { space: 'Project Quantum', strength: 0.94, trend: 'up' },
    { space: 'Design System', strength: 0.89, trend: 'up' },
    { space: 'Research Papers', strength: 0.82, trend: 'stable' },
    { space: 'Temporal Archive', strength: 0.76, trend: 'down' }
  ],
  recentActivity: [
    { time: '14:32', event: 'High resonance achieved', space: 'Project Quantum', type: 'success' },
    { time: '14:28', event: 'New member joined', space: 'Design System', type: 'info' },
    { time: '14:15', event: 'File contribution', space: 'Research Papers', type: 'info' },
    { time: '14:02', event: 'Resonance lock timeout', space: 'Temporal Archive', type: 'warning' }
  ]
};

export function AnalyticsBoard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
      {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h2>
          <p className="text-gray-400">Comprehensive insights into your quantum collaboration network</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Total Spaces', value: analyticsData.overview.totalSpaces, icon: Database, color: 'text-cyan-400' },
          { label: 'Files Managed', value: analyticsData.overview.totalFiles.toLocaleString(), icon: BarChart3, color: 'text-purple-400' },
          { label: 'Active Users', value: analyticsData.overview.activeUsers, icon: Users, color: 'text-green-400' },
          { label: 'Storage Used', value: analyticsData.overview.totalStorage, icon: Activity, color: 'text-orange-400' },
          { label: 'Summon Success', value: `${analyticsData.overview.summonSuccess}%`, icon: Zap, color: 'text-yellow-400' },
          { label: 'Avg Resonance', value: `${(analyticsData.overview.avgResonance * 100).toFixed(1)}%`, icon: TrendingUp, color: 'text-pink-400' }
        ].map((metric, index) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trends */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Performance Trends</h3>
          </div>
          <div className="space-y-4">
            {analyticsData.trends.map((trend, index) => (
              <div key={trend.label} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <div className="text-white font-medium">{trend.label}</div>
                  <div className="text-sm text-gray-400">{trend.period}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">{trend.value}</div>
                  <div className={`text-sm ${trend.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trend.change > 0 ? '+' : ''}{trend.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resonance Health */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center space-x-2 mb-6">
            <Zap className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Resonance Health by Space</h3>
          </div>
          <div className="space-y-4">
            {analyticsData.resonanceHealth.map((space, index) => (
              <div key={space.space} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{space.space}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono text-cyan-400">
                      {(space.strength * 100).toFixed(0)}%
                    </span>
                    <div className={`w-2 h-2 rounded-full ${
                      space.trend === 'up' ? 'bg-green-400' :
                      space.trend === 'down' ? 'bg-red-400' : 'bg-yellow-400'
                    }`} />
                  </div>
                </div>
                <ResonanceIndicator strength={space.strength} animated />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex items-center space-x-2 mb-6">
          <Clock className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">Real-time Activity Log</h3>
        </div>
        <div className="space-y-3">
          {analyticsData.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
              <div className="text-sm font-mono text-gray-400 w-12">{activity.time}</div>
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'success' ? 'bg-green-400' :
                activity.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
              }`} />
              <div className="flex-1">
                <span className="text-white">{activity.event}</span>
                <span className="text-gray-400 mx-2">in</span>
                <span className="text-purple-300">{activity.space}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-white/10">
          <button className="w-full text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
            View full activity log
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}