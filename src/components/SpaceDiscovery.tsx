import { useState } from 'react';
import { SpaceCard } from './common/SpaceCard';
import { Grid } from './ui/Grid';
import { Tabs } from './ui/Tabs';

const suggestedSpaces: Space[] = [
  {
    id: '1',
    name: 'Quantum Computing Research',
    description: 'Advanced quantum computing discussions, research papers, and collaborative projects. Join researchers from around the world.',
    isJoined: false,
    isPublic: true,
    memberCount: 2847,
    fileCount: 1249,
    resonanceStrength: 0.94,
    recentActivity: 'New breakthrough paper on quantum supremacy shared',
    tags: ['quantum', 'computing', 'research', 'physics'],
    creator: 'Dr. Sarah Chen',
    createdAt: '6 months ago',
    growthRate: 23.5,
    cover: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: '2',
    name: 'Creative Design Collective',
    description: 'A vibrant community of designers sharing inspiration, resources, and collaborative design projects.',
    isJoined: false,
    isPublic: true,
    memberCount: 1203,
    fileCount: 892,
    resonanceStrength: 0.87,
    recentActivity: 'New design system template uploaded',
    tags: ['design', 'creativity', 'ui-ux', 'inspiration'],
    creator: 'Elena Kowalski',
    createdAt: '4 months ago',
    growthRate: 18.2
  },
  {
    id: '3',
    name: 'Open Source Developers Hub',
    description: 'Collaborate on open source projects, share code, and build the future of software together.',
    isJoined: true,
    isPublic: true,
    memberCount: 3421,
    fileCount: 5678,
    resonanceStrength: 0.91,
    recentActivity: 'Major framework update released',
    tags: ['development', 'open-source', 'collaboration', 'coding'],
    creator: 'Marcus Rodriguez',
    createdAt: '1 year ago',
    growthRate: 31.7
  },
  {
    id: '4',
    name: 'AI & Machine Learning',
    description: 'Cutting-edge AI research, model training datasets, and machine learning breakthroughs.',
    isJoined: false,
    isPublic: true,
    memberCount: 1567,
    fileCount: 2134,
    resonanceStrength: 0.89,
    recentActivity: 'New neural network architecture published',
    tags: ['ai', 'machine-learning', 'neural-networks', 'data-science'],
    creator: 'Dr. Maria Santos',
    createdAt: '8 months ago',
    growthRate: 45.3
  },
  {
    id: '5',
    name: 'Digital Art & NFTs',
    description: 'Showcase digital artwork, discuss NFT trends, and collaborate on creative blockchain projects.',
    isJoined: false,
    isPublic: true,
    memberCount: 892,
    fileCount: 1834,
    resonanceStrength: 0.82,
    recentActivity: 'Community art exhibition launched',
    tags: ['digital-art', 'nft', 'blockchain', 'crypto-art'],
    creator: 'Alex Thompson',
    createdAt: '3 months ago',
    growthRate: 67.8
  },
  {
    id: '6',
    name: 'Photography Masters',
    description: 'Professional and amateur photographers sharing techniques, gear reviews, and stunning captures.',
    isJoined: false,
    isPublic: false,
    memberCount: 543,
    fileCount: 3421,
    resonanceStrength: 0.85,
    recentActivity: 'Exclusive workshop series announced',
    tags: ['photography', 'visual-arts', 'techniques', 'portfolio'],
    creator: 'James Wilson',
    createdAt: '5 months ago',
    growthRate: 12.4
  }
];

export function SpaceDiscovery() {
  const [spaces, setSpaces] = useState(suggestedSpaces);
  const [filter, setFilter] = useState<'all' | 'public' | 'private' | 'trending'>('all');

  const handleJoin = (spaceId: string) => {
    setSpaces(prev =>
      prev.map(space =>
        space.id === spaceId
          ? { 
              ...space, 
              isJoined: !space.isJoined,
              memberCount: space.isJoined ? space.memberCount - 1 : space.memberCount + 1
            }
          : space
      )
    );
  };

  const filteredSpaces = spaces.filter(space => {
    switch (filter) {
      case 'public':
        return space.isPublic;
      case 'private':
        return !space.isPublic;
      case 'trending':
        return space.growthRate > 25;
      default:
        return true;
    }
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">Discover Spaces</h2>
          <p className="text-gray-400">Find and join amazing collaborative spaces</p>
        </div>
        
        <Tabs
          variant="pills"
          tabs={[
            { id: 'all', label: 'All Spaces' },
            { id: 'public', label: 'Public' },
            { id: 'private', label: 'Private' },
            { id: 'trending', label: 'Trending' }
          ]}
          activeTab={filter}
          onTabChange={(tabId) => setFilter(tabId as any)}
        />
      </div>

      <Grid cols={2}>
        {filteredSpaces.map((space) => (
          <SpaceCard
            key={space.id}
            space={space}
            onJoin={handleJoin}
            showJoinButton={true}
            showResonance={true}
          />
        ))}
      </Grid>

      {filteredSpaces.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No spaces found for the current filter.
        </div>
      )}
    </div>
  );
}