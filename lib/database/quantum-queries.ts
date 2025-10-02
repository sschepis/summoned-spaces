/**
 * Quantum Resonance Query Operations
 * Advanced quantum calculations and clustering algorithms
 */

import { DatabaseAdapter } from './abstract-adapter.js';
import { 
  Beacon, QuantumPrimeIndices, QuantumResonanceQuery, 
  BeaconCluster, QuantumResonanceError 
} from './types.js';

export class QuantumQueryEngine {
  constructor(private db: DatabaseAdapter) {}
  
  // ============================================
  // Resonance Calculation Methods
  // ============================================
  
  async calculateResonanceStrength(
    primeA: QuantumPrimeIndices,
    primeB: QuantumPrimeIndices
  ): Promise<number> {
    try {
      // Advanced quantum resonance algorithm
      const baseResonance = (primeA.base_resonance + primeB.base_resonance) / 2;
      const amplificationSync = Math.abs(primeA.amplification_factor - primeB.amplification_factor);
      const phaseAlignment = 1 - Math.abs(primeA.phase_alignment - primeB.phase_alignment);
      const entropyBalance = 1 - Math.abs(primeA.entropy_level - primeB.entropy_level);
      
      // Prime sequence correlation
      const primeCorrelation = this.calculatePrimeSequenceCorrelation(
        primeA.prime_sequence,
        primeB.prime_sequence
      );
      
      // Combined resonance strength
      const resonanceStrength = (
        baseResonance * 0.3 +
        (1 - amplificationSync) * 0.2 +
        phaseAlignment * 0.2 +
        entropyBalance * 0.15 +
        primeCorrelation * 0.15
      );
      
      return Math.max(0, Math.min(1, resonanceStrength));
      
    } catch (error) {
      throw new QuantumResonanceError(
        `Failed to calculate resonance strength: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { primeA, primeB }
      );
    }
  }
  
  private calculatePrimeSequenceCorrelation(
    sequenceA: number[],
    sequenceB: number[]
  ): number {
    if (!sequenceA.length || !sequenceB.length) return 0;
    
    // Find common prime factors
    const setA = new Set(sequenceA);
    const setB = new Set(sequenceB);
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);
    
    // Jaccard similarity coefficient
    return intersection.size / union.size;
  }
  
  // ============================================
  // Advanced Query Methods
  // ============================================
  
  async findResonantBeacons(query: QuantumResonanceQuery): Promise<Beacon[]> {
    // Get user's prime resonance identity
    const targetUser = await this.db.getUserById(query.target_user_id);
    if (!targetUser) {
      throw new QuantumResonanceError(`User not found: ${query.target_user_id}`);
    }
    
    // Query all relevant beacons
    const beacons = await this.db.queryBeacons({
      limit: query.max_results * 3, // Over-fetch for filtering
      order_by: 'created_at',
      order_direction: 'desc'
    });
    
    // Calculate resonance for each beacon
    const resonantBeacons: Array<Beacon & { resonance_score: number }> = [];
    
    for (const beacon of beacons) {
      if (beacon.author_id === query.target_user_id) continue; // Skip own beacons
      
      const resonanceScore = await this.calculateResonanceStrength(
        beacon.prime_indices,
        query.reference_prime_indices
      );
      
      if (resonanceScore >= query.resonance_threshold) {
        resonantBeacons.push({
          ...beacon,
          resonance_score: resonanceScore
        });
      }
    }
    
    // Sort by resonance strength and limit results
    return resonantBeacons
      .sort((a, b) => b.resonance_score - a.resonance_score)
      .slice(0, query.max_results)
      .map(({ resonance_score, ...beacon }) => {
        // Remove resonance_score from the result
        void resonance_score;
        return beacon;
      });
  }
  
  async findQuantumClusters(
    spaceId: string,
    clusterThreshold: number = 0.7
  ): Promise<BeaconCluster[]> {
    // Get all beacons in the space
    const spaceBeacons = await this.db.queryBeacons({
      space_id: spaceId,
      limit: 1000 // Reasonable limit for clustering
    });
    
    if (spaceBeacons.length < 2) return [];
    
    // Calculate resonance matrix
    const resonanceMatrix = new Map<string, Map<string, number>>();
    
    for (let i = 0; i < spaceBeacons.length; i++) {
      const beaconA = spaceBeacons[i];
      resonanceMatrix.set(beaconA.beacon_id, new Map());
      
      for (let j = i + 1; j < spaceBeacons.length; j++) {
        const beaconB = spaceBeacons[j];
        
        const resonance = await this.calculateResonanceStrength(
          beaconA.prime_indices,
          beaconB.prime_indices
        );
        
        resonanceMatrix.get(beaconA.beacon_id)!.set(beaconB.beacon_id, resonance);
        
        if (!resonanceMatrix.has(beaconB.beacon_id)) {
          resonanceMatrix.set(beaconB.beacon_id, new Map());
        }
        resonanceMatrix.get(beaconB.beacon_id)!.set(beaconA.beacon_id, resonance);
      }
    }
    
    // Perform clustering using resonance threshold
    return this.performQuantumClustering(spaceBeacons, resonanceMatrix, clusterThreshold);
  }
  
  private performQuantumClustering(
    beacons: Beacon[],
    resonanceMatrix: Map<string, Map<string, number>>,
    threshold: number
  ): BeaconCluster[] {
    const visited = new Set<string>();
    const clusters: BeaconCluster[] = [];
    
    for (const beacon of beacons) {
      if (visited.has(beacon.beacon_id)) continue;
      
      // Find all beacons resonant with this one
      const cluster = this.findClusterMembers(
        beacon,
        beacons,
        resonanceMatrix,
        threshold,
        visited
      );
      
      if (cluster.length > 1) { // Only include multi-beacon clusters
        clusters.push({
          cluster_id: `cluster_${clusters.length + 1}`,
          beacons: cluster,
          centroid_resonance: this.calculateClusterCentroid(cluster),
          cluster_strength: this.calculateClusterStrength(cluster, resonanceMatrix),
          member_count: cluster.length
        });
      }
    }
    
    return clusters.sort((a, b) => b.cluster_strength - a.cluster_strength);
  }
  
  private findClusterMembers(
    seedBeacon: Beacon,
    allBeacons: Beacon[],
    resonanceMatrix: Map<string, Map<string, number>>,
    threshold: number,
    visited: Set<string>
  ): Beacon[] {
    const cluster = [seedBeacon];
    const queue = [seedBeacon];
    visited.add(seedBeacon.beacon_id);
    
    while (queue.length > 0) {
      const currentBeacon = queue.shift()!;
      const currentResonances = resonanceMatrix.get(currentBeacon.beacon_id);
      
      if (!currentResonances) continue;
      
      for (const [beaconId, resonance] of currentResonances) {
        if (visited.has(beaconId) || resonance < threshold) continue;
        
        const resonantBeacon = allBeacons.find(b => b.beacon_id === beaconId);
        if (resonantBeacon) {
          cluster.push(resonantBeacon);
          queue.push(resonantBeacon);
          visited.add(beaconId);
        }
      }
    }
    
    return cluster;
  }
  
  private calculateClusterCentroid(cluster: Beacon[]): QuantumPrimeIndices {
    const count = cluster.length;
    
    return {
      base_resonance: cluster.reduce((sum, b) => sum + b.prime_indices.base_resonance, 0) / count,
      amplification_factor: cluster.reduce((sum, b) => sum + b.prime_indices.amplification_factor, 0) / count,
      phase_alignment: cluster.reduce((sum, b) => sum + b.prime_indices.phase_alignment, 0) / count,
      entropy_level: cluster.reduce((sum, b) => sum + b.prime_indices.entropy_level, 0) / count,
      prime_sequence: [], // Centroid doesn't have a meaningful prime sequence
      resonance_signature: `cluster_centroid_${Date.now()}`
    };
  }
  
  private calculateClusterStrength(
    cluster: Beacon[],
    resonanceMatrix: Map<string, Map<string, number>>
  ): number {
    if (cluster.length < 2) return 0;
    
    let totalResonance = 0;
    let pairCount = 0;
    
    for (let i = 0; i < cluster.length; i++) {
      const beaconA = cluster[i];
      const resonances = resonanceMatrix.get(beaconA.beacon_id);
      
      if (!resonances) continue;
      
      for (let j = i + 1; j < cluster.length; j++) {
        const beaconB = cluster[j];
        const resonance = resonances.get(beaconB.beacon_id);
        
        if (resonance !== undefined) {
          totalResonance += resonance;
          pairCount++;
        }
      }
    }
    
    return pairCount > 0 ? totalResonance / pairCount : 0;
  }
  
  // ============================================
  // Performance Optimization Methods
  // ============================================
  
  async buildResonanceCache(userId: string): Promise<void> {
    const user = await this.db.getUserById(userId);
    if (!user) return;
    
    const recentBeacons = await this.db.queryBeacons({
      limit: 100,
      order_by: 'created_at',
      order_direction: 'desc'
    });
    
    const resonanceCache: Record<string, number> = {};
    
    for (const beacon of recentBeacons) {
      if (beacon.author_id === userId) continue;
      
      const resonance = await this.calculateResonanceStrength(
        user.pri_public_resonance,
        beacon.prime_indices
      );
      
      resonanceCache[beacon.beacon_id] = resonance;
    }
    
    await this.db.updateResonanceCache(userId, resonanceCache);
  }
  
  async getQuantumSuggestions(
    userId: string,
    suggestionType: 'beacons' | 'users' | 'spaces' = 'beacons',
    limit: number = 10
  ): Promise<Beacon[] | string[]> {
    const user = await this.db.getUserById(userId);
    if (!user) return [];
    
    switch (suggestionType) {
      case 'beacons':
        return this.findResonantBeacons({
          target_user_id: userId,
          reference_prime_indices: user.pri_public_resonance,
          resonance_threshold: 0.6,
          max_results: limit
        });
        
      case 'users': {
        // Find users with similar resonance patterns
        const allUsers = await this.db.listUsers(limit * 5);
        const resonantUsers: Array<{ user: string; score: number }> = [];
        
        for (const otherUser of allUsers) {
          if (otherUser.user_id === userId) continue;
          
          const resonance = await this.calculateResonanceStrength(
            user.pri_public_resonance,
            otherUser.pri_public_resonance
          );
          
          if (resonance > 0.5) {
            resonantUsers.push({ user: otherUser.user_id, score: resonance });
          }
        }
        
        return resonantUsers
          .sort((a, b) => b.score - a.score)
          .slice(0, limit)
          .map(r => r.user);
      }
        
      case 'spaces': {
        // Find spaces with high resonance activity
        const publicSpaces = await this.db.getPublicSpaces(limit * 3);
        const spaceScores: Array<{ space: string; score: number }> = [];
        
        for (const space of publicSpaces) {
          const spaceBeacons = await this.db.queryBeacons({
            space_id: space.space_id,
            limit: 20
          });
          
          let totalResonance = 0;
          let beaconCount = 0;
          
          for (const beacon of spaceBeacons) {
            const resonance = await this.calculateResonanceStrength(
              user.pri_public_resonance,
              beacon.prime_indices
            );
            
            totalResonance += resonance;
            beaconCount++;
          }
          
          if (beaconCount > 0) {
            spaceScores.push({
              space: space.space_id,
              score: totalResonance / beaconCount
            });
          }
        }
        
        return spaceScores
          .sort((a, b) => b.score - a.score)
          .slice(0, limit)
          .map(s => s.space);
      }
        
      default:
        return [];
    }
  }
}