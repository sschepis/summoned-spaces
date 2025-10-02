import { Clock } from 'lucide-react';
import { Card } from '../ui/Card';

interface ActivityItem {
  id: string;
  type: string;
  user: { name: string; avatar: string };
  content: string;
  timestamp: Date;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface RecentActivityCardProps {
  recentActivity: ActivityItem[];
}

export function RecentActivityCard({ recentActivity }: RecentActivityCardProps) {
  return (
    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="flex items-center space-x-2 mb-4">
        <Clock className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
      </div>
      <div className="space-y-3">
        {recentActivity.length > 0 ? (
          recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full bg-${activity.color}-500/20 
                             flex items-center justify-center`}>
                <activity.icon className={`w-4 h-4 text-${activity.color}-400`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white">
                  <span className="font-medium">{activity.user.name}</span>{' '}
                  {activity.content}
                </p>
                <p className="text-xs text-gray-400">
                  {activity.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm">No recent activity</p>
        )}
      </div>
    </Card>
  );
}