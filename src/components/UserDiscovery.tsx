import { useState } from 'react';
import { UserCard } from './common/UserCard';
import { Grid } from './ui/Grid';

const suggestedUsers: User[] = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    username: '@sarahchen_quantum',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    bio: 'Quantum computing researcher at MIT. Pioneering work in prime-resonant algorithms.',
    isFollowing: false,
    isVerified: true,
    stats: { followers: 2847, following: 342, spaces: 12, resonanceScore: 0.94 },
    recentActivity: 'Published breakthrough paper on quantum entanglement',
    tags: ['quantum-computing', 'research', 'algorithms']
  },
  {
    id: '2',
    name: 'Elena Kowalski',
    username: '@elenakdesign',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    bio: 'Senior UX Designer creating quantum-inspired interfaces. Design systems enthusiast.',
    isFollowing: false,
    stats: { followers: 1203, following: 89, spaces: 8, resonanceScore: 0.87 },
    recentActivity: 'Created new design system for quantum interfaces',
    tags: ['design', 'ux', 'quantum-ui']
  },
  {
    id: '3',
    name: 'Marcus Rodriguez',
    username: '@marcustech',
    avatar: 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    bio: 'Full-stack developer building the next generation of collaborative platforms.',
    isFollowing: true,
    stats: { followers: 892, following: 156, spaces: 15, resonanceScore: 0.91 },
    recentActivity: 'Achieved perfect resonance lock on complex dataset',
    tags: ['development', 'collaboration', 'full-stack']
  },
  {
    id: '4',
    name: 'Dr. James Wilson',
    username: '@jwilson_research',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    bio: 'Physics researcher exploring quantum measurement theory and practical applications.',
    isFollowing: false,
    isVerified: true,
    stats: { followers: 1567, following: 203, spaces: 6, resonanceScore: 0.89 },
    recentActivity: 'Shared breakthrough measurement data',
    tags: ['physics', 'quantum-theory', 'measurements']
  }
];

export function UserDiscovery() {
  const [users, setUsers] = useState(suggestedUsers);

  const handleFollow = (userId: string) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === userId
          ? { 
              ...user, 
              isFollowing: !user.isFollowing,
              stats: {
                ...user.stats,
                followers: user.isFollowing ? user.stats.followers - 1 : user.stats.followers + 1
              }
            }
          : user
      )
    );
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