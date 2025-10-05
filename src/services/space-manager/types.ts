/**
 * Space Manager Type Definitions
 * Aligned with design specification from design/design.md
 */

// Roles per design spec (design.md:262)
export type SpaceRole = 'owner' | 'admin' | 'contributor' | 'viewer';

// Permission enum per design spec (design.md:466-475)
export enum Permission {
  VIEW_SPACE = 'view_space',
  VIEW_VOLUMES = 'view_volumes',
  CONTRIBUTE_FILES = 'contribute_files',
  SUMMON_FILES = 'summon_files',
  MANAGE_MEMBERS = 'manage_members',
  MANAGE_VOLUMES = 'manage_volumes',
  DELETE_FILES = 'delete_files',
  ADMIN = 'admin'
}

// SpaceMember per design spec (design.md:259-269)
export interface SpaceMember {
  userId: string;
  spaceId: string;  // Added per design spec
  role: SpaceRole;
  joinedAt: string;  // Keep as string for JSON serialization
  permissions: Permission[];  // Added per design spec
  resonanceKeys?: {  // Added per design spec (optional for backward compatibility)
    phaseKey: Uint8Array;
    accessLevel: number;
  };
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