/**
 * User Data Type Definitions
 */

export interface SpaceMembership {
  spaceId: string;
  role: string;
  joinedAt: string;
}

export interface FollowingListData {
  following: string[];
}

export interface SpacesListData {
  spaces: SpaceMembership[];
  version: number;
}