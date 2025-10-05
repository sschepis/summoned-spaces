/**
 * Script to clear users table from Neon PostgreSQL database
 * This is necessary after fixing the authentication vulnerability
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function clearUsers() {
  const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL or NEON_DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🗑️  Connecting to Neon PostgreSQL database...');
    
    // Clear users table
    await pool.query('TRUNCATE TABLE users CASCADE');
    console.log('✅ Users table cleared successfully!');
    console.log('   All user accounts have been removed.');
    console.log('   Users will need to re-register with the fixed authentication system.');
    
  } catch (error) {
    console.error('❌ Error clearing users table:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
clearUsers();