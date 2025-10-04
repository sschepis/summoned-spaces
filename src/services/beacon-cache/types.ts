/**
 * Beacon Cache Type Definitions
 */

export interface CachedBeacon {
  beacon_id: string;
  beacon_type: string;
  author_id: string;
  prime_indices: string;
  epoch: number;
  fingerprint: Uint8Array;
  signature: Uint8Array;
  metadata: string | null;
  created_at: string;
  username?: string;
}

export type RawCachedBeacon = Omit<CachedBeacon, 'fingerprint' | 'signature'> & {
  fingerprint: Uint8Array | string | null;
  signature: Uint8Array | string | null;
};

export interface BeaconCache {
  [beaconId: string]: CachedBeacon;
}

export interface CacheStats {
  totalBeacons: number;
  primeIndexSize: number;
  avgHealth: number;
  entropy: number;
  hitRate: number;
}