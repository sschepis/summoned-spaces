import { describe, it, expect, vi } from 'vitest';
import { ConnectionManager } from './connections';
import { NetworkStateManager } from './networkState';
import { PostManager } from './posts';
import { SocialGraphManager } from './social';
import type { WebSocket } from 'ws';

// Mock WebSocket
const createMockWebSocket = () => ({
  send: vi.fn(),
  close: vi.fn(),
  on: vi.fn(),
  readyState: 1,
});

describe('Server-Side Managers', () => {
  it('ConnectionManager should add, retrieve, and remove connections', () => {
    const manager = new ConnectionManager();
    const ws1 = createMockWebSocket() as unknown as WebSocket;
    const ws2 = createMockWebSocket() as unknown as WebSocket;

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

    expect(manager.getNetworkState()).toEqual([{ userId: 'user1', publicResonance: pri }]);
    expect(broadcastFn).toHaveBeenCalledTimes(1);

    manager.removeNode('conn1');
    expect(manager.getNetworkState()).toEqual([]);
    expect(broadcastFn).toHaveBeenCalledTimes(2);
  });

  it('PostManager should handle beacon submission and propagate to followers', async () => {
    const connectionManager = new ConnectionManager();
    const socialGraphManager = new SocialGraphManager();
    const postManager = new PostManager(socialGraphManager, connectionManager);

    // Mock user and follower connections
    const authorWs = createMockWebSocket() as unknown as WebSocket;
    const followerWs = createMockWebSocket() as unknown as WebSocket;
    socialGraphManager.addFollow('author1', 'follower1');
    connectionManager.addConnection(authorWs, 'author1');
    connectionManager.addConnection(followerWs, 'follower1');

    const mockBeacon = { index: [2,3,5], epoch: 1, fingerprint: new Uint8Array(1), signature: new Uint8Array(1) };
    await postManager.handleBeaconSubmission('author1', mockBeacon);

    // Author should receive their own beacon
    expect(authorWs.send).toHaveBeenCalledOnce();
    // Follower should receive the beacon
    expect(followerWs.send).toHaveBeenCalledOnce();
  });
});