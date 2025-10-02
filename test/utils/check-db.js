import { initializeDatabase, getDatabase, closeDatabase } from './server/database';

async function checkDatabase() {
    try {
        console.log('Initializing database connection...');
        await initializeDatabase();
        
        const db = getDatabase();
        
        // Check users table
        console.log('Checking users table...');
        const users = await new Promise((resolve, reject) => {
            db.all('SELECT COUNT(*) as count FROM users', [], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
        console.log('Users count:', users[0].count);
        
        // Check spaces table
        console.log('Checking spaces table...');
        const spaces = await new Promise((resolve, reject) => {
            db.all('SELECT COUNT(*) as count FROM spaces', [], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
        console.log('Spaces count:', spaces[0].count);
        
        // Check beacons table (posts)
        console.log('Checking beacons table...');
        const beacons = await new Promise((resolve, reject) => {
            db.all('SELECT COUNT(*) as count FROM beacons', [], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
        console.log('Beacons count:', beacons[0].count);
        
        await closeDatabase();
        console.log('Database connection closed.');
        
    } catch (error) {
        console.error('Error checking database:', error);
        process.exit(1);
    }
}

checkDatabase();