/**
 * Database Factory
 * Creates appropriate database adapter based on configuration
 */

import { DatabaseAdapter } from './abstract-adapter.js';
import { DatabaseConfig, DatabaseError } from './types.js';

// Import adapters
import { NeonAdapter } from './neon-adapter.js';
// import { SqliteAdapter } from './sqlite-adapter.js'; // TODO: Implement later

export class DatabaseFactory {
  private static instance: DatabaseAdapter | null = null;
  
  static async create(config: DatabaseConfig): Promise<DatabaseAdapter> {
    let adapter: DatabaseAdapter;
    
    switch (config.type) {
      case 'sqlite':
        // TODO: Implement SqliteAdapter for development
        throw new DatabaseError('SQLite adapter not yet implemented - use Neon for now');
        
      case 'postgresql':
        adapter = new NeonAdapter(config);
        break;
        
      default:
        throw new DatabaseError(`Unsupported database type: ${config.type}`);
    }
    
    await adapter.connect();
    this.instance = adapter;
    
    console.log(`Database adapter initialized: ${config.type}`);
    return adapter;
  }
  
  static getInstance(): DatabaseAdapter {
    if (!this.instance) {
      throw new DatabaseError('Database not initialized. Call DatabaseFactory.create() first.');
    }
    return this.instance;
  }
  
  static async createFromEnvironment(): Promise<DatabaseAdapter> {
    const config = this.getConfigFromEnvironment();
    return this.create(config);
  }
  
  private static getConfigFromEnvironment(): DatabaseConfig {
    // Development: Use SQLite
    if (process.env.NODE_ENV !== 'production') {
      return {
        type: 'sqlite',
        connectionString: process.env.SQLITE_PATH || './summoned-spaces.db',
        pooling: false
      };
    }
    
    // Production: Use Neon PostgreSQL
    const neonUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
    if (!neonUrl) {
      throw new DatabaseError(
        'DATABASE_URL or NEON_DATABASE_URL environment variable required for production'
      );
    }
    
    return {
      type: 'postgresql',
      connectionString: neonUrl,
      pooling: true,
      ssl: true,
      maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
      queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000')
    };
  }
  
  static async shutdown(): Promise<void> {
    if (this.instance) {
      await this.instance.disconnect();
      this.instance = null;
    }
  }
}

// Global database instance getter
export function getDatabase(): DatabaseAdapter {
  return DatabaseFactory.getInstance();
}

// Initialize database for server startup
export async function initializeDatabase(): Promise<DatabaseAdapter> {
  return DatabaseFactory.createFromEnvironment();
}