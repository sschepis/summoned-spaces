import { Database, Clock, Activity } from 'lucide-react';
import { ResonanceIndicator } from './ResonanceIndicator';

interface Volume {
  id: string;
  name: string;
  fileCount: number;
  totalSize: string;
  resonanceStrength: number;
  lastUpdate: string;
  color: string;
  isLocking: boolean;
}

interface VolumeCardProps {
  volume: Volume;
}

export function VolumeCard({ volume }: VolumeCardProps) {
  return (
    <div className="group relative bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 
                   hover:bg-white/10 transition-all duration-300 cursor-pointer hover:scale-[1.02]">
      {volume.isLocking && (
        <div className="absolute top-3 right-3">
          <div className="flex items-center space-x-1 px-2 py-1 bg-orange-500/20 text-orange-300 
                        text-xs rounded-full border border-orange-500/30">
            <Activity className="w-3 h-3 animate-pulse" />
            <span>Locking</span>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white group-hover:text-cyan-300 
                       transition-colors mb-2">
            {volume.name}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <Database className="w-4 h-4" />
              <span>{volume.fileCount} files</span>
            </div>
            <span>{volume.totalSize}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-1 text-gray-400 text-xs">
          <Clock className="w-3 h-3" />
          <span>Updated {volume.lastUpdate}</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Resonance Lock</span>
            <span className="text-sm font-mono text-cyan-400">
              {(volume.resonanceStrength * 100).toFixed(1)}%
            </span>
          </div>
          <ResonanceIndicator 
            strength={volume.resonanceStrength} 
            animated={volume.isLocking} 
          />
        </div>
      </div>

      <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${volume.color} 
                    opacity-60 group-hover:opacity-100 transition-opacity duration-300 
                    rounded-b-xl`} />
    </div>
  );
}