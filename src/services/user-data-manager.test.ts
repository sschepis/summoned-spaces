import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the dependencies at the top level
vi.mock('./holographic-memory');
vi.mock('./communication-manager');

describe('UserDataManager - Holographic Architecture', () => {
  let userDataManager: typeof import('./user-data').userDataManager;
  let holographicMemoryManager: typeof import('./holographic-memory').holographicMemoryManager;
  let communicationManager: typeof import('./communication-manager').communicationManager;

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
    communicationManager = (await import('./communication-manager')).communicationManager;

    // Reset mocks before each test
    vi.mocked(holographicMemoryManager.encodeMemory).mockClear();
    vi.mocked(communicationManager.send).mockClear();

    // Dynamically import the module under test
    userDataManager = (await import('./user-data')).userDataManager;

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
    expect(communicationManager.send).toHaveBeenCalled();
  });

  it('should not store user data in plaintext', async () => {
    vi.mocked(holographicMemoryManager.encodeMemory).mockResolvedValue(mockBeacon);

    await userDataManager.followUser('user456');

    // Verify the beacon was sent, not the raw following list
    const call = vi.mocked(communicationManager.send).mock.calls[0][0];
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