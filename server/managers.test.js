import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { initializeDatabase, closeDatabase, clearDatabase } from './database';
import { ConnectionManager } from './connections';
import { NetworkStateManager } from './networkState';
import { PostManager } from './posts';
import { SocialGraphManager } from './social';
import { AuthenticationManager } from './auth';
// Mock WebSocket
const createMockWebSocket = () => ({
    send: vi.fn(),
    close: vi.fn(),
    on: vi.fn(),
    readyState: 1,
});
describe('Server-Side Managers', () => {
    beforeAll(async () => {
        await initializeDatabase(':memory:');
    });
    afterEach(async () => {
        await clearDatabase();
    });
    afterAll(async () => {
        await closeDatabase();
    });
    it('ConnectionManager should add, retrieve, and remove connections', () => {
        const manager = new ConnectionManager();
        const ws1 = createMockWebSocket();
        const ws2 = createMockWebSocket();
        const connId1 = manager.addConnection(ws1, 'user1');
        manager.addConnection(ws2, 'user1');
        expect(manager.getTotalConnectionCount()).toBe(2);
        expect(manager.getConnectedUserCount()).toBe(1);
        expect(manager.getConnectionsByUserId('user1')).toEqual([ws1, ws2]);
        manager.removeConnection(connId1);
        expect(manager.getTotalConnectionCount()).toBe(1);
        expect(manager.getConnectionsByUserId('user1')).toEqual([ws2]);
    });
    it('NetworkStateManager should manage and broadcast network state', () => {
        const manager = new NetworkStateManager();
        const broadcastFn = vi.fn();
        // @ts-expect-error - Monkey-patching for test purposes
        manager.broadcastNetworkUpdate = broadcastFn;
        const pri = { primaryPrimes: [2, 3, 5], harmonicPrimes: [7, 11] };
        manager.addNode('conn1', 'user1', pri);
        expect(manager.getNetworkState()).toEqual([{ connectionId: 'conn1', userId: 'user1', publicResonance: pri }]);
        expect(broadcastFn).toHaveBeenCalledTimes(1);
        manager.removeNode('conn1');
        expect(manager.getNetworkState()).toEqual([]);
        expect(broadcastFn).toHaveBeenCalledTimes(2);
    });
    it('PostManager should handle beacon submission and propagate to followers', async () => {
        const connectionManager = new ConnectionManager();
        const socialGraphManager = new SocialGraphManager();
        const postManager = new PostManager(connectionManager);
        const authManager = new AuthenticationManager();
        const author = await authManager.registerUser('author1', 'author1@test.com', 'password');
        const follower = await authManager.registerUser('follower1', 'follower1@test.com', 'password');
        // Mock user and follower connections
        const authorWs = createMockWebSocket();
        const followerWs = createMockWebSocket();
        await socialGraphManager.addFollow(follower.userId, author.userId);
        connectionManager.addConnection(authorWs, author.userId);
        connectionManager.addConnection(followerWs, follower.userId);
        const mockBeacon = { index: [2, 3, 5], epoch: 1, fingerprint: new Uint8Array(1), signature: new Uint8Array(1) };
        await postManager.handleBeaconSubmission(author.userId, mockBeacon, 'post');
        // Author should not receive their own beacon
        expect(authorWs.send).not.toHaveBeenCalled();
        // Follower should receive the beacon
        expect(followerWs.send).toHaveBeenCalledOnce();
    });
});
