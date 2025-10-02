import { initializeDatabase, getDatabase, closeDatabase } from './server/database.js';

async function dumpUsers() {
    try {
        console.log('Initializing database connection...');
        await initializeDatabase();
        
        const db = getDatabase();
        
        console.log('\n=== DUMPING ALL USER RECORDS ===\n');
        
        // Get all users
        const users = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM users', [], (err, rows) => {
                if (err) {
                    console.error('Error fetching users:', err.message);
                    return reject(err);
                }
                resolve(rows);
            });
        });
        
        if (users.length === 0) {
            console.log('No users found in the database.');
        } else {
            console.log(`Found ${users.length} user(s):\n`);
            users.forEach((user, index) => {
                console.log(`User ${index + 1}:`);
                console.log('  user_id:', user.user_id);
                console.log('  username:', user.username);
                console.log('  email:', user.email);
                console.log('  password_hash:', user.password_hash ? '[HIDDEN]' : 'null');
                console.log('  created_at:', user.created_at);
                console.log('  pri_seed:', user.pri_seed ? '[HIDDEN]' : 'null');
                console.log('  public_resonance:', user.public_resonance);
                console.log('');
            });
        }
        
        // Also dump beacons to see if there are any
        console.log('\n=== DUMPING ALL BEACONS ===\n');
        
        const beacons = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM beacons', [], (err, rows) => {
                if (err) {
                    console.error('Error fetching beacons:', err.message);
                    return reject(err);
                }
                resolve(rows);
            });
        });
        
        if (beacons.length === 0) {
            console.log('No beacons found in the database.');
        } else {
            console.log(`Found ${beacons.length} beacon(s):\n`);
            beacons.forEach((beacon, index) => {
                console.log(`Beacon ${index + 1}:`);
                console.log('  beacon_id:', beacon.beacon_id);
                console.log('  beacon_type:', beacon.beacon_type);
                console.log('  author_id:', beacon.author_id);
                console.log('  prime_indices:', beacon.prime_indices);
                console.log('  epoch:', beacon.epoch);
                console.log('  fingerprint:', beacon.fingerprint ? `${beacon.fingerprint.substring(0, 50)}...` : 'null');
                console.log('  signature:', beacon.signature ? `${beacon.signature.substring(0, 50)}...` : 'null');
                console.log('  metadata:', beacon.metadata);
                console.log('  created_at:', beacon.created_at);
                console.log('');
            });
        }
        
        // Also check for any follow relationships
        console.log('\n=== CHECKING FOLLOW RELATIONSHIPS ===\n');
        
        const follows = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM follows', [], (err, rows) => {
                if (err) {
                    console.error('Error fetching follows:', err.message);
                    return reject(err);
                }
                resolve(rows);
            });
        });
        
        if (follows.length === 0) {
            console.log('No follow relationships found in the database.');
        } else {
            console.log(`Found ${follows.length} follow relationship(s):\n`);
            follows.forEach((follow, index) => {
                console.log(`Follow ${index + 1}:`);
                console.log('  follower_id:', follow.follower_id);
                console.log('  following_id:', follow.following_id);
                console.log('  created_at:', follow.created_at);
                console.log('');
            });
        }
        
        await closeDatabase();
        console.log('\nDatabase connection closed.');
        
    } catch (error) {
        console.error('Error dumping users:', error);
        process.exit(1);
    }
}

dumpUsers();