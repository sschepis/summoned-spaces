import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageLayout } from './layouts/PageLayout';
import { SpaceCard } from './common/SpaceCard';
import { Space } from '../types/common';
import { CreateSpaceModal } from './CreateSpaceModal';
import { PublicActivityStream as PublicActivityStream } from './PublicActivityStream';
import { UserDiscovery } from './UserDiscovery';
import { SpaceDiscovery } from './SpaceDiscovery';
import { ContentComposer } from './ContentComposer';
import { NetworkTopology } from './NetworkTopology';
import { ActivityFeed } from './ActivityFeed';
import { Tabs } from './ui/Tabs';
import { Button } from './ui/Button';
import { Grid } from './ui/Grid';
import { EmptyState } from './ui/EmptyState';

interface DashboardProps {
  onViewSpace: (spaceId: string) => void;
}

// Tab Content Components
const SpacesTab = ({ 
  spaces, 
  onViewSpace, 
  onCreateSpace 
}: {
  spaces: Space[];
  onViewSpace: (spaceId: string) => void;
  onCreateSpace: () => void;
}) => (
  <div>
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">My Spaces</h2>
        <p className="text-gray-400">Your personal spaces for sharing and collaboration</p>
      </div>
      <Button
        variant="primary"
        icon={Plus}
        onClick={onCreateSpace}
      >
        Create Space
      </Button>
    </div>

    {spaces.length > 0 ? (
      <Grid cols={2}>
        {spaces.map((space) => (
          <SpaceCard
            key={space.id}
            space={space}
            onSelect={() => onViewSpace(space.id)}
            showRole={true}
          />
        ))}
      </Grid>
    ) : (
      <EmptyState
        icon={Plus}
        title="No spaces yet"
        description="Create your first space to start collaborating"
        action={{
          label: "Create Your First Space",
          onClick: onCreateSpace,
          icon: Plus
        }}
      />
    )}
  </div>
);

const ActivityTab = () => (
  <div>
    <PublicActivityStream />
  </div>
);

const DiscoverTab = ({ 
  discoverTab, 
  setDiscoverTab 
}: {
  discoverTab: 'people' | 'spaces';
  setDiscoverTab: (tab: 'people' | 'spaces') => void;
}) => (
  <div className="space-y-8">
    <div className="flex justify-center">
      <Tabs
        variant="pills"
        tabs={[
          { id: 'people', label: 'Discover People' },
          { id: 'spaces', label: 'Discover Spaces' }
        ]}
        activeTab={discoverTab}
        onTabChange={(tab) => setDiscoverTab(tab as 'people' | 'spaces')}
      />
    </div>
    
    {discoverTab === 'people' && <UserDiscovery />}
    {discoverTab === 'spaces' && <SpaceDiscovery />}
  </div>
);

export function Dashboard({ onViewSpace }: DashboardProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'holographic' | 'spaces' | 'activity' | 'discover'>('holographic');
  const [discoverTab, setDiscoverTab] = useState<'people' | 'spaces'>('people');
  
  const mockSpaces: Space[] = []; // Remove mock data

  const tabContent = {
    spaces: (
      <SpacesTab
        spaces={mockSpaces}
        onViewSpace={onViewSpace}
        onCreateSpace={() => setIsCreateModalOpen(true)}
      />
    ),
    activity: <ActivityTab />,
    holographic: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-purple-300">1. Create a Memory</h2>
          <ContentComposer />
          <div className="mt-8">
            <NetworkTopology />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4 text-purple-300">2. Observe Network Activity</h2>
          <ActivityFeed />
        </div>
      </div>
    ),
    discover: (
      <DiscoverTab
        discoverTab={discoverTab}
        setDiscoverTab={setDiscoverTab}
      />
    )
  };

  return (
    <PageLayout sidebar={activeTab === 'spaces' ? <ActivityFeed /> : undefined}>
      <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome back! Here's what's happening in your spaces.</p>
      </div>
      {/* Tab Navigation */}
      <Tabs
        tabs={[
          { id: 'holographic', label: 'Holographic Network' },
          { id: 'spaces', label: 'Your Spaces' },
          { id: 'activity', label: 'Network Activity' },
          { id: 'discover', label: 'Discover' }
        ]}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as 'holographic' | 'spaces' | 'activity' | 'discover')}
        className="mb-8"
      />

      {/* Tab Content */}
      {tabContent[activeTab]}

      {/* Create Space Modal */}
      <CreateSpaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      </>
    </PageLayout>
  );
}