import { getDatabase, initializeDatabase } from './server/database.ts';
import { AuthenticationManager } from './server/auth.ts';

async function createTestUser2() {
    await initializeDatabase();
    
    const authManager = new AuthenticationManager();
    
    try {
        const result = await authManager.registerUser('testuser2', 'test2@example.com', 'testpass2');
        console.log('Test user 2 created successfully:', result.userId);
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            console.log('Test user 2 already exists');
        } else {
            console.error('Error creating test user 2:', error);
        }
    }
    
    getDatabase().close();
}

createTestUser2();