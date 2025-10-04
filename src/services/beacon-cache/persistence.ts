/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Beacon Cache Persistence
 * Handles localStorage operations for cache persistence
 */

import { toUint8Array, uint8ArrayToBase64 } from '../utils/uint8-converter';
import type { CachedBeacon, RawCachedBeacon, BeaconCache } from './types';

export class CachePersistence {
  private persistenceKey = 'summoned-spaces-beacon-cache';

  /**
   * Normalize beacon from storage format
   */
  normalizeBeacon(raw: RawCachedBeacon | null): CachedBeacon | null {
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

  /**
   * Load cache data from localStorage
   */
  loadFromStorage(): {
    cache: BeaconCache;
    userBeacons: Map<string, Set<string>>;
    cacheHealth: Record<string, number>;
  } {
    const cache: BeaconCache = {};
    const userBeacons = new Map<string, Set<string>>();
    let cacheHealth: Record<string, number> = {};

    try {
      const stored = localStorage.getItem(this.persistenceKey);
      if (stored) {
        const data = JSON.parse(stored);
        
        // Restore beacon cache
        if (data.cache) {
          for (const [beaconId, rawBeacon] of Object.entries(data.cache)) {
            const beacon = this.normalizeBeacon(rawBeacon as RawCachedBeacon);
            if (beacon) {
              cache[beaconId] = beacon;
            }
          }
        }
        
        // Restore user beacons mapping
        if (data.userBeacons) {
          for (const [userId, beaconIds] of Object.entries(data.userBeacons)) {
            userBeacons.set(userId, new Set(beaconIds as string[]));
          }
        }
        
        // Restore cache health
        if (data.cacheHealth) {
          cacheHealth = data.cacheHealth;
        }
        
        console.log(`[BeaconCache] Loaded ${Object.keys(cache).length} beacons from storage`);
      }
    } catch (error) {
      console.error('[BeaconCache] Failed to load from storage:', error);
      // Clear corrupted storage
      localStorage.removeItem(this.persistenceKey);
    }

    return { cache, userBeacons, cacheHealth };
  }

  /**
   * Save cache data to localStorage
   */
  saveToStorage(
    cache: BeaconCache,
    userBeacons: Map<string, Set<string>>,
    cacheHealth: Record<string, number>
  ): void {
    try {
      // Convert Maps to objects for JSON serialization
      const userBeaconsObj: Record<string, string[]> = {};
      for (const [userId, beaconIds] of userBeacons) {
        userBeaconsObj[userId] = Array.from(beaconIds);
      }
      
      // Prepare data for storage (convert Uint8Arrays to base64 and preserve all fields)
      const cacheForStorage: Record<string, any> = {};
      for (const [beaconId, beacon] of Object.entries(cache)) {
        const beaconForStorage: any = {
          ...beacon,
          fingerprint: uint8ArrayToBase64(beacon.fingerprint),
          signature: uint8ArrayToBase64(beacon.signature)
        };
        
        // CRITICAL: Preserve metadata field which may contain originalText
        if (beacon.metadata) {
          try {
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
        cacheHealth,
        timestamp: Date.now()
      };
      
      localStorage.setItem(this.persistenceKey, JSON.stringify(data));
      console.log(`[BeaconCache] Saved ${Object.keys(cache).length} beacons to storage with metadata preservation`);
    } catch (error) {
      console.error('[BeaconCache] Failed to save to storage:', error);
    }
  }

  /**
   * Clear persisted cache data
   */
  clearStorage(): void {
    localStorage.removeItem(this.persistenceKey);
    console.log('[BeaconCache] Storage cleared');
  }

  /**
   * Start auto-save with given save function
   */
  startAutoSave(saveFunction: () => void): void {
    // Save every 30 seconds
    setInterval(() => {
      saveFunction();
    }, 30000);
    
    // Also save on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        saveFunction();
      });
      
      // Save on visibility change (when user switches tabs)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          saveFunction();
        }
      });
    }
  }
}