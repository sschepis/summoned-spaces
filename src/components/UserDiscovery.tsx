import { UserCard } from './common/UserCard';
import { Grid } from './ui/Grid';
import { useNetworkState } from '../contexts/NetworkContext';
import { useAuth } from '../contexts/AuthContext';
import { webSocketService } from '../services/websocket';

export function UserDiscovery() {
  const { nodes } = useNetworkState();
  const { user: currentUser } = useAuth();

  const users = nodes
    .filter(node => node.userId !== currentUser?.id)
    .map(node => ({
      id: node.userId,
      name: node.userId.substring(0, 8),
      username: `@${node.userId.substring(0, 8)}`,
      avatar: `https://api.dicebear.com/8.x/bottts/svg?seed=${node.userId}`,
      bio: 'A resonant being in the quantum network.',
      isFollowing: false,
      stats: { followers: 0, following: 0, spaces: 0, resonanceScore: 0.5 },
      recentActivity: 'Active on network',
      tags: ['live-node', 'holographic'],
    }));

  const handleFollow = (userId: string) => {
    webSocketService.sendMessage({
      kind: 'follow',
      payload: { userIdToFollow: userId }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">Discover People</h2>
          <p className="text-gray-400">Connect with creators, designers, and interesting people</p>
        </div>
      </div>

      <Grid cols={2}>
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onFollow={handleFollow}
          />
        ))}
      </Grid>
    </div>
  );
}