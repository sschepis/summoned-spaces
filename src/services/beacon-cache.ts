/* eslint-disable @typescript-eslint/no-explicit-any */
import webSocketService from './websocket';
import { ServerMessage } from '../../server/protocol';

// Safe imports with fallbacks
let resolangModule: any = null;

async function safeResolangCall(funcName: string, ...args: any[]) {
  try {
    if (!resolangModule) {
      resolangModule = await import('../../resolang/build/resolang.js');
    }
    return resolangModule[funcName](...args);
  } catch {
    // Proper fallback implementations
    const fallbacks: any = {
      generatePrimes: (n: number) => {
        // Sieve of Eratosthenes for proper prime generation
        const primes: number[] = [];
        const isPrime = new Array(n * 10).fill(true);
        isPrime[0] = isPrime[1] = false;
        
        for (let i = 2; i < isPrime.length && primes.length < n; i++) {
          if (isPrime[i]) {
            primes.push(i);
            for (let j = i * i; j < isPrime.length; j += i) {
              isPrime[j] = false;
            }
          }
        }
        
        return primes.slice(0, n);
      },
      primeOperator: () => {
        // Return a Map with basic prime operations
        const map = new Map();
        map.set('identity', 1);
        map.set('generator', 2);
        return map;
      },
      factorizationOperator: () => ({
        amplitudes: new Map([[2, 0.5], [3, 0.3], [5, 0.2]]),
        phase: 0,
        coherence: 0.8
      }),
      entropyRate: () => {
        // Generate pseudo-random entropy in [0, 1]
        const base = Math.random();
        const variation = Math.sin(Date.now() / 1000) * 0.1;
        return Math.max(0, Math.min(1, base + variation));
      },
      modExpOptimized: (base: bigint, exp: bigint, mod: bigint) => {
        // Fast modular exponentiation
        if (mod === BigInt(1)) return BigInt(0);
        let result = BigInt(1);
        base = base % mod;
        while (exp > 0) {
          if (exp % BigInt(2) === BigInt(1)) {
            result = (result * base) % mod;
          }
          exp = exp >> BigInt(1);
          base = (base * base) % mod;
        }
        return result;
      }
    };
    
    if (funcName in fallbacks) {
      console.warn(`Using fallback implementation for ${funcName}`);
      return fallbacks[funcName](...args);
    }
    
    throw new Error(`No fallback available for ${funcName}`);
  }
}

const toUint8Array = (value: any): Uint8Array => {
  if (!value) {
    return new Uint8Array();
  }

  // Handle Uint8Array directly
  if (value instanceof Uint8Array) {
    return value;
  }

  // Handle Buffer-like objects from server ({"type":"Buffer","data":[...]})
  if (typeof value === 'object' && value.type === 'Buffer' && Array.isArray(value.data)) {
    return new Uint8Array(value.data);
  }

  // Handle base64 strings
  if (typeof value === 'string') {
    if (value.length === 0) {
      return new Uint8Array();
    }

    try {
      if (typeof globalThis.atob === 'function') {
        const binary = globalThis.atob(value);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
      }

      const bufferCtor = (globalThis as typeof globalThis & { Buffer?: { from(input: string, encoding: 'base64'): Uint8Array } }).Buffer;
      if (bufferCtor) {
        const buffer = bufferCtor.from(value, 'base64');
        return buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
      }
    } catch (error) {
      console.error('Failed to decode base64 beacon field:', error);
    }
  }

  // Handle arrays directly
  if (Array.isArray(value)) {
    return new Uint8Array(value);
  }

  console.warn('Unknown format for binary data:', typeof value, value);
  return new Uint8Array();
};

interface CachedBeacon {
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

type RawCachedBeacon = Omit<CachedBeacon, 'fingerprint' | 'signature'> & {
  fingerprint: Uint8Array | string | null;
  signature: Uint8Array | string | null;
};

interface BeaconCache {
  [beaconId: string]: CachedBeacon;
}

/**
 * BeaconCacheManager - Client-side cache for holographic beacons
 * Reduces redundant requests to the server and provides fast local access
 */
class BeaconCacheManager {
  private cache: BeaconCache = {};
  private userBeacons: Map<string, Set<string>> = new Map(); // userId -> Set of beaconIds
  private pendingRequests: Map<string, Promise<CachedBeacon | null>> = new Map();
  private primeIndex: Map<number, string[]> = new Map(); // prime -> beaconIds with that prime
  private primeCache: number[] = [];
  private cacheHealth: Map<string, number> = new Map(); // beaconId -> health score
  private persistenceKey = 'summoned-spaces-beacon-cache';

