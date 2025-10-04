# Service Initialization Bug Fix

## Problem

The "Create Space" button was stuck showing "Initializing..." indefinitely because the service initialization Promise chain in AuthContext was hanging. After 10 seconds, a timeout error would occur:

```
[AUTH] SERVICE INITIALIZATION FAILED: Error: Service initialization timeout after 10 seconds
```

## Root Cause

During the refactoring process, we migrated from WebSocket-based communication to SSE (Server-Sent Events). However, three critical initialization methods still contained code that waited for WebSocket responses that would never arrive:

### 1. `userDataManager.loadUserData()`
**Location:** `src/services/user-data/index.ts`

**Issue:** The method was calling:
- `await webSocketService.waitForConnection()` 
- A retry loop waiting for `webSocketService.isReady()`

Both of these would hang because the WebSocket service was deprecated and no longer functional.

### 2. `beaconCacheManager.preloadUserBeacons()`
**Location:** `src/services/beacon-cache/cache-core.ts`

**Issue:** Called `getBeaconsByUser()` which sent a WebSocket request and waited for a `beaconsResponse` message that would never arrive.

### 3. `spaceManager.initializeForUser()`
**Location:** `src/services/space-manager/index.ts`

**Issue:** Called `loadUserSpaces()` which used `beaconCacheManager.getBeaconsByType()` - another WebSocket request waiting for a response.

## Solution

All three methods have been converted to lightweight operations that acknowledge the SSE architecture:

### 1. `userDataManager.loadUserData()`
```typescript
async loadUserData(): Promise<void> {
  if (!this.currentUserId) {
    console.error('Cannot load user data: currentUserId not set');
    return;
  }

  try {
    // The WebSocket service is deprecated, we're using SSE now
    // Just proceed with loading the data
    console.log('[UserDataManager] Loading user data for:', this.currentUserId);

    // Load following list
    await this.loadFollowingList();
    
    // Load spaces list
    await this.loadSpacesList();
    
    console.log('[UserDataManager] User data loaded successfully');
    
  } catch (error) {
    console.error('[UserDataManager] Failed to load user data:', error);
    throw error;
  }
}
```

### 2. `beaconCacheManager.preloadUserBeacons()`
```typescript
async preloadUserBeacons(userId: string): Promise<void> {
  console.log(`[BeaconCache] Skipping preload for user ${userId} (SSE handles beacon loading)`);
  // No-op: SSE will populate the cache via real-time events
  return Promise.resolve();
}
```

### 3. `spaceManager.loadUserSpaces()`
```typescript
private async loadUserSpaces(userId: string): Promise<void> {
  console.log(`[SpaceManager] Skipping space loading for user ${userId} (SSE handles space data)`);
  // No-op: SSE will populate the cache via real-time events
  return Promise.resolve();
}
```

## Impact

- **Before:** Service initialization hung indefinitely, preventing any user actions
- **After:** Service initialization completes immediately, allowing normal application flow
- **Side Effect:** Beacon cache is now populated exclusively via SSE events rather than upfront loading
- **Benefit:** Faster initial load time and more reactive data updates

## Testing

After deployment, verify that:
1. Login/session restoration completes successfully
2. "Create Space" button works without hanging
3. Console shows proper initialization logs:
   - `[UserDataManager] Loading user data for: [userId]`
   - `[BeaconCache] Skipping preload for user [userId] (SSE handles beacon loading)`
   - `[SpaceManager] Skipping space loading for user [userId] (SSE handles space data)`
   - `[AUTH] All services initialized successfully`

## Files Modified

- `src/services/user-data/index.ts` - Removed WebSocket connection wait
- `src/services/beacon-cache/cache-core.ts` - Converted preload to no-op
- `src/services/space-manager/index.ts` - Converted space loading to no-op and removed unused imports

## Commit

```
fix: Remove WebSocket dependencies from service initialization

- Convert userDataManager.loadUserData() to skip deprecated WebSocket calls
- Convert beaconCacheManager.preloadUserBeacons() to no-op (SSE handles beacon loading)
- Convert spaceManager.loadUserSpaces() to no-op (SSE handles space data)
- Remove unused imports from space-manager
- All three methods were hanging the initialization Promise chain
- SSE now handles all real-time data loading
```

## Future Considerations

1. **WebSocket Removal:** The WebSocket service should be fully deprecated and removed from the codebase
2. **SSE Event Handlers:** Ensure all necessary SSE event handlers are in place to populate caches
3. **Error Handling:** Add proper error handling for SSE connection failures
4. **Cache Warming:** Consider implementing an SSE-based cache warming strategy if needed