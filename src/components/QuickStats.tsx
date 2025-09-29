import { Users, Database, Zap, Clock } from 'lucide-react';
import { ResonanceIndicator } from './ResonanceIndicator';

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

export function QuickStats() {
  return (
    <div className="mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10
                     hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            </div>
            <div className="text-xs text-green-400 font-medium">{stat.change}</div>
          </div>
        ))}
      </div>
      
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Global Resonance Health</h3>
            <p className="text-sm text-gray-400">Network-wide quantum coherence status</p>
          </div>
          <div className="text-2xl font-bold text-cyan-400">94.7%</div>
        </div>
        <ResonanceIndicator strength={0.947} size="large" animated />
      </div>
    </div>
  );
}