import { describe, it, expect, vi, afterEach } from 'vitest';
import { WebSocketService } from './websocket';
import { holographicMemoryManager, PrimeResonanceIdentity } from './holographic-memory';
import WebSocket from 'ws';

// Manually assign WebSocket to the global scope for the test environment
// @ts-expect-error - This is necessary for the test environment
global.WebSocket = WebSocket;

// Mock the wasm module import
vi.mock('../../../summoned-spaces/resolang/build/resolang.js', () => ({
  createHolographicEncoding: vi.fn(),
  holographicEncodingEncode: vi.fn((encoder: unknown, text: string) => {
    return {
      signature: new Uint8Array([1, 2, 3]),
      fingerprint: new Uint8Array([4, 5, 6]),
      index: [7, 8, 9],
      text,
    };
  }),
}));


describe('Client-Side Services', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('WebSocketService should be created', () => {
    const webSocketService = new WebSocketService();
    // This test primarily ensures the service can be instantiated in a node environment
    expect(webSocketService).toBeDefined();
  });

  it('HolographicMemoryManager should encode memory after being initialized', async () => {
    const mockPRI: PrimeResonanceIdentity = {
      publicResonance: { primaryPrimes: [2], harmonicPrimes: [3] },
      privateResonance: { secretPrimes: [5], eigenPhase: 1, authenticationSeed: 1 },
      fingerprint: 'test',
      nodeAddress: 'test',
    };

    holographicMemoryManager.setCurrentUser(mockPRI);
    const fragment = await holographicMemoryManager.encodeMemory('hello world');

    interface MockFragment {
      signature: Uint8Array;
      fingerprint: Uint8Array;
      index: number[];
      text: string;
    }

    expect(fragment).toBeDefined();
    expect(fragment!.signature).toEqual(new Uint8Array([1, 2, 3]));
    expect((fragment as unknown as MockFragment).text).toBe('hello world');
  });

  it('HolographicMemoryManager should not encode memory before being initialized', async () => {
    // Reset the manager state for this test
    // @ts-expect-error - Accessing private member for test reset
    holographicMemoryManager.currentUserPRI = null;
    await expect(holographicMemoryManager.encodeMemory('hello world')).rejects.toThrow(
      'Cannot encode memory: User PRI not set.',
    );
  });
});