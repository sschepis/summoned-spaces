// TODO: Replace this with a proper import from the 'prdb' library
// once the projects are linked (e.g., via npm workspace).
export interface Beacon {
    index: number[];
    epoch: number;
    fingerprint: Uint8Array;
    signature: Uint8Array;
}

// Client -> Server Message Types
export interface RegisterMessage {
    kind: 'register';
    payload: {
        username: string;
        email: string;
        password: string;
    };
}

export interface LoginMessage {
    kind: 'login';
    payload: {
        username: string;
        password: string;
    };
}

export interface SubmitPostBeaconMessage {
    kind: 'submitPostBeacon';
    payload: {
        beacon: Beacon;
        beaconType?: string; // 'post', 'user_following_list', 'user_spaces_list', etc.
    };
}

export interface RequestTeleportMessage {
    kind: 'requestTeleport';
    payload: {
        targetUserId: string;
        memoryId: string; // Or some identifier for the memory
    };
}

export interface AcceptTeleportMessage {
    kind: 'acceptTeleport';
    payload: {
        sourceUserId: string;
        memoryId: string;
    };
}

export interface FollowMessage {
    kind: 'follow';
    payload: {
        userIdToFollow: string;
    };
}

export interface UnfollowMessage {
    kind: 'unfollow';
    payload: {
        userIdToUnfollow: string;
    };
}

export interface CreateSpaceMessage {
    kind: 'createSpace';
    payload: {
        name: string;
        description: string;
        isPublic: boolean;
    };
}

export interface SubmitCommentBeaconMessage {
    kind: 'submitCommentBeacon';
    payload: {
        postBeaconId: string;
        beacon: Beacon;
    };
}

export interface LikePostMessage {
    kind: 'likePost';
    payload: {
        postBeaconId: string;
    };
}

export interface GetPublicSpacesMessage {
    kind: 'getPublicSpaces';
}

export interface SearchMessage {
    kind: 'search';
    payload: {
        query: string;
        category: 'all' | 'people' | 'spaces' | 'posts';
    };
}

export interface GetBeaconsByUserMessage {
    kind: 'getBeaconsByUser';
    payload: {
        userId: string;
        beaconType?: string; // Optional filter by type (e.g., 'user_following_list', 'user_spaces_list')
    };
}

export interface GetBeaconByIdMessage {
    kind: 'getBeaconById';
    payload: {
        beaconId: string;
    };
}

export interface GetFollowersMessage {
    kind: 'getFollowers';
    payload: {
        userId: string;
    };
}

export interface GetFollowingMessage {
    kind: 'getFollowing';
    payload: {
        userId: string;
    };
}

export interface RestoreSessionMessage {
    kind: 'restoreSession';
    payload: {
        sessionToken: string;
        userId: string;
        pri: PrimeResonanceIdentity; // PrimeResonanceIdentity from the client
    };
}

// Quaternionic Chat Messages
export interface JoinQuaternionicChatRoomMessage {
    kind: 'joinQuaternionicChatRoom';
    payload: {
        roomId: string;
        participants: string[];
    };
}

export interface SendQuaternionicMessageMessage {
    kind: 'sendQuaternionicMessage';
    payload: {
        receiverId: string;
        content: string;
        roomId?: string;
    };
}

export interface SynchronizeQuaternionicPhasesMessage {
    kind: 'synchronizeQuaternionicPhases';
    payload: {
        targetUserId: string;
    };
}

export interface GetQuaternionicMessageHistoryMessage {
    kind: 'getQuaternionicMessageHistory';
    payload: {
        roomId: string;
        limit?: number;
    };
}

export interface GetQuaternionicRoomMetricsMessage {
    kind: 'getQuaternionicRoomMetrics';
    payload: {
        roomId: string;
    };
}

export interface AddFileMessage {
    kind: 'addFileToSpace';
    payload: {
        spaceId: string;
        fileName: string;
        fileType: string;
        fileSize: number;
        fingerprint: string;
        fileContent: string; // base64 encoded
    };
}

export interface RemoveFileMessage {
    kind: 'removeFileFromSpace';
    payload: {
        spaceId: string;
        fileId: string;
    };
}

export interface GetSpaceFilesMessage {
    kind: 'getSpaceFiles';
    payload: {
        spaceId: string;
    };
}

export interface DownloadFileMessage {
    kind: 'downloadFile';
    payload: {
        spaceId: string;
        fingerprint: string;
    };
}

