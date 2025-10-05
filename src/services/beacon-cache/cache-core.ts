/**
 * Core Beacon Cache Operations
 * Main cache logic coordinating all cache components
 * NOTE: This cache is now populated via SSE events, not active fetching
 */

import { generatePrimes } from '../utils/prime-utils';
import { PrimeIndexer } from './prime-indexing';
import { HealthMonitor } from './health-monitoring';
import { CachePersistence } from './persistence';
import type { CachedBeacon, RawCachedBeacon, BeaconCache, CacheStats } from './types';

export class BeaconCacheCore {
  private cache: BeaconCache = {};
  private userBeacons: Map<string, Set<string>> = new Map();
  private pendingRequests: Map<string, Promise<CachedBeacon | null>> = new Map();
  
  private primeIndexer: PrimeIndexer;
  private healthMonitor: HealthMonitor;
  private persistence: CachePersistence;

  constructor() {
    this.primeIndexer = new PrimeIndexer();
    this.healthMonitor = new HealthMonitor();
    this.persistence = new CachePersistence();
    
    // Load persisted cache data
    this.loadFromStorage();
    
    // Try to load ResoLang primes asynchronously
    this.initializePrimes();
    
    // Start cache health monitoring
    this.startHealthMonitoring();
    
    // Auto-save cache periodically
    this.persistence.startAutoSave(() => this.saveToStorage());
  }

  /**
   * Initialize primes with ResoLang if available
   */
  private async initializePrimes(): Promise<void> {
    try {
      const primes = await generatePrimes(10000);
      await this.primeIndexer.initializePrimes(primes);
    } catch {
      console.log('Using fallback primes in beacon cache');
    }
  }

  /**
   * Get beacon by ID from cache only (no fetching)
   * Beacons are populated via SSE events
   */
  async getBeaconById(beaconId: string): Promise<CachedBeacon | null> {
    // Check cache only - no active fetching with SSE
    if (this.cache[beaconId]) {
      this.healthMonitor.updateHealth(beaconId, 1.0); // Cache hit
      console.log(`[BeaconCache] Beacon ${beaconId} found in cache`);
      return this.cache[beaconId];
    }

    // Try prime-based lookup for related beacons
    const relatedBeacons = this.primeIndexer.findRelatedBeacons(beaconId);
    for (const relatedId of relatedBeacons) {
      if (this.cache[relatedId]) {
        console.log(`[BeaconCache] Found related beacon ${relatedId} for ${beaconId}`);
        return this.cache[relatedId];
      }
    }

    console.log(`[BeaconCache] Beacon ${beaconId} not in cache (will be loaded via SSE)`);
    return null;
  }

  /**
   * Get all beacons for a user from cache only (no fetching)
   * Beacons are populated via SSE events
   */
  async getBeaconsByUser(userId: string, beaconType?: string): Promise<CachedBeacon[]> {
    const userBeaconIds = this.userBeacons.get(userId);
    if (!userBeaconIds) {
      console.log(`[BeaconCache] No beacons cached for user ${userId}`);
      return [];
    }

    const beacons = Array.from(userBeaconIds)
      .map(id => this.cache[id])
      .filter((beacon): beacon is CachedBeacon => Boolean(beacon));

    if (beaconType) {
      return beacons.filter(beacon => beacon.beacon_type === beaconType);
    }

    return beacons;
  }

  /**
   * Get all beacons of a specific type from cache only (no fetching)
   */
  async getBeaconsByType(beaconType: string): Promise<CachedBeacon[]> {
    return Object.values(this.cache).filter(
      beacon => beacon.beacon_type === beaconType
    );
  }

