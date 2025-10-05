import { useState, useEffect } from 'react';
import { Plus, Globe } from 'lucide-react';
import { PageLayout } from './layouts/PageLayout';
import { SpaceCard } from './common/SpaceCard';
import { Grid } from './ui/Grid';
import { Tabs } from './ui/Tabs';
import { Button } from './ui/Button';
import { EmptyState } from './ui/EmptyState';
import { Space, SpaceRole } from '../types/common';
import { CreateSpaceModal } from './CreateSpaceModal';
import { communicationManager, CommunicationMessage } from '../services/communication-manager';
import { useAuth } from '../contexts/AuthContext';
import { userDataManager } from '../services/user-data';
import { useNotifications } from './NotificationSystem';
import { spaceManager } from '../services/space-manager';

interface SpaceDiscoveryProps {
  onViewSpace: (spaceId: string) => void;
}

interface ApiSpace {
  space_id: string;
  name: string;
  description: string;
  is_public: number;
  member_count?: number;
  created_at?: string;
  owner?: string;
}

export function SpaceDiscovery({ onViewSpace }: SpaceDiscoveryProps) {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [userSpaces, setUserSpaces] = useState<Space[]>([]);
  const [filter, setFilter] = useState<'discover' | 'joined' | 'created' | 'trending'>('discover');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { waitForAuth, user } = useAuth();

  useEffect(() => {
    const loadAllSpaces = async () => {
      await waitForAuth();
      if (!user) return;

      // Load user's spaces - defined as a named function for reusability
      const loadUserSpaces = async () => {
        const userSpacesList = userDataManager.getSpacesList();
        const spacesWithRoles = await Promise.all(
          userSpacesList.map(async (s) => {
            let actualRole: SpaceRole = s.role as SpaceRole;
            try {
              const role = await spaceManager.getUserRole(s.spaceId, user.id);
              actualRole = role || (s.role as SpaceRole);
            } catch (error) {
              console.warn(`Could not get role for space ${s.spaceId}:`, error);
            }
            
            return {
              id: s.spaceId,
              name: `Space-${s.spaceId.substring(0, 8)}`,
              description: `Role: ${actualRole} • Joined ${new Date(s.joinedAt).toLocaleDateString()}`,
              isPublic: true,
              isJoined: true,
              memberCount: 1,
              tags: ['quantum-space'],
              resonanceStrength: Math.random() * 0.5 + 0.5,
              recentActivity: 'Active',
              role: actualRole
            };
          })
        );
        setUserSpaces(spacesWithRoles);
        return userSpacesList;
      };

      // Initial load
      await loadUserSpaces();

      // Now handle public spaces and space creation events
      const handleMessage = async (message: CommunicationMessage) => {
        if (message.kind === 'publicSpacesResponse') {
          // Get fresh user spaces list each time
          const currentUserSpacesList = userDataManager.getSpacesList();
          const userSpaceMap = new Map(currentUserSpacesList.map(s => [s.spaceId, s]));
          
          const mappedSpaces = await Promise.all(
            (message.payload.spaces as ApiSpace[]).map(async (space) => {
              const userSpaceData = userSpaceMap.get(space.space_id);
              let userRole: SpaceRole | undefined = undefined;
              
              if (userSpaceData && user) {
                try {
                  const role = await spaceManager.getUserRole(space.space_id, user.id);
                  userRole = role || userSpaceData.role as SpaceRole;
                } catch (error) {
                  console.warn(`Could not get user role for space ${space.space_id}:`, error);
                  userRole = userSpaceData.role as SpaceRole;
                }
              }
              
              return {
                id: space.space_id,
                name: space.name,
                description: space.description || '',
                isPublic: space.is_public === 1,
                isJoined: !!userSpaceData,
                memberCount: space.member_count || 0,
                tags: [],
                resonanceStrength: 0.8,
                recentActivity: 'Active',
                role: userRole,
              };
            })
          );
          
          setSpaces(mappedSpaces);
        } else if (message.kind === 'createSpaceSuccess') {
          // Handle successful space creation
          console.log('[SpaceDiscovery] Received createSpaceSuccess event:', message.payload);
          
          // Reload user spaces to include the newly created space
          await loadUserSpaces();
          
          // Request updated public spaces list
          communicationManager.send({ kind: 'getPublicSpaces', payload: {} });
        }
      };

      communicationManager.onMessage(handleMessage);
      communicationManager.send({ kind: 'getPublicSpaces', payload: {} });
    };

    loadAllSpaces();

    return () => {
      // Cleanup if necessary, though onMessage might handle it
    };
  }, [user, waitForAuth]);

  const handleJoinLeave = async (spaceId: string) => {
    console.log('[SpaceDiscovery] handleJoinLeave called for space:', spaceId);
    
    try {
      const space = spaces.find(s => s.id === spaceId);
      if (!space) {
        console.error('[SpaceDiscovery] Space not found:', spaceId);
        showError('Error', 'Space not found');
        return;
      }

      console.log('[SpaceDiscovery] Space found:', { id: space.id, isJoined: space.isJoined, role: space.role });

      if (space.isJoined) {
        console.log('[SpaceDiscovery] Leaving space:', spaceId);
        await spaceManager.leaveSpace(spaceId);
        
        setSpaces(prev => prev.map(s =>
          s.id === spaceId ? {
            ...s,
            isJoined: false,
            role: undefined,
            memberCount: Math.max(0, (s.memberCount || 0) - 1)
          } : s
        ));
        
        setUserSpaces(prev => prev.filter(s => s.id !== spaceId));
        
        showSuccess('Left Space', `You have left ${space.name}`);
        
        // Refresh public spaces to get updated member count from server
        communicationManager.send({ kind: 'getPublicSpaces', payload: {} });
      } else {
        console.log('[SpaceDiscovery] Joining space:', spaceId);
        
        try {
          await spaceManager.joinSpace(spaceId);
          console.log('[SpaceDiscovery] Join successful, getting role...');
        } catch (joinError) {
          console.error('[SpaceDiscovery] Join failed:', joinError);
          throw joinError;
        }
        
        let userRole: SpaceRole = 'member';
        if (user) {
          try {
            const role = await spaceManager.getUserRole(spaceId, user.id);
            userRole = role || 'member';
            console.log('[SpaceDiscovery] User role:', userRole);
          } catch (error) {
            console.warn('[SpaceDiscovery] Could not get user role after joining:', error);
          }
        }
        
        console.log('[SpaceDiscovery] Updating UI state...');
        setSpaces(prev => prev.map(s =>
          s.id === spaceId ? {
            ...s,
            isJoined: true,
            role: userRole,
            memberCount: (s.memberCount || 0) + 1
          } : s
        ));
        
        const newUserSpace = {
          ...space,
          isJoined: true,
          role: userRole,
          memberCount: (space.memberCount || 0) + 1
        };
        setUserSpaces(prev => [...prev, newUserSpace]);
        
        console.log('[SpaceDiscovery] Join complete, refreshing spaces...');
        showSuccess('Joined Space', `Welcome to ${space.name}!`);
        
        // Refresh public spaces to get updated member count from server
        communicationManager.send({ kind: 'getPublicSpaces', payload: {} });
      }
    } catch (error) {
      console.error('[SpaceDiscovery] Error in handleJoinLeave:', error);
      showError('Error', error instanceof Error ? error.message : 'Failed to update space membership');
    }
  };

  const { showSuccess, showError } = useNotifications();

  const handleSpaceCreated = async (spaceId: string) => {
    console.log('New space created:', spaceId);
    setIsCreateModalOpen(false);
    showSuccess('Space Created!', `Your new space is ready with ID: ${spaceId}`);
    
    // The createSpaceSuccess event handler in useEffect will automatically
    // refresh the spaces lists, so we don't need to do it manually here
  };

  const filteredSpaces = spaces.filter(space => {
    switch (filter) {
      case 'trending': {
        // Calculate trending based on member count and recent activity
        const memberScore = space.memberCount || 0;
        const activityScore = space.recentActivity === 'Active' ? 10 : 0;
        const resonanceScore = (space.resonanceStrength || 0) * 20;
        const trendingScore = memberScore + activityScore + resonanceScore;
        return trendingScore > 15;
      }
      default:
        return true;
    }
  });

  const getCurrentSpaces = () => {
    switch (filter) {
      case 'joined':
        return userSpaces;
      case 'created':
        return userSpaces.filter(s => s.role === 'owner');
      case 'trending':
        return filteredSpaces;
      default:
        return filteredSpaces;
    }
  };

  const currentSpaces = getCurrentSpaces();

  return (
    <PageLayout
      title="Spaces"
      subtitle="Discover, create, and manage collaborative spaces"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Tabs
            variant="pills"
            tabs={[
              { id: 'discover', label: 'Discover Spaces' },
              { id: 'joined', label: `Joined (${userSpaces.length})` },
              { id: 'created', label: 'Created' },
              { id: 'trending', label: 'Trending' }
            ]}
            activeTab={filter}
            onTabChange={(tabId) => setFilter(tabId as 'discover' | 'joined' | 'created' | 'trending')}
          />
          
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Space
          </Button>
        </div>

        {currentSpaces.length > 0 ? (
          <Grid cols={2}>
            {currentSpaces.map((space) => (
              <SpaceCard
                key={space.id}
                space={space}
                onJoin={handleJoinLeave}
                onSelect={() => onViewSpace(space.id)}
                showJoinButton={true}
                showResonance={true}
                showRole={space.isJoined}
              />
            ))}
          </Grid>
        ) : (
          <EmptyState
            icon={filter === 'discover' ? Plus : Globe}
            title={
              filter === 'discover' ? 'No spaces available' :
              filter === 'joined' ? 'No spaces joined yet' :
              filter === 'created' ? 'No spaces created yet' :
              'No trending spaces'
            }
            description={
              filter === 'discover' ? 'Check back later for new spaces' :
              filter === 'joined' ? 'Join some spaces to get started' :
              filter === 'created' ? 'Create your first space to start collaborating' :
              'No spaces are trending right now'
            }
            action={filter !== 'discover' ? {
              label: 'Create Your First Space',
              onClick: () => setIsCreateModalOpen(true),
              icon: Plus
            } : undefined}
          />
        )}
      </div>

      <CreateSpaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSpaceCreated={handleSpaceCreated}
      />
    </PageLayout>
  );
}