/**
 * Prime-Based Beacon Indexing
 * Uses prime factorization for related beacon discovery
 */

import { generatePrimesSync, getPrimeFactors, hashToNumber } from '../utils/prime-utils';
import type { CachedBeacon } from './types';

export class PrimeIndexer {
  private primeIndex: Map<number, string[]> = new Map(); // prime -> beaconIds with that prime
  private primeCache: number[] = [];

  constructor() {
    // Initialize with fallback primes
    this.primeCache = generatePrimesSync(10000);
  }

  /**
   * Update prime cache with async ResoLang primes if available
   */
  async initializePrimes(primes: number[]): Promise<void> {
    if (primes && primes.length > 0) {
      this.primeCache = primes;
    }
  }

  /**
   * Index beacon by its prime factors
   */
  optimizeBeaconStorage(beacon: CachedBeacon): void {
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
        const hash = hashToNumber(beacon.beacon_id);
        primeIndices = getPrimeFactors(hash, this.primeCache);
      }
      
      // Index beacon by its prime factors
      for (const prime of primeIndices) {
        if (!this.primeIndex.has(prime)) {
          this.primeIndex.set(prime, []);
        }
        this.primeIndex.get(prime)!.push(beacon.beacon_id);
      }
    } catch (error) {
      console.error('Error optimizing beacon storage:', error);
    }
  }

  /**
   * Find related beacons using prime factorization
   */
  findRelatedBeacons(beaconId: string): string[] {
    try {
      const hash = hashToNumber(beaconId);
      const primeFactors = getPrimeFactors(hash, this.primeCache);
      
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
   * Remove beacon from prime index
   */
  removeFromIndex(beaconId: string): void {
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
   * Clear all prime indices
   */
  clear(): void {
    this.primeIndex.clear();
  }

  /**
   * Get index size for stats
   */
  getIndexSize(): number {
    return this.primeIndex.size;
  }
}