import { Bell, FileText, Users, Zap, Upload, Download, Settings, Trash2, UserPlus, Star, MessageSquare } from 'lucide-react';

const activities = [
  {
    id: '1',
    type: 'user_followed',
    icon: UserPlus,
    user: 'Dr. Sarah Chen',
    action: 'started following',
    target: 'Marcus Rodriguez',
    space: null,
    timestamp: '1 minute ago',
    iconColor: 'text-cyan-400'
  },
  {
    id: '2',
    type: 'file_summoned',
    icon: Download,
    user: 'You',
    action: 'summoned',
    target: 'quantum_algorithms.pdf',
    space: 'Project Quantum',
    timestamp: '2 minutes ago',
    iconColor: 'text-green-400'
  },
  {
    id: '3',
    type: 'space_starred',
    icon: Star,
    user: 'Elena Kowalski',
    action: 'starred your space',
    target: 'Design System Collective',
    space: null,
    timestamp: '8 minutes ago',
    iconColor: 'text-yellow-400'
  },
  {
    id: '4',
    type: 'file_contributed',
    icon: Upload,
    user: 'Marcus Rodriguez',
    action: 'contributed to your space',
    target: 'entanglement_theory.docx',
    space: 'Research Papers',
    timestamp: '15 minutes ago',
    iconColor: 'text-blue-400'
  },
  {
    id: '5',
    type: 'member_joined',
    icon: Users,
    user: 'James Wilson',
    action: 'joined your space',
    target: 'Project Quantum',
    space: null,
    timestamp: '1 hour ago',
    iconColor: 'text-purple-400'
  },
  {
    id: '6',
    type: 'comment_received',
    icon: MessageSquare,
    user: 'Dr. Amanda Liu',
    action: 'commented on',
    target: 'your quantum research paper',
    space: 'Research Papers',
    timestamp: '1.5 hours ago',
    iconColor: 'text-blue-400'
  },
  {
    id: '7',
    type: 'resonance_locked',
    icon: Zap,
    user: 'System',
    action: 'achieved resonance lock for',
    target: 'measurement_data.csv',
    space: 'Your Space: Temporal Archive',
    timestamp: '2 hours ago',
    iconColor: 'text-cyan-400'
  }
];

export function ActivityFeed() {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 h-full">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <Bell className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Your Activity</h3>
        </div>
        <p className="text-sm text-gray-400 mt-1">Notifications and updates for you</p>
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