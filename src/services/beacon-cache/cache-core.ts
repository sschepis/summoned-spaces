/**
 * Core Beacon Cache Operations
 * Main cache logic coordinating all cache components
 */

import webSocketService from '../websocket';
import { ServerMessage } from '../../../server/protocol';
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
   * Get beacon by ID with caching
   */
  async getBeaconById(beaconId: string): Promise<CachedBeacon | null> {
    // Check cache first with prime-based optimization
    if (this.cache[beaconId]) {
      this.healthMonitor.updateHealth(beaconId, 1.0); // Cache hit
      console.log(`Beacon ${beaconId} found in cache`);
      return this.cache[beaconId];
    }

    // Try prime-based lookup for related beacons
    const relatedBeacons = this.primeIndexer.findRelatedBeacons(beaconId);
    for (const relatedId of relatedBeacons) {
      if (this.cache[relatedId]) {
        console.log(`Found related beacon ${relatedId} for ${beaconId}`);
      }
    }

    // Check if there's already a pending request
    if (this.pendingRequests.has(beaconId)) {
      console.log(`Waiting for pending request for beacon ${beaconId}`);
      return this.pendingRequests.get(beaconId)!;
    }

    // Create new request
    const promise = this.fetchBeaconById(beaconId);
    this.pendingRequests.set(beaconId, promise);

    try {
      const beacon = await promise;
      if (beacon) {
        this.optimizeBeaconStorage(beacon);
      }
      return beacon;
    } finally {
      this.pendingRequests.delete(beaconId);
    }
  }

  /**
   * Get all beacons for a user
   */
  async getBeaconsByUser(userId: string, beaconType?: string): Promise<CachedBeacon[]> {
    return new Promise((resolve, reject) => {
      const handleMessage = (message: ServerMessage) => {
        if (message.kind === 'beaconsResponse') {
          const rawBeacons = message.payload.beacons as RawCachedBeacon[];
          const normalized = rawBeacons
            .map(beacon => this.persistence.normalizeBeacon(beacon))
            .filter((beacon): beacon is CachedBeacon => Boolean(beacon));

          let hasNewBeacons = false;
          normalized.forEach(beacon => {
            if (!this.cache[beacon.beacon_id]) {
              hasNewBeacons = true;
            }
            this.cache[beacon.beacon_id] = beacon;

            if (!this.userBeacons.has(userId)) {
              this.userBeacons.set(userId, new Set());
            }
            this.userBeacons.get(userId)!.add(beacon.beacon_id);
          });

          if (hasNewBeacons) {
            this.saveToStorage();
          }

          webSocketService.removeMessageListener(handleMessage);
          resolve(normalized);
        } else if (message.kind === 'error') {
          webSocketService.removeMessageListener(handleMessage);
          reject(new Error(message.payload.message));
        }
      };

      webSocketService.addMessageListener(handleMessage);
      webSocketService.sendMessage({
        kind: 'getBeaconsByUser',
        payload: { userId, beaconType }
      });
    });
  }

  /**
   * Get all beacons of a specific type
   */
  async getBeaconsByType(beaconType: string): Promise<CachedBeacon[]> {
    return this.getBeaconsByUser('*', beaconType);
  }

  /**
   * Get most recent beacon
   */
  async getMostRecentBeacon(userId: string, beaconType: string): Promise<CachedBeacon | null> {
    const beacons = await this.getBeaconsByUser(userId, beaconType);
    return beacons.length > 0 ? beacons[0] : null;
  }

  /**
   * Fetch single beacon from server
   */
  private fetchBeaconById(beaconId: string): Promise<CachedBeacon | null> {
    return new Promise((resolve, reject) => {
      const handleMessage = (message: ServerMessage) => {
        if (message.kind === 'beaconResponse') {
          const beacon = this.persistence.normalizeBeacon(message.payload.beacon as RawCachedBeacon | null);

          if (beacon) {
            this.cache[beacon.beacon_id] = beacon;

            if (!this.userBeacons.has(beacon.author_id)) {
              this.userBeacons.set(beacon.author_id, new Set());
            }
            this.userBeacons.get(beacon.author_id)!.add(beacon.beacon_id);
            
            this.saveToStorage();
          }

          webSocketService.removeMessageListener(handleMessage);
          resolve(beacon);
        } else if (message.kind === 'error') {
          webSocketService.removeMessageListener(handleMessage);
          reject(new Error(message.payload.message));
        }
      };

      webSocketService.addMessageListener(handleMessage);
      webSocketService.sendMessage({
        kind: 'getBeaconById',
        payload: { beaconId }
      });
    });
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