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

export type ClientMessage = RegisterMessage | LoginMessage | SubmitPostBeaconMessage | RequestTeleportMessage | AcceptTeleportMessage | FollowMessage | CreateSpaceMessage | SubmitCommentBeaconMessage | LikePostMessage | GetPublicSpacesMessage | SearchMessage;


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
        beacons: Array<{ beacon_id: string; author_id: string }>;
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
    | SearchResponseMessage;