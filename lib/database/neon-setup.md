# Neon PostgreSQL Setup Guide

## Quick Setup Instructions

### 1. Install Dependencies

```bash
npm install pg @types/pg
```

### 2. Environment Configuration

Create or update your `.env.local` file:

```bash
# Development (SQLite)
NODE_ENV=development
SQLITE_PATH=./summoned-spaces.db

# Production (Neon PostgreSQL)
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_lTUFQG2f8OjV@ep-bold-lake-adgkzwlk-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NEON_DATABASE_URL=postgresql://neondb_owner:npg_lTUFQG2f8OjV@ep-bold-lake-adgkzwlk-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Database Configuration
DB_MAX_CONNECTIONS=20
DB_QUERY_TIMEOUT=30000
```

### 3. Initialize Neon Database Schema

#### Option A: Using psql command line

```bash
# Connect to your Neon database
psql "postgresql://neondb_owner:npg_lTUFQG2f8OjV@ep-bold-lake-adgkzwlk-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Run the schema file
\i lib/database/neon-schema.sql
```

#### Option B: Using a Node.js script

Create `scripts/setup-neon.js`:

```javascript
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupNeon() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Neon PostgreSQL...');
    
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, '../lib/database/neon-schema.sql'),
      'utf8'
    );
    
    console.log('Executing schema...');
    await pool.query(schemaSQL);
    
    console.log('✅ Neon database schema created successfully!');
    
    // Test the quantum function
    const result = await pool.query(`
      SELECT calculate_resonance_strength(
        '{"base_resonance": 0.8, "amplification_factor": 0.7, "phase_alignment": 0.9, "entropy_level": 0.6}'::jsonb,
        '{"base_resonance": 0.7, "amplification_factor": 0.8, "phase_alignment": 0.85, "entropy_level": 0.65}'::jsonb
      ) as resonance_strength
    `);
    
    console.log('✅ Quantum resonance function test passed:', result.rows[0]);
    
  } catch (error) {
    console.error('❌ Error setting up Neon database:', error);
  } finally {
    await pool.end();
  }
}

setupNeon();
```

Then run:

```bash
node scripts/setup-neon.js
```

### 4. Update Database Factory

Update your `lib/database/database-factory.ts` to enable the Neon adapter:

```typescript
// Uncomment the import
import { NeonAdapter } from './neon-adapter.js';

// In the create method, uncomment:
case 'postgresql':
  adapter = new NeonAdapter(config);
  break;
```

### 5. Update Server Code

Update your `server/main.ts`:

```typescript
import { initializeDatabase } from '../lib/database/database-factory.js';

async function startServer() {
  try {
    // This will automatically choose SQLite or Neon based on NODE_ENV
    const db = await initializeDatabase();
    console.log(`Database initialized: ${db.constructor.name}`);
    
    // ... rest of server code
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}
```

## Vercel Deployment Configuration

### Environment Variables in Vercel

Set these in your Vercel dashboard:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_lTUFQG2f8OjV@ep-bold-lake-adgkzwlk-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NEON_DATABASE_URL=postgresql://neondb_owner:npg_lTUFQG2f8OjV@ep-bold-lake-adgkzwlk-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
DB_MAX_CONNECTIONS=20
DB_QUERY_TIMEOUT=30000
```

### Vercel Build Configuration

Update your `package.json`:

```json
{
  "scripts": {
    "build": "vite build",
    "postbuild": "node scripts/setup-neon.js"
  }
}
```

## Testing the Migration

### Development Testing

1. **Test SQLite (Development)**:
   ```bash
   NODE_ENV=development npm run dev
   ```

2. **Test Neon (Production-like)**:
   ```bash
   NODE_ENV=production npm run dev
   ```

### Migration Verification

Create `scripts/test-migration.js`:

```javascript
const { DatabaseFactory } = require('../lib/database/database-factory.js');