  /**
   * Get a beacon by ID, using cache if available
   */
  constructor() {
    // Initialize with proper fallback primes using sieve
    this.primeCache = this.generateFallbackPrimes(10000);
    
    // Load persisted cache data
    this.loadFromStorage();
    
    // Try to load ResoLang primes asynchronously
    this.initializePrimes();
    
    // Start cache health monitoring
    this.startHealthMonitoring();
    
    // Auto-save cache periodically
    this.startAutoSave();
  }

  private generateFallbackPrimes(count: number): number[] {
    const primes: number[] = [];
    const isPrime = new Array(count * 15).fill(true); // Larger sieve for enough primes
    isPrime[0] = isPrime[1] = false;
    
    for (let i = 2; i < isPrime.length && primes.length < count; i++) {
      if (isPrime[i]) {
        primes.push(i);
        for (let j = i * i; j < isPrime.length; j += i) {
          isPrime[j] = false;
        }
      }
    }
    
    return primes.slice(0, count);
  }

  private normalizeBeacon(raw: RawCachedBeacon | null): CachedBeacon | null {
    if (!raw) {
      return null;
    }

    try {
      const fingerprint = toUint8Array(raw.fingerprint);
      const signature = toUint8Array(raw.signature);

      return {
        ...raw,
        fingerprint,
        signature
      };
    } catch (error) {
      console.error('Failed to normalize beacon:', error, raw);
      return null;
    }
  }

  private async initializePrimes() {
    try {
      this.primeCache = await safeResolangCall('generatePrimes', 10000);
    } catch {
      console.log('Using fallback primes in beacon cache');
    }
  }

