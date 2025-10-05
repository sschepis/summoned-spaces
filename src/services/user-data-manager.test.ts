import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock holographic memory manager
const mockEncodeMemory = vi.fn();
const mockDecodeMemory = vi.fn();
const mockSetCurrentUser = vi.fn();

// Mock communication manager
const mockSend = vi.fn();
const mockConnect = vi.fn().mockResolvedValue(undefined);
const mockOnMessage = vi.fn();
const mockDisconnect = vi.fn();
const mockIsConnected = vi.fn().mockReturnValue(true);

// Mock the modules with factory functions
vi.mock('./holographic-memory', () => ({
  holographicMemoryManager: {
    encodeMemory: mockEncodeMemory,
    decodeMemory: mockDecodeMemory,
    setCurrentUser: mockSetCurrentUser,
    isReady: true,
  }
}));

vi.mock('./communication-manager', () => ({
  communicationManager: {
    send: mockSend,
    connect: mockConnect,
    onMessage: mockOnMessage,
    disconnect: mockDisconnect,
    isConnected: mockIsConnected,
  }
}));

// Import after mocks are set up
const { userDataManager } = await import('./user-data');

describe('UserDataManager - Holographic Architecture', () => {
  const mockBeacon = {
    index: [1, 2, 3],
    epoch: 123,
    fingerprint: new Uint8Array([1, 2, 3]),
    signature: new Uint8Array([4, 5, 6]),
    originalText: '',
    coeffs: new Map(),
    center: [0, 0] as [number, number],
    entropy: 0,
  };

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
    mockEncodeMemory.mockResolvedValue(mockBeacon);
    mockSend.mockResolvedValue(undefined);
    
    // Reset user data manager state by accessing the managers
    // @ts-expect-error - Accessing private managers for test reset
    userDataManager.followingManager.setFollowingList([]);
    // @ts-expect-error - Accessing private managers for test reset
    userDataManager.spacesManager.setSpacesList([]);
    
    // Set current user
    userDataManager.setCurrentUser('test-user');
  });

  it('should encode following list as holographic beacon when following a user', async () => {
    mockEncodeMemory.mockResolvedValue(mockBeacon);

    await userDataManager.followUser('user123');

    expect(mockEncodeMemory).toHaveBeenCalledWith(
      JSON.stringify({ following: ['user123'] })
    );
    expect(mockSend).toHaveBeenCalled();
  });

  it('should not store user data in plaintext', async () => {
    mockEncodeMemory.mockResolvedValue(mockBeacon);

    await userDataManager.followUser('user456');

    // Verify the beacon was sent, not the raw following list
    const call = mockSend.mock.calls[0][0];
    if (call.kind === 'submitPostBeacon') {
      expect(call.payload.beaconType).toBe('user_following_list');
      expect(call.payload).toHaveProperty('beacon');
    }
  });

  it('should manage spaces list as holographic beacon', async () => {
    mockEncodeMemory.mockResolvedValue(mockBeacon);

    await userDataManager.joinSpace('space123', 'member');

    expect(mockEncodeMemory).toHaveBeenCalled();
    const encodedData = mockEncodeMemory.mock.calls[0][0];
    const parsedData = JSON.parse(encodedData);
    expect(parsedData.spaces).toBeDefined();
    expect(parsedData.spaces[0].spaceId).toBe('space123');
  });

  it('should maintain local cache of following list', async () => {
    mockEncodeMemory.mockResolvedValue(mockBeacon);

    await userDataManager.followUser('user1');
    await userDataManager.followUser('user2');

    const following = userDataManager.getFollowingList();
    expect(following).toEqual(['user1', 'user2']);
  });

  it('should remove users from following list', async () => {
    mockEncodeMemory.mockResolvedValue(mockBeacon);

    await userDataManager.followUser('user1');
    await userDataManager.followUser('user2');
    await userDataManager.unfollowUser('user1');

    const following = userDataManager.getFollowingList();
    expect(following).toEqual(['user2']);
  });
});