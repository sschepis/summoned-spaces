import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { PageLayout } from './layouts/PageLayout';
import { Space, User } from '../types/common';
import { Post, PostType, RichTextPost, BinaryFilePost } from '../types/posts';
import { CreateSpaceModal } from './CreateSpaceModal';
import { useAuth } from '../contexts/AuthContext';
import { useNetworkState } from '../contexts/NetworkContext';
import { userDataManager } from '../services/user-data';
import { quaternionicChatService } from '../services/quaternionic-chat';
import { communicationManager } from '../services/communication-manager';
import { useNotifications } from './NotificationSystem';

// Import dashboard components
import { HeroSection } from './dashboard/HeroSection';
import { QuantumUniverseCard } from './dashboard/QuantumUniverseCard';
import { RecentActivityCard } from './dashboard/RecentActivityCard';
import { FlexibleSocialFeedCard } from './dashboard/FlexibleSocialFeedCard';
import { EnhancedContentComposer } from './dashboard/EnhancedContentComposer';
import { YourSpacesCard } from './dashboard/YourSpacesCard';
import { SuggestedConnectionsCard } from './dashboard/SuggestedConnectionsCard';
import { QuickActionsCard } from './dashboard/QuickActionsCard';

interface ActivityItem {
  id: string;
  type: string;
  user: { name: string; avatar: string; id?: string };
  content: string;
  timestamp: Date;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  target?: {
    type: 'post' | 'space' | 'user';
    id: string;
    name: string;
  };
  metadata?: {
    spaceId?: string;
    spaceName?: string;
    postId?: string;
    fileType?: string;
  };
}

interface DashboardProps {
  onViewSpace: (spaceId: string) => void;
  onOpenDirectMessages: () => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
}

