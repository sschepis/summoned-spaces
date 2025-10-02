import { useState } from 'react';
import { Globe, Users, Calendar, TrendingUp, Plus, Star, Lock, Eye } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Space } from '../../types/common';

interface YourSpacesCardProps {
  spaces: Space[];
  onViewSpace: (spaceId: string) => void;
}

export function YourSpacesCard({ spaces, onViewSpace }: YourSpacesCardProps) {
  const [showAll, setShowAll] = useState(false);
  
  if (spaces.length === 0) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
        <div className="flex items-center space-x-2 mb-4">
          <Globe className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Your Spaces</h3>
        </div>
        <div className="text-center py-8">
          <Globe className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h4 className="text-white font-medium mb-2">No spaces yet</h4>
          <p className="text-gray-400 text-sm mb-4">
            Create or join spaces to collaborate with others
          </p>
          <Button variant="primary" size="sm" icon={Plus}>
            Create Your First Space
          </Button>
        </div>
      </Card>
    );
  }

  const displaySpaces = showAll ? spaces : spaces.slice(0, 3);
  
  const getActivityColor = (activity: string) => {
    if (activity.toLowerCase().includes('active')) return 'bg-green-400';
    if (activity.toLowerCase().includes('recent')) return 'bg-yellow-400';
    return 'bg-gray-400';
  };

  const getResonanceColor = (strength: number) => {
    if (strength >= 0.8) return 'text-green-400';
    if (strength >= 0.6) return 'text-yellow-400';
    if (strength >= 0.4) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Globe className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Your Spaces</h3>
        </div>
        <div className="text-xs text-gray-400">
          {spaces.length} space{spaces.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="space-y-3">
        {displaySpaces.map((space, index) => (
          <div key={space.id}
               className="group p-3 bg-white/5 rounded-lg hover:bg-white/10
                         transition-all duration-200 cursor-pointer border border-transparent
                         hover:border-white/20 hover:scale-[1.02]"
               onClick={() => onViewSpace(space.id)}>
            
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="text-white font-medium text-sm group-hover:text-blue-300 transition-colors">
                    {space.name}
                  </p>
                  {!space.isPublic && <Lock className="w-3 h-3 text-gray-400" />}
                  {index === 0 && <Star className="w-3 h-3 text-yellow-400" />}
                </div>
                
                <div className="flex items-center space-x-3 text-xs text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>{space.memberCount}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{space.recentActivity}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-1">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getActivityColor(space.recentActivity || '')} animate-pulse`}></div>
                  <span className={`text-xs font-bold ${getResonanceColor(space.resonanceStrength || 0)}`}>
                    {((space.resonanceStrength || 0) * 100).toFixed(0)}%
                  </span>
                </div>
                
                <div className="w-16 bg-white/10 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full transition-all duration-500 ${
                      (space.resonanceStrength || 0) >= 0.8 ? 'bg-green-400' :
                      (space.resonanceStrength || 0) >= 0.6 ? 'bg-yellow-400' :
                      (space.resonanceStrength || 0) >= 0.4 ? 'bg-orange-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${(space.resonanceStrength || 0) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Quick Actions on Hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3 text-gray-400">
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>Trending</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>View</span>
                  </div>
                </div>
                <div className="text-blue-400 font-medium">Enter Space →</div>
              </div>
            </div>
          </div>
        ))}
        
        {spaces.length > 3 && (
          <Button
            variant="ghost"
            className="w-full mt-3 hover:scale-105 transition-transform"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : `View All ${spaces.length} Spaces`}
          </Button>
        )}

        {/* Create New Space Button */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <Button
            variant="secondary"
            icon={Plus}
            className="w-full hover:scale-105 transition-transform"
          >
            Create New Space
          </Button>
        </div>
      </div>
    </Card>
  );
}