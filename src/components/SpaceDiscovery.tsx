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
import webSocketService from '../services/websocket';
import { ServerMessage } from '../../server/protocol';
import { useAuth } from '../contexts/AuthContext';
import { userDataManager } from '../services/user-data-manager';
import { useNotifications } from './NotificationSystem';
import { spaceManager } from '../services/space-manager';

interface SpaceDiscoveryProps {
  onViewSpace: (spaceId: string) => void;
}

export function SpaceDiscovery({ onViewSpace }: SpaceDiscoveryProps) {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [userSpaces, setUserSpaces] = useState<Space[]>([]);
  const [filter, setFilter] = useState<'discover' | 'joined' | 'created' | 'trending'>('discover');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { waitForAuth, user } = useAuth();

  useEffect(() => {
    // Request public spaces on mount after auth is ready
    const fetchSpaces = async () => {
      await waitForAuth();
      webSocketService.sendMessage({ kind: 'getPublicSpaces' });
    };
    
    fetchSpaces();

    const handleMessage = async (message: ServerMessage) => {
      if (message.kind === 'publicSpacesResponse') {
        // Get user's current space memberships from userDataManager
        const userSpacesList = userDataManager.getSpacesList();
        const userSpaceMap = new Map(userSpacesList.map(s => [s.spaceId, s]));
        
        // Load member data for each space to get user roles
        const mappedSpaces = await Promise.all(
          message.payload.spaces.map(async (space) => {
            const userSpaceData = userSpaceMap.get(space.space_id);
            let userRole: SpaceRole | undefined = undefined;
            
            // If user is a member, get their actual role from SpaceManager
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
              memberCount: 0,
              tags: [],
              resonanceStrength: 0.8,
              recentActivity: 'Active',
              role: userRole,
            };
          })
        );
        
        setSpaces(mappedSpaces);
      }
    };

    webSocketService.addMessageListener(handleMessage);
    return () => webSocketService.removeMessageListener(handleMessage);
  }, [user]);

  // Load user's spaces from userDataManager and get actual roles
  useEffect(() => {
    const loadUserSpaces = async () => {
      if (user) {
        const userSpacesList = userDataManager.getSpacesList();
        
        // Get actual role data from SpaceManager for each space
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
              name: `Space ${s.spaceId.substring(0, 8)}`,
              description: `Role: ${actualRole} • Joined ${new Date(s.joinedAt).toLocaleDateString()}`,
              isPublic: true,
              isJoined: true,
              memberCount: 1,
              tags: ['holographic'],
              resonanceStrength: 0.8,
              recentActivity: 'Active',
              role: actualRole
            };
          })
        );
        
        setUserSpaces(spacesWithRoles);
      }
    };
    
    loadUserSpaces();
  }, [user]);

  const handleJoinLeave = async (spaceId: string) => {
    try {
      const space = spaces.find(s => s.id === spaceId);
      if (!space) return;

      if (space.isJoined) {
        // Leave space
        console.log('Leaving space:', spaceId);
        await spaceManager.leaveSpace(spaceId);
        
        // Update UI - remove role when leaving
        setSpaces(prev => prev.map(s =>
          s.id === spaceId ? { ...s, isJoined: false, role: undefined } : s
        ));
        
        // Update user spaces list
        setUserSpaces(prev => prev.filter(s => s.id !== spaceId));
        
        showSuccess('Left Space', `You have left ${space.name}`);
      } else {
        // Join space
        console.log('Joining space:', spaceId);
        await spaceManager.joinSpace(spaceId);
        
        // Get the user's actual role after joining
        let userRole: SpaceRole = 'member';
        if (user) {
          try {
            const role = await spaceManager.getUserRole(spaceId, user.id);
            userRole = role || 'member';
          } catch (error) {
            console.warn('Could not get user role after joining:', error);
          }
        }
        
        // Update UI with role information
        setSpaces(prev => prev.map(s =>
          s.id === spaceId ? { ...s, isJoined: true, role: userRole } : s
        ));
        
        // Add to user spaces list
        const newUserSpace = {
          ...space,
          isJoined: true,
          role: userRole
        };
        setUserSpaces(prev => [...prev, newUserSpace]);
        
        showSuccess('Joined Space', `Welcome to ${space.name}!`);
      }
    } catch (error) {
      console.error('Error joining/leaving space:', error);
      showError('Error', 'Failed to update space membership');
    }
  };

  const { showSuccess, showError } = useNotifications();

  const handleSpaceCreated = async (spaceId: string) => {
    console.log('New space created:', spaceId);
    setIsCreateModalOpen(false);
    showSuccess('Space Created!', `Your new space is ready.`);
    
    // Wait a moment for space creation to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Refresh both spaces lists to show the new space with owner role
    webSocketService.sendMessage({ kind: 'getPublicSpaces' });
    
    // Reload user spaces to include the newly created space
    if (user) {
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
            name: `Space ${s.spaceId.substring(0, 8)}`,
            description: `Role: ${actualRole} • Joined ${new Date(s.joinedAt).toLocaleDateString()}`,
            isPublic: true,
            isJoined: true,
            memberCount: 1,
            tags: ['holographic'],
            resonanceStrength: 0.8,
            recentActivity: 'Active',
            role: actualRole
          };
        })
      );
      setUserSpaces(spacesWithRoles);
    }
  };

  const filteredSpaces = spaces.filter(space => {
  switch (filter) {
    case 'trending':
      return (space.growthRate || 0) > 25;
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
        return filteredSpaces.filter(s => (s.growthRate || 0) > 25);
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