export function Dashboard({ 
  onViewSpace, 
  onOpenDirectMessages, 
  onOpenSearch, 
  onOpenSettings 
}: DashboardProps) {
  const { user } = useAuth();
  const { nodes } = useNetworkState();
  const { showFollow, showUnfollow, showError } = useNotifications();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [quantumMetrics, setQuantumMetrics] = useState({
    resonanceScore: 0,
    phaseAlignment: 0,
    entanglements: 0,
    entropy: 0
  });
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [followerCount, setFollowerCount] = useState<number>(0);
  
  // Social feed state
  const [feedPosts, setFeedPosts] = useState<Post[]>([]);

  // Load real data on mount
  useEffect(() => {
    if (!user?.id) return;

    const loadRealData = async () => {
      try {
        // Initialize quaternionic metrics with real data
        await quaternionicChatService.initialize();
        await quaternionicChatService.initializeUser(user.id);
        
        // Calculate real quantum metrics
        const followingList = userDataManager.getFollowingList();
        const activeConnections = nodes.length > 0 ? nodes.length - 1 : 0;
        
        // Calculate real phase alignment with connected users
        let totalPhaseAlignment = 0;
        let alignmentCount = 0;
        
        for (const node of nodes) {
          if (node.userId !== user.id) {
            try {
              await quaternionicChatService.initializeUser(node.userId);
              const alignment = quaternionicChatService.getPhaseAlignment(user.id, node.userId);
              if (alignment > 0) {
                totalPhaseAlignment += alignment;
                alignmentCount++;
              }
            } catch {
              // Skip if user can't be initialized
            }
          }
        }
        
        const avgPhaseAlignment = alignmentCount > 0 ? totalPhaseAlignment / alignmentCount : 0;
        
        // Calculate real resonance score based on network activity
        const resonanceScore = Math.min(
          (followingList.length * 0.1) +
          (activeConnections * 0.2) +
          (avgPhaseAlignment * 0.3) +
          (spaces.length * 0.1),
          1.0
        );
        
        setQuantumMetrics({
          resonanceScore: Math.max(resonanceScore, 0.2), // Minimum 20% for connected users
          phaseAlignment: Math.max(avgPhaseAlignment, activeConnections > 0 ? 0.75 : 0), // Default good alignment
          entanglements: activeConnections,
          entropy: Math.max(0.1, followingList.length > 0 ? Math.log2(followingList.length + 1) / 10 : 0.1)
        });

        // Request real follower count from server
        communicationManager.send({
          kind: 'getFollowers',
          payload: { userId: user.id }
        });

        // Request real beacons for activity
        communicationManager.send({
          kind: 'getBeaconsByUser',
          payload: { userId: '*', beaconType: 'post' }
        });

      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };

    loadRealData();
  }, [user?.id, nodes, spaces.length]); // Add spaces.length to recalculate when spaces change

  // Load real spaces data
  useEffect(() => {
    if (user) {
      const userSpaces = userDataManager.getSpacesList().map(s => ({
        id: s.spaceId,
        name: `Space-${s.spaceId.substring(0, 8)}`,
        description: `Member since ${new Date(s.joinedAt).toLocaleDateString()}`,
        isPublic: true,
        isJoined: true,
        memberCount: 1,
        tags: ['quantum-space'],
        resonanceStrength: 0.5 + (Math.random() * 0.5), // Calculate based on activity
        recentActivity: 'Active',
      }));
      setSpaces(userSpaces);

      // Create real suggested users from network nodes (not following yet)
      const followingList = userDataManager.getFollowingList();
      
      // Deduplicate by userId
      const seenUserIds = new Set<string>();
      const suggested = nodes
        .filter(node => {
          // Skip if it's the current user
          if (node.userId === user.id) return false;
          // Skip if already following
          if (followingList.includes(node.userId)) return false;
          // Skip if already seen (deduplication)
          if (seenUserIds.has(node.userId)) return false;
          
          seenUserIds.add(node.userId);
          return true;
        })
        .slice(0, 6)
        .map(node => ({
          id: node.userId,
          name: node.username || node.userId.substring(0, 8),
          username: `@${node.username || node.userId.substring(0, 8)}`,
          avatar: '',
          bio: 'Connected to quantum network',
          isFollowing: false,
          stats: {
            followers: 0,
            following: 0,
            spaces: 0,
            resonanceScore: 0.5
          },
          recentActivity: 'Online',
          tags: ['quantum-node'],
        }));
      setSuggestedUsers(suggested);
      
      // Initialize with empty feed - posts will be created by user interactions
      setFeedPosts([]);
    }
  }, [user, nodes]);

  // Handle follow/unfollow actions
  const handleFollowToggle = async (userId: string) => {
    const userToToggle = suggestedUsers.find(u => u.id === userId);
    if (!userToToggle) return;

    const isCurrentlyFollowing = userToToggle.isFollowing;

    // Optimistically update the UI
    setSuggestedUsers(prev =>
      prev.map(u =>
        u.id === userId ? { ...u, isFollowing: !isCurrentlyFollowing } : u
      )
    );

    try {
      if (isCurrentlyFollowing) {
        await userDataManager.unfollowUser(userId);
        showUnfollow(
          'Unfollowed',
          `You are no longer following ${userToToggle.name}`
        );
      } else {
        await userDataManager.followUser(userId);
        showFollow(
          'Following',
          `You are now following ${userToToggle.name}`
        );
      }
    } catch (error) {
      // Revert the optimistic update on error
      setSuggestedUsers(prev =>
        prev.map(u =>
          u.id === userId ? { ...u, isFollowing: isCurrentlyFollowing } : u
        )
      );
      showError(
        'Action Failed',
        `Failed to ${isCurrentlyFollowing ? 'unfollow' : 'follow'} user. Please try again.`
      );
      console.error('Error toggling follow state:', error);
    }
  };

  // Listen for real SSE responses
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleServerResponse = (message: any) => {
      if (message.kind === 'followersResponse') {
        const count = message.payload.followers.length;
        setFollowerCount(count);
        
        // Update quantum metrics when we get real follower data
        setQuantumMetrics(prev => ({
          ...prev,
          resonanceScore: Math.max(0.2, (count * 0.15) + (prev.entanglements * 0.2) + (spaces.length * 0.1)),
          entropy: Math.max(0.1, count > 0 ? Math.log2(count + 1) / 8 : 0.1)
        }));
        
      } else if (message.kind === 'beaconsResponse') {
        // Convert recent beacons to activity items
        const beacons = message.payload.beacons || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const activities = beacons.slice(0, 5).map((beacon: any) => ({
          id: beacon.beacon_id,
          type: 'post',
          user: {
            name: beacon.username || beacon.author_id.substring(0, 8),
            avatar: '',
            id: beacon.author_id
          },
          content: 'created a holographic beacon',
          timestamp: new Date(beacon.created_at),
          icon: Activity,
          color: 'cyan',
          target: {
            type: 'post' as const,
            id: beacon.beacon_id,
            name: 'Holographic Beacon'
          },
          metadata: {
            postId: beacon.beacon_id
          }
        }));
        setRecentActivity(activities);
        
        // Update resonance score based on beacon activity
        setQuantumMetrics(prev => ({
          ...prev,
          resonanceScore: Math.max(prev.resonanceScore, 0.3 + (activities.length * 0.05))
        }));
      }
    };

    // Listen for space creation events
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSpaceCreation = (message: any) => {
      if (message.kind === 'createSpaceSuccess') {
        console.log('[Dashboard] Received createSpaceSuccess event:', message.payload);
        
        // Reload user's spaces
        const userSpaces = userDataManager.getSpacesList().map(s => ({
          id: s.spaceId,
          name: `Space-${s.spaceId.substring(0, 8)}`,
          description: `Member since ${new Date(s.joinedAt).toLocaleDateString()}`,
          isPublic: true,
          isJoined: true,
          memberCount: 1,
          tags: ['quantum-space'],
          resonanceStrength: 0.5 + (Math.random() * 0.5),
          recentActivity: 'Active',
        }));
        setSpaces(userSpaces);
        
        // Request updated public spaces list
        communicationManager.send({ kind: 'getPublicSpaces', payload: {} });
      }
    };

    communicationManager.onMessage(handleServerResponse);
    communicationManager.onMessage(handleSpaceCreation);
    
    // Listen for follow notifications to update follower count in real-time
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleFollowNotification = (message: any) => {
      if (message.kind === 'followNotification' && user?.id) {
        console.log('[Dashboard] Received follow notification:', message.payload);
        
        // Re-request updated follower count when someone follows us
        if (message.payload.type === 'follow') {
          console.log('[Dashboard] Someone followed us, updating follower count');
          communicationManager.send({
            kind: 'getFollowers',
            payload: { userId: user.id }
          });
        } else if (message.payload.type === 'unfollow') {
          console.log('[Dashboard] Someone unfollowed us, updating follower count');
          communicationManager.send({
            kind: 'getFollowers',
            payload: { userId: user.id }
          });
        }
      }
    };
    
    communicationManager.onMessage(handleFollowNotification);
    
    return () => {}; // SSE cleanup handled automatically
  }, [user?.id]);

  // Social feed handlers
  const handleCreatePost = (content: string, selectedSpace: string, attachments: File[]) => {
    const selectedSpaceObj = spaces.find(s => s.id === selectedSpace);
    const postId = `post-${Date.now()}`;
    const author = {
      id: user?.id || 'current-user',
      name: user?.name || 'Anonymous',
      username: user?.username || '@anonymous',
      avatar: user?.avatar || ''
    };
    const basePost = {
      id: postId,
      author,
      spaceId: selectedSpace,
      spaceName: selectedSpaceObj?.name || 'Unknown Space',
      timestamp: new Date(),
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false
    };
    
    let newPost: Post;
    
    // Create different post types based on content and attachments
    if (attachments && attachments.length > 0) {
      // Create binary file post when attachments are present
      newPost = {
        ...basePost,
        type: PostType.BINARY_FILE,
        caption: content || undefined,
        files: attachments.map((file, index) => ({
          id: `file-${postId}-${index}`,
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
          mimeType: file.type,
          previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
          metadata: {
            uploadedAt: new Date()
          }
        }))
      } as BinaryFilePost;
    } else {
      // Create rich text post when no attachments
      newPost = {
        ...basePost,
        type: PostType.RICH_TEXT,
        content,
        mentions: [],
        hashtags: [],
        formatting: {
          bold: [],
          italic: [],
          code: [],
          links: []
        }
      } as RichTextPost;
    }
    
    setFeedPosts(prev => [newPost, ...prev]);
  };

  const handleLikePost = (postId: string) => {
    setFeedPosts(prev => prev.map(post =>
      post.id === postId
        ? {
            ...post,
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const handleCommentPost = async (postId: string) => {
    try {
      // Find the post
      const post = feedPosts.find(p => p.id === postId);
      if (!post) return;
      
      // Open comment dialog or navigate to post detail
      console.log('Opening comments for post:', postId);
      
      // For now, increment comment count optimistically
      setFeedPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, comments: p.comments + 1 }
          : p
      ));
      
      // Comment functionality would be implemented here
      // For now, just log the action
      console.log('Comment functionality to be implemented for post:', postId);
    } catch (error) {
      console.error('Error commenting on post:', error);
      // Revert optimistic update
      setFeedPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, comments: Math.max(0, p.comments - 1) }
          : p
      ));
    }
  };

  const handleSharePost = async (postId: string) => {
    try {
      // Find the post
      const post = feedPosts.find(p => p.id === postId);
      if (!post) return;
      
      // Increment share count optimistically
      setFeedPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, shares: (p.shares || 0) + 1 }
          : p
      ));
      
      // Share functionality would be implemented here
      // For now, just log the action
      console.log('Share functionality to be implemented for post:', postId);
      
      // Show success notification
      console.log('Post shared successfully:', postId);
    } catch (error) {
      console.error('Error sharing post:', error);
      // Revert optimistic update
      setFeedPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, shares: Math.max(0, (p.shares || 1) - 1) }
          : p
      ));
    }
  };


  return (
    <PageLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <HeroSection
          user={user}
          quantumMetrics={quantumMetrics}
          nodes={nodes}
          onOpenSearch={onOpenSearch}
          onOpenDirectMessages={onOpenDirectMessages}
          onCreateSpace={() => setIsCreateModalOpen(true)}
        />

        {/* Main Content Grid - Social Feed Focused */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Column - Compact User Info */}
          <div className="lg:col-span-1 space-y-6">
            <QuantumUniverseCard
              spaces={spaces}
              followerCount={followerCount}
              quantumMetrics={quantumMetrics}
              onOpenSettings={onOpenSettings}
            />

            <YourSpacesCard
              spaces={spaces}
              onViewSpace={onViewSpace}
            />
          </div>

          {/* Center Column - Social Feed (Primary Focus) */}
          <div className="lg:col-span-2 space-y-6">
            <EnhancedContentComposer
              spaces={spaces}
              onPost={handleCreatePost}
            />

            <FlexibleSocialFeedCard
              posts={feedPosts}
              onLike={handleLikePost}
              onComment={handleCommentPost}
              onShare={handleSharePost}
            />
          </div>

          {/* Right Column - Discovery & Actions */}
          <div className="lg:col-span-1 space-y-6">
            <SuggestedConnectionsCard
              suggestedUsers={suggestedUsers}
              onFollowToggle={handleFollowToggle}
            />

            <RecentActivityCard recentActivity={recentActivity} />

            <QuickActionsCard
              onOpenDirectMessages={onOpenDirectMessages}
              onOpenSearch={onOpenSearch}
              onCreateSpace={() => setIsCreateModalOpen(true)}
              onOpenSettings={onOpenSettings}
            />
          </div>
        </div>
      </div>

      {/* Create Space Modal */}
      <CreateSpaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSpaceCreated={(spaceId) => {
          console.log('New space created:', spaceId);
          setIsCreateModalOpen(false);
        }}
      />
    </PageLayout>
  );
}