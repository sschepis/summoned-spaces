import { Clock, Globe, Lock, Plus } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ResonanceIndicator } from '../ResonanceIndicator';
import { Space } from '../../types/common';

interface SpaceCardProps {
  space: Space;
  onSelect?: () => void;
  onJoin?: (spaceId: string) => void;
  showJoinButton?: boolean;
  showResonance?: boolean;
  showRole?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function SpaceCard({ 
  space, 
  onSelect, 
  onJoin, 
  showJoinButton = false,
  showResonance = true,
  showRole = false
}: SpaceCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'warning';
      case 'admin': return 'error';
      case 'contributor': return 'info';
      default: return 'default';
    }
  };

  return (
    <Card
      hover={!!onSelect}
      onClick={onSelect}
      className="relative overflow-hidden"
    >
      {/* Cover Image */}
      {space.cover && (
        <div className="absolute inset-0 opacity-10">
          <img
            src={space.cover}
            alt={space.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4 flex-1">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 
                          rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">
                {space.name.split(' ').map(word => word[0]).join('')}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
                  {space.name}
                </h3>
                {space.isPublic ? (
                  <Globe className="w-4 h-4 text-green-400" aria-label="Public space" />
                ) : (
                  <Lock className="w-4 h-4 text-orange-400" aria-label="Private space" />
                )}
                {showRole && space.role && (
                  <Badge variant={getRoleColor(space.role) as any} size="sm">
                    {space.role}
                  </Badge>
                )}
              </div>
              
              <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
                {space.description}
              </p>
            </div>
          </div>
          
          {showJoinButton && onJoin && (
            <Button
              size="sm"
              variant={space.isJoined ? 'success' : 'secondary'}
              icon={space.isJoined ? undefined : Plus}
              onClick={(e) => {
                e.stopPropagation();
                onJoin(space.id);
              }}
            >
              {space.isJoined ? 'Joined' : 'Join'}
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-sm font-bold text-white">{formatNumber(space.memberCount)}</div>
            <div className="text-xs text-gray-400">Members</div>
          </div>
          {space.fileCount !== undefined && (
            <div className="text-center">
              <div className="text-sm font-bold text-white">{formatNumber(space.fileCount)}</div>
              <div className="text-xs text-gray-400">Files</div>
            </div>
          )}
          {space.growthRate !== undefined && (
            <div className="text-center">
              <div className="text-sm font-bold text-cyan-400">+{space.growthRate}%</div>
              <div className="text-xs text-gray-400">Growth</div>
            </div>
          )}
        </div>

        {/* Resonance Strength */}
        {showResonance && space.resonanceStrength !== undefined && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Resonance Strength</span>
              <span className="text-sm font-mono text-cyan-400">
                {(space.resonanceStrength * 100).toFixed(1)}%
              </span>
            </div>
            <ResonanceIndicator strength={space.resonanceStrength} animated />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>
              {space.createdAt ? `Created ${space.createdAt}` : ''}
              {space.creator ? ` by ${space.creator}` : ''}
              {space.recentActivity && !space.createdAt ? space.recentActivity : ''}
            </span>
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {space.tags?.slice(0, 2)?.map((tag) => (
              <Badge key={tag} variant="info" size="sm">
                {tag}
              </Badge>
            ))}
            {(space.tags?.length || 0) > 2 && (
              <span className="text-xs text-gray-400">+{(space.tags?.length || 0) - 2}</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}