async function testMigration() {
  try {
    // Test SQLite
    console.log('Testing SQLite connection...');
    const sqliteDb = await DatabaseFactory.create({
      type: 'sqlite',
      connectionString: './summoned-spaces.db'
    });
    
    const sqliteStats = await sqliteDb.getStats();
    console.log('✅ SQLite stats:', sqliteStats);
    await sqliteDb.disconnect();
    
    // Test Neon
    console.log('Testing Neon connection...');
    const neonDb = await DatabaseFactory.create({
      type: 'postgresql',
      connectionString: process.env.DATABASE_URL,
      ssl: true
    });
    
    const neonStats = await neonDb.getStats();
    console.log('✅ Neon stats:', neonStats);
    await neonDb.disconnect();
    
    console.log('🎉 Both databases working correctly!');
    
  } catch (error) {
    console.error('❌ Migration test failed:', error);
  }
}

testMigration();
```

## Data Migration Script

Create `scripts/migrate-data.js`:

```javascript
const sqlite3 = require('sqlite3');
const { Pool } = require('pg');

async function migrateData() {
  const sqliteDb = new sqlite3.Database('./summoned-spaces.db');
  const neonPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Starting data migration from SQLite to Neon...');
    
    // Migrate users
    console.log('Migrating users...');
    const users = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM users', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    for (const user of users) {
      await neonPool.query(`
        INSERT INTO users (
          user_id, username, email, password_hash, salt,
          node_public_key, node_private_key_encrypted, master_phase_key_encrypted,
          pri_public_resonance, pri_private_resonance, pri_fingerprint, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (user_id) DO NOTHING
      `, [
        user.user_id, user.username, user.email, user.password_hash, user.salt,
        user.node_public_key, user.node_private_key_encrypted, user.master_phase_key_encrypted,
        user.pri_public_resonance, user.pri_private_resonance, user.pri_fingerprint,
        user.created_at
      ]);
    }
    console.log(`✅ Migrated ${users.length} users`);
    
    // Migrate beacons
    console.log('Migrating beacons...');
    const beacons = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM beacons ORDER BY created_at', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    for (const beacon of beacons) {
      await neonPool.query(`
        INSERT INTO beacons (
          beacon_id, beacon_type, author_id, prime_indices,
          epoch, fingerprint, signature, metadata, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (beacon_id) DO NOTHING
      `, [
        beacon.beacon_id, beacon.beacon_type, beacon.author_id, beacon.prime_indices,
        beacon.epoch, beacon.fingerprint, beacon.signature, beacon.metadata,
        beacon.created_at
      ]);
    }
    console.log(`✅ Migrated ${beacons.length} beacons`);
    
    console.log('🎉 Data migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    sqliteDb.close();
    await neonPool.end();
  }
}

migrateData();
```

## Quantum Features Verification

After migration, verify quantum features work:

```sql
-- Test quantum resonance calculation
SELECT calculate_resonance_strength(
  '{"base_resonance": 0.8, "amplification_factor": 0.7, "phase_alignment": 0.9, "entropy_level": 0.6}'::jsonb,
  '{"base_resonance": 0.7, "amplification_factor": 0.8, "phase_alignment": 0.85, "entropy_level": 0.65}'::jsonb
) as resonance_strength;

-- Test resonant beacon finding
SELECT * FROM find_resonant_beacons('your-user-id-here', 0.5, 5);

-- Check quantum stats
SELECT * FROM quantum_resonance_stats;

-- Check space activity
SELECT * FROM space_activity_stats LIMIT 10;
```

## Troubleshooting

### Common Issues

1. **Connection Timeout**:
   - Increase `DB_QUERY_TIMEOUT`
   - Check Neon connection limits

2. **SSL Errors**:
   - Ensure `sslmode=require` in connection string
   - Set `ssl: { rejectUnauthorized: false }` in Pool config

3. **Function Not Found**:
   - Re-run the schema SQL file
   - Check if all functions were created successfully

4. **Performance Issues**:
   - Monitor connection pool usage
   - Check if indexes are being used: `EXPLAIN ANALYZE SELECT ...`

### Monitoring

Add these queries for monitoring:

```sql
-- Check connection count
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';

-- Check slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_tup_read DESC;
```

## Next Steps

1. ✅ Install PostgreSQL dependencies
2. ✅ Run schema initialization
3. ✅ Test both SQLite and Neon connections
4. ✅ Migrate existing data
5. ✅ Verify quantum functions work
6. ✅ Deploy to Vercel with Neon
7. ✅ Monitor performance and optimize

Your holographic beacon architecture is now ready for production deployment! 🚀