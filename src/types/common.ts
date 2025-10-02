export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  isFollowing: boolean;
  followsMe?: boolean;
  isVerified?: boolean;
  stats: {
    followers: number;
    following: number;
    spaces: number;
    resonanceScore: number;
  };
  recentActivity: string;
  tags: string[];
  mutualFollowers?: User[];
}

export interface Space {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  isJoined?: boolean;
  memberCount: number;
  fileCount?: number;
  volumeCount?: number;
  resonanceStrength?: number;
  recentActivity?: string;
  creator?: string;
  createdAt?: string;
  lastActivity?: string;
  tags: string[];
  role?: SpaceRole;
  color?: string;
  cover?: string;
  growthRate?: number;
  isTemporary?: boolean;
}

export type SpaceRole = 'owner' | 'admin' | 'contributor' | 'viewer' | 'member';

export interface ActivityItem {
  id: string;
  type: 'file_contributed' | 'file_summoned' | 'space_created' | 'member_joined' | 'resonance_locked' | 'file_starred' | 'space_updated' | 'collaboration_started' | 'user_followed' | 'space_joined';
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isFollowing: boolean;
    verified?: boolean;
  };
  action: string;
  target?: string;
  space?: string;
  details?: string;
  timestamp: string;
  metrics?: {
    likes: number;
    comments: number;
    shares: number;
    hasLiked?: boolean;
    hasBookmarked?: boolean;
  };
  resonanceData?: {
    strength: number;
    timeToLock: string;
  };
  media?: {
    type: 'image' | 'video' | 'audio' | 'file';
    url: string;
    thumbnail?: string;
    filename?: string;
    artist?: string;
    duration?: number;
  };
  isPinned?: boolean;
}

export interface FileEntry {
  id: string;
  name: string;
  size: string;
  type: string;
  fingerprint: string;
  contributor: string;
  uploadedAt: string;
  lastAccessed?: string;
  accessCount: number;
  resonanceStrength: number;
  description?: string;
  tags: string[];
}

export interface Volume {
  id: string;
  name: string;
  fileCount: number;
  totalSize: string;
  resonanceStrength: number;
  lastUpdate: string;
  color: string;
  isLocking: boolean;
}