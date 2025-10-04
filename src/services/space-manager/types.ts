/**
 * Space Manager Type Definitions
 */

export type SpaceRole = 'owner' | 'admin' | 'member';

export interface SpaceMember {
  userId: string;
  role: SpaceRole;
  joinedAt: string;
}

export interface SpaceMetadata {
  spaceId: string;
  name: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
}

export interface SpaceMemberListData {
  spaceId: string;
  members: SpaceMember[];
  version: number;
}