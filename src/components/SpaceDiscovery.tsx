import { useState, useEffect } from 'react';
import { SpaceCard } from './common/SpaceCard';
import { Grid } from './ui/Grid';
import { Tabs } from './ui/Tabs';
import { Space } from '../types/common';
import { webSocketService } from '../services/websocket';
import { ServerMessage } from '../../server/protocol';

export function SpaceDiscovery() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [filter, setFilter] = useState<'all' | 'public' | 'private' | 'trending'>('all');

  useEffect(() => {
    // Request public spaces on mount
    webSocketService.sendMessage({ kind: 'getPublicSpaces' });

    const handleMessage = (message: ServerMessage) => {
      if (message.kind === 'publicSpacesResponse') {
        const mappedSpaces = message.payload.spaces.map(space => ({
          id: space.space_id,
          name: space.name,
          description: space.description || '',
          isPublic: space.is_public === 1,
          isJoined: false,
          memberCount: 0,
          tags: [],
          resonanceStrength: 0.8,
          recentActivity: 'Active',
        }));
        setSpaces(mappedSpaces);
      }
    };

    webSocketService.addMessageListener(handleMessage);
    return () => webSocketService.removeMessageListener(handleMessage);
  }, []);

  const handleJoin = (spaceId: string) => {
    // TODO: Implement join space WebSocket message
    console.log('Join space:', spaceId);
  };

  const filteredSpaces = spaces.filter(space => {
    switch (filter) {
      case 'public':
        return space.isPublic;
      case 'private':
        return !space.isPublic;
      case 'trending':
        return (space.growthRate || 0) > 25;
      default:
        return true;
    }
  });

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
          onTabChange={(tabId) => setFilter(tabId as 'all' | 'public' | 'private' | 'trending')}
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