export type ClientMessage = RegisterMessage | LoginMessage | SubmitPostBeaconMessage | RequestTeleportMessage | AcceptTeleportMessage | FollowMessage | UnfollowMessage | CreateSpaceMessage | SubmitCommentBeaconMessage | LikePostMessage | GetPublicSpacesMessage | SearchMessage | GetBeaconsByUserMessage | GetBeaconByIdMessage | GetFollowersMessage | GetFollowingMessage | RestoreSessionMessage | JoinQuaternionicChatRoomMessage | SendQuaternionicMessageMessage | SynchronizeQuaternionicPhasesMessage | GetQuaternionicMessageHistoryMessage | GetQuaternionicRoomMetricsMessage | AddFileMessage | RemoveFileMessage | GetSpaceFilesMessage | DownloadFileMessage;


// Server -> Client Message Types
export interface RegisterSuccessMessage {
    kind: 'registerSuccess';
    payload: {
        userId: string;
    };
}

import { PrimeResonanceIdentity, PublicResonance } from './identity';

export interface LoginSuccessMessage {
    kind: 'loginSuccess';
    payload: {
        sessionToken: string;
        userId: string;
        pri: PrimeResonanceIdentity;
    };
}

export interface SubmitPostSuccessMessage {
    kind: 'submitPostSuccess';
    payload: {
        postId: string;
        beaconId: string;
        timestamp: number;
    };
}

export interface ErrorMessage {
    kind: 'error';
    payload: {
        message: string;
        requestKind?: string;
    };
}

export interface NewPostBeaconMessage {
    kind: 'newPostBeacon';
    payload: {
        authorId: string;
        beacon: Beacon;
    };
}

export interface NetworkStateUpdateMessage {
    kind: 'networkStateUpdate';
    payload: {
        nodes: {
            userId: string;
            username: string;
            publicResonance: PublicResonance;
            connectionId: string;
        }[];
    };
}

export interface TeleportRequestMessage {
    kind: 'teleportRequest';
    payload: {
        fromUserId: string;
        memoryId: string;
    };
}

export interface TeleportAcceptedMessage {
    kind: 'teleportAccepted';
    payload: {
        targetUserId: string;
        memoryId: string;
    };
}

export interface CreateSpaceSuccessMessage {
    kind: 'createSpaceSuccess';
    payload: {
        spaceId: string;
        name: string;
    };
}

export interface SubmitCommentSuccessMessage {
    kind: 'submitCommentSuccess';
    payload: {
        commentId: string;
        postBeaconId: string;
    };
}

export interface LikePostSuccessMessage {
    kind: 'likePostSuccess';
    payload: {
        postBeaconId: string;
        liked: boolean;
    };
}

export interface PublicSpacesResponseMessage {
    kind: 'publicSpacesResponse';
    payload: {
        spaces: Array<{
            space_id: string;
            name: string;
            description: string;
            is_public: number;
            owner_id: string;
            created_at: string;
        }>;
    };
}

export interface SearchResponseMessage {
    kind: 'searchResponse';
    payload: {
        users: Array<{ user_id: string; username: string }>;
        spaces: Array<{ space_id: string; name: string; description: string }>;
        beacons: Array<{ beacon_id: string; author_id: string; username: string; created_at: string }>;
    };
}

export interface BeaconsResponseMessage {
    kind: 'beaconsResponse';
    payload: {
        beacons: Array<{
            beacon_id: string;
            beacon_type: string;
            author_id: string;
            username?: string;
            prime_indices: string; // JSON string
            epoch: number;
            fingerprint: Uint8Array;
            signature: Uint8Array;
            metadata: string | null;
            created_at: string;
        }>;
    };
}

export interface BeaconResponseMessage {
    kind: 'beaconResponse';
    payload: {
        beacon: {
            beacon_id: string;
            beacon_type: string;
            author_id: string;
            prime_indices: string; // JSON string
            epoch: number;
            fingerprint: Uint8Array;
            signature: Uint8Array;
            metadata: string | null;
            created_at: string;
        } | null;
    };
}

export interface FollowersResponseMessage {
    kind: 'followersResponse';
    payload: {
        followers: { userId: string, username: string }[];
    };
}

export interface FollowingResponseMessage {
    kind: 'followingResponse';
    payload: {
        following: { userId: string, username: string }[];
    };
}

export interface FollowSuccessMessage {
    kind: 'followSuccess';
    payload: {
        userIdToFollow: string;
    };
}

export interface UnfollowSuccessMessage {
    kind: 'unfollowSuccess';
    payload: {
        userIdToUnfollow: string;
    };
}

