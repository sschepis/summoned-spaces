import { useState } from 'react';
import { ArrowLeft, Users, TrendingUp } from 'lucide-react';
import { PageLayout } from './layouts/PageLayout';
import { SearchInput } from './ui/SearchInput';
import { Tabs } from './ui/Tabs';
import { UserList } from './common/lists/UserList';
import { User } from '../types/common';
import { StatsGrid } from './common/StatsGrid';

interface SocialNetworkProps {
  onBack: () => void;
}

const mockFollowing: User[] = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    username: '@sarahchen_quantum',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    bio: 'Quantum computing researcher at MIT. Pioneering work in prime-resonant algorithms.',
    isFollowing: true,
    isVerified: true,
    stats: { followers: 2847, following: 342, spaces: 12, resonanceScore: 0.94 },
    recentActivity: 'Published breakthrough paper on quantum entanglement',
    tags: ['quantum-computing', 'research', 'algorithms']
  },
];

const mockFollowers: User[] = [
    {
    id: '4',
    name: 'Dr. James Wilson',
    username: '@jwilson_research',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    bio: 'Physics researcher exploring quantum measurement theory.',
    isFollowing: false,
    isVerified: true,
    stats: { followers: 1567, following: 203, spaces: 6, resonanceScore: 0.89 },
    recentActivity: 'Shared breakthrough measurement data',
    tags: ['physics', 'quantum-theory']
  },
];

const mockSuggested: User[] = [
    {
    id: '6',
    name: 'Dr. Maria Santos',
    username: '@mariasantos_ai',
    avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    bio: 'AI researcher working on quantum machine learning applications.',
    isFollowing: false,
    isVerified: true,
    stats: { followers: 1834, following: 298, spaces: 9, resonanceScore: 0.92 },
    recentActivity: 'Published paper on quantum neural networks',
    tags: ['ai', 'machine-learning', 'quantum']
  },
];

export function SocialNetwork({ onBack }: SocialNetworkProps) {
  const [activeTab, setActiveTab] = useState<'following' | 'followers' | 'suggested'>('following');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState({
    following: mockFollowing,
    followers: mockFollowers,
    suggested: mockSuggested,
  });

  const handleFollow = (userId: string, listName: 'following' | 'followers' | 'suggested') => {
    setUsers(prev => ({
      ...prev,
      [listName]: prev[listName].map(user =>
        user.id === userId
          ? { ...user, isFollowing: !user.isFollowing }
          : user
      )
    }));
  };

  const getCurrentList = () => {
    const list = users[activeTab];
    return list.filter(user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.tags && user.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  };

  const filteredUsers = getCurrentList();

  const stats = [
    { label: 'Following', value: users.following.length, icon: Users },
    { label: 'Followers', value: users.followers.length, icon: Users },
    { label: 'Mutuals', value: users.following.filter(u => users.followers.some(f => f.id === u.id)).length, icon: TrendingUp },
  ];

  const tabs = [
    { id: 'following', label: `Following (${users.following.length})` },
    { id: 'followers', label: `Followers (${users.followers.length})` },
    { id: 'suggested', label: 'Suggested' },
  ];

  return (
    <PageLayout
      title="Friends & Followers"
      subtitle="Manage your connections and discover interesting people"
      onBack={onBack}
    >
      <StatsGrid stats={stats} className="mb-8" />

      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as any)}
        className="mb-6"
      />

      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search users..."
        className="mb-6"
      />

      <UserList
        users={filteredUsers}
        onFollow={(userId) => handleFollow(userId, activeTab)}
        loading={false}
        emptyTitle={`No ${activeTab} found`}
        emptyDescription={searchQuery ? `No users found matching "${searchQuery}"` : `You are not following anyone yet.`}
        paginate
      />
    </PageLayout>
  );
}