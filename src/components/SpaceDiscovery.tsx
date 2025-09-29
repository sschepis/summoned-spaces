import { useState } from 'react';
import { UserPlus, Star, Zap, Users, TrendingUp, Plus, Globe, Lock, Clock, Database } from 'lucide-react';
import { ResonanceIndicator } from './ResonanceIndicator';

interface Space {
  id: string;
  name: string;
  description: string;
  isJoined: boolean;
  isPublic: boolean;
  memberCount: number;
  fileCount: number;
  resonanceStrength: number;
  recentActivity: string;
  tags: string[];
  creator: string;
  createdAt: string;
  growthRate: number;
  cover?: string;
}

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
        
        {/* Filter Tabs */}
        <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-1">
          {[
            { id: 'all', label: 'All Spaces' },
            { id: 'public', label: 'Public' },
            { id: 'private', label: 'Private' },
            { id: 'trending', label: 'Trending' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                filter === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/20'
                  : 'text-gray-400 hover:text-cyan-300 hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSpaces.map((space) => (
          <div
            key={space.id}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 
                     hover:bg-white/10 transition-all duration-300 relative overflow-hidden"
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
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-500 
                                rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {space.name.split(' ').map(word => word[0]).join('')}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-white truncate">{space.name}</h3>
                      {space.isPublic ? (
                        <Globe className="w-4 h-4 text-green-400" title="Public space" />
                      ) : (
                        <Lock className="w-4 h-4 text-orange-400" title="Private space" />
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{formatNumber(space.memberCount)} members</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Database className="w-4 h-4" />
                        <span>{formatNumber(space.fileCount)} files</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
                      {space.description}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleJoin(space.id)}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors font-medium ${
                    space.isJoined
                      ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                      : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30'
                  }`}
                >
                  {space.isJoined ? (
                    <>Joined</>
                  ) : (
                    <><Plus className="w-4 h-4 inline mr-1" />Join</>
                  )}
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-2 bg-white/5 rounded-lg">
                  <div className="text-lg font-bold text-white">{formatNumber(space.memberCount)}</div>
                  <div className="text-xs text-gray-400">Members</div>
                </div>
                <div className="text-center p-2 bg-white/5 rounded-lg">
                  <div className="text-lg font-bold text-white">{formatNumber(space.fileCount)}</div>
                  <div className="text-xs text-gray-400">Files</div>
                </div>
                <div className="text-center p-2 bg-white/5 rounded-lg">
                  <div className="text-lg font-bold text-cyan-400">+{space.growthRate}%</div>
                  <div className="text-xs text-gray-400">Growth</div>
                </div>
              </div>

              {/* Resonance Strength */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-gray-400">Resonance Strength</span>
                  </div>
                  <span className="text-sm font-mono text-cyan-400">
                    {(space.resonanceStrength * 100).toFixed(1)}%
                  </span>
                </div>
                <ResonanceIndicator strength={space.resonanceStrength} animated />
              </div>

              {/* Recent Activity */}
              <div className="mb-4">
                <div className="flex items-center space-x-1 mb-1">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-gray-400">Recent Activity</span>
                </div>
                <p className="text-sm text-gray-300">{space.recentActivity}</p>
              </div>

              {/* Footer Info */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>Created {space.createdAt} by {space.creator}</span>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {space.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full 
                               border border-purple-500/30"
                    >
                      {tag}
                    </span>
                  ))}
                  {space.tags.length > 2 && (
                    <span className="text-xs text-gray-400">+{space.tags.length - 2}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSpaces.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400">
            No spaces found for the current filter.
          </div>
        </div>
      )}
    </div>
  );
}