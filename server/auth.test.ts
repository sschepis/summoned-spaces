import { AuthenticationManager } from './auth';
import { initializeDatabase, getDatabase, closeDatabase, clearDatabase } from './database';

describe('AuthenticationManager with SQLite', () => {
  beforeAll(async () => {
    await initializeDatabase(':memory:');
  });


  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  it('should register a new user and store them in the database', async () => {
    const authManager = new AuthenticationManager();
    const result = await authManager.registerUser('testuser1', 'test1@test.com', 'password123');

    expect(result.userId).toBeDefined();
    expect(result.pri).toBeDefined();

    const db = getDatabase();
    interface UserRow {
      user_id: string;
      username: string;
      email: string;
    }

    const user: UserRow = await new Promise((resolve, reject) => {
      db.get('SELECT user_id, username, email FROM users WHERE username = ?', ['testuser1'], (err, row: UserRow) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    expect(user).toBeDefined();
    expect(user.username).toBe('testuser1');
    expect(user.email).toBe('test1@test.com');
    expect(user.user_id).toBe(result.userId);
  });

  it('should allow a registered user to log in', async () => {
    const authManager = new AuthenticationManager();
    await authManager.registerUser('loginuser2', 'test2@test.com', 'password123');
    const session = await authManager.loginUser('loginuser2', 'password123');

    expect(session).toBeDefined();
    expect(session.userId).toBeDefined();
    expect(session.sessionToken).toBeDefined();
    expect(session.pri).toBeDefined();
    expect(session.pri.nodeAddress).toBe(session.userId);
  });

  it('should fail to log in with an incorrect password', async () => {
    const authManager = new AuthenticationManager();
    await authManager.registerUser('failuser3', 'test3@test.com', 'password123');

    await expect(authManager.loginUser('failuser3', 'wrongpassword')).rejects.toThrow('Invalid credentials');
  });

  it('should fail to log in a non-existent user', async () => {
    const authManager = new AuthenticationManager();
    await expect(authManager.loginUser('nouser', 'password')).rejects.toThrow('User not found');
  });
});