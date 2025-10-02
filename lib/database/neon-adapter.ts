/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Neon PostgreSQL Database Adapter
 * Optimized for serverless deployment with Vercel
 */

import { Pool, PoolClient, QueryResult as PgQueryResult } from 'pg';
import { DatabaseAdapter } from './abstract-adapter.js';
import { 
  DatabaseConfig, DatabaseError, TransactionError,
  User, CreateUserData, Beacon, CreateBeaconData, BeaconFilter,
  Space, CreateSpaceData, QuantumPrimeIndices, QuantumResonanceQuery,
  BeaconCluster, DatabaseStats
} from './types.js';

export class NeonAdapter extends DatabaseAdapter {
  private pool: Pool;
  private connected = false;

  constructor(private config: DatabaseConfig) {
    super();
    
    this.pool = new Pool({
      connectionString: config.connectionString,
      ssl: config.ssl !== false ? { rejectUnauthorized: false } : false,
      max: config.maxConnections || 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      statement_timeout: config.queryTimeout || 30000,
      query_timeout: config.queryTimeout || 30000,
    });

    // Handle pool errors
    this.pool.on('error', (err: Error) => {
      console.error('Unexpected error on idle client:', err);
    });
  }

  async connect(): Promise<void> {
    if (this.connected) return;
    
    try {
      // Test connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      
      this.connected = true;
      console.log('Connected to Neon PostgreSQL');
      
      // Initialize schema
      await this.initializeSchema();
      
    } catch (error) {
      throw new DatabaseError(`Failed to connect to Neon: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;
    
    try {
      await this.pool.end();
      this.connected = false;
      console.log('Disconnected from Neon PostgreSQL');
    } catch (error) {
      console.error('Error disconnecting from Neon:', error);
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  async getStats(): Promise<DatabaseStats> {
    const queries = [
      'SELECT COUNT(*) as total_users FROM users',
      'SELECT COUNT(*) as total_beacons FROM beacons', 
      'SELECT COUNT(*) as total_spaces FROM spaces',
      'SELECT pg_database_size(current_database()) / 1024 / 1024 as size_mb',
      'SELECT count(*) as connections FROM pg_stat_activity WHERE state = \'active\''
    ];

    const results = await Promise.all(
      queries.map(query => this.rawQuery(query))
    );

    return {
      total_users: parseInt((results[0][0] as Record<string, string>).total_users),
      total_beacons: parseInt((results[1][0] as Record<string, string>).total_beacons),
      total_spaces: parseInt((results[2][0] as Record<string, string>).total_spaces),
      avg_resonance_strength: 0.75, // TODO: Calculate from actual data
      database_size_mb: parseFloat((results[3][0] as Record<string, string>).size_mb),
      connection_count: parseInt((results[4][0] as Record<string, string>).connections)
    };
  }

  async transaction<T>(callback: (tx: DatabaseAdapter) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const txAdapter = new NeonTransactionAdapter(client, this);
      const result = await callback(txAdapter);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw new TransactionError(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      client.release();
    }
  }

  // ============================================
  // User Operations
  // ============================================

  async createUser(userData: CreateUserData): Promise<User> {
    const query = `
      INSERT INTO users (
        user_id, username, email, password_hash, salt,
        node_public_key, node_private_key_encrypted, master_phase_key_encrypted,
        pri_public_resonance, pri_private_resonance, pri_fingerprint
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const values = [
      userData.user_id,
      userData.username,
      userData.email,
      userData.password_hash,
      userData.salt,
      userData.node_public_key,
      userData.node_private_key_encrypted,
      userData.master_phase_key_encrypted,
      JSON.stringify(userData.pri_public_resonance),
      JSON.stringify(userData.pri_private_resonance),
      userData.pri_fingerprint
    ];

    const result = await this.rawQuery<User>(query, values);
    return this.mapUserRow(result[0]);
  }

  async getUserById(userId: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE user_id = $1';
    const result = await this.rawQuery<User>(query, [userId]);
    return result.length > 0 ? this.mapUserRow(result[0]) : null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await this.rawQuery<User>(query, [username]);
    return result.length > 0 ? this.mapUserRow(result[0]) : null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await this.rawQuery<User>(query, [email]);
    return result.length > 0 ? this.mapUserRow(result[0]) : null;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const filteredUpdates = Object.keys(updates).filter(key => key !== 'user_id');
    
    if (filteredUpdates.length === 0) {
      // No fields to update, just return the current user
      const user = await this.getUserById(userId);
      if (!user) {
        throw new DatabaseError(`User not found: ${userId}`);
      }
      return user;
    }
    
    const setClause = filteredUpdates
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const query = `
      UPDATE users
      SET ${setClause}, updated_at = NOW()
      WHERE user_id = $1
      RETURNING *
    `;
    
    const values = [userId, ...Object.values(updates).filter((_, index) => Object.keys(updates)[index] !== 'user_id')];
    const result = await this.rawQuery<User>(query, values);
    
    if (result.length === 0) {
      throw new DatabaseError(`User not found: ${userId}`);
    }
    
    return this.mapUserRow(result[0]);
  }

  async deleteUser(userId: string): Promise<any> {
    const query = 'DELETE FROM users WHERE user_id = $1';
    const result = await this.rawQuery(query, [userId]);
    return (result as unknown as any).rowCount > 0;
  }

  async listUsers(limit?: number, offset?: number): Promise<User[]> {
    let query = 'SELECT * FROM users ORDER BY created_at DESC';
    const params: unknown[] = [];
    
    if (limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(limit);
    }
    
    if (offset) {
      query += ` OFFSET $${params.length + 1}`;
      params.push(offset);
    }
    
    const result = await this.rawQuery<User>(query, params);
    return result.map(row => this.mapUserRow(row));
  }

  // ============================================
  // Beacon Operations
  // ============================================

  async createBeacon(beacon: CreateBeaconData): Promise<Beacon> {
    const query = `
      INSERT INTO beacons (
        beacon_id, beacon_type, author_id, prime_indices,
        epoch, fingerprint, signature, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      beacon.beacon_id,
      beacon.beacon_type,
      beacon.author_id,
      JSON.stringify(beacon.prime_indices),
      beacon.epoch,
      beacon.fingerprint,
      beacon.signature,
      beacon.metadata ? JSON.stringify(beacon.metadata) : null
    ];

    const result = await this.rawQuery<Beacon>(query, values);
    return this.mapBeaconRow(result[0]);
  }

  async getBeaconById(beaconId: string): Promise<Beacon | null> {
    const query = 'SELECT * FROM beacons WHERE beacon_id = $1';
    const result = await this.rawQuery<Beacon>(query, [beaconId]);
    return result.length > 0 ? this.mapBeaconRow(result[0]) : null;
  }

  async getBeaconsByUser(userId: string, type?: string, limit?: number): Promise<Beacon[]> {
    let query = 'SELECT * FROM beacons WHERE author_id = $1';
    const params: unknown[] = [userId];

    if (type) {
      query += ` AND beacon_type = $${params.length + 1}`;
      params.push(type);
    }

    query += ' ORDER BY created_at DESC';

    if (limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(limit);
    }

    const result = await this.rawQuery<Beacon>(query, params);
    return result.map(row => this.mapBeaconRow(row));
  }

  async getBeaconsByType(type: string, limit?: number, offset?: number): Promise<Beacon[]> {
    let query = 'SELECT * FROM beacons WHERE beacon_type = $1 ORDER BY created_at DESC';
    const params: unknown[] = [type];

    if (limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(limit);
    }

    if (offset) {
      query += ` OFFSET $${params.length + 1}`;
      params.push(offset);
    }

    const result = await this.rawQuery<Beacon>(query, params);
    return result.map(row => this.mapBeaconRow(row));
  }

  async queryBeacons(filter: BeaconFilter): Promise<Beacon[]> {
    let query = 'SELECT * FROM beacons WHERE 1=1';
    const params: unknown[] = [];

    if (filter.beacon_type) {
      query += ` AND beacon_type = $${params.length + 1}`;
      params.push(filter.beacon_type);
    }

    if (filter.author_id) {
      query += ` AND author_id = $${params.length + 1}`;
      params.push(filter.author_id);
    }

    if (filter.space_id) {
      query += ` AND metadata->>'space_id' = $${params.length + 1}`;
      params.push(filter.space_id);
    }

    if (filter.epoch_min) {
      query += ` AND epoch >= $${params.length + 1}`;
      params.push(filter.epoch_min);
    }

    if (filter.epoch_max) {
      query += ` AND epoch <= $${params.length + 1}`;
      params.push(filter.epoch_max);
    }

    // Order by
    const orderBy = filter.order_by || 'created_at';
    const orderDirection = filter.order_direction || 'desc';
    query += ` ORDER BY ${orderBy} ${orderDirection.toUpperCase()}`;

    if (filter.limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(filter.limit);
    }

    if (filter.offset) {
      query += ` OFFSET $${params.length + 1}`;
      params.push(filter.offset);
    }

    const result = await this.rawQuery<Beacon>(query, params);
    return result.map(row => this.mapBeaconRow(row));
  }

  async updateBeacon(beaconId: string, updates: Partial<Beacon>): Promise<Beacon> {
    const filteredUpdates = Object.keys(updates).filter(key => key !== 'beacon_id');
    
    if (filteredUpdates.length === 0) {
      // No fields to update, just return the current beacon
      const beacon = await this.getBeaconById(beaconId);
      if (!beacon) {
        throw new DatabaseError(`Beacon not found: ${beaconId}`);
      }
      return beacon;
    }
    
    const setClause = filteredUpdates
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const query = `
      UPDATE beacons
      SET ${setClause}, updated_at = NOW()
      WHERE beacon_id = $1
      RETURNING *
    `;
    
    const values = [beaconId, ...Object.values(updates).filter((_, index) => Object.keys(updates)[index] !== 'beacon_id')];
    const result = await this.rawQuery<Beacon>(query, values);
    
    if (result.length === 0) {
      throw new DatabaseError(`Beacon not found: ${beaconId}`);
    }
    
    return this.mapBeaconRow(result[0]);
  }

  async deleteBeacon(beaconId: string): Promise<boolean> {
    const query = 'DELETE FROM beacons WHERE beacon_id = $1';
    const result = await this.rawQuery(query, [beaconId]);
    return (result as unknown as any).rowCount > 0;
  }

  // ============================================
  // Space Operations  
  // ============================================

  async createSpace(space: CreateSpaceData): Promise<Space> {
    const query = `
      INSERT INTO spaces (space_id, name, description, is_public, owner_id, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      space.space_id,
      space.name,
      space.description,
      space.is_public,
      space.owner_id,
      space.metadata ? JSON.stringify(space.metadata) : null
    ];

    const result = await this.rawQuery<Space>(query, values);
    return this.mapSpaceRow(result[0]);
  }

  async getSpaceById(spaceId: string): Promise<Space | null> {
    const query = 'SELECT * FROM spaces WHERE space_id = $1';
    const result = await this.rawQuery<Space>(query, [spaceId]);
    return result.length > 0 ? this.mapSpaceRow(result[0]) : null;
  }

  async getSpaceByName(name: string): Promise<Space | null> {
    const query = 'SELECT * FROM spaces WHERE name = $1';
    const result = await this.rawQuery<Space>(query, [name]);
    return result.length > 0 ? this.mapSpaceRow(result[0]) : null;
  }

  async getPublicSpaces(limit?: number, offset?: number): Promise<Space[]> {
    let query = 'SELECT * FROM spaces WHERE is_public = true ORDER BY created_at DESC';
    const params: unknown[] = [];

    if (limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(limit);
    }

    if (offset) {
      query += ` OFFSET $${params.length + 1}`;
      params.push(offset);
    }

    const result = await this.rawQuery<Space>(query, params);
    return result.map(row => this.mapSpaceRow(row));
  }

  async getSpacesByOwner(ownerId: string): Promise<Space[]> {
    const query = 'SELECT * FROM spaces WHERE owner_id = $1 ORDER BY created_at DESC';
    const result = await this.rawQuery<Space>(query, [ownerId]);
    return result.map(row => this.mapSpaceRow(row));
  }

  async updateSpace(spaceId: string, updates: Partial<Space>): Promise<Space> {
    const filteredUpdates = Object.keys(updates).filter(key => key !== 'space_id');
    
    if (filteredUpdates.length === 0) {
      // No fields to update, just return the current space
      const space = await this.getSpaceById(spaceId);
      if (!space) {
        throw new DatabaseError(`Space not found: ${spaceId}`);
      }
      return space;
    }
    
    const setClause = filteredUpdates
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const query = `
      UPDATE spaces
      SET ${setClause}, updated_at = NOW()
      WHERE space_id = $1
      RETURNING *
    `;
    
    const values = [spaceId, ...Object.values(updates).filter((_, index) => Object.keys(updates)[index] !== 'space_id')];
    const result = await this.rawQuery<Space>(query, values);
    
    if (result.length === 0) {
      throw new DatabaseError(`Space not found: ${spaceId}`);
    }
    
    return this.mapSpaceRow(result[0]);
  }

  async deleteSpace(spaceId: string): Promise<boolean> {
    const query = 'DELETE FROM spaces WHERE space_id = $1';
    const result = await this.rawQuery(query, [spaceId]);
    return (result as unknown as any).rowCount > 0;
  }

  // ============================================
  // Quantum Resonance Operations
  // ============================================

  async calculateQuantumResonance(
    primeIndices: QuantumPrimeIndices,
    referencePoint: QuantumPrimeIndices
  ): Promise<number> {
    // Use custom PostgreSQL function if available, otherwise calculate client-side
    const query = `
      SELECT calculate_resonance_strength($1, $2) as resonance_strength
    `;
    
    try {
      const result = await this.rawQuery(query, [
        JSON.stringify(primeIndices),
        JSON.stringify(referencePoint)
      ]);
      return parseFloat((result[0] as Record<string, string>).resonance_strength);
    } catch {
      // Fallback to client-side calculation
      return this.calculateResonanceClientSide(primeIndices, referencePoint);
    }
  }

  private calculateResonanceClientSide(
    primeA: QuantumPrimeIndices,
    primeB: QuantumPrimeIndices
  ): number {
    const baseResonance = (primeA.base_resonance + primeB.base_resonance) / 2;
    const amplificationSync = Math.abs(primeA.amplification_factor - primeB.amplification_factor);
    const phaseAlignment = 1 - Math.abs(primeA.phase_alignment - primeB.phase_alignment);
    const entropyBalance = 1 - Math.abs(primeA.entropy_level - primeB.entropy_level);
    
    const resonanceStrength = (
      baseResonance * 0.4 +
      (1 - amplificationSync) * 0.25 +
      phaseAlignment * 0.2 +
      entropyBalance * 0.15
    );
    
    return Math.max(0, Math.min(1, resonanceStrength));
  }

  async findResonantBeacons(_query: QuantumResonanceQuery): Promise<Beacon[]> {
    // This will be implemented using the QuantumQueryEngine
    throw new DatabaseError('findResonantBeacons should be called through QuantumQueryEngine');
  }

  async findQuantumClusters(_spaceId: string, _clusterThreshold?: number): Promise<BeaconCluster[]> {
    // This will be implemented using the QuantumQueryEngine
    throw new DatabaseError('findQuantumClusters should be called through QuantumQueryEngine');
  }

  async getResonanceMatrix(beaconIds: string[]): Promise<Map<string, Map<string, number>>> {
    const matrix = new Map<string, Map<string, number>>();
    
    // Get all beacons
    const query = 'SELECT * FROM beacons WHERE beacon_id = ANY($1)';
    const beacons = await this.rawQuery<Beacon>(query, [beaconIds]);
    const mappedBeacons = beacons.map(row => this.mapBeaconRow(row));
    
    // Calculate pairwise resonance
    for (let i = 0; i < mappedBeacons.length; i++) {
      const beaconA = mappedBeacons[i];
      matrix.set(beaconA.beacon_id, new Map());
      
      for (let j = i + 1; j < mappedBeacons.length; j++) {
        const beaconB = mappedBeacons[j];
        
        const resonance = await this.calculateQuantumResonance(
          beaconA.prime_indices,
          beaconB.prime_indices
        );
        
        matrix.get(beaconA.beacon_id)!.set(beaconB.beacon_id, resonance);
        
        if (!matrix.has(beaconB.beacon_id)) {
          matrix.set(beaconB.beacon_id, new Map());
        }
        matrix.get(beaconB.beacon_id)!.set(beaconA.beacon_id, resonance);
      }
    }
    
    return matrix;
  }

  async updateResonanceCache(userId: string, resonanceData: Record<string, number>): Promise<void> {
    // Store in user metadata for now
    const query = `
      UPDATE users 
      SET pri_private_resonance = jsonb_set(
        pri_private_resonance, 
        '{resonance_cache}', 
        $2::jsonb
      )
      WHERE user_id = $1
    `;
    
    await this.rawQuery(query, [userId, JSON.stringify(resonanceData)]);
  }

  // ============================================
  // Social Operations (Simplified Implementation)
  // ============================================

  async createFollow(followerId: string, followingId: string): Promise<boolean> {
    const query = `
      INSERT INTO follows (follower_id, following_id, created_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (follower_id, following_id) DO NOTHING
    `;
    
    const result = await this.rawQuery(query, [followerId, followingId]);
    return (result as unknown as any).rowCount > 0;
  }

  async removeFollow(followerId: string, followingId: string): Promise<boolean> {
    const query = 'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2';
    const result = await this.rawQuery(query, [followerId, followingId]);
    return (result as unknown as any).rowCount > 0;
  }

  async getFollowers(userId: string): Promise<User[]> {
    const query = `
      SELECT u.* FROM users u
      JOIN follows f ON u.user_id = f.follower_id
      WHERE f.following_id = $1
    `;
    
    const result = await this.rawQuery<User>(query, [userId]);
    return result.map(row => this.mapUserRow(row));
  }

  async getFollowing(userId: string): Promise<User[]> {
    const query = `
      SELECT u.* FROM users u
      JOIN follows f ON u.user_id = f.following_id
      WHERE f.follower_id = $1
    `;
    
    const result = await this.rawQuery<User>(query, [userId]);
    return result.map(row => this.mapUserRow(row));
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const query = 'SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2';
    const result = await this.rawQuery(query, [followerId, followingId]);
    return result.length > 0;
  }

  // ============================================
  // Engagement Operations (Simplified Implementation)
  // ============================================

  async likeBeacon(userId: string, beaconId: string): Promise<boolean> {
    const query = `
      INSERT INTO likes (post_beacon_id, user_id, created_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (post_beacon_id, user_id) DO NOTHING
    `;
    
    const result = await this.rawQuery(query, [beaconId, userId]);
    return (result as unknown as any).rowCount > 0;
  }

  async unlikeBeacon(userId: string, beaconId: string): Promise<boolean> {
    const query = 'DELETE FROM likes WHERE post_beacon_id = $1 AND user_id = $2';
    const result = await this.rawQuery(query, [beaconId, userId]);
    return (result as unknown as any).rowCount > 0;
  }

  async getBeaconLikes(beaconId: string): Promise<User[]> {
    const query = `
      SELECT u.* FROM users u
      JOIN likes l ON u.user_id = l.user_id
      WHERE l.post_beacon_id = $1
    `;
    
    const result = await this.rawQuery<User>(query, [beaconId]);
    return result.map(row => this.mapUserRow(row));
  }

  async getUserLikes(userId: string): Promise<Beacon[]> {
    const query = `
      SELECT b.* FROM beacons b
      JOIN likes l ON b.beacon_id = l.post_beacon_id
      WHERE l.user_id = $1
    `;
    
    const result = await this.rawQuery<Beacon>(query, [userId]);
    return result.map(row => this.mapBeaconRow(row));
  }

  // ============================================
  // Search Operations (Basic Implementation)
  // ============================================

  async searchUsers(query: string, limit = 10): Promise<User[]> {
    const searchQuery = `
      SELECT * FROM users 
      WHERE username ILIKE $1 OR email ILIKE $1
      ORDER BY username
      LIMIT $2
    `;
    
    const result = await this.rawQuery<User>(searchQuery, [`%${query}%`, limit]);
    return result.map(row => this.mapUserRow(row));
  }

  async searchSpaces(query: string, limit = 10): Promise<Space[]> {
    const searchQuery = `
      SELECT * FROM spaces 
      WHERE name ILIKE $1 OR description ILIKE $1
      ORDER BY name
      LIMIT $2
    `;
    
    const result = await this.rawQuery<Space>(searchQuery, [`%${query}%`, limit]);
    return result.map(row => this.mapSpaceRow(row));
  }

  async searchBeacons(query: string, type?: string, limit = 10): Promise<Beacon[]> {
    let searchQuery = `
      SELECT * FROM beacons
      WHERE metadata::text ILIKE $1
    `;
    const params: unknown[] = [`%${query}%`];

    if (type) {
      searchQuery += ` AND beacon_type = $${params.length + 1}`;
      params.push(type);
    }

    searchQuery += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);
    
    const result = await this.rawQuery<Beacon>(searchQuery, params);
    return result.map(row => this.mapBeaconRow(row));
  }

  // ============================================
  // Database Management Methods
  // ============================================

  async query<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
    return this.rawQuery<T>(sql, params);
  }

  async clearAllData(): Promise<void> {
    console.log('🧹 Clearing all data from Neon database...');
    
    const tables = [
      'notifications',
      'quaternionic_messages',
      'comments',
      'likes',
      'follows',
      'beacons',
      'spaces',
      'users'
    ];
    
    try {
      // Use TRUNCATE CASCADE for efficient clearing
      for (const table of tables) {
        try {
          await this.rawQuery(`TRUNCATE TABLE ${table} CASCADE`);
          console.log(`  ✅ Truncated ${table}`);
        } catch (error) {
          // If TRUNCATE fails, try DELETE
          try {
            await this.rawQuery(`DELETE FROM ${table}`);
            console.log(`  ✅ Deleted from ${table}`);
          } catch (deleteError) {
            console.warn(`  ⚠️ Could not clear ${table}:`, deleteError);
          }
        }
      }
      console.log('✅ All data cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing database:', error);
      throw error;
    }
  }

  // ============================================
  // Utility Methods
  // ============================================

  protected async rawQuery<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
    try {
      const result = await this.pool.query(sql, params);
      return result.rows as T[];
    } catch (error) {
      console.error('Database query error:', error);
      throw new DatabaseError(`Query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  protected mapUserRow(row: unknown): User {
    const r = row as Record<string, unknown>;
    return {
      user_id: r.user_id as string,
      username: r.username as string,
      email: r.email as string,
      password_hash: r.password_hash as string,
      salt: r.salt as Buffer,
      node_public_key: r.node_public_key as Buffer,
      node_private_key_encrypted: r.node_private_key_encrypted as Buffer,
      master_phase_key_encrypted: r.master_phase_key_encrypted as Buffer,
      pri_public_resonance: typeof r.pri_public_resonance === 'string' 
        ? JSON.parse(r.pri_public_resonance) 
        : r.pri_public_resonance as QuantumPrimeIndices,
      pri_private_resonance: typeof r.pri_private_resonance === 'string'
        ? JSON.parse(r.pri_private_resonance)
        : r.pri_private_resonance as QuantumPrimeIndices,
      pri_fingerprint: r.pri_fingerprint as string,
      created_at: (r.created_at as Date).toISOString(),
      updated_at: r.updated_at ? (r.updated_at as Date).toISOString() : undefined
    };
  }

  protected mapBeaconRow(row: unknown): Beacon {
    const r = row as Record<string, unknown>;
    return {
      beacon_id: r.beacon_id as string,
      beacon_type: r.beacon_type as string,
      author_id: r.author_id as string,
      prime_indices: typeof r.prime_indices === 'string'
        ? JSON.parse(r.prime_indices)
        : r.prime_indices as QuantumPrimeIndices,
      epoch: parseInt(r.epoch as string),
      fingerprint: r.fingerprint as Buffer,
      signature: r.signature as Buffer,
      metadata: r.metadata ? (typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata) : undefined,
      created_at: (r.created_at as Date).toISOString(),
      updated_at: r.updated_at ? (r.updated_at as Date).toISOString() : undefined
    };
  }

  protected mapSpaceRow(row: unknown): Space {
    const r = row as Record<string, unknown>;
    return {
      space_id: r.space_id as string,
      name: r.name as string,
      description: r.description as string | undefined,
      is_public: r.is_public as boolean,
      owner_id: r.owner_id as string | undefined,
      metadata: r.metadata ? (typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata) : undefined,
      created_at: (r.created_at as Date).toISOString(),
      updated_at: r.updated_at ? (r.updated_at as Date).toISOString() : undefined
    };
  }

  // ============================================
  // Schema Initialization
  // ============================================

  private async initializeSchema(): Promise<void> {
    console.log('🏗️ Initializing Neon PostgreSQL schema...');
    
    const createUserTableSql = `
      CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        salt BYTEA NOT NULL,
        node_public_key BYTEA NOT NULL,
        node_private_key_encrypted BYTEA NOT NULL,
        master_phase_key_encrypted BYTEA NOT NULL,
        pri_public_resonance JSONB NOT NULL,
        pri_private_resonance JSONB NOT NULL,
        pri_fingerprint TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const createBeaconsTableSql = `
      CREATE TABLE IF NOT EXISTS beacons (
        beacon_id TEXT PRIMARY KEY,
        beacon_type TEXT NOT NULL,
        author_id TEXT NOT NULL,
        prime_indices JSONB NOT NULL,
        epoch BIGINT NOT NULL,
        fingerprint BYTEA NOT NULL,
        signature BYTEA NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        FOREIGN KEY (author_id) REFERENCES users (user_id)
      );
    `;

    const createSpacesTableSql = `
      CREATE TABLE IF NOT EXISTS spaces (
        space_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        is_public BOOLEAN NOT NULL,
        owner_id TEXT,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        FOREIGN KEY (owner_id) REFERENCES users (user_id)
      );
    `;

    const createLikesTableSql = `
      CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        post_beacon_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(post_beacon_id, user_id),
        FOREIGN KEY (user_id) REFERENCES users (user_id)
      );
    `;

    const createCommentsTableSql = `
      CREATE TABLE IF NOT EXISTS comments (
        comment_id TEXT PRIMARY KEY,
        post_beacon_id TEXT NOT NULL,
        author_id TEXT NOT NULL,
        comment_beacon_id TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        FOREIGN KEY (author_id) REFERENCES users (user_id)
      );
    `;

    const createFollowsTableSql = `
      CREATE TABLE IF NOT EXISTS follows (
        follower_id TEXT NOT NULL,
        following_id TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (follower_id, following_id),
        FOREIGN KEY (follower_id) REFERENCES users (user_id),
        FOREIGN KEY (following_id) REFERENCES users (user_id)
      );
    `;

    const createNotificationsTableSql = `
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        recipient_id TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        sender_id TEXT,
        sender_username TEXT,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        FOREIGN KEY (recipient_id) REFERENCES users (user_id),
        FOREIGN KEY (sender_id) REFERENCES users (user_id)
      );
    `;

    const createQuaternionicMessagesTableSql = `
      CREATE TABLE IF NOT EXISTS quaternionic_messages (
        message_id TEXT PRIMARY KEY,
        sender_id TEXT NOT NULL,
        receiver_id TEXT NOT NULL,
        content TEXT NOT NULL,
        room_id TEXT,
        phase_alignment REAL NOT NULL,
        entropy_level REAL NOT NULL,
        twist_angle REAL NOT NULL,
        is_quantum_delivered BOOLEAN NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (sender_id) REFERENCES users (user_id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users (user_id) ON DELETE CASCADE
      );
    `;

    try {
      await this.rawQuery(createUserTableSql);
      console.log('  ✅ Users table ready');
      
      await this.rawQuery(createBeaconsTableSql);
      console.log('  ✅ Beacons table ready');
      
      await this.rawQuery(createSpacesTableSql);
      console.log('  ✅ Spaces table ready');
      
      await this.rawQuery(createLikesTableSql);
      console.log('  ✅ Likes table ready');
      
      await this.rawQuery(createCommentsTableSql);
      console.log('  ✅ Comments table ready');
      
      await this.rawQuery(createFollowsTableSql);
      console.log('  ✅ Follows table ready');
      
      await this.rawQuery(createNotificationsTableSql);
      console.log('  ✅ Notifications table ready');
      
      await this.rawQuery(createQuaternionicMessagesTableSql);
      console.log('  ✅ Quaternionic messages table ready');
      
      console.log('🎉 Schema initialization complete!');
    } catch (error) {
      console.error('❌ Schema initialization failed:', error);
      throw error;
    }
  }
}

// Transaction adapter for Neon
class NeonTransactionAdapter extends DatabaseAdapter {
  constructor(
    private client: PoolClient,
    private parentAdapter: NeonAdapter
  ) {
    super();
  }

  async connect(): Promise<void> {
    // Already connected via parent client
  }

  async disconnect(): Promise<void> {
    // Don't disconnect transaction client
  }

  isConnected(): boolean {
    return true;
  }

  async getStats(): Promise<DatabaseStats> {
    return this.parentAdapter.getStats();
  }

  async transaction<T>(callback: (tx: DatabaseAdapter) => Promise<T>): Promise<T> {
    // Nested transactions not supported, just execute callback
    return callback(this);
  }

  async query<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
    // For transactions, delegate to parent
    return this.parentAdapter.query<T>(sql, params);
  }

  async clearAllData(): Promise<void> {
    // For transactions, delegate to parent
    return this.parentAdapter.clearAllData();
  }

  // Delegate all operations to use the transaction client
  async createUser(userData: CreateUserData): Promise<User> {
    // Implementation similar to parent but using this.client instead of this.pool
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async getUserById(_userId: string): Promise<User | null> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async getUserByUsername(_username: string): Promise<User | null> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async getUserByEmail(_email: string): Promise<User | null> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async updateUser(_userId: string, _updates: Partial<User>): Promise<User> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async deleteUser(_userId: string): Promise<boolean> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async listUsers(_limit?: number, _offset?: number): Promise<User[]> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async createBeacon(_beacon: CreateBeaconData): Promise<Beacon> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async getBeaconById(_beaconId: string): Promise<Beacon | null> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async getBeaconsByUser(_userId: string, _type?: string, _limit?: number): Promise<Beacon[]> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async getBeaconsByType(_type: string, _limit?: number, _offset?: number): Promise<Beacon[]> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async queryBeacons(_filter: BeaconFilter): Promise<Beacon[]> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async updateBeacon(_beaconId: string, _updates: Partial<Beacon>): Promise<Beacon> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async deleteBeacon(_beaconId: string): Promise<boolean> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async createSpace(_space: CreateSpaceData): Promise<Space> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async getSpaceById(_spaceId: string): Promise<Space | null> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async getSpaceByName(_name: string): Promise<Space | null> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async getPublicSpaces(_limit?: number, _offset?: number): Promise<Space[]> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async getSpacesByOwner(_ownerId: string): Promise<Space[]> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async updateSpace(_spaceId: string, _updates: Partial<Space>): Promise<Space> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async deleteSpace(_spaceId: string): Promise<boolean> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async calculateQuantumResonance(_primeIndices: QuantumPrimeIndices, _referencePoint: QuantumPrimeIndices): Promise<number> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async findResonantBeacons(_query: QuantumResonanceQuery): Promise<Beacon[]> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async findQuantumClusters(_spaceId: string, _clusterThreshold?: number): Promise<BeaconCluster[]> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async getResonanceMatrix(_beaconIds: string[]): Promise<Map<string, Map<string, number>>> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async updateResonanceCache(_userId: string, _resonanceData: Record<string, number>): Promise<void> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async createFollow(_followerId: string, _followingId: string): Promise<boolean> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async removeFollow(_followerId: string, _followingId: string): Promise<boolean> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async getFollowers(_userId: string): Promise<User[]> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async getFollowing(_userId: string): Promise<User[]> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async isFollowing(_followerId: string, _followingId: string): Promise<boolean> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async likeBeacon(_userId: string, _beaconId: string): Promise<boolean> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async unlikeBeacon(_userId: string, _beaconId: string): Promise<boolean> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async getBeaconLikes(_beaconId: string): Promise<User[]> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async getUserLikes(_userId: string): Promise<Beacon[]> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async searchUsers(_query: string, _limit?: number): Promise<User[]> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async searchSpaces(_query: string, _limit?: number): Promise<Space[]> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  async searchBeacons(_query: string, _type?: string, _limit?: number): Promise<Beacon[]> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  protected async rawQuery<T = unknown>(_sql: string, _params?: unknown[]): Promise<T[]> {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  protected mapUserRow(_row: unknown): User {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  protected mapBeaconRow(_row: unknown): Beacon {
    throw new DatabaseError('Transaction operations not yet implemented');
  }

  protected mapSpaceRow(_row: unknown): Space {
    throw new DatabaseError('Transaction operations not yet implemented');
  }
}