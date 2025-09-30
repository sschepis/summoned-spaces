import type { PublicResonance } from './identity';

interface NetworkNode {
    userId: string; // This is the nodeAddress from the PRI
    publicResonance: PublicResonance;
    connectionId: string;
}

export class NetworkStateManager {
    // Maps a connectionId to its public node information
    private nodes: Map<string, NetworkNode> = new Map();

    constructor() {
        console.log('NetworkStateManager initialized');
    }

    /**
     * Adds a new node to the network state.
     * @param connectionId The unique ID of the WebSocket connection.
     * @param userId The user's unique node address (from PRI).
     * @param publicResonance The public part of the user's PRI.
     */
    addNode(connectionId: string, userId: string, publicResonance: PublicResonance): void {
        const newNode: NetworkNode = { userId, publicResonance, connectionId };
        this.nodes.set(connectionId, newNode);
        console.log(`Node ${userId} added to network state.`);
        this.broadcastNetworkUpdate();
    }

    /**
     * Removes a node from the network state.
     * @param connectionId The unique ID of the WebSocket connection.
     */
    removeNode(connectionId: string): void {
        if (this.nodes.has(connectionId)) {
            const removedNode = this.nodes.get(connectionId);
            this.nodes.delete(connectionId);
            console.log(`Node ${removedNode?.userId} removed from network state.`);
            this.broadcastNetworkUpdate();
        }
    }

    /**
     * Gets the current state of the entire network.
     * @returns An array of all active nodes.
     */
    getNetworkState(): NetworkNode[] {
        return Array.from(this.nodes.values());
    }

    /**
     * Broadcasts the current network state to all connected clients.
     * This is a placeholder for now. In a real implementation, this would
     * intelligently send messages to all clients via the ConnectionManager.
     */
    private broadcastNetworkUpdate(): void {
        const state = this.getNetworkState();
        console.log('Broadcasting network update to all nodes. Current state:', state);
        // This is where we would iterate through all connections
        // in the ConnectionManager and send a 'networkStateUpdate' message.
    }
}