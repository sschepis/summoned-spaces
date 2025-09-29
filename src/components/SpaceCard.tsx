import { Users, Database, Clock, Crown, Shield, CreditCard as Edit3, Eye } from 'lucide-react';
import { ResonanceIndicator } from './ResonanceIndicator';

interface Space {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  volumeCount: number;
  resonanceStrength: number;
  lastActivity: string;
  role: 'owner' | 'admin' | 'contributor' | 'viewer';
  color: string;
  isTemporary?: boolean;
}

interface SpaceCardProps {
  space: Space;
  onSelect: () => void;
}

const roleIcons = {
  owner: Crown,
  admin: Shield,
  contributor: Edit3,
  viewer: Eye
};

const roleColors = {
  owner: 'text-yellow-400',
  admin: 'text-red-400',
  contributor: 'text-blue-400',
  viewer: 'text-gray-400'
};

export function SpaceCard({ space, onSelect }: SpaceCardProps) {
  const RoleIcon = roleIcons[space.role];

  return (
    <div
      onClick={onSelect}
      className="group relative bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 
               hover:bg-white/10 transition-all duration-300 cursor-pointer hover:scale-[1.02] 
               hover:shadow-2xl hover:shadow-cyan-500/10"
    >
      {space.isTemporary && (
        <div className="absolute top-3 right-3">
          <div className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded-full border border-orange-500/30">
            Temporal
          </div>
        </div>
      )}
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-xl font-semibold text-white group-hover:text-cyan-300 transition-colors">
              {space.name}
            </h3>
            <RoleIcon className={`w-4 h-4 ${roleColors[space.role]}`} />
          </div>
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">{space.description}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-gray-300">
              <Users className="w-4 h-4" />
              <span>{space.memberCount}</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-300">
              <Database className="w-4 h-4" />
              <span>{space.volumeCount}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-gray-400 text-xs">
            <Clock className="w-3 h-3" />
            <span>{space.lastActivity}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Resonance Strength</span>
            <span className="text-sm font-mono text-cyan-400">
              {(space.resonanceStrength * 100).toFixed(1)}%
            </span>
          </div>
          <ResonanceIndicator strength={space.resonanceStrength} animated />
        </div>
      </div>

      <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${space.color} 
                    opacity-60 group-hover:opacity-100 transition-opacity duration-300 
                    rounded-b-xl`} />
    </div>
  );
}