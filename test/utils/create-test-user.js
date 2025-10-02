import { getDatabase, initializeDatabase } from './server/database.ts';
import { AuthenticationManager } from './server/auth.ts';

async function createTestUser() {
    await initializeDatabase();
    
    const authManager = new AuthenticationManager();
    
    try {
        const result = await authManager.registerUser('testuser', 'test@example.com', 'testpass');
        console.log('Test user created successfully:', result.userId);
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            console.log('Test user already exists');
        } else {
            console.error('Error creating test user:', error);
        }
    }
    
    getDatabase().close();
}

createTestUser();