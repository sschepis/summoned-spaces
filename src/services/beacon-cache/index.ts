/**
 * Beacon Cache Module
 * Main export for refactored beacon cache
 */

import { BeaconCacheCore } from './cache-core';

/**
 * BeaconCacheManager - Singleton instance maintaining backward compatibility
 */
class BeaconCacheManager extends BeaconCacheCore {
  // All functionality is inherited from BeaconCacheCore
  // This class exists for backward compatibility
}

// Export singleton instance
export const beaconCacheManager = new BeaconCacheManager();

// Export types
export type { CachedBeacon, CacheStats } from './types';