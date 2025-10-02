/**
 * Database Types and Interfaces for Summoned Spaces
 * Supports both SQLite and PostgreSQL backends
 */

// ============================================
// Core Database Configuration
// ============================================

export interface DatabaseConfig {
  type: 'sqlite' | 'postgresql';
  connectionString: string;
  pooling?: boolean;
  ssl?: boolean;
  maxConnections?: number;
  queryTimeout?: number;
}

// ============================================
// Quantum Resonance Types
// ============================================

export interface QuantumPrimeIndices {
  base_resonance: number;
  amplification_factor: number;
  phase_alignment: number;
  entropy_level: number;
  prime_sequence: number[];
  resonance_signature: string;
}

export interface PrimeResonanceIdentity {
  public_resonance: QuantumPrimeIndices;
  private_resonance: QuantumPrimeIndices;
  fingerprint: string;
  verification_signature: Buffer;
}

// ============================================
// Core Entity Types
// ============================================

export interface User {
  user_id: string;
  username: string;
  email: string;
  password_hash: string;
  salt: Buffer;
  node_public_key: Buffer;
  node_private_key_encrypted: Buffer;
  master_phase_key_encrypted: Buffer;
  pri_public_resonance: QuantumPrimeIndices;
  pri_private_resonance: QuantumPrimeIndices;
  pri_fingerprint: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateUserData {
  user_id: string;
  username: string;
  email: string;
  password_hash: string;
  salt: Buffer;
  node_public_key: Buffer;
  node_private_key_encrypted: Buffer;
  master_phase_key_encrypted: Buffer;
  pri_public_resonance: QuantumPrimeIndices;
  pri_private_resonance: QuantumPrimeIndices;
  pri_fingerprint: string;
}

export interface Beacon {
  beacon_id: string;
  beacon_type: string;
  author_id: string;
  prime_indices: QuantumPrimeIndices;
  epoch: number;
  fingerprint: Buffer;
  signature: Buffer;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

export interface CreateBeaconData {
  beacon_id: string;
  beacon_type: string;
  author_id: string;
  prime_indices: QuantumPrimeIndices;
  epoch: number;
  fingerprint: Buffer;
  signature: Buffer;
  metadata?: Record<string, unknown>;
}

export interface Space {
  space_id: string;
  name: string;
  description?: string;
  is_public: boolean;
  owner_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

export interface CreateSpaceData {
  space_id: string;
  name: string;
  description?: string;
  is_public: boolean;
  owner_id?: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// Query Filter Types
// ============================================

export interface BeaconFilter {
  beacon_type?: string;
  author_id?: string;
  space_id?: string;
  resonance_threshold?: number;
  epoch_min?: number;
  epoch_max?: number;
  limit?: number;
  offset?: number;
  order_by?: 'created_at' | 'epoch' | 'resonance_strength';
  order_direction?: 'asc' | 'desc';
}

export interface QuantumResonanceQuery {
  target_user_id: string;
  reference_prime_indices: QuantumPrimeIndices;
  resonance_threshold: number;
  max_results: number;
  include_metadata?: boolean;
}

export interface BeaconCluster {
  cluster_id: string;
  beacons: Beacon[];
  centroid_resonance: QuantumPrimeIndices;
  cluster_strength: number;
  member_count: number;
}

// ============================================
// Transaction and Connection Types
// ============================================

export interface TransactionContext {
  commit(): Promise<void>;
  rollback(): Promise<void>;
  isActive(): boolean;
}

export interface QueryResult<T = unknown> {
  rows: T[];
  rowCount: number;
  command: string;
}

export interface DatabaseStats {
  total_users: number;
  total_beacons: number;
  total_spaces: number;
  avg_resonance_strength: number;
  database_size_mb: number;
  connection_count: number;
}

// ============================================
// Error Types
// ============================================

export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class QuantumResonanceError extends Error {
  constructor(
    message: string,
    public resonance_data?: unknown
  ) {
    super(message);
    this.name = 'QuantumResonanceError';
  }
}

export class TransactionError extends Error {
  constructor(
    message: string,
    public transaction_id?: string
  ) {
    super(message);
    this.name = 'TransactionError';
  }
}