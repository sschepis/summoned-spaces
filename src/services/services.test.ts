import { describe, it, expect, vi, afterEach } from 'vitest';
import { holographicMemoryManager, PrimeResonanceIdentity } from './holographic-memory';

// Mock the wasm module import
vi.mock('../../../summoned-spaces/resolang/build/resolang.js', () => ({
  createHolographicEncoding: vi.fn(() => ({})),
  holographicEncodingEncode: vi.fn(() => 1.0), // Return amplitude
  generatePrimes: vi.fn((count: number) => {
    // Generate mock prime numbers
    return Array.from({ length: count }, (_, i) => i * 2 + 1);
  }),
}));


describe('Client-Side Services', () => {
  afterEach(() => {
    vi.clearAllMocks();
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

    expect(fragment).toBeDefined();
    expect(fragment!.signature).toBeInstanceOf(Uint8Array);
    expect(fragment!.signature.length).toBeGreaterThan(0);
    expect(fragment!.fingerprint).toBeInstanceOf(Uint8Array);
    expect(fragment!.index).toBeInstanceOf(Array);
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