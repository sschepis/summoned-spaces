/**
 * Script to clear all data from the Neon PostgreSQL database
 */

import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

import { initializeDatabase, getDatabase, closeDatabase } from '../server/database.js';

async function clearDatabase() {
    try {
        console.log('🗑️ Clearing Neon PostgreSQL database...');
        
        // Initialize database connection
        await initializeDatabase();
        
        // Get database instance and clear all data
        const db = getDatabase();
        await db.clearAllData();
        
        console.log('✅ Database cleared successfully!');
        
        // Close connection
        await closeDatabase();
        
    } catch (error) {
        console.error('❌ Error clearing database:', error);
        process.exit(1);
    }
}

// Run the script
clearDatabase();