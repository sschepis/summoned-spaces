import type { WebSocket } from 'ws';

interface AuthenticatedConnection {
    ws: WebSocket;
    userId: string;
    connectionId: string;
}

export class ConnectionManager {
    private connections: Map<string, AuthenticatedConnection> = new Map();
    private users: Map<string, Set<string>> = new Map(); // userId -> Set<connectionId>

    constructor() {
        console.log('ConnectionManager initialized');
    }

    /**
     * Adds a new authenticated connection to the manager.
     */
    addConnection(ws: WebSocket, userId: string): string {
        const connectionId = `conn_${Math.random().toString(36).substr(2, 9)}`;
        
        this.connections.set(connectionId, { ws, userId, connectionId });

        if (!this.users.has(userId)) {
            this.users.set(userId, new Set());
        }
        this.users.get(userId)!.add(connectionId);

        console.log(`Connection ${connectionId} added for user ${userId}. Total connections for user: ${this.users.get(userId)!.size}`);
        return connectionId;
    }

    /**
     * Removes a connection from the manager.
     */
    removeConnection(connectionId: string): void {
        const connection = this.connections.get(connectionId);
        if (!connection) return;

        const { userId } = connection;
        this.connections.delete(connectionId);

        const userConnections = this.users.get(userId);
        if (userConnections) {
            userConnections.delete(connectionId);
            if (userConnections.size === 0) {
                this.users.delete(userId);
            }
        }
        console.log(`Connection ${connectionId} removed for user ${userId}.`);
    }

    /**
     * Retrieves all WebSocket connections for a given user.
     */
    getConnectionsByUserId(userId: string): WebSocket[] {
        const connectionIds = this.users.get(userId);
        if (!connectionIds) return [];

        return Array.from(connectionIds)
            .map(id => this.connections.get(id)?.ws)
            .filter((ws): ws is WebSocket => ws !== undefined);
    }

    /**
     * Gets the total number of connected users.
     */
    getConnectedUserCount(): number {
        return this.users.size;
    }

    /**
     * Gets the total number of active connections.
     */
    getTotalConnectionCount(): number {
        return this.connections.size;
    }

    /**
     * Gets all active WebSocket instances.
     */
    getAllConnections(): WebSocket[] {
        return Array.from(this.connections.values()).map(c => c.ws);
    }
}