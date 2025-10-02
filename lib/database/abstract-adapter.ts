/**
 * Abstract Database Adapter Interface
 * Defines the contract for all database implementations
 */

import {
  User, CreateUserData,
  Beacon, CreateBeaconData, BeaconFilter,
  Space, CreateSpaceData,
  QuantumPrimeIndices, QuantumResonanceQuery, BeaconCluster,
  DatabaseStats
} from './types.js';

export abstract class DatabaseAdapter {
  
  // ============================================
  // Connection Management
  // ============================================
  
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract isConnected(): boolean;
  abstract getStats(): Promise<DatabaseStats>;
  
  // ============================================
  // Transaction Management
  // ============================================
  
  abstract transaction<T>(
    callback: (tx: DatabaseAdapter) => Promise<T>
  ): Promise<T>;
  
  // ============================================
  // User Operations
  // ============================================
  
  abstract createUser(userData: CreateUserData): Promise<User>;
  abstract getUserById(userId: string): Promise<User | null>;
  abstract getUserByUsername(username: string): Promise<User | null>;
  abstract getUserByEmail(email: string): Promise<User | null>;
  abstract updateUser(userId: string, updates: Partial<User>): Promise<User>;
  abstract deleteUser(userId: string): Promise<boolean>;
  abstract listUsers(limit?: number, offset?: number): Promise<User[]>;
  
  // ============================================
  // Beacon Operations
  // ============================================
  
  abstract createBeacon(beacon: CreateBeaconData): Promise<Beacon>;
  abstract getBeaconById(beaconId: string): Promise<Beacon | null>;
  abstract getBeaconsByUser(
    userId: string, 
    type?: string, 
    limit?: number
  ): Promise<Beacon[]>;
  abstract getBeaconsByType(
    type: string, 
    limit?: number, 
    offset?: number
  ): Promise<Beacon[]>;
  abstract queryBeacons(filter: BeaconFilter): Promise<Beacon[]>;
  abstract updateBeacon(
    beaconId: string, 
    updates: Partial<Beacon>
  ): Promise<Beacon>;
  abstract deleteBeacon(beaconId: string): Promise<boolean>;
  
  // ============================================
  // Space Operations
  // ============================================
  
  abstract createSpace(space: CreateSpaceData): Promise<Space>;
  abstract getSpaceById(spaceId: string): Promise<Space | null>;
  abstract getSpaceByName(name: string): Promise<Space | null>;
  abstract getPublicSpaces(limit?: number, offset?: number): Promise<Space[]>;
  abstract getSpacesByOwner(ownerId: string): Promise<Space[]>;
  abstract updateSpace(spaceId: string, updates: Partial<Space>): Promise<Space>;
  abstract deleteSpace(spaceId: string): Promise<boolean>;
  
  // ============================================
  // Quantum Resonance Operations
  // ============================================
  
  abstract calculateQuantumResonance(
    primeIndices: QuantumPrimeIndices,
    referencePoint: QuantumPrimeIndices
  ): Promise<number>;
  
  abstract findResonantBeacons(query: QuantumResonanceQuery): Promise<Beacon[]>;
  
  abstract findQuantumClusters(
    spaceId: string,
    clusterThreshold?: number
  ): Promise<BeaconCluster[]>;
  
  abstract getResonanceMatrix(
    beaconIds: string[]
  ): Promise<Map<string, Map<string, number>>>;
  
  abstract updateResonanceCache(
    userId: string,
    resonanceData: Record<string, number>
  ): Promise<void>;
  
  // ============================================
  // Social Operations
  // ============================================
  
  abstract createFollow(followerId: string, followingId: string): Promise<boolean>;
  abstract removeFollow(followerId: string, followingId: string): Promise<boolean>;
  abstract getFollowers(userId: string): Promise<User[]>;
  abstract getFollowing(userId: string): Promise<User[]>;
  abstract isFollowing(followerId: string, followingId: string): Promise<boolean>;
  
  // ============================================
  // Engagement Operations
  // ============================================
  
  abstract likeBeacon(userId: string, beaconId: string): Promise<boolean>;
  abstract unlikeBeacon(userId: string, beaconId: string): Promise<boolean>;
  abstract getBeaconLikes(beaconId: string): Promise<User[]>;
  abstract getUserLikes(userId: string): Promise<Beacon[]>;
  
  // ============================================
  // Search and Discovery
  // ============================================
  
  abstract searchUsers(query: string, limit?: number): Promise<User[]>;
  abstract searchSpaces(query: string, limit?: number): Promise<Space[]>;
  abstract searchBeacons(
    query: string, 
    type?: string, 
    limit?: number
  ): Promise<Beacon[]>;
  
  // ============================================
  // Utility Methods
  // ============================================
  
  // Public query method for server-level operations
  abstract query<T = unknown>(
    sql: string,
    params?: unknown[]
  ): Promise<T[]>;
  
  protected abstract rawQuery<T = unknown>(
    sql: string,
    params?: unknown[]
  ): Promise<T[]>;
  
  // Database management operations
  abstract clearAllData(): Promise<void>;
  
  // ============================================
  // Legacy SQLite API Compatibility Layer
  // ============================================
  
  // Legacy get method for backward compatibility
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(sql: string, params: unknown[], callback: (err: Error | null, row?: any) => void): void {
    this.query(sql, params)
      .then(results => {
        const row = results.length > 0 ? results[0] : undefined;
        callback(null, row);
      })
      .catch(err => callback(err));
  }
  
  // Legacy all method for backward compatibility
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  all(sql: string, params: unknown[], callback: (err: Error | null, rows: any[]) => void): void {
    this.query(sql, params)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(results => callback(null, results as any[]))
      .catch(err => callback(err, []));
  }
  
  // Legacy run method for backward compatibility
  run(sql: string, params: unknown[], callback?: (err: Error | null) => void): void {
    this.query(sql, params)
      .then(() => callback?.(null))
      .catch(err => callback?.(err));
  }
  
  protected abstract mapUserRow(row: unknown): User;
  protected abstract mapBeaconRow(row: unknown): Beacon;
  protected abstract mapSpaceRow(row: unknown): Space;
}