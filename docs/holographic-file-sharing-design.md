# Holographic Space File Sharing Architecture

This document outlines an enhanced design that moves the file list for a Space into holographic storage, leveraging our existing beacon and quaternionic communication infrastructure.

## 1. Core Principles

*   **Decentralized File Index**: Instead of a centralized `files` table in the database, the list of files in a Space will be stored in a special `space_file_index` beacon. This beacon is associated with the Space and is updated by its members.
*   **Holographic Truth**: The `space_file_index` beacon becomes the single source of truth for the contents of a Space's Volume. The local database will act as a cache for this holographic data.
*   **Quaternionic Consensus**: Changes to the file index (adding or removing files) will be proposed and validated by members of the Space using a quaternionic consensus mechanism. This ensures that only authorized members can modify the Space's contents.
*   **Real-time Synchronization**: All members of a Space will be subscribed to updates for the `space_file_index` beacon. When the beacon is updated, all members will receive the new file list in real-time.

## 2. Data Model & Schema Changes

### `files` Table (Cache Only)

The `files` table will now serve as a local cache of the file metadata retrieved from the `space_file_index` beacon. Its schema will remain the same, but its role changes from the source of truth to a performance optimization.

### `beacons` Table

We will introduce two new `beacon_type` enum values:

*   `space_file_index`: A beacon that contains the list of all files in a Space. There will be one such beacon per Space, which is updated over time.
*   `file_metadata`: A beacon for each individual file, containing its detailed metadata.

## 3. Backend Architecture

### `SpaceManager` (`server/spaces.ts`)

The `SpaceManager` will be updated to manage the `space_file_index` beacon.

```typescript
// in server/spaces.ts

export class SpaceManager {
    // ... existing methods

    async addFileToSpace(spaceId: string, uploaderId: string, fileInfo: { ... }): Promise<void> {
        // 1. Create a new 'file_metadata' beacon for the file.
        // 2. Retrieve the current 'space_file_index' beacon.
        // 3. Decode the beacon, add the new file's metadata, and re-encode it.
        // 4. Submit the updated 'space_file_index' beacon.
        // 5. The server will then broadcast this updated beacon to all space members.
    }

    async removeFileFromSpace(spaceId: string, removerId: string, fileId: string): Promise<void> {
        // 1. Verify that 'removerId' has permission to remove files.
        // 2. Retrieve the 'space_file_index' beacon.
        // 3. Decode, remove the file metadata, and re-encode.
        // 4. Submit the updated beacon.
    }

    async getSpaceFileIndex(spaceId: string): Promise<any> {
        // Retrieve the latest 'space_file_index' beacon for the space.
    }
}
```

### WebSocket Protocol (`server/protocol.ts`)

The WebSocket messages will be simplified, as the client will now primarily interact with the holographic beacons.

```typescript
// Client -> Server
export interface UpdateSpaceFileIndexMessage {
    kind: 'updateSpaceFileIndex';
    payload: {
        spaceId: string;
        updatedIndexBeacon: Beacon; // The new, proposed file index
    };
}

// Server -> Client
export interface SpaceFileIndexUpdateMessage {
    kind: 'spaceFileIndexUpdate';
    payload: {
        spaceId: string;
        fileIndexBeacon: Beacon;
    };
}
```

## 4. Frontend Design

### `FileExplorer` Component (`src/components/FileExplorer.tsx`)

The `FileExplorer` will be updated to fetch and decode the `space_file_index` beacon.

```typescript
// in src/components/FileExplorer.tsx

useEffect(() => {
    const fetchFileIndex = async () => {
        await waitForAuth();
        // Request the file index beacon from the server or a peer
        const fileIndexBeacon = await beaconCacheManager.getBeacon(spaceId, 'space_file_index');
        if (fileIndexBeacon) {
            const decodedIndex = await holographicMemoryManager.decodeMemory(fileIndexBeacon);
            setFiles(JSON.parse(decodedIndex));
        }
    };
    fetchFileIndex();

    const handleFileIndexUpdate = (message: any) => {
        if (message.kind === 'spaceFileIndexUpdate' && message.payload.spaceId === spaceId) {
            const decodedIndex = await holographicMemoryManager.decodeMemory(message.payload.fileIndexBeacon);
            setFiles(JSON.parse(decodedIndex));
        }
    };

    webSocketService.addMessageListener(handleFileIndexUpdate);
    return () => webSocketService.removeMessageListener(handleFileIndexUpdate);
}, [spaceId, waitForAuth]);
```

### User Flow for Adding a File

1.  A user drags a file into the `FileUploadZone`.
2.  The frontend creates a `file_metadata` beacon for the new file.
3.  The frontend fetches the current `space_file_index` beacon, decodes it, adds the new file's metadata, and re-encodes it.
4.  The user's client proposes this new `space_file_index` beacon to the other members of the space via a quaternionic consensus message.
5.  If consensus is reached, the new beacon is submitted to the network.
6.  All members receive the updated `space_file_index` beacon and refresh their file lists.

## 5. Advantages of this Design

*   **Decentralization**: The file list is no longer stored in a central database, but in a distributed, holographic beacon.
*   **Verifiability**: All changes to the file list are cryptographically signed and auditable through the chain of beacons.
*   **Resilience**: The file list can be reconstructed from the beacon chain even if the central server is offline.
*   **Real-time**: Quaternionic synchronization ensures that all members have a consistent, up-to-date view of the Space's Volume.

This design represents a significant step towards a truly decentralized and user-sovereign system, fully embracing the holographic and quaternionic principles of our architecture.
