import { initializeDatabase, clearDatabase, closeDatabase } from './server/database.js';

async function resetDatabase() {
    try {
        console.log('Initializing database connection...');
        await initializeDatabase();
        
        console.log('Clearing all data from database...');
        await clearDatabase();
        
        console.log('Database reset complete! All users, spaces, and posts have been deleted.');
        
        await closeDatabase();
        console.log('Database connection closed.');
        
    } catch (error) {
        console.error('Error resetting database:', error);
        process.exit(1);
    }
}

resetDatabase();