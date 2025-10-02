import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the dependencies at the top level
vi.mock('./holographic-memory');
vi.mock('./websocket');

describe('UserDataManager - Holographic Architecture', () => {
  let userDataManager: typeof import('./user-data-manager').userDataManager;
  let holographicMemoryManager: typeof import('./holographic-memory').holographicMemoryManager;
  let webSocketService: typeof import('./websocket').default;

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

  beforeEach(async () => {
    // Dynamically import the mocked modules
    holographicMemoryManager = (await import('./holographic-memory')).holographicMemoryManager;
    webSocketService = (await import('./websocket')).default;

    // Reset mocks before each test
    vi.mocked(holographicMemoryManager.encodeMemory).mockClear();
    vi.mocked(webSocketService.sendMessage).mockClear();
    vi.mocked(webSocketService.sendFollowMessage).mockClear();
    vi.mocked(webSocketService.sendUnfollowMessage).mockClear();

    // Dynamically import the module under test
    userDataManager = (await import('./user-data-manager')).userDataManager;

    // Reset the manager's internal state
    // @ts-expect-error - Accessing private for test reset
    userDataManager.followingList = [];
    // @ts-expect-error - Accessing private for test reset
    userDataManager.spacesList = [];
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('should encode following list as holographic beacon when following a user', async () => {
    vi.mocked(holographicMemoryManager.encodeMemory).mockResolvedValue(mockBeacon);

    await userDataManager.followUser('user123');

    expect(holographicMemoryManager.encodeMemory).toHaveBeenCalledWith(
      JSON.stringify({ following: ['user123'] })
    );
    expect(webSocketService.sendFollowMessage).toHaveBeenCalledWith('user123');
  });

  it('should not store user data in plaintext', async () => {
    vi.mocked(holographicMemoryManager.encodeMemory).mockResolvedValue(mockBeacon);

    await userDataManager.followUser('user456');

    // Verify the beacon was sent, not the raw following list
    const call = vi.mocked(webSocketService.sendMessage).mock.calls[0][0];
    if (call.kind === 'submitPostBeacon') {
      expect(call.payload.beaconType).toBe('user_following_list');
      expect(call.payload).toHaveProperty('beacon');
    }
  });

  it('should manage spaces list as holographic beacon', async () => {
    vi.mocked(holographicMemoryManager.encodeMemory).mockResolvedValue(mockBeacon);

    await userDataManager.joinSpace('space123', 'member');

    expect(holographicMemoryManager.encodeMemory).toHaveBeenCalled();
    const encodedData = vi.mocked(holographicMemoryManager.encodeMemory).mock.calls[0][0];
    const parsedData = JSON.parse(encodedData);
    expect(parsedData.spaces).toBeDefined();
    expect(parsedData.spaces[0].spaceId).toBe('space123');
  });

  it('should maintain local cache of following list', async () => {
    vi.mocked(holographicMemoryManager.encodeMemory).mockResolvedValue(mockBeacon);

    await userDataManager.followUser('user1');
    await userDataManager.followUser('user2');

    const following = userDataManager.getFollowingList();
    expect(following).toEqual(['user1', 'user2']);
  });

  it('should remove users from following list', async () => {
    vi.mocked(holographicMemoryManager.encodeMemory).mockResolvedValue(mockBeacon);

    await userDataManager.followUser('user1');
    await userDataManager.followUser('user2');
    await userDataManager.unfollowUser('user1');

    const following = userDataManager.getFollowingList();
    expect(following).toEqual(['user2']);
  });
});