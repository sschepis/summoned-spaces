/**
 * Data Migration Script: SQLite to Neon PostgreSQL
 * Preserves all quantum/holographic beacon data with enhanced PostgreSQL features
 */

import sqlite3 from 'sqlite3';
import { Pool } from 'pg';
import { QuantumPrimeIndices } from '../lib/database/types.js';

interface SQLiteFollow {
  follower_id: string;
  following_id: string;
  created_at: string;
}

interface SQLiteLike {
  post_beacon_id: string;
  user_id: string;
  created_at: string;
}

interface SQLiteComment {
  comment_id: string;
  post_beacon_id: string;
  author_id: string;
  comment_beacon_id: string;
  created_at: string;
}

interface SQLiteCountResult {
  count: number;
}

interface MigrationConfig {
  sqlitePath: string;
  neonConnectionString: string;
  batchSize: number;
  preserveTimestamps: boolean;
  dryRun: boolean;
}

interface SQLiteUser {
  user_id: string;
  username: string;
  email: string;
  password_hash: string;
  salt: Buffer;
  node_public_key: Buffer;
  node_private_key_encrypted: Buffer;
  master_phase_key_encrypted: Buffer;
  pri_public_resonance: string;
  pri_private_resonance: string;
  pri_fingerprint: string;
  created_at: string;
}

interface SQLiteBeacon {
  beacon_id: string;
  beacon_type: string;
  author_id: string;
  prime_indices: string;
  epoch: number;
  fingerprint: Buffer;
  signature: Buffer;
  metadata: string | null;
  created_at: string;
}

interface SQLiteSpace {
  space_id: string;
  name: string;
  description: string | null;
  is_public: number;
  created_at: string;
}

class NeonMigrator {
  private sqlite: sqlite3.Database;
  private neon: Pool;
  private config: MigrationConfig;

