import { Users, Search } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { User } from '../../types/common';

interface SuggestedConnectionsCardProps {
  suggestedUsers: User[];
  onFollowToggle: (userId: string) => void;
}

export function SuggestedConnectionsCard({ suggestedUsers, onFollowToggle }: SuggestedConnectionsCardProps) {
  return (
    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="flex items-center space-x-2 mb-4">
        <Users className="w-5 h-5 text-pink-400" />
        <h3 className="text-lg font-semibold text-white">Suggested Connections</h3>
      </div>
      <div className="space-y-3">
        {suggestedUsers.slice(0, 4).map((suggestedUser) => (
          <div key={suggestedUser.id} className="flex items-center space-x-3">
            <img
              src={suggestedUser.avatar}
              alt={suggestedUser.name}
              className="w-10 h-10 rounded-full border border-white/20"
            />
            <div className="flex-1">
              <p className="text-white text-sm font-medium">{suggestedUser.name}</p>
              <p className="text-gray-400 text-xs">
                Live node • Online now
              </p>
            </div>
            <Button
              variant={suggestedUser.isFollowing ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onFollowToggle(suggestedUser.id)}
            >
              {suggestedUser.isFollowing ? 'Following' : 'Follow'}
            </Button>
          </div>
        ))}
        
        <Button variant="secondary" icon={Search} className="w-full mt-4">
          Discover More People
        </Button>
      </div>
    </Card>
  );
}