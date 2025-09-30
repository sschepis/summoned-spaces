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

export type ClientMessage = RegisterMessage | LoginMessage | SubmitPostBeaconMessage | RequestTeleportMessage | AcceptTeleportMessage;


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

export type ServerMessage =
    | RegisterSuccessMessage
    | LoginSuccessMessage
    | ErrorMessage
    | SubmitPostSuccessMessage
    | NewPostBeaconMessage
    | NetworkStateUpdateMessage
    | TeleportRequestMessage
    | TeleportAcceptedMessage;