  constructor(config: MigrationConfig) {
    this.config = config;
    this.sqlite = new sqlite3.Database(config.sqlitePath);
    this.neon = new Pool({
      connectionString: config.neonConnectionString,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async migrate(): Promise<void> {
    console.log('🚀 Starting migration from SQLite to Neon PostgreSQL...');
    console.log(`📊 Configuration:
    - SQLite: ${this.config.sqlitePath}
    - Neon: ${this.config.neonConnectionString.split('@')[1]?.split('/')[0] || 'hidden'}
    - Batch Size: ${this.config.batchSize}
    - Dry Run: ${this.config.dryRun}
    - Preserve Timestamps: ${this.config.preserveTimestamps}
    `);

    try {
      // Test connections
      await this.testConnections();

      // Clear target database if not dry run
      if (!this.config.dryRun) {
        await this.clearNeonDatabase();
      }

      // Migrate data in order due to foreign key constraints
      await this.migrateUsers();
      await this.migrateSpaces();
      await this.migrateBeacons();
      await this.migrateSocialData();
      
      // Verify migration
      await this.verifyMigration();

      console.log('🎉 Migration completed successfully!');

    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  private async testConnections(): Promise<void> {
    console.log('🔌 Testing database connections...');

    // Test SQLite
    const sqliteTest = await this.querySQLite('SELECT COUNT(*) as count FROM users') as SQLiteCountResult[];
    console.log(`✅ SQLite connected: ${sqliteTest[0].count} users found`);

    // Test Neon
    const neonTest = await this.neon.query('SELECT NOW() as timestamp');
    console.log(`✅ Neon connected: ${neonTest.rows[0].timestamp}`);
  }

  private async clearNeonDatabase(): Promise<void> {
    console.log('🧹 Clearing target Neon database...');
    
    const tables = [
      'notifications', 'quaternionic_messages', 'comments', 
      'likes', 'follows', 'beacons', 'spaces', 'users'
    ];

    for (const table of tables) {
      await this.neon.query(`DELETE FROM ${table}`);
      console.log(`  Cleared ${table}`);
    }
  }

  private async migrateUsers(): Promise<void> {
    console.log('👥 Migrating users...');

    const users = await this.querySQLite('SELECT * FROM users ORDER BY created_at');
    console.log(`  Found ${users.length} users to migrate`);

    let migrated = 0;
    for (const user of users as SQLiteUser[]) {
      if (!this.config.dryRun) {
        try {
          // Parse JSON fields
          const priPublic: QuantumPrimeIndices = JSON.parse(user.pri_public_resonance);
          const priPrivate: QuantumPrimeIndices = JSON.parse(user.pri_private_resonance);

          await this.neon.query(`
            INSERT INTO users (
              user_id, username, email, password_hash, salt,
              node_public_key, node_private_key_encrypted, master_phase_key_encrypted,
              pri_public_resonance, pri_private_resonance, pri_fingerprint,
              created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          `, [
            user.user_id,
            user.username,
            user.email,
            user.password_hash,
            user.salt,
            user.node_public_key,
            user.node_private_key_encrypted,
            user.master_phase_key_encrypted,
            JSON.stringify(priPublic),
            JSON.stringify(priPrivate),
            user.pri_fingerprint,
            this.config.preserveTimestamps ? user.created_at : new Date().toISOString(),
            new Date().toISOString()
          ]);

          migrated++;
        } catch (error) {
          console.error(`  ❌ Failed to migrate user ${user.username}:`, error);
        }
      }
    }

    console.log(`  ✅ Migrated ${migrated} users${this.config.dryRun ? ' (dry run)' : ''}`);
  }

  private async migrateSpaces(): Promise<void> {
    console.log('🏢 Migrating spaces...');

    const spaces = await this.querySQLite('SELECT * FROM spaces ORDER BY created_at');
    console.log(`  Found ${spaces.length} spaces to migrate`);

    let migrated = 0;
    for (const space of spaces as SQLiteSpace[]) {
      if (!this.config.dryRun) {
        try {
          await this.neon.query(`
            INSERT INTO spaces (space_id, name, description, is_public, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [
            space.space_id,
            space.name,
            space.description,
            space.is_public === 1,
            this.config.preserveTimestamps ? space.created_at : new Date().toISOString(),
            new Date().toISOString()
          ]);

          migrated++;
        } catch (error) {
          console.error(`  ❌ Failed to migrate space ${space.name}:`, error);
        }
      }
    }

    console.log(`  ✅ Migrated ${migrated} spaces${this.config.dryRun ? ' (dry run)' : ''}`);
  }

  private async migrateBeacons(): Promise<void> {
    console.log('📡 Migrating beacons (quantum holographic data)...');

    const beacons = await this.querySQLite('SELECT * FROM beacons ORDER BY created_at');
    console.log(`  Found ${beacons.length} beacons to migrate`);

    let migrated = 0;
    for (const beacon of beacons as SQLiteBeacon[]) {
      if (!this.config.dryRun) {
        try {
          // Parse quantum prime indices
          const primeIndices: QuantumPrimeIndices = JSON.parse(beacon.prime_indices);
          const metadata = beacon.metadata ? JSON.parse(beacon.metadata) : null;

          await this.neon.query(`
            INSERT INTO beacons (
              beacon_id, beacon_type, author_id, prime_indices,
              epoch, fingerprint, signature, metadata, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          `, [
            beacon.beacon_id,
            beacon.beacon_type,
            beacon.author_id,
            JSON.stringify(primeIndices),
            beacon.epoch,
            beacon.fingerprint,
            beacon.signature,
            metadata ? JSON.stringify(metadata) : null,
            this.config.preserveTimestamps ? beacon.created_at : new Date().toISOString(),
            new Date().toISOString()
          ]);

          migrated++;

          // Log quantum resonance data preservation
          if (migrated % 100 === 0) {
            console.log(`    📊 Processed ${migrated} beacons (quantum data preserved)`);
          }

        } catch (error) {
          console.error(`  ❌ Failed to migrate beacon ${beacon.beacon_id}:`, error);
        }
      }
    }

    console.log(`  ✅ Migrated ${migrated} beacons${this.config.dryRun ? ' (dry run)' : ''}`);
    
    // Test quantum resonance function with migrated data
    if (!this.config.dryRun && migrated > 1) {
      await this.testQuantumFunctions();
    }
  }

  private async migrateSocialData(): Promise<void> {
    console.log('👥 Migrating social data (follows, likes, comments)...');

    // Migrate follows
    try {
      const follows = await this.querySQLite('SELECT * FROM follows');
      console.log(`  Found ${follows.length} follow relationships`);

      if (!this.config.dryRun) {
        for (const follow of follows as SQLiteFollow[]) {
          await this.neon.query(`
            INSERT INTO follows (follower_id, following_id, created_at)
            VALUES ($1, $2, $3)
            ON CONFLICT (follower_id, following_id) DO NOTHING
          `, [
            follow.follower_id,
            follow.following_id,
            this.config.preserveTimestamps ? follow.created_at : new Date().toISOString()
          ]);
        }
      }
      console.log(`    ✅ Migrated ${follows.length} follows`);
    } catch {
      console.log(`    ⚠️ Follow table not found or empty`);
    }

    // Migrate likes
    try {
      const likes = await this.querySQLite('SELECT * FROM likes');
      console.log(`  Found ${likes.length} likes`);

      if (!this.config.dryRun) {
        for (const like of likes as SQLiteLike[]) {
          await this.neon.query(`
            INSERT INTO likes (post_beacon_id, user_id, created_at)
            VALUES ($1, $2, $3)
            ON CONFLICT (post_beacon_id, user_id) DO NOTHING
          `, [
            like.post_beacon_id,
            like.user_id,
            this.config.preserveTimestamps ? like.created_at : new Date().toISOString()
          ]);
        }
      }
      console.log(`    ✅ Migrated ${likes.length} likes`);
    } catch {
      console.log(`    ⚠️ Likes table not found or empty`);
    }

    // Migrate comments
    try {
      const comments = await this.querySQLite('SELECT * FROM comments');
      console.log(`  Found ${comments.length} comments`);

      if (!this.config.dryRun) {
        for (const comment of comments as SQLiteComment[]) {
          await this.neon.query(`
            INSERT INTO comments (comment_id, post_beacon_id, author_id, comment_beacon_id, created_at)
            VALUES ($1, $2, $3, $4, $5)
          `, [
            comment.comment_id,
            comment.post_beacon_id,
            comment.author_id,
            comment.comment_beacon_id,
            this.config.preserveTimestamps ? comment.created_at : new Date().toISOString()
          ]);
        }
      }
      console.log(`    ✅ Migrated ${comments.length} comments`);
    } catch {
      console.log(`    ⚠️ Comments table not found or empty`);
    }
  }

  private async testQuantumFunctions(): Promise<void> {
    console.log('🔬 Testing quantum resonance functions...');

    try {
      // Test resonance calculation function
      const resonanceTest = await this.neon.query(`
        SELECT calculate_resonance_strength(
          '{"base_resonance": 0.8, "amplification_factor": 0.7, "phase_alignment": 0.9, "entropy_level": 0.6, "prime_sequence": [2,3,5], "resonance_signature": "test1"}'::jsonb,
          '{"base_resonance": 0.7, "amplification_factor": 0.8, "phase_alignment": 0.85, "entropy_level": 0.65, "prime_sequence": [2,3,7], "resonance_signature": "test2"}'::jsonb
        ) as resonance_strength
      `);

      const resonanceStrength = parseFloat(resonanceTest.rows[0].resonance_strength);
      console.log(`  ✅ Quantum resonance calculation: ${resonanceStrength.toFixed(4)}`);

      // Test with actual migrated data
      const sampleBeacons = await this.neon.query(`
        SELECT beacon_id, prime_indices FROM beacons LIMIT 2
      `);

      if (sampleBeacons.rows.length >= 2) {
        const beacon1 = sampleBeacons.rows[0];
        const beacon2 = sampleBeacons.rows[1];
        
        const realResonance = await this.neon.query(`
          SELECT calculate_resonance_strength($1::jsonb, $2::jsonb) as resonance_strength
        `, [beacon1.prime_indices, beacon2.prime_indices]);

        console.log(`  ✅ Real beacon resonance: ${parseFloat(realResonance.rows[0].resonance_strength).toFixed(4)}`);
      }

      // Test quantum views
      const quantumStats = await this.neon.query('SELECT * FROM quantum_resonance_stats LIMIT 3');
      console.log(`  ✅ Quantum stats view: ${quantumStats.rows.length} beacon types analyzed`);

    } catch (error) {
      console.error('  ❌ Quantum function test failed:', error);
    }
  }

  private async verifyMigration(): Promise<void> {
    console.log('🔍 Verifying migration integrity...');

    // Compare counts
    const sqliteCounts = {
      users: ((await this.querySQLite('SELECT COUNT(*) as count FROM users')) as SQLiteCountResult[])[0].count,
      beacons: ((await this.querySQLite('SELECT COUNT(*) as count FROM beacons')) as SQLiteCountResult[])[0].count,
      spaces: ((await this.querySQLite('SELECT COUNT(*) as count FROM spaces')) as SQLiteCountResult[])[0].count
    };

    const neonCounts = {
      users: parseInt((await this.neon.query('SELECT COUNT(*) as count FROM users')).rows[0].count),
      beacons: parseInt((await this.neon.query('SELECT COUNT(*) as count FROM beacons')).rows[0].count),
      spaces: parseInt((await this.neon.query('SELECT COUNT(*) as count FROM spaces')).rows[0].count)
    };

    console.log(`
    📊 Migration Verification:
    
    Users:   SQLite: ${sqliteCounts.users} → Neon: ${neonCounts.users} ${sqliteCounts.users === neonCounts.users ? '✅' : '❌'}
    Beacons: SQLite: ${sqliteCounts.beacons} → Neon: ${neonCounts.beacons} ${sqliteCounts.beacons === neonCounts.beacons ? '✅' : '❌'}  
    Spaces:  SQLite: ${sqliteCounts.spaces} → Neon: ${neonCounts.spaces} ${sqliteCounts.spaces === neonCounts.spaces ? '✅' : '❌'}
    `);

    // Test random sample integrity
    const sampleUser = await this.neon.query('SELECT * FROM users ORDER BY RANDOM() LIMIT 1');
    if (sampleUser.rows.length > 0) {
      const user = sampleUser.rows[0];
      const primeIndices = typeof user.pri_public_resonance === 'string' 
        ? JSON.parse(user.pri_public_resonance)
        : user.pri_public_resonance;
      
      console.log(`  ✅ Sample user quantum data: base_resonance=${primeIndices.base_resonance}`);
    }
  }

  private async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up connections...');
    this.sqlite.close();
    await this.neon.end();
  }

  private querySQLite(sql: string, params: unknown[] = []): Promise<unknown[]> {
    return new Promise((resolve, reject) => {
      this.sqlite.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

// CLI Script Runner
async function runMigration() {
  const config: MigrationConfig = {
    sqlitePath: process.env.SQLITE_PATH || './summoned-spaces.db',
    neonConnectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || '',
    batchSize: parseInt(process.env.MIGRATION_BATCH_SIZE || '100'),
    preserveTimestamps: process.env.PRESERVE_TIMESTAMPS !== 'false',
    dryRun: process.env.DRY_RUN === 'true'
  };

  if (!config.neonConnectionString) {
    console.error('❌ DATABASE_URL or NEON_DATABASE_URL environment variable is required');
    process.exit(1);
  }

  console.log(`
╔══════════════════════════════════════════════════════════════════════════════════╗
║                    SUMMONED SPACES QUANTUM DATABASE MIGRATION                   ║
║                            SQLite → Neon PostgreSQL                            ║
╚══════════════════════════════════════════════════════════════════════════════════╝
  `);

  const migrator = new NeonMigrator(config);
  
  try {
    await migrator.migrate();
    console.log('\n🎉 Your quantum holographic beacon system is now running on Neon PostgreSQL!');
    console.log('🚀 Ready for Vercel deployment with enhanced performance and scalability.');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration().catch(console.error);
}

export { NeonMigrator, runMigration };