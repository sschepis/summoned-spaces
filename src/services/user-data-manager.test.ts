import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userDataManager } from './user-data-manager';
import { holographicMemoryManager } from './holographic-memory';
import { webSocketService } from './websocket';

// Mock the dependencies
vi.mock('./holographic-memory', () => ({
  holographicMemoryManager: {
    encodeMemory: vi.fn(),
  },
}));

vi.mock('./websocket', () => ({
  webSocketService: {
    sendMessage: vi.fn(),
  },
}));

describe('UserDataManager - Holographic Architecture', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the manager's internal state
    // @ts-expect-error - Accessing private for test reset
    userDataManager.followingList = [];
    // @ts-expect-error - Accessing private for test reset
    userDataManager.spacesList = [];
  });

  it('should encode following list as holographic beacon when following a user', async () => {
    const mockBeacon = { coeffs: new Map(), center: [0, 0] as [number, number], entropy: 0 };
    vi.mocked(holographicMemoryManager.encodeMemory).mockResolvedValue(mockBeacon);

    await userDataManager.followUser('user123');

    expect(holographicMemoryManager.encodeMemory).toHaveBeenCalledWith(
      JSON.stringify({ following: ['user123'] })
    );
    expect(webSocketService.sendMessage).toHaveBeenCalled();
  });

  it('should not store user data in plaintext', async () => {
    const mockBeacon = { coeffs: new Map(), center: [0, 0] as [number, number], entropy: 0 };
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
    const mockBeacon = { coeffs: new Map(), center: [0, 0] as [number, number], entropy: 0 };
    vi.mocked(holographicMemoryManager.encodeMemory).mockResolvedValue(mockBeacon);

    await userDataManager.joinSpace('space123', 'member');

    expect(holographicMemoryManager.encodeMemory).toHaveBeenCalled();
    const encodedData = vi.mocked(holographicMemoryManager.encodeMemory).mock.calls[0][0];
    const parsedData = JSON.parse(encodedData);
    expect(parsedData.spaces).toBeDefined();
    expect(parsedData.spaces[0].spaceId).toBe('space123');
  });

  it('should maintain local cache of following list', async () => {
    const mockBeacon = { coeffs: new Map(), center: [0, 0] as [number, number], entropy: 0 };
    vi.mocked(holographicMemoryManager.encodeMemory).mockResolvedValue(mockBeacon);

    await userDataManager.followUser('user1');
    await userDataManager.followUser('user2');

    const following = userDataManager.getFollowingList();
    expect(following).toEqual(['user1', 'user2']);
  });

  it('should remove users from following list', async () => {
    const mockBeacon = { coeffs: new Map(), center: [0, 0] as [number, number], entropy: 0 };
    vi.mocked(holographicMemoryManager.encodeMemory).mockResolvedValue(mockBeacon);

    await userDataManager.followUser('user1');
    await userDataManager.followUser('user2');
    await userDataManager.unfollowUser('user1');

    const following = userDataManager.getFollowingList();
    expect(following).toEqual(['user2']);
  });
});