import { Bell, FileText, Users, Zap, Upload, Download, Settings, Trash2 } from 'lucide-react';

const activities = [
  {
    id: '1',
    type: 'file_summoned',
    icon: Download,
    user: 'Dr. Sarah Chen',
    action: 'summoned',
    target: 'quantum_algorithms.pdf',
    space: 'Project Quantum',
    timestamp: '2 minutes ago',
    iconColor: 'text-green-400'
  },
  {
    id: '2',
    type: 'file_contributed',
    icon: Upload,
    user: 'Marcus Rodriguez',
    action: 'contributed',
    target: 'entanglement_theory.docx',
    space: 'Research Papers',
    timestamp: '15 minutes ago',
    iconColor: 'text-blue-400'
  },
  {
    id: '3',
    type: 'member_joined',
    icon: Users,
    user: 'Elena Kowalski',
    action: 'joined space',
    target: 'Design System',
    space: null,
    timestamp: '1 hour ago',
    iconColor: 'text-purple-400'
  },
  {
    id: '4',
    type: 'resonance_locked',
    icon: Zap,
    user: 'System',
    action: 'achieved resonance lock',
    target: 'measurement_data.csv',
    space: 'Temporal Archive',
    timestamp: '2 hours ago',
    iconColor: 'text-cyan-400'
  },
  {
    id: '5',
    type: 'space_created',
    icon: Settings,
    user: 'Dr. Amanda Liu',
    action: 'created space',
    target: 'Mathematics Archive',
    space: null,
    timestamp: '3 hours ago',
    iconColor: 'text-yellow-400'
  },
  {
    id: '6',
    type: 'file_deleted',
    icon: Trash2,
    user: 'James Wilson',
    action: 'removed',
    target: 'old_research.pdf',
    space: 'Project Quantum',
    timestamp: '5 hours ago',
    iconColor: 'text-red-400'
  }
];

export function ActivityFeed() {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 h-full">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <Bell className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className={`p-2 rounded-lg bg-black/20 ${activity.iconColor}`}>
                <activity.icon className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="text-sm">
                  <span className="font-medium text-white">{activity.user}</span>
                  <span className="text-gray-400 mx-1">{activity.action}</span>
                  <span className="font-medium text-cyan-300">{activity.target}</span>
                  {activity.space && (
                    <>
                      <span className="text-gray-400 mx-1">in</span>
                      <span className="text-purple-300">{activity.space}</span>
                    </>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">{activity.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/10">
          <button className="w-full text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
            View all activity
          </button>
        </div>
      </div>
    </div>
  );
}