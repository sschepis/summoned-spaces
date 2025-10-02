/**
 * Beacon Type Constants
 * Centralized constants to prevent beacon type mismatches across the application
 */

export const BEACON_TYPES = {
  // User-related beacons
  USER_FOLLOWING_LIST: 'user_following_list',
  USER_SPACES_LIST: 'user_spaces_list',
  
  // Space-related beacons
  SPACE_MEMBERS: 'space_members',
  SPACE_MEMBER_LIST: 'space_member_list', // Alternative name, should be unified
  SPACE_FILE_INDEX: 'space_file_index',
  
  // Message-related beacons
  DIRECT_MESSAGE: 'direct_message',
  SPACE_MESSAGE: 'space_message',
  
  // Content beacons
  POST: 'post',
  COMMENT: 'comment',
  FILE_METADATA: 'file_metadata',
  
  // System beacons
  USER_PROFILE: 'user_profile',
  NOTIFICATION: 'notification'
} as const;

export type BeaconType = typeof BEACON_TYPES[keyof typeof BEACON_TYPES];

// Validation helper
export function isValidBeaconType(type: string): type is BeaconType {
  return Object.values(BEACON_TYPES).includes(type as BeaconType);
}

// Migration helper - maps old beacon types to new standardized ones
export const BEACON_TYPE_MIGRATIONS: Record<string, BeaconType> = {
  'space_member_list': BEACON_TYPES.SPACE_MEMBERS,
  'user_follow_list': BEACON_TYPES.USER_FOLLOWING_LIST,
  'message': BEACON_TYPES.DIRECT_MESSAGE,
};

// Get standardized beacon type
export function getStandardBeaconType(type: string): BeaconType {
  return BEACON_TYPE_MIGRATIONS[type] || type as BeaconType;
}