  async getBeaconById(beaconId: string): Promise<CachedBeacon | null> {
    // Check cache first with prime-based optimization
    if (this.cache[beaconId]) {
      this.updateCacheHealth(beaconId, 1.0); // Cache hit
      console.log(`Beacon ${beaconId} found in cache`);
      return this.cache[beaconId];
    }

    // Try prime-based lookup for related beacons
    const relatedBeacons = this.findRelatedBeacons(beaconId);
    for (const relatedId of relatedBeacons) {
      if (this.cache[relatedId]) {
        console.log(`Found related beacon ${relatedId} for ${beaconId}`);
        // This could indicate a pattern or correlation
      }
    }

    // Check if there's already a pending request for this beacon
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
   * Find related beacons using prime factorization
   */
  private findRelatedBeacons(beaconId: string): string[] {
    try {
      // Hash the beacon ID to a number for prime analysis
      const hash = this.hashBeaconId(beaconId);
      const primeFactors = this.getPrimeFactors(hash);
      
      const relatedBeacons: string[] = [];
      
      // Find beacons that share prime factors
      for (const prime of primeFactors) {
        const beaconsWithPrime = this.primeIndex.get(prime) || [];
        relatedBeacons.push(...beaconsWithPrime);
      }
      
      return Array.from(new Set(relatedBeacons)).slice(0, 10); // Limit results
    } catch (error) {
      console.error('Error finding related beacons:', error);
      return [];
    }
  }

  /**
   * Optimize beacon storage using prime indexing
   */
  private optimizeBeaconStorage(beacon: CachedBeacon): void {
    try {
      // Extract prime indices from beacon if available
      let primeIndices: number[] = [];
      
      if (beacon.prime_indices) {
        try {
          primeIndices = JSON.parse(beacon.prime_indices);
        } catch (error) {
          console.error('Error parsing prime indices:', error);
        }
      }
      
      // If no prime indices, generate them from beacon data
      if (primeIndices.length === 0) {
        const hash = this.hashBeaconId(beacon.beacon_id);
        primeIndices = this.getPrimeFactors(hash);
      }
      
      // Index beacon by its prime factors
      for (const prime of primeIndices) {
        if (!this.primeIndex.has(prime)) {
          this.primeIndex.set(prime, []);
        }
        this.primeIndex.get(prime)!.push(beacon.beacon_id);
      }
      
      // Initialize health score
      this.cacheHealth.set(beacon.beacon_id, 1.0);
      
    } catch (error) {
      console.error('Error optimizing beacon storage:', error);
    }
  }

  /**
   * Hash beacon ID to number for prime analysis
   */
  private hashBeaconId(beaconId: string): number {
    let hash = 0;
    for (let i = 0; i < beaconId.length; i++) {
      hash = ((hash << 5) - hash + beaconId.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(hash);
  }

  /**
   * Get prime factors of a number
   */
  private getPrimeFactors(n: number): number[] {
    const factors: number[] = [];
    let num = n;
    
    for (const prime of this.primeCache) {
      if (prime * prime > num) break;
      
      while (num % prime === 0) {
        factors.push(prime);
        num /= prime;
      }
      
      if (factors.length >= 10) break; // Limit factor count
    }
    
    if (num > 1 && factors.length < 10) {
      factors.push(num);
    }
    
    return factors;
  }

  /**
   * Update cache health score
   */
  private updateCacheHealth(beaconId: string, delta: number): void {
    const currentHealth = this.cacheHealth.get(beaconId) || 0.5;
    const newHealth = Math.max(0, Math.min(1, currentHealth + delta * 0.1));
    this.cacheHealth.set(beaconId, newHealth);
  }

  /**
   * Start cache health monitoring and self-healing
   */
  private startHealthMonitoring(): void {
    setInterval(() => {
      this.performSelfHealing();
    }, 60000); // Every minute
  }

  /**
   * Perform self-healing on the cache
   */
  private performSelfHealing(): void {
    try {
      // Detect anomalies using entropy analysis
      const cacheEntropy = this.calculateCacheEntropy();
      
      if (cacheEntropy > 0.8) { // High entropy indicates chaos
        console.log('Cache entropy high, performing self-healing...');
        
        // Remove low-health beacons
        const lowHealthBeacons: string[] = [];
        for (const [beaconId, health] of this.cacheHealth) {
          if (health < 0.3) {
            lowHealthBeacons.push(beaconId);
          }
        }
        
        // Remove up to 10% of low-health beacons
        const maxRemove = Math.floor(Object.keys(this.cache).length * 0.1);
        const toRemove = lowHealthBeacons.slice(0, maxRemove);
        
        for (const beaconId of toRemove) {
          this.invalidateBeacon(beaconId);
        }
        
        console.log(`Self-healing removed ${toRemove.length} low-health beacons`);
      }
      
      // Decay health scores over time
      for (const [beaconId, health] of this.cacheHealth) {
        this.cacheHealth.set(beaconId, health * 0.99); // 1% decay
      }
      
    } catch (error) {
      console.error('Error in cache self-healing:', error);
    }
  }

  /**
   * Calculate cache entropy for health monitoring
   */
  private calculateCacheEntropy(): number {
    const cacheSize = Object.keys(this.cache).length;
    if (cacheSize === 0) return 0;
    
    // Calculate access pattern entropy
    const healthScores = Array.from(this.cacheHealth.values());
    if (healthScores.length === 0) return 0;
    
    let entropy = 0;
    for (const health of healthScores) {
      if (health > 0) {
        entropy -= health * Math.log(health);
      }
    }
    
    return entropy / Math.log(healthScores.length); // Normalize
  }

  /**
   * Get all beacons for a user, optionally filtered by type
   */
  async getBeaconsByUser(userId: string, beaconType?: string): Promise<CachedBeacon[]> {
    return new Promise((resolve, reject) => {
      const handleMessage = (message: ServerMessage) => {
        if (message.kind === 'beaconsResponse') {
          const rawBeacons = message.payload.beacons as RawCachedBeacon[];
          const normalized = rawBeacons
            .map(beacon => this.normalizeBeacon(beacon))
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

          // Save to storage if we got new beacons
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
   * Get all beacons of a specific type from all users
   */
  async getBeaconsByType(beaconType: string): Promise<CachedBeacon[]> {
    return new Promise((resolve, reject) => {
      const handleMessage = (message: ServerMessage) => {
        if (message.kind === 'beaconsResponse') {
          const rawBeacons = message.payload.beacons as RawCachedBeacon[];
          const normalized = rawBeacons
            .map(beacon => this.normalizeBeacon(beacon))
            .filter((beacon): beacon is CachedBeacon => Boolean(beacon));

          let hasNewBeacons = false;
          normalized.forEach(beacon => {
            if (!this.cache[beacon.beacon_id]) {
              hasNewBeacons = true;
            }
            this.cache[beacon.beacon_id] = beacon;

            if (!this.userBeacons.has(beacon.author_id)) {
              this.userBeacons.set(beacon.author_id, new Set());
            }
            this.userBeacons.get(beacon.author_id)!.add(beacon.beacon_id);
          });

          // Save to storage if we got new beacons
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
        payload: { userId: '*', beaconType } // Use wildcard to get all users' beacons of this type
      });
    });
  }

  /**
   * Get the most recent beacon of a specific type for a user
   */
  async getMostRecentBeacon(userId: string, beaconType: string): Promise<CachedBeacon | null> {
    const beacons = await this.getBeaconsByUser(userId, beaconType);
    if (beacons.length === 0) return null;
    
    // Beacons are returned sorted by created_at DESC, so first is most recent
    return beacons[0];
  }

  /**
   * Fetch a single beacon by ID from the server
   */
  private fetchBeaconById(beaconId: string): Promise<CachedBeacon | null> {
    return new Promise((resolve, reject) => {
      const handleMessage = (message: ServerMessage) => {
        if (message.kind === 'beaconResponse') {
          const beacon = this.normalizeBeacon(message.payload.beacon as RawCachedBeacon | null);

          if (beacon) {
            this.cache[beacon.beacon_id] = beacon;

            if (!this.userBeacons.has(beacon.author_id)) {
              this.userBeacons.set(beacon.author_id, new Set());
            }
            this.userBeacons.get(beacon.author_id)!.add(beacon.beacon_id);
            
            // Save to storage since we got a new beacon
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
   * Invalidate cache for a specific beacon
   */
  invalidateBeacon(beaconId: string): void {
    delete this.cache[beaconId];
    this.cacheHealth.delete(beaconId);
    
    // Remove from prime index
    for (const [prime, beaconIds] of this.primeIndex) {
      const index = beaconIds.indexOf(beaconId);
      if (index > -1) {
        beaconIds.splice(index, 1);
        if (beaconIds.length === 0) {
          this.primeIndex.delete(prime);
        }
      }
    }
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
    this.primeIndex.clear();
    this.cacheHealth.clear();
    
    // Clear storage as well
    localStorage.removeItem(this.persistenceKey);
    console.log('[BeaconCache] Cache and storage cleared');
  }

  /**
   * Get cache statistics including quantum health metrics
   */
  getCacheStats(): {
    totalBeacons: number;
    primeIndexSize: number;
    avgHealth: number;
    entropy: number;
    hitRate: number;
  } {
    const totalBeacons = Object.keys(this.cache).length;
    const primeIndexSize = this.primeIndex.size;
    
    const healthScores = Array.from(this.cacheHealth.values());
    const avgHealth = healthScores.length > 0 ?
      healthScores.reduce((sum, h) => sum + h, 0) / healthScores.length : 0;
    
    const entropy = this.calculateCacheEntropy();
    
    // Calculate hit rate (simplified)
    const hitRate = avgHealth; // Approximation
    
    return {
      totalBeacons,
      primeIndexSize,
      avgHealth,
      entropy,
      hitRate
    };
  }

  /**
   * Pre-load beacons into cache (useful after login)
   */
  async preloadUserBeacons(userId: string): Promise<void> {
    try {
      await this.getBeaconsByUser(userId);
      console.log(`Pre-loaded beacons for user ${userId}`);
    } catch (error) {
      console.error(`Failed to pre-load beacons for user ${userId}:`, error);
    }
  }

  /**
   * Load cache data from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.persistenceKey);
      if (stored) {
        const data = JSON.parse(stored);
        
        // Restore beacon cache
        if (data.cache) {
          for (const [beaconId, rawBeacon] of Object.entries(data.cache)) {
            const beacon = this.normalizeBeacon(rawBeacon as RawCachedBeacon);
            if (beacon) {
              this.cache[beaconId] = beacon;
            }
          }
        }
        
        // Restore user beacons mapping
        if (data.userBeacons) {
          for (const [userId, beaconIds] of Object.entries(data.userBeacons)) {
            this.userBeacons.set(userId, new Set(beaconIds as string[]));
          }
        }
        
        // Restore cache health
        if (data.cacheHealth) {
          for (const [beaconId, health] of Object.entries(data.cacheHealth)) {
            this.cacheHealth.set(beaconId, health as number);
          }
        }
        
        console.log(`[BeaconCache] Loaded ${Object.keys(this.cache).length} beacons from storage`);
      }
    } catch (error) {
      console.error('[BeaconCache] Failed to load from storage:', error);
      // Clear corrupted storage
      localStorage.removeItem(this.persistenceKey);
    }
  }

  /**
   * Save cache data to localStorage
   */
  private saveToStorage(): void {
    try {
      // Convert Maps to objects for JSON serialization
      const userBeaconsObj: Record<string, string[]> = {};
      for (const [userId, beaconIds] of this.userBeacons) {
        userBeaconsObj[userId] = Array.from(beaconIds);
      }
      
      const cacheHealthObj: Record<string, number> = {};
      for (const [beaconId, health] of this.cacheHealth) {
        cacheHealthObj[beaconId] = health;
      }
      
      // Prepare data for storage (convert Uint8Arrays to base64 and preserve all fields)
      const cacheForStorage: Record<string, any> = {};
      for (const [beaconId, beacon] of Object.entries(this.cache)) {
        const beaconForStorage: any = {
          ...beacon,
          fingerprint: this.uint8ArrayToBase64(beacon.fingerprint),
          signature: this.uint8ArrayToBase64(beacon.signature)
        };
        
        // CRITICAL FIX: Preserve metadata field which may contain originalText
        if (beacon.metadata) {
          try {
            // If metadata is a string that looks like JSON, preserve it as-is
            if (typeof beacon.metadata === 'string') {
              beaconForStorage.metadata = beacon.metadata;
              
              // Try to extract originalText from metadata if available
              const parsed = JSON.parse(beacon.metadata);
              if (parsed && typeof parsed.originalText === 'string') {
                beaconForStorage.originalText = parsed.originalText;
              }
            }
          } catch {
            // If metadata isn't valid JSON, preserve as-is
            beaconForStorage.metadata = beacon.metadata;
          }
        }
        
        // Preserve any other decoding-critical fields
        const criticalFields = ['originalText', 'content', 'data', 'coeffs', 'center', 'entropy'];
        for (const field of criticalFields) {
          if ((beacon as any)[field] !== undefined) {
            beaconForStorage[field] = (beacon as any)[field];
          }
        }
        
        cacheForStorage[beaconId] = beaconForStorage;
      }
      
      const data = {
        cache: cacheForStorage,
        userBeacons: userBeaconsObj,
        cacheHealth: cacheHealthObj,
        timestamp: Date.now()
      };
      
      localStorage.setItem(this.persistenceKey, JSON.stringify(data));
      console.log(`[BeaconCache] Saved ${Object.keys(this.cache).length} beacons to storage with metadata preservation`);
    } catch (error) {
      console.error('[BeaconCache] Failed to save to storage:', error);
    }
  }

  /**
   * Convert Uint8Array to base64 string for storage
   */
  private uint8ArrayToBase64(uint8Array: Uint8Array): string {
    if (typeof btoa === 'function') {
      return btoa(String.fromCharCode(...uint8Array));
    }
    // Fallback for environments without btoa
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i = 0;
    while (i < uint8Array.length) {
      const a = uint8Array[i++];
      const b = i < uint8Array.length ? uint8Array[i++] : 0;
      const c = i < uint8Array.length ? uint8Array[i++] : 0;
      const bitmap = (a << 16) | (b << 8) | c;
      result += chars.charAt((bitmap >> 18) & 63) +
                chars.charAt((bitmap >> 12) & 63) +
                (i - 2 < uint8Array.length ? chars.charAt((bitmap >> 6) & 63) : '=') +
                (i - 1 < uint8Array.length ? chars.charAt(bitmap & 63) : '=');
    }
    return result;
  }

  /**
   * Start auto-save timer to persist cache periodically
   */
  private startAutoSave(): void {
    // Save every 30 seconds
    setInterval(() => {
      this.saveToStorage();
    }, 30000);
    
    // Also save on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.saveToStorage();
      });
      
      // Save on visibility change (when user switches tabs)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.saveToStorage();
        }
      });
    }
  }
}

export const beaconCacheManager = new BeaconCacheManager();
export type { CachedBeacon };
