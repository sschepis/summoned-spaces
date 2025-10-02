export class NetworkStateManager {
    // Maps a connectionId to its public node information
    nodes = new Map();
    constructor() {
        console.log('NetworkStateManager initialized');
    }
    /**
     * Adds a new node to the network state.
     * @param connectionId The unique ID of the WebSocket connection.
     * @param userId The user's unique node address (from PRI).
     * @param publicResonance The public part of the user's PRI.
     */
    addNode(connectionId, userId, username, publicResonance) {
        const newNode = { userId, username, publicResonance, connectionId };
        this.nodes.set(connectionId, newNode);
        console.log(`Node ${username} (${userId}) added to network state.`);
        this.broadcastNetworkUpdate();
    }
    /**
     * Removes a node from the network state.
     * @param connectionId The unique ID of the WebSocket connection.
     */
    removeNode(connectionId) {
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
    getNetworkState() {
        return Array.from(this.nodes.values());
    }
    /**
     * Broadcasts the current network state to all connected clients.
     * This is a placeholder for now. In a real implementation, this would
     * intelligently send messages to all clients via the ConnectionManager.
     */
    broadcastNetworkUpdate() {
        const state = this.getNetworkState();
        console.log('Broadcasting network update to all nodes. Current state:', state);
        // This is where we would iterate through all connections
        // in the ConnectionManager and send a 'networkStateUpdate' message.
    }
}
