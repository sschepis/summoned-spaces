import { UserCard } from './common/UserCard';
import { Grid } from './ui/Grid';
import { useNetworkState } from '../contexts/NetworkContext';
import { useAuth } from '../contexts/AuthContext';
import { userInfoCache } from '../services/user-info-cache';
import { communicationManager } from '../services/communication-manager';
import { useState, useEffect } from 'react';

interface UserInfo {
  username: string;
  bio?: string;
  stats?: {
    followers: number;
    following: number;
    spaces: number;
    resonanceScore: number;
  };
}

export function UserDiscovery() {
  const { nodes } = useNetworkState();
  const { user: currentUser, waitForAuth } = useAuth();
  const [userInfoMap, setUserInfoMap] = useState<Map<string, UserInfo>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserInfo = async () => {
      setLoading(true);
      const newMap = new Map<string, UserInfo>();
      
      for (const node of nodes) {
        if (node.userId !== currentUser?.id) {
          try {
            const info = await userInfoCache.getUserInfo(node.userId);
            // Fetch additional user data from API
            const response = await fetch(`/api/users/${node.userId}/profile`);
            if (response.ok) {
              const profileData = await response.json();
              newMap.set(node.userId, {
                username: info.username,
                bio: profileData.bio,
                stats: profileData.stats
              });
            } else {
              // Fallback to basic info
              newMap.set(node.userId, {
                username: info.username,
                bio: undefined,
                stats: undefined
              });
            }
          } catch (error) {
            console.error(`Failed to load user info for ${node.userId}:`, error);
          }
        }
      }
      
      setUserInfoMap(newMap);
      setLoading(false);
    };

    if (nodes.length > 0) {
      loadUserInfo();
    }
  }, [nodes, currentUser?.id]);

  const users = nodes
    .filter(node => node.userId !== currentUser?.id)
    .map(node => {
      const userInfo = userInfoMap.get(node.userId);
      return {
        id: node.userId,
        name: userInfo?.username || node.username || node.userId.substring(0, 8),
        username: `@${userInfo?.username || node.username || node.userId.substring(0, 8)}`,
        avatar: `/api/avatar/${node.userId}`,
        bio: userInfo?.bio || `Connected via ${node.connectionId.substring(0, 8)}`,
        isFollowing: false,
        stats: userInfo?.stats || {
          followers: 0,
          following: 0,
          spaces: 0,
          resonanceScore: node.publicResonance ?
            (node.publicResonance.primaryPrimes.length + node.publicResonance.harmonicPrimes.length) / 100 : 0
        },
        recentActivity: 'Active on network',
        tags: ['quantum', 'network'],
      };
    });

  const handleFollow = async (userId: string) => {
    try {
      await waitForAuth();
      communicationManager.send({
        kind: 'follow',
        payload: { userIdToFollow: userId }
      });
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">Discover People</h2>
          <p className="text-gray-400">Connect with creators, designers, and interesting people</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No users to discover at the moment. Check back later!</p>
        </div>
      ) : (
        <Grid cols={2}>
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onFollow={handleFollow}
            />
          ))}
        </Grid>
      )}
    </div>
  );
}