  /**
   * Get most recent beacon from cache only (no fetching)
   */
  async getMostRecentBeacon(userId: string, beaconType: string): Promise<CachedBeacon | null> {
    const beacons = await this.getBeaconsByUser(userId, beaconType);
    if (beacons.length === 0) {
      return null;
    }
    
    // Sort by created_at descending and return the first one
    return beacons.sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return timeB - timeA;
    })[0];
  }

  /**
   * Add beacon to cache (called when beacon arrives via SSE)
   */
  addBeacon(beacon: CachedBeacon | RawCachedBeacon): void {
    const normalized = this.persistence.normalizeBeacon(beacon as RawCachedBeacon);
    if (!normalized) return;

    this.cache[normalized.beacon_id] = normalized;

    if (!this.userBeacons.has(normalized.author_id)) {
      this.userBeacons.set(normalized.author_id, new Set());
    }
    this.userBeacons.get(normalized.author_id)!.add(normalized.beacon_id);
    
    this.optimizeBeaconStorage(normalized);
    this.saveToStorage();
    
    console.log(`[BeaconCache] Added beacon ${normalized.beacon_id} to cache`);
  }

  /**
   * Optimize beacon storage using prime indexing
   */
  private optimizeBeaconStorage(beacon: CachedBeacon): void {
    this.primeIndexer.optimizeBeaconStorage(beacon);
    this.healthMonitor.initializeHealth(beacon.beacon_id);
  }

  /**
   * Invalidate specific beacon
   */
  invalidateBeacon(beaconId: string): void {
    delete this.cache[beaconId];
    this.healthMonitor.removeHealth(beaconId);
    this.primeIndexer.removeFromIndex(beaconId);
  }

  /**
   * Invalidate all beacons for a user
   */
  invalidateUserBeacons(userId: string): void {
    const beaconIds = this.userBeacons.get(userId);
    if (beaconIds) {
      beaconIds.forEach(beaconId => {
        delete this.cache[beaconId];
      });
      this.userBeacons.delete(userId);
    }
  }

  /**
   * Clear entire cache
   */
  clearCache(): void {
    this.cache = {};
    this.userBeacons.clear();
    this.primeIndexer.clear();
    this.healthMonitor.clear();
    this.persistence.clearStorage();
    console.log('[BeaconCache] Cache and storage cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStats {
    return {
      totalBeacons: Object.keys(this.cache).length,
      primeIndexSize: this.primeIndexer.getIndexSize(),
      avgHealth: this.healthMonitor.getAverageHealth(),
      entropy: this.healthMonitor.calculateCacheEntropy(Object.keys(this.cache).length),
      hitRate: this.healthMonitor.getAverageHealth()
    };
  }

  /**
   * Pre-load user beacons
   * NOTE: This is deprecated with the move to SSE. The beacon cache is now populated
   * via SSE events rather than WebSocket requests. Keeping this as a no-op for
   * backward compatibility.
   */
  async preloadUserBeacons(userId: string): Promise<void> {
    console.log(`[BeaconCache] Skipping preload for user ${userId} (SSE handles beacon loading)`);
    // No-op: SSE will populate the cache via real-time events
    return Promise.resolve();
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    setInterval(() => {
      this.performSelfHealing();
    }, 60000); // Every minute
  }

  /**
   * Perform self-healing
   */
  private performSelfHealing(): void {
    try {
      const cacheEntropy = this.healthMonitor.calculateCacheEntropy(Object.keys(this.cache).length);
      
      if (cacheEntropy > 0.8) {
        console.log('Cache entropy high, performing self-healing...');
        
        const lowHealthBeacons = this.healthMonitor.getLowHealthBeacons(0.3);
        const maxRemove = Math.floor(Object.keys(this.cache).length * 0.1);
        const toRemove = lowHealthBeacons.slice(0, maxRemove);
        
        for (const beaconId of toRemove) {
          this.invalidateBeacon(beaconId);
        }
        
        console.log(`Self-healing removed ${toRemove.length} low-health beacons`);
      }
      
      this.healthMonitor.decayHealthScores(0.99);
    } catch (error) {
      console.error('Error in cache self-healing:', error);
    }
  }

  /**
   * Load from storage
   */
  private loadFromStorage(): void {
    const { cache, userBeacons, cacheHealth } = this.persistence.loadFromStorage();
    this.cache = cache;
    this.userBeacons = userBeacons;
    this.healthMonitor.importHealthData(cacheHealth);
  }

  /**
   * Save to storage
   */
  private saveToStorage(): void {
    const healthData = this.healthMonitor.exportHealthData();
    this.persistence.saveToStorage(this.cache, this.userBeacons, healthData);
  }
}