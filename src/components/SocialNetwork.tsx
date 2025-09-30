import { useState, useEffect } from 'react';
import { Users, TrendingUp } from 'lucide-react';
import { PageLayout } from './layouts/PageLayout';
import { SearchInput } from './ui/SearchInput';
import { Tabs } from './ui/Tabs';
import { UserList } from './common/lists/UserList';
import { User } from '../types/common';
import { StatsGrid } from './common/StatsGrid';
import { useNetworkState } from '../contexts/NetworkContext';
import { useAuth } from '../contexts/AuthContext';
import { userDataManager } from '../services/user-data-manager';

interface SocialNetworkProps {
  onBack: () => void;
}

export function SocialNetwork({ onBack }: SocialNetworkProps) {
  const [activeTab, setActiveTab] = useState<'following' | 'followers' | 'suggested'>('suggested');
  const [searchQuery, setSearchQuery] = useState('');
  const { user: currentUser } = useAuth();
  const { nodes } = useNetworkState();

  const suggestedUsers = nodes
    .filter(node => node.userId !== currentUser?.id)
    .map(node => ({
      id: node.userId,
      name: node.userId.substring(0, 8), // Placeholder
      username: `@${node.userId.substring(0, 8)}`,
      avatar: `https://api.dicebear.com/8.x/bottts/svg?seed=${node.userId}`,
      bio: 'A resonant being in the network.',
      isFollowing: false,
      stats: { followers: 0, following: 0, spaces: 0, resonanceScore: 0 },
      recentActivity: 'Online',
      tags: ['live-node'],
    }));

  const [users, setUsers] = useState<{
    following: User[];
    followers: User[];
    suggested: User[];
  }>({
    following: [],
    followers: [],
    suggested: suggestedUsers,
  });

  useEffect(() => {
    setUsers(prev => ({ ...prev, suggested: suggestedUsers }));
  }, [nodes]);

  const handleFollow = async (userIdToFollow: string) => {
    // Use the holographic user data manager
    await userDataManager.followUser(userIdToFollow);

    // Optimistically update the UI
    setUsers(prev => ({
      ...prev,
      suggested: prev.suggested.map(user =>
        user.id === userIdToFollow
          ? { ...user, isFollowing: true }
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
    { label: 'Mutuals', value: 0, icon: TrendingUp },
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
        onTabChange={(tabId) => setActiveTab(tabId as 'following' | 'followers' | 'suggested')}
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
        onFollow={handleFollow}
        loading={false}
        emptyTitle={`No ${activeTab} found`}
        emptyDescription={searchQuery ? `No users found matching "${searchQuery}"` : `You are not following anyone yet.`}
        paginate
      />
    </PageLayout>
  );
}