export interface FollowNotificationMessage {
    kind: 'followNotification';
    payload: {
        followerId: string;
        followerUsername: string;
        type: 'follow' | 'unfollow';
    };
}

export interface SessionRestoredMessage {
    kind: 'sessionRestored';
    payload: {
        userId: string;
        success: boolean;
    };
}

// Quaternionic Chat Response Messages
export interface QuaternionicRoomReadyMessage {
    kind: 'quaternionicRoomReady';
    payload: {
        roomId: string;
        participants: string[];
        phaseAlignment: number;
        entropyLevel: number;
    };
}

export interface QuaternionicMessageReceivedMessage {
    kind: 'quaternionicMessageReceived';
    payload: {
        messageId: string;
        senderId: string;
        receiverId: string;
        content: string;
        timestamp: number;
        phaseAlignment: number;
        entropyLevel: number;
        twistAngle: number;
        deliveryType: 'quantum' | 'traditional';
        isInstant: boolean;
    };
}

export interface PhaseSynchronizedMessage {
    kind: 'phaseSynchronized';
    payload: {
        user1Id: string;
        user2Id: string;
        synchronized: boolean;
        phaseAlignment: number;
        timestamp: number;
    };
}

export interface QuaternionicMessageHistoryResponseMessage {
    kind: 'quaternionicMessageHistoryResponse';
    payload: {
        messages: Array<{
            message_id: string;
            sender_id: string;
            receiver_id: string;
            content: string;
            room_id: string | null;
            phase_alignment: number;
            entropy_level: number;
            twist_angle: number;
            is_quantum_delivered: number;
            created_at: string;
        }>;
    };
}

export interface QuaternionicRoomMetricsResponseMessage {
    kind: 'quaternionicRoomMetricsResponse';
    payload: {
        metrics: {
            roomId: string;
            participantCount: number;
            messageCount: number;
            avgPhaseAlignment: number;
            avgEntropy: number;
            lastActivity: number;
        } | null;
    };
}

export interface SpaceFilesResponseMessage {
    kind: 'spaceFilesResponse';
    payload: {
        spaceId: string;
        files: {
            file_id: string;
            space_id: string;
            uploader_id: string;
            file_name: string;
            file_type: string;
            file_size: number;
            fingerprint: string;
            created_at: string;
        }[];
    };
}

export interface FileAddedToSpaceMessage {
    kind: 'fileAddedToSpace';
    payload: {
        spaceId: string;
        file: {
            file_id: string;
            space_id: string;
            uploader_id: string;
            file_name: string;
            file_type: string;
            file_size: number;
            fingerprint: string;
            created_at: string;
        };
    };
}

export interface FileRemovedFromSpaceMessage {
    kind: 'fileRemovedFromSpace';
    payload: {
        spaceId: string;
        fileId: string;
    };
}

export interface BeaconReceivedMessage {
    kind: 'beaconReceived';
    payload: {
        beaconId: string;
        senderId: string;
        beaconType: string;
        beacon: Beacon;
    };
}

export interface NewBeaconAvailableMessage {
    kind: 'newBeaconAvailable';
    payload: {
        authorId: string;
        beaconType: string;
        timestamp: number;
    };
}

export interface DownloadFileResponseMessage {
    kind: 'downloadFileResponse';
    payload: {
        fingerprint: string;
        content: string | null;
        success: boolean;
        error?: string;
    };
}

export type ServerMessage =
    | RegisterSuccessMessage
    | LoginSuccessMessage
    | ErrorMessage
    | SubmitPostSuccessMessage
    | NewPostBeaconMessage
    | NetworkStateUpdateMessage
    | TeleportRequestMessage
    | TeleportAcceptedMessage
    | CreateSpaceSuccessMessage
    | SubmitCommentSuccessMessage
    | LikePostSuccessMessage
    | PublicSpacesResponseMessage
    | SearchResponseMessage
    | BeaconsResponseMessage
    | BeaconResponseMessage
    | FollowersResponseMessage
    | FollowingResponseMessage
    | FollowSuccessMessage
    | UnfollowSuccessMessage
    | FollowNotificationMessage
    | SessionRestoredMessage
    | QuaternionicRoomReadyMessage
    | QuaternionicMessageReceivedMessage
    | PhaseSynchronizedMessage
    | QuaternionicMessageHistoryResponseMessage
    | QuaternionicRoomMetricsResponseMessage
    | SpaceFilesResponseMessage
    | FileAddedToSpaceMessage
    | FileRemovedFromSpaceMessage
    | BeaconReceivedMessage
    | NewBeaconAvailableMessage
    | DownloadFileResponseMessage;