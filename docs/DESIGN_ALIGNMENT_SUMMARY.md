# Design Alignment Summary - Summoned Spaces

**Generated**: 2025-10-05  
**Status**: Analysis Phase  
**Purpose**: Complete extraction of design requirements for systematic code alignment

---

## Executive Overview

Summoned Spaces is a quantum-inspired collaborative platform with:
- Virtual shared spaces for file collaboration
- Prime-resonant data synchronization (non-local channels)
- Multi-layered communication (Traditional + Quantum + Holographic)
- Zero-knowledge architecture for privacy

---

## 1. API Endpoints Specification

### 1.1 Space Management Endpoints

| Method | Endpoint | Body/Query | Response | Design Ref |
|--------|----------|------------|----------|------------|
| POST | `/api/spaces` | `SpaceCreationParams` | `Space` | design.md:311-313 |
| GET | `/api/spaces` | `{ visibility?, memberOf?, search? }` | `Space[]` | design.md:315-317 |
| GET | `/api/spaces/:spaceId` | - | `Space` | design.md:319-320 |
| PUT | `/api/spaces/:spaceId` | `Partial<SpaceUpdateParams>` | `Space` | design.md:322-324 |
| DELETE | `/api/spaces/:spaceId` | - | `{ success: boolean }` | design.md:326-327 |

### 1.2 Volume Operations Endpoints

| Method | Endpoint | Body/Query | Response | Design Ref |
|--------|----------|------------|----------|------------|
| POST | `/api/spaces/:spaceId/volumes` | `VolumeCreationParams` | `VirtualVolume` | design.md:329-331 |
| GET | `/api/spaces/:spaceId/volumes` | - | `VirtualVolume[]` | design.md:333-334 |
| POST | `/api/volumes/:volumeId/contribute` | `{ filePath: string }` | `FileContribution` | design.md:336-338 |
| GET | `/api/volumes/:volumeId/files` | - | `FileEntry[]` | design.md:340-341 |
| POST | `/api/volumes/:volumeId/summon/:fileName` | - | `{ transmissionId, status, progress }` | design.md:343-348 |

### 1.3 Member Management Endpoints

| Method | Endpoint | Body/Query | Response | Design Ref |
|--------|----------|------------|----------|------------|
| POST | `/api/spaces/:spaceId/join` | `{ inviteCode?: string }` | `SpaceMember` | design.md:350-352 |
| GET | `/api/spaces/:spaceId/members` | - | `SpaceMember[]` | design.md:354-355 |
| PUT | `/api/spaces/:spaceId/members/:userId` | `{ role?, permissions? }` | `SpaceMember` | design.md:357-359 |
| POST | `/api/spaces/:spaceId/invite` | `{ email?, role?, expiresIn? }` | `{ inviteCode, inviteUrl }` | design.md:361-363 |

### 1.4 Communication Endpoints

| Method | Endpoint | Body/Query | Response | Design Ref |
|--------|----------|------------|----------|------------|
| GET | `/v1/events` | `?userId=...` | SSE Stream | comm-arch.md:74-89 |
| POST | `/v1/messages` | `{ kind, payload, ... }` | Message Response | comm-arch.md:96-131 |
| POST | `/api/poll-messages` | `{ userId, lastMessageTime }` | `{ messages[], count }` | comm-arch.md:261-305 |

---

## 2. Data Structures

### 2.1 Core Interfaces

#### SpaceCreationParams
```typescript
interface SpaceCreationParams {
  name: string;
  description: string;
  visibility: 'public' | 'private' | 'invite-only';
  resonanceConfig: {
    primeCount: number;      // Default: 32
    quantization: number;    // Default: 64
    epochDuration: number;   // Default: 2000ms
  };
  memberPolicy: {
    maxMembers: number;
    requireApproval: boolean;
    defaultPermissions: Permission[];
  };
}
```
**Design Ref**: design.md:77-91

#### Space
```typescript
interface Space {
  id: string;  // generateSpaceId()
  name: string;
  description: string;
  visibility: 'public' | 'private' | 'invite-only';
  resonanceChannel: Channel;
  createdAt: Date;
  creator: User;
  memberPolicy: MemberPolicy;
  // ... additional fields
}
```
**Design Ref**: design.md:108-117

#### VirtualVolume
```typescript
interface VirtualVolume {
  id: string;
  spaceId: string;
  name: string;
  description?: string;
  resonanceSignature: Uint8Array;
  contributors: Set<string>;
  files: Map<string, FileEntry>;
  syncRules: SyncRule[];
  accessPolicy: AccessPolicy;
}
```
**Design Ref**: design.md:120-130

