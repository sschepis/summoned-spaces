import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageLayout } from './layouts/PageLayout';
import { SpaceCard } from './common/SpaceCard';
import { CreateSpaceModal } from './CreateSpaceModal';
import { PublicActivityStream as PublicActivityStream } from './PublicActivityStream';
import { UserDiscovery } from './UserDiscovery';
import { SpaceDiscovery } from './SpaceDiscovery';
import { ActivityFeed } from './ActivityFeed';
import { Tabs } from './ui/Tabs';
import { Button } from './ui/Button';
import { Grid } from './ui/Grid';
import { EmptyState } from './ui/EmptyState';
import { componentHelpers } from '../utils/componentHelpers';

interface DashboardProps {
  onViewSpace: (spaceId: string) => void;
}

// Tab Content Components
const SpacesTab = ({ 
  spaces, 
  onViewSpace, 
  onCreateSpace 
}: {
  spaces: any[];
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
        onTabChange={(tab) => setDiscoverTab(tab as any)}
      />
    </div>
    
    {discoverTab === 'people' && <UserDiscovery />}
    {discoverTab === 'spaces' && <SpaceDiscovery />}
  </div>
);

export function Dashboard({ onViewSpace }: DashboardProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'spaces' | 'activity' | 'discover'>('spaces');
  const [discoverTab, setDiscoverTab] = useState<'people' | 'spaces'>('people');
  
  // Use component helpers for mock data
  const mockSpaces = componentHelpers.generateMockSpaces(4).map((space, index) => ({
    ...space,
    name: ['Project Quantum', 'Design System', 'Research Papers', 'Temporal Archive'][index],
    description: [
      'Research collaboration space for quantum computing papers',
      'Shared design assets and component library', 
      'Academic collaboration and paper sharing',
      'Time-limited document exchange'
    ][index],
    role: (['owner', 'admin', 'contributor', 'viewer'] as const)[index],
    color: [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500', 
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500'
    ][index],
    isTemporary: index === 3,
    volumeCount: [8, 15, 23, 4][index],
    lastActivity: ['2 hours ago', '1 hour ago', '5 minutes ago', '12 hours ago'][index]
  }));

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Dashboard' }
  ];

  const tabContent = {
    spaces: (
      <SpacesTab
        spaces={mockSpaces}
        onViewSpace={onViewSpace}
        onCreateSpace={() => setIsCreateModalOpen(true)}
      />
    ),
    activity: <ActivityTab />,
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
          { id: 'spaces', label: 'Your Spaces' },
          { id: 'activity', label: 'Network Activity' },  
          { id: 'discover', label: 'Discover' }
        ]}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as any)}
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