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
import { userDataManager } from '../services/user-data';
import { useNotifications } from './NotificationSystem';
import { communicationManager } from '../services/communication-manager';

interface SocialNetworkProps {
  onBack: () => void;
}

export function SocialNetwork({ onBack }: SocialNetworkProps) {
  const [activeTab, setActiveTab] = useState<'following' | 'followers' | 'suggested'>('suggested');
  const [searchQuery, setSearchQuery] = useState('');
  const { user: currentUser, waitForAuth } = useAuth();
  const { nodes } = useNetworkState();
  const { showFollow, showUnfollow } = useNotifications();
  const [followingList, setFollowingList] = useState<{ userId: string, username: string }[]>([]);
  const [followersList, setFollowersList] = useState<{ userId: string, username: string }[]>([]);

  const [users, setUsers] = useState<{
    following: User[];
    followers: User[];
    suggested: User[];
  }>({
    following: [],
    followers: [],
    suggested: [],
  });

  // Load current user's following list from userDataManager
  useEffect(() => {
    const loadFollowingData = async () => {
        if (!currentUser?.id) return;
        try {
            // Get following list from userDataManager (authoritative source)
            const localFollowingList = userDataManager.getFollowingList();
            
            // Convert to the format expected by this component
            const followingWithUsernames = localFollowingList.map(userId => {
                const node = nodes.find(n => n.userId === userId);
                return {
                    userId,
                    username: node?.username || userId.substring(0, 8)
                };
            });
            
            setFollowingList(followingWithUsernames);
            
            // Also request from server for completeness (to get follower notifications)
            communicationManager.send({
                kind: 'getFollowing',
                payload: { userId: currentUser.id }
            });
        } catch (error) {
            console.error('Failed to fetch following:', error);
        }
    };

    loadFollowingData();
    
    // Set up interval to refresh data periodically
    const interval = setInterval(loadFollowingData, 2000);
    return () => clearInterval(interval);
  }, [nodes, currentUser?.id]);

  // Fetch followers from server
  useEffect(() => {
    const fetchFollowers = async () => {
      if (!currentUser?.id) return;
      
      try {
        // Wait for auth before requesting followers
        await waitForAuth();
        
        // Request followers list from server
        communicationManager.send({
          kind: 'getFollowers',
          payload: { userId: currentUser.id }
        });
      } catch (error) {
        console.error('Failed to fetch followers:', error);
      }
    };

    // Listen for followers response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleFollowersResponse = (message: any) => {
      if (message.kind === 'followersResponse') {
        setFollowersList(message.payload.followers || []);
        console.log('Received followers list:', message.payload.followers);
      } else if (message.kind === 'followingResponse') {
        // Update server following list but keep userDataManager as primary source
        const serverFollowing = message.payload.following || [];
        console.log('Received server following list:', serverFollowing);
        
        // Only update if significantly different from userDataManager
        const localFollowing = userDataManager.getFollowingList();
        if (serverFollowing.length !== localFollowing.length) {
          console.log('Server/local following lists differ, updating from server');
          setFollowingList(serverFollowing);
        }
      }
    };

    communicationManager.onMessage(handleFollowersResponse);
    fetchFollowers();

    // Refresh followers periodically
    const interval = setInterval(fetchFollowers, 10000); // Every 10 seconds

    return () => {
      clearInterval(interval);
    };
  }, [currentUser?.id]);

  // Update suggested users and following list when data changes
  useEffect(() => {
    const suggestedUsers = nodes
      .filter(node => node.userId !== currentUser?.id)
      .filter(node => !followingList.some(f => f.userId === node.userId)) // Exclude already followed users
      .map(node => ({
        id: node.userId,
        name: node.username || node.userId.substring(0, 8),
        username: `@${node.username || node.userId.substring(0, 8)}`,
        avatar: `https://api.dicebear.com/8.x/bottts/svg?seed=${node.userId}`,
        bio: 'A resonant being in the network.',
        isFollowing: false, // Should always be false for suggested users
        stats: { followers: 0, following: 0, spaces: 0, resonanceScore: 0 },
        recentActivity: 'Online',
        tags: ['live-node'],
      }));

    // Create following users list from the actual following data
    const followingUsers = followingList.map(following => {
      const node = nodes.find(n => n.userId === following.userId);
      return {
        id: following.userId,
        name: following.username,
        username: `@${following.username}`,
        avatar: `https://api.dicebear.com/8.x/bottts/svg?seed=${following.userId}`,
        bio: 'A resonant being in the network.',
        isFollowing: true,
        stats: { followers: 0, following: 0, spaces: 0, resonanceScore: 0 },
        recentActivity: node ? 'Online' : 'Offline',
        tags: node ? ['live-node'] : ['offline'],
      };
    });

    // Create followers users list
    const followersUsers = followersList.map(follower => {
      const node = nodes.find(n => n.userId === follower.userId);
      return {
        id: follower.userId,
        name: follower.username,
        username: `@${follower.username}`,
        avatar: `https://api.dicebear.com/8.x/bottts/svg?seed=${follower.userId}`,
        bio: 'A resonant being following you.',
        isFollowing: followingList.some(f => f.userId === follower.userId), // Check if mutual
        stats: { followers: 0, following: 0, spaces: 0, resonanceScore: 0 },
        recentActivity: node ? 'Online' : 'Offline',
        tags: node ? ['live-node', 'follower'] : ['offline', 'follower'],
      };
    });

    setUsers(prev => ({
      ...prev,
      suggested: suggestedUsers,
      following: followingUsers,
      followers: followersUsers
    }));
  }, [nodes, followingList, followersList, currentUser?.id]);

  // Set up follow notification listener
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleFollowNotification = (notification: any) => {
      if (notification.kind !== 'followNotification') return;
      const { followerId, followerUsername, type } = notification.payload;
      
      if (type === 'follow') {
        // Add to followers list immediately
        setFollowersList(prev => {
          if (!prev.some(f => f.userId === followerId)) {
            return [...prev, { userId: followerId, username: followerUsername }];
          }
          return prev;
        });
        
        showFollow(
          'New Follower!',
          `${followerUsername} started following you`,
          followerId,
          {
            label: 'View Profile',
            onClick: () => {
              setActiveTab('followers'); // Switch to followers tab
            }
          }
        );
      } else if (type === 'unfollow') {
        // Remove from followers list immediately
        setFollowersList(prev => prev.filter(f => f.userId !== followerId));
        
        showUnfollow(
          'Follower Update',
          `${followerUsername} unfollowed you`,
          followerId
        );
      }
    };

    communicationManager.onMessage(handleFollowNotification);

    return () => {}; // SSE cleanup handled automatically
  }, [showFollow, showUnfollow]);

  const handleFollow = async (userIdToFollow: string) => {
    try {
      // Use the holographic user data manager
      await userDataManager.followUser(userIdToFollow);

      // Update local state immediately from userDataManager
      const updatedFollowing = userDataManager.getFollowingList();
      const followingWithUsernames = updatedFollowing.map(userId => {
        const node = nodes.find(n => n.userId === userId);
        return {
          userId,
          username: node?.username || userId.substring(0, 8)
        };
      });
      setFollowingList(followingWithUsernames);
      
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  const handleUnfollow = async (userIdToUnfollow: string) => {
    try {
      // Use the holographic user data manager
      await userDataManager.unfollowUser(userIdToUnfollow);

      // Update local state immediately from userDataManager
      const updatedFollowing = userDataManager.getFollowingList();
      const followingWithUsernames = updatedFollowing.map(userId => {
        const node = nodes.find(n => n.userId === userId);
        return {
          userId,
          username: node?.username || userId.substring(0, 8)
        };
      });
      setFollowingList(followingWithUsernames);
      
    } catch (error) {
      console.error('Failed to unfollow user:', error);
    }
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
    {
      label: 'Mutuals',
      value: followersList.filter(f => followingList.some(fol => fol.userId === f.userId)).length,
      icon: TrendingUp
    },
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
        onUnfollow={handleUnfollow}
        loading={false}
        emptyTitle={`No ${activeTab} found`}
        emptyDescription={searchQuery ? `No users found matching "${searchQuery}"` : `You are not following anyone yet.`}
        paginate
      />
    </PageLayout>
  );
}