#### SpaceMember
```typescript
interface SpaceMember {
  userId: string;
  spaceId: string;
  role: 'owner' | 'admin' | 'contributor' | 'viewer';
  joinedAt: Date;
  permissions: Permission[];
  resonanceKeys: {
    phaseKey: Uint8Array;
    accessLevel: number;
  };
}
```
**Design Ref**: design.md:259-269

#### Permission Enum
```typescript
enum Permission {
  VIEW_SPACE = 'view_space',
  VIEW_VOLUMES = 'view_volumes',
  CONTRIBUTE_FILES = 'contribute_files',
  SUMMON_FILES = 'summon_files',
  MANAGE_MEMBERS = 'manage_members',
  MANAGE_VOLUMES = 'manage_volumes',
  DELETE_FILES = 'delete_files',
  ADMIN = 'admin'
}
```
**Design Ref**: design.md:466-475

### 2.2 Communication Message Types

#### Client to Server Events
```typescript
interface ClientEvents {
  'subscribe:space': { spaceId: string };
  'subscribe:volume': { volumeId: string };
  'request:summon': { volumeId: string, fileName: string };
  'probe:update': { transmissionId: string, probeState: ProbeState };
}
```
**Design Ref**: design.md:365-371

#### Server to Client Events
```typescript
interface ServerEvents {
  'space:updated': { space: Space };
  'volume:fileAdded': { volumeId: string, file: FileEntry };
  'beacon:broadcast': { volumeId: string, beacon: Beacon };
  'summon:progress': { 
    transmissionId: string,
    progress: number,
    resonance: number,
    entropy: number
  };
  'summon:complete': {
    transmissionId: string,
    fileName: string,
    size: number
  };
}
```
**Design Ref**: design.md:373-389

---

## 3. Communication Architecture Requirements

### 3.1 Layer 1: Server Endpoints

**SSE Endpoint** (`/v1/events`):
- Long-lived HTTP connection
- Content-Type: `text/event-stream`
- Cache-Control: `no-cache`
- Connection: `keep-alive`
- Ping every 30 seconds
- Graceful ECONNRESET handling
**Design Ref**: comm-arch.md:531-538

**REST Endpoint** (`/v1/messages`):
- Processes all message types
- Returns immediate responses
- Can queue notifications for SSE delivery
- Includes embedded notifications as fallback
**Design Ref**: comm-arch.md:539-544

**Polling Endpoint** (`/api/poll-messages`):
- For Vercel deployments
- Returns messages since lastMessageTime
- Cleans up old messages
**Design Ref**: comm-arch.md:261-305

### 3.2 Layer 2: Transport Components

**Communication Manager**:
- EventSource for receiving (server → client)
- Fetch POST to /v1/messages for sending (client → server)
- Session management (sessionToken, userId in localStorage)
- Reconnection: Exponential backoff 5s, 10s, 20s, 40s, 80s
- Maximum 5 reconnection attempts
- Falls back to REST-only after max attempts
**Design Ref**: comm-arch.md:486-504

**Vercel Realtime Manager**:
- Base interval: 2 seconds
- Max interval: 10 seconds
- Backoff multiplier: 1.5x per empty response
- Resets to fast polling on message receipt
- Immediate poll after user sends message
**Design Ref**: comm-arch.md:505-515

### 3.3 Layer 3: Quantum Network

**Entanglement Requirements**:
- Phase alignment: `targetPhase = (φ₁ + φ₂) / 2`
- Entanglement strength: `ε = avgCoherence × e^(-|φ₁-φ₂|)`
- Minimum strength: ε ≥ 0.5 for teleportation
**Design Ref**: comm-arch.md:559-570

**Teleportation Requirements**:
- Entanglement strength ≥ 0.5
- Fidelity > 0.8 for success
- Fidelity calculation: `f = coherence(target) × ε`
- State updates:
  - `coherence(source) -= 0.05`
  - `coherence(target) += ε × 0.1`
**Design Ref**: comm-arch.md:571-584

### 3.4 Three-Tier Fallback Strategy

1. **Quantum Teleportation** (instant, P2P, requires entanglement)
2. **Holographic Beacon** (client-side encoded, server-stored)
3. **Standard REST/SSE** (traditional client-server)

**Design Ref**: comm-arch.md:596-614

---

## 4. Authentication Requirements

### 4.1 User Registration
- Username validation
- Password hashing (per-user salts)
- PRI (Personal Resonance Identity) generation
- User ID format: `user_` prefix

### 4.2 Login Flow
1. Validate credentials
2. Hash password with user's salt
3. Compare with stored hash
4. Generate session token on success
5. Return session + user data

### 4.3 Session Management
- Session token storage in localStorage
- Include sessionToken and userId in all requests
- Session restoration on page reload
- Logout cleanup

---

## 5. Space Management Requirements

### 5.1 Space Creation Flow

**Steps**:
1. Generate space-specific prime set
2. Create resonance channel for space
3. Initialize space metadata
4. Set creator as owner with role='owner'
5. Return space object

**Design Ref**: design.md:76-118

### 5.2 Member Joining Flow

**Steps**:
1. Validate invite or check if space is public
2. Validate invite code (if provided)
3. Generate member-specific resonance keys
4. Create membership with default role='contributor'
5. Register member with space
6. Sync existing volume beacons to new member
7. Return membership

**Critical**: Must create member beacon with role on join
**Design Ref**: design.md:272-306

### 5.3 Member Roles and Permissions

**Roles**:
- `owner`: Creator of the space, full control
- `admin`: Can manage members and settings
- `contributor`: Can add files and content (default for joiners)
- `viewer`: Read-only access

**Design Ref**: design.md:259-269

---

## 6. Volume and File Management

### 6.1 Volume Creation
1. Derive volume-specific resonance parameters
2. Generate resonance signature
3. Initialize with creator as contributor
4. Register volume with space

**Design Ref**: design.md:132-155

### 6.2 File Contribution
1. Read file data
2. Encode file using volume's resonance parameters
3. Create file contribution record
4. Store beacon (not file data)
5. Broadcast beacon to volume members

**Design Ref**: design.md:157-180

### 6.3 File Summoning (Non-Local Access)
1. Check member permissions
2. Retrieve beacon from volume
3. Synthesize probe state using member's keys
4. Attempt resonance lock
5. Reconstruct file from locked state

**Design Ref**: design.md:182-256

---

## 7. Testing Requirements

### 7.1 Unit Testing Needs

**Authentication**:
- Password validation
- Session creation
- Token generation
- Error handling

**Space Management**:
- Space creation
- Owner role assignment
- Member management
- Permission validation

**Communication**:
- Message sending
- SSE connection
- Reconnection logic
- Polling fallback

### 7.2 Integration Testing Needs

**Complete Flows**:
- User registration → login → create space → join space
- Create space → post content → verify delivery
- SSE connection → disconnect → reconnect
- Quantum teleportation → holographic fallback

### 7.3 Manual Testing Scenarios

**Authentication Tests**:
- Register new user
- Login with correct password
- Login with wrong password
- Logout
- Session restoration

**Space Tests**:
- Create space → verify ownership
- Join space → verify membership
- Post to space → verify delivery
- Leave space → verify removal

---

## 8. Critical Alignment Points

### 8.1 HIGH Priority (Must Fix)

1. **Space Creation**: Must set role='owner' for creator
2. **Member Join**: Must create member beacon with role
3. **Session Management**: Include sessionToken in all requests
4. **SSE Connection**: Proper initialization with userId
5. **Message Format**: Match design specification exactly

### 8.2 MEDIUM Priority (Should Fix)

1. **Permission System**: Implement full permission checks
2. **Reconnection Logic**: Exponential backoff per spec
3. **Error Handling**: Graceful degradation
4. **Volume Management**: Complete resonance integration

### 8.3 LOW Priority (Nice to Have)

1. **Quantum Features**: Full quantum teleportation
2. **Holographic Encoding**: Complete implementation
3. **Performance Optimization**: Parallel resonance locking
4. **Advanced Features**: Semantic summoning, cross-space bridges

---

## 9. File Mapping

### 9.1 Client-Side Files

**Core Services**:
- `src/services/communication-manager.ts` - SSE + REST communication
- `src/services/vercel-realtime-manager.ts` - Intelligent polling
- `src/services/messaging.ts` - Message handling
- `src/services/space-manager/index.ts` - Space operations
- `src/services/user-data/index.ts` - User data management

**Quantum Services**:
- `src/services/quantum/index.ts` - Quantum operations
- `src/services/quantum/entanglement.ts` - Entanglement manager
- `src/services/quantum/teleportation.ts` - Teleportation manager
- `src/services/holographic-memory/encoder.ts` - Holographic encoding
- `src/services/holographic-memory/decoder.ts` - Holographic decoding

**Context & State**:
- `src/contexts/AuthContext.tsx` - Authentication state
- `src/contexts/NetworkContext.tsx` - Network state

### 9.2 Server-Side Files

**API Endpoints**:
- `api/events.ts` - SSE endpoint
- `api/messages.ts` - REST message handler
- `api/poll-messages.ts` - Polling endpoint
- `api/auth/login.ts` - Authentication

---

## 10. Next Steps

1. **Map Current Implementation**: Compare each file to design spec
2. **Create Gap Analysis Table**: Document all deviations
3. **Identify Testing Gaps**: List missing test coverage
4. **Prioritize Changes**: Order by criticality
5. **Begin Incremental Alignment**: One change at a time with validation

---

## References

- **design.md**: Primary design specification
- **communication-architecture.md**: Communication patterns and flows
- **README.md**: Overview and quick reference

---

**Document Status**: ✅ Complete - Ready for Gap Analysis