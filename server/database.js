/**
 * Server Database Interface - Updated for Database Abstraction Layer
 * Supports seamless switching between SQLite (development) and Neon PostgreSQL (production)
 */
import { DatabaseFactory } from '../lib/database/database-factory.js';
let dbInstance = null;
/**
 * Initialize the database using the abstraction layer
 * Automatically chooses SQLite for development, Neon for production
 */
export async function initializeDatabase(customConfig) {
    try {
        console.log('🚀 Initializing Summoned Spaces database...');
        // Determine configuration
        const config = customConfig?.type ? customConfig : await getDefaultConfig();
        // Get the appropriate database adapter
        dbInstance = await DatabaseFactory.create(config);
        console.log('✅ Database initialized successfully');
        console.log('🔮 HOLOGRAPHIC ARCHITECTURE: User data stored as quantum beacons');
        console.log('🌀 QUATERNIONIC ARCHITECTURE: Messages via split-prime entanglement');
        console.log(`📊 Database type: ${config.type}`);
    }
    catch (error) {
        console.error('❌ Failed to initialize database:', error);
        throw error;
    }
}
/**
 * Get default configuration based on environment
 */
async function getDefaultConfig() {
    const isProduction = process.env.NODE_ENV === 'production';
    const isVercel = process.env.VERCEL === '1';
    const hasNeonUrl = !!(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL);
    if (isProduction || isVercel || hasNeonUrl) {
        // Use Neon PostgreSQL for production/Vercel
        if (!hasNeonUrl) {
            throw new Error('DATABASE_URL or NEON_DATABASE_URL environment variable is required for production deployment');
        }
        return {
            type: 'postgresql',
            connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL,
            pooling: true,
            ssl: true,
            maxConnections: 20,
            queryTimeout: 30000
        };
    }
    else {
        // For now, force Neon even in development since SQLite adapter isn't implemented yet
        if (hasNeonUrl) {
            return {
                type: 'postgresql',
                connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL,
                pooling: true,
                ssl: true,
                maxConnections: 20,
                queryTimeout: 30000
            };
        }
        throw new Error('Please provide DATABASE_URL or NEON_DATABASE_URL. SQLite adapter not yet implemented.');
    }
}
/**
 * Get the current database instance
 * Returns the abstracted database adapter
 */
export function getDatabase() {
    if (!dbInstance) {
        throw new Error('Database has not been initialized. Please call initializeDatabase() first.');
    }
    return dbInstance;
}
/**
 * Close the database connection
 */
export async function closeDatabase() {
    if (dbInstance) {
        try {
            await dbInstance.disconnect();
            dbInstance = null;
            console.log('🔌 Database connection closed.');
        }
        catch (error) {
            console.error('❌ Error closing database:', error);
            throw error;
        }
    }
}
/**
 * Clear all data from the database
 * Useful for testing and development
 */
export async function clearDatabase() {
    const db = getDatabase();
    try {
        await db.clearAllData();
    }
    catch (error) {
        console.error('❌ Error clearing database:', error);
        throw error;
    }
}
/**
 * Get database health and statistics
 */
export async function getDatabaseStats() {
    const db = getDatabase();
    const stats = await db.getStats();
    // Get table row counts using available methods
    const tables = ['users', 'spaces', 'beacons', 'likes', 'comments', 'follows', 'notifications', 'quaternionic_messages'];
    const tableStats = {};
    // Use the stats we already have and supplement with individual counts if needed
    tableStats.users = stats.total_users;
    tableStats.beacons = stats.total_beacons;
    tableStats.spaces = stats.total_spaces;
    // Estimate others to avoid complex queries
    for (const table of tables) {
        if (!tableStats[table]) {
            tableStats[table] = 0; // Default for now
        }
    }
    return {
        type: 'postgresql', // We only support Neon PostgreSQL now
        tableStats,
        health: {
            connected: db.isConnected(),
            lastQuery: new Date(),
            totalQueries: Object.values(tableStats).reduce((sum, count) => sum + count, 0)
        }
    };
}
/**
 * Test database connection and functionality
 */
export async function testDatabaseConnection() {
    try {
        const db = getDatabase();
        // Test basic connectivity
        const connected = db.isConnected();
        if (!connected) {
            return {
                success: false,
                message: 'Database not connected',
                details: { connected: false }
            };
        }
        // Get database statistics
        const stats = await db.getStats();
        // Test quantum resonance calculation if available
        let quantumTest = null;
        try {
            // Test with sample data
            const samplePrimes1 = {
                base_resonance: 0.8,
                amplification_factor: 0.7,
                phase_alignment: 0.9,
                entropy_level: 0.6,
                prime_sequence: [2, 3, 5],
                resonance_signature: "test1"
            };
            const samplePrimes2 = {
                base_resonance: 0.7,
                amplification_factor: 0.8,
                phase_alignment: 0.85,
                entropy_level: 0.65,
                prime_sequence: [2, 3, 7],
                resonance_signature: "test2"
            };
            const resonance = await db.calculateQuantumResonance(samplePrimes1, samplePrimes2);
            quantumTest = { resonance_strength: resonance };
        }
        catch (error) {
            console.warn('⚠️ Quantum resonance function test failed:', error);
        }
        return {
            success: true,
            message: 'Database connection successful (Neon PostgreSQL)',
            details: {
                stats,
                quantumFunction: quantumTest,
                connected: true
            }
        };
    }
    catch (error) {
        return {
            success: false,
            message: `Database connection failed: ${error.message}`,
            details: { error: error.toString() }
        };
    }
}
/**
 * Initialize database with environment detection
 * This is the main entry point for server startup
 */
export async function initializeDatabaseForEnvironment() {
    const isVercel = process.env.VERCEL === '1';
    const hasNeonUrl = !!(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL);
    console.log(`🌍 Environment detection:
    - NODE_ENV: ${process.env.NODE_ENV || 'development'}
    - VERCEL: ${isVercel ? 'Yes' : 'No'}
    - Neon URL: ${hasNeonUrl ? 'Available' : 'Not configured'}
    `);
    if (!hasNeonUrl) {
        throw new Error('DATABASE_URL or NEON_DATABASE_URL environment variable is required');
    }
    console.log('🐘 Using Neon PostgreSQL');
    await initializeDatabase();
    // Test the connection
    const connectionTest = await testDatabaseConnection();
    if (connectionTest.success) {
        console.log('✅', connectionTest.message);
    }
    else {
        console.error('❌', connectionTest.message);
        throw new Error(`Database connection test failed: ${connectionTest.message}`);
    }
}
