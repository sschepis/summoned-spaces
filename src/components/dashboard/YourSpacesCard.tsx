import { Globe } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Space } from '../../types/common';

interface YourSpacesCardProps {
  spaces: Space[];
  onViewSpace: (spaceId: string) => void;
}

export function YourSpacesCard({ spaces, onViewSpace }: YourSpacesCardProps) {
  if (spaces.length === 0) return null;

  return (
    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="flex items-center space-x-2 mb-4">
        <Globe className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Your Spaces</h3>
      </div>
      <div className="space-y-3">
        {spaces.slice(0, 3).map((space) => (
          <div key={space.id} 
               className="flex items-center justify-between p-3 bg-white/5 rounded-lg 
                         hover:bg-white/10 transition-colors cursor-pointer"
               onClick={() => onViewSpace(space.id)}>
            <div>
              <p className="text-white font-medium">{space.name}</p>
              <p className="text-gray-400 text-sm">
                {space.memberCount} members • {space.recentActivity}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full bg-green-400`}></div>
              <span className="text-xs text-gray-400">
                {(space.resonanceStrength! * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
        
        {spaces.length > 3 && (
          <Button variant="ghost" className="w-full mt-3">
            View All {spaces.length} Spaces
          </Button>
        )}
      </div>
    </Card>
  );
}