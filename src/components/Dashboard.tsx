import { useState } from 'react';
import { Plus } from 'lucide-react';
import { SpaceCard } from './common/SpaceCard';
import { CreateSpaceModal } from './CreateSpaceModal';
import { PublicActivityStream } from './PublicActivityStream';
import { UserDiscovery } from './UserDiscovery';
import { SpaceDiscovery } from './SpaceDiscovery';
import { ActivityFeed } from './ActivityFeed';
import { PageLayout } from './layouts/PageLayout';
import { Tabs } from './ui/Tabs';
import { Button } from './ui/Button';
import { Grid } from './ui/Grid';

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
    <PageLayout sidebar={activeTab === 'spaces' ? <ActivityFeed /> : undefined}>
      {/* Tab Navigation */}
      <Tabs
        tabs={[
          { id: 'spaces', label: 'Your Spaces' },
          { id: 'activity', label: 'Network Activity' },  
          { id: 'discover', label: 'Discover' }
        ]}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as any)}
        className="mb-8"
      />

      {activeTab === 'spaces' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">My Spaces</h2>
              <p className="text-gray-400">Your personal spaces for sharing and collaboration</p>
            </div>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create Space
            </Button>
          </div>

          <Grid cols={2}>
            {mockSpaces.map((space) => (
              <SpaceCard
                key={space.id}
                space={space}
                onSelect={() => onViewSpace(space.id)}
                showRole={true}
              />
            ))}
          </Grid>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div>
          <PublicActivityStream />
        </div>
      )}
      
      {activeTab === 'discover' && (
        <div className="space-y-8">
          {/* Toggle between People and Spaces */}
          <div className="flex justify-center">
            <Tabs
              variant="pills"
              tabs={[
                { id: 'people', label: 'Discover People' },
                { id: 'spaces', label: 'Discover Spaces' }
              ]}
              activeTab={discoverTab}
              onTabChange={(tab) => setDiscoverTab(tab as any)}
            />
          </div>
          
          {discoverTab === 'people' && <UserDiscovery />}
          {discoverTab === 'spaces' && <SpaceDiscovery />}
        </div>
      )}

      <CreateSpaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </PageLayout>
  );
}