import { useState } from 'react';
import { Plus } from 'lucide-react';
import { SpaceCard } from './SpaceCard';
import { CreateSpaceModal } from './CreateSpaceModal';
import { PublicActivityStream } from './PublicActivityStream';
import { UserDiscovery } from './UserDiscovery';
import { SpaceDiscovery } from './SpaceDiscovery';
import { ActivityFeed } from './ActivityFeed';

interface DashboardProps {
  onViewSpace: (spaceId: string) => void;
}

const mockSpaces = [
  {
    id: '1',
    name: 'Project Quantum',
    description: 'Research collaboration space for quantum computing papers',
    memberCount: 12,
    volumeCount: 8,
    resonanceStrength: 0.87,
    lastActivity: '2 hours ago',
    role: 'owner' as const,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: '2',
    name: 'Design System',
    description: 'Shared design assets and component library',
    memberCount: 25,
    volumeCount: 15,
    resonanceStrength: 0.92,
    lastActivity: '1 hour ago',
    role: 'admin' as const,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: '3',
    name: 'Research Papers',
    description: 'Academic collaboration and paper sharing',
    memberCount: 8,
    volumeCount: 23,
    resonanceStrength: 0.73,
    lastActivity: '5 minutes ago',
    role: 'contributor' as const,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: '4',
    name: 'Temporal Archive',
    description: 'Time-limited document exchange',
    memberCount: 6,
    volumeCount: 4,
    resonanceStrength: 0.68,
    lastActivity: '12 hours ago',
    role: 'viewer' as const,
    color: 'from-orange-500 to-red-500',
    isTemporary: true
  }
];

export function Dashboard({ onViewSpace }: DashboardProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'spaces' | 'activity' | 'discover'>('spaces');
  const [discoverTab, setDiscoverTab] = useState<'people' | 'spaces'>('people');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Tab Navigation */}
      <div className="mb-8">
        <nav className="flex space-x-8 border-b border-white/10">
          {[
            { id: 'spaces', label: 'Your Spaces' },
            { id: 'activity', label: 'Network Activity' },  
            { id: 'discover', label: 'Discover' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'spaces' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">My Spaces</h2>
                <p className="text-gray-400">Your personal spaces for sharing and collaboration</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg 
                         hover:from-cyan-400 hover:to-purple-400 transition-all duration-200 
                         shadow-lg hover:shadow-xl flex items-center space-x-2 group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                <span className="font-medium">Create Space</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockSpaces.map((space) => (
                <SpaceCard
                  key={space.id}
                  space={space}
                  onSelect={() => onViewSpace(space.id)}
                />
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <ActivityFeed />
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <PublicActivityStream />
          </div>
        </div>
      )}
      
      {activeTab === 'discover' && (
        <div className="space-y-8">
          {/* Toggle between People and Spaces */}
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-1">
              {[
                { id: 'people', label: 'Discover People' },
                { id: 'spaces', label: 'Discover Spaces' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDiscoverTab(tab.id as any)}
                  className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                    discoverTab === tab.id
                      ? 'bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/20'
                      : 'text-gray-400 hover:text-cyan-300 hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          {discoverTab === 'people' && <UserDiscovery />}
          {discoverTab === 'spaces' && <SpaceDiscovery />}
        </div>
      )}

      <CreateSpaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}