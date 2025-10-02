import { initializeDatabase, getDatabase, closeDatabase } from './server/database';

async function checkUser() {
    try {
        console.log('Initializing database connection...');
        await initializeDatabase();
        
        const db = getDatabase();
        
        // Check users table
        console.log('Checking for registered users...');
        const users = await new Promise((resolve, reject) => {
            db.all('SELECT user_id, username, email, created_at FROM users', [], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
        
        console.log(`Found ${users.length} user(s):`);
        users.forEach(user => {
            console.log(`- ID: ${user.user_id}`);
            console.log(`  Username: ${user.username}`);
            console.log(`  Email: ${user.email}`);
            console.log(`  Created: ${user.created_at}`);
            console.log('');
        });
        
        await closeDatabase();
        console.log('Database connection closed.');
        
    } catch (error) {
        console.error('Error checking users:', error);
        process.exit(1);
    }
}

checkUser();