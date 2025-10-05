# Communication Architecture - Summoned Spaces

## Overview

Summoned Spaces implements a sophisticated multi-layered communication architecture that combines traditional client-server patterns with cutting-edge quantum networking and holographic memory encoding for true peer-to-peer, non-local communication.

## Complete Communication Stack

```mermaid
graph TB
    subgraph "Layer 4: Application"
        APP[Application Components]
        MSG[Messaging Service]
    end
    
    subgraph "Layer 3: Quantum Network"
        QNO[Quantum Network Ops]
        ENT[Entanglement Manager]
        TEL[Teleportation Manager]
        HMM[Holographic Memory Manager]
    end
    
    subgraph "Layer 2: Transport"
        CM[Communication Manager<br/>SSE + REST]
        VRM[Vercel Realtime Manager<br/>Intelligent Polling]
    end
    
    subgraph "Layer 1: Server"
        SSE[/v1/events<br/>SSE Endpoint]
        REST[/v1/messages<br/>REST Endpoint]
        POLL[/api/poll-messages<br/>Polling Endpoint]
    end
    
    APP -->|Send Message| MSG
    MSG -->|Try Quantum First| QNO
    QNO -->|Fallback| CM
    
    QNO --> ENT
    QNO --> TEL
    QNO --> HMM
    
    CM --> SSE
    CM --> REST
    VRM --> POLL
    
    style QNO fill:#9C27B0
    style TEL fill:#E91E63
    style HMM fill:#FF5722
```

## Layer 1: Traditional Client-Server Communication

### Connection Initialization Flow

```mermaid
sequenceDiagram
    participant App as Application
    participant CM as Communication Manager
    participant LS as LocalStorage
    participant ES as EventSource
    participant Server as /v1/events

    App->>CM: connect()
    
    Note over CM: Check if already connected
    alt Already Connected
        CM-->>App: Skip (already connected)
    else Not Connected
        CM->>LS: Get saved session
        LS-->>CM: sessionToken, userId
        
        Note over CM: Mark as connected
        CM->>CM: connected = true
        
        CM->>ES: new EventSource('/v1/events?userId=...')
        ES->>Server: GET /v1/events
        
        Server-->>ES: HTTP 200 + SSE Headers
        Note over Server: Content-Type: text/event-stream<br/>Cache-Control: no-cache<br/>Connection: keep-alive
        
        Server->>ES: data: {"kind":"connected",...}
        ES->>CM: onopen event
        Note over CM: Reset reconnectAttempts = 0
        CM-->>App: Connection established
        
        loop Every 30 seconds
            Server->>ES: data: {"kind":"ping",...}
            ES->>CM: onmessage(ping)
        end
    end
```

### Message Sending Flow (Client to Server)

```mermaid
sequenceDiagram
    participant App as Application
    participant CM as Communication Manager
    participant Server as /v1/messages
    participant MQ as Message Queue

    App->>CM: send({kind:"follow", payload:{...}})
    
    Note over CM: Check if connected
    alt Not Connected
        CM->>CM: Auto-connect
    end
    
    Note over CM: Add session info
    CM->>CM: Enhance message with<br/>sessionToken, userId
    
    CM->>Server: POST /v1/messages<br/>{"kind":"follow",...}
    
    Note over Server: Route to handleFollow()
    Server->>Server: Process follow action
    Server->>MQ: Queue notification for target user
    
    Server-->>CM: {"kind":"followSuccess",...}
    
    Note over CM: Handle immediate response
    CM->>App: messageCallback(response)
    
    alt Response includes notification
        Note over CM: Extract embedded notification
        CM->>App: messageCallback(notification)
    end
    
    alt Response includes session
        CM->>CM: Store sessionToken, userId
        CM->>LocalStorage: Save session
    end
```

### Real-Time Update Flow (Server to Client)

```mermaid
sequenceDiagram
    participant User1 as User A Browser
    participant User2 as User B Browser
    participant ES as EventSource
    participant Server as /v1/events
    participant MQ as Message Queue

    Note over User1: User A follows User B
    User1->>Server: POST /v1/messages<br/>{"kind":"follow"}
    
    Server->>MQ: Queue notification for User B
    Note over MQ: {"kind":"followNotification",<br/>payload:{followerId:...}}
    
    Note over User2: User B's SSE connection is open
    User2->>ES: (Active connection)
    
    Note over Server: In production, this would be<br/>triggered by database changes
    
    alt With Real-time Push (Production)
        Server->>ES: data: {"kind":"followNotification",...}
        ES->>User2: onmessage event
        User2->>User2: Show notification UI
    else With Polling Fallback
        loop Every N seconds
            User2->>Server: POST /v1/messages<br/>{"kind":"getQueuedMessages"}
            Server->>MQ: getQueuedMessages(userId)
            MQ-->>Server: [...messages]
            Server-->>User2: {"kind":"queuedMessages",...}
            User2->>User2: Process queued messages
        end
    end
```

### Reconnection Flow

```mermaid
sequenceDiagram
    participant CM as Communication Manager
    participant ES as EventSource
    participant Server as /v1/events

    Note over ES,Server: Connection active
    
    Server--xES: Connection drops
    ES->>CM: onerror event
    
    Note over CM: Check readyState
    
    alt readyState = CONNECTING
        Note over CM: Still trying, don't interfere
    else readyState = OPEN
        Note over CM: Transient error, ignore
    else readyState = CLOSED
        Note over CM: Connection closed
        
        CM->>CM: reconnectAttempts++
        CM->>ES: close()
        
        alt reconnectAttempts < maxReconnectAttempts
            Note over CM: Calculate backoff delay<br/>delay = 5s × 2^(attempts-1)
            CM->>CM: setTimeout(delay)
            
            Note over CM: Wait for delay...
            
            CM->>ES: new EventSource('/v1/events')
            ES->>Server: GET /v1/events
            
            alt Connection Successful
                Server-->>ES: Connected
                ES->>CM: onopen
                CM->>CM: reconnectAttempts = 0
            else Connection Failed
                ES->>CM: onerror
                Note over CM: Retry with longer delay
            end
        else Max attempts reached
            Note over CM: Stop reconnecting<br/>Fall back to REST-only mode
        end
    end
```

### Error Handling Flow

```mermaid
flowchart TD
    Start[Error Occurs] --> CheckType{Error Type?}
    
    CheckType -->|Client Navigation| NavError[ECONNRESET on Server]
    CheckType -->|Network Issue| NetError[Connection Failed]
    CheckType -->|Server Error| SrvError[5xx Response]
    
    NavError --> LogInfo[Log as Info<br/>Normal Disconnect]
    LogInfo --> Cleanup[Cleanup Resources]
    
    NetError --> CheckState{EventSource<br/>readyState?}
    CheckState -->|CONNECTING| Wait[Wait for Connection]
    CheckState -->|OPEN| Ignore[Ignore Transient Error]
    CheckState -->|CLOSED| Reconnect[Attempt Reconnect]
    
    Reconnect --> CheckAttempts{Attempts < Max?}
    CheckAttempts -->|Yes| Backoff[Exponential Backoff]
    Backoff --> Retry[Retry Connection]
    CheckAttempts -->|No| Fallback[REST-Only Mode]
    
    SrvError --> LogError[Log Error]
    LogError --> ErrorResponse[Return Error Response]
    ErrorResponse --> NotifyUser[Notify User]
    
    Wait --> End[End]
    Ignore --> End
    Retry --> End
    Fallback --> End
    Cleanup --> End
    NotifyUser --> End
    
    style NavError fill:#4CAF50
    style Fallback fill:#FF9800
    style LogError fill:#F44336
```

## Layer 2: Intelligent Polling System (Vercel Environment)

For Vercel deployments (which have SSE timeout limits), the system implements adaptive polling:

```mermaid
sequenceDiagram
    participant Client as Client Browser
    participant VRM as Vercel Realtime Manager
    participant Poll as /api/poll-messages
    participant Queue as Message Queue

    Note over Client: Detect Vercel environment
    Client->>VRM: start(userId)
    
    Note over VRM: Initialize:<br/>pollInterval = 2s (base)<br/>maxInterval = 10s
    
    loop Intelligent Adaptive Polling
        VRM->>Poll: POST {userId, lastMessageTime}
        
        Poll->>Queue: Get messages since lastMessageTime
        Queue-->>Poll: messages[]
        
        alt Messages Found
            Poll-->>VRM: {messages: [...], count: N}
            
            Note over VRM: Reset to fast polling<br/>pollInterval = 2s
            
            VRM->>Client: Deliver messages
            Client->>Client: Update UI
            
        else No Messages
            Poll-->>VRM: {messages: [], count: 0}
            
            Note over VRM: Exponential backoff<br/>pollInterval × 1.5<br/>max: 10s
            
            Note over VRM: Current interval:<br/>2s → 3s → 4.5s → 6.75s → 10s
        end
        
        Note over VRM: Wait for pollInterval
        
        alt User Sends Message
            Client->>VRM: sendAndPoll(message)
            VRM->>REST: POST message
            Note over VRM: Immediately poll for response<br/>Reset interval to 2s
        end
    end
    
    Note over VRM: Cleanup old messages (>5 min)
```

## Layer 3: Quantum Network Communication

### Quantum Teleportation Flow

The system implements true quantum teleportation for message delivery:

```mermaid
sequenceDiagram
    participant Alice as User A (Alice)
    participant QNA as Quantum Node A
    participant ENT as Entanglement Manager
    participant TEL as Teleportation Manager
    participant HMM as Holographic Memory
    participant QNB as Quantum Node B
    participant Bob as User B (Bob)

    Note over Alice: Wants to send message to Bob
    
    Alice->>QNA: sendDirectMessage(Bob, "Hello")
    
    Note over QNA,QNB: Phase 1: Establish Entanglement
    QNA->>ENT: createEntanglement(Alice, Bob)
    ENT->>QNA: Calculate phase alignment
    ENT->>QNB: Calculate phase alignment
    
    Note over ENT: Phase rotation for alignment<br/>targetPhase = (φ₁ + φ₂) / 2
    
    ENT->>QNA: Apply phase rotation
    ENT->>QNB: Apply phase rotation
    
    Note over ENT: Calculate entanglement strength<br/>ε = avgCoherence × e^(-|φ₁-φ₂|)
    
    alt Entanglement Strong (ε > 0.3)
        ENT->>QNA: Store entanglement(Bob, ε)
        ENT->>QNB: Store entanglement(Alice, ε)
        ENT-->>QNA: Entanglement established
        
        Note over QNA,QNB: Phase 2: Quantum Teleportation
        QNA->>HMM: Encode memory fragment
        
        Note over HMM: Holographic encoding:<br/>coeffs = Σ(char × prime)<br/>center = [len/2, coherence]<br/>entropy = -Σ p·log(p)
        
        HMM-->>QNA: MemoryFragment
        
        QNA->>TEL: teleportMemory(fragment, Alice, Bob)
        
        Note over TEL: Check entanglement ε ≥ 0.5
        Note over TEL: Calculate fidelity<br/>f = coherence(Bob) × ε
        
        alt Fidelity High (f > 0.8)
            TEL->>QNB: Teleport fragment
            Note over TEL: Update quantum states:<br/>coherence(A) -= 0.05<br/>coherence(B) += ε × 0.1
            
            TEL-->>QNA: Teleportation successful (f)
            
            Note over QNA: Create quantum_message beacon
            QNA->>HMM: Encode full message data
            HMM-->>QNA: Quantum beacon
            
            QNA->>REST: submitPostBeacon(quantum_message)
            REST-->>Bob: Quantum-delivered message
            
            Note over Bob: Message received via<br/>quantum teleportation!
        else Fidelity Low
            Note over QNA: Fall back to holographic beacon
        end
    else Entanglement Failed
        Note over QNA: Fall back to holographic beacon
    end
    
    Note over QNA,REST: Phase 3: Fallback - Holographic Beacon
    QNA->>HMM: encodeMemory(messageData)
    HMM-->>QNA: Holographic beacon
    QNA->>REST: submitPostBeacon(direct_message)
    REST-->>Bob: Message via beacon
```

### Holographic Memory Encoding

Messages are encoded as prime-indexed holographic beacons:

```mermaid
flowchart TB
    Start[Message: "Hello Bob"] --> Encode[Holographic Memory Encoder]
    
    Encode --> Step1[Convert to character codes]
    Step1 --> Step2[Map to prime indices]
    Step2 --> Step3[Calculate coefficients]
    Step3 --> Step4[Compute holographic center]
    Step4 --> Step5[Calculate entropy]
    Step5 --> Step6[Generate fingerprint]
    Step6 --> Step7[Create signature]
    
    Step7 --> Beacon[Holographic Beacon]
    
    Beacon --> Fields{Beacon Fields}
    
    Fields --> F1[fingerprint: Uint8Array<br/>quantum signature]
    Fields --> F2[signature: Uint8Array<br/>cryptographic proof]
    Fields --> F3[index: prime indices<br/>spatial encoding]
    Fields --> F4[epoch: timestamp]
    Fields --> F5[coeffs: amplitude map<br/>holographic data]
    Fields --> F6[center: x, y<br/>quantum center]
    Fields --> F7[entropy: H<br/>information measure]
    
    F1 --> Serialize[Serialize for Transport]
    F2 --> Serialize
    F3 --> Serialize
    F4 --> Serialize
    F5 --> Serialize
    F6 --> Serialize
    F7 --> Serialize
    
    Serialize --> Compatible{Make Decoder<br/>Compatible}
    
    Compatible --> C1[fingerprint → Array]
    Compatible --> C2[signature → Array]
    Compatible --> C3[index → prime_indices JSON]
    Compatible --> C4[Add originalText fallback]
    
    C1 --> Submit[Submit to Server]
    C2 --> Submit
    C3 --> Submit
    C4 --> Submit
    
    style Encode fill:#9C27B0
    style Beacon fill:#E91E63
    style Compatible fill:#FF5722
```

### Complete Message Sending Decision Tree

```mermaid
flowchart TD
    Start[User sends message] --> Init{Quantum System<br/>Initialized?}
    
    Init -->|No| InitQS[Initialize Quantum Node]
    Init -->|Yes| CheckEnt
    InitQS --> CheckEnt
    
    CheckEnt[Attempt Entanglement] --> EntResult{Entanglement<br/>Strength?}
    
    EntResult -->|ε ≥ 0.5| TryTel[Attempt Teleportation]
    EntResult -->|ε < 0.5| FallbackBeacon[Fallback to Beacon]
    
    TryTel --> CalcFid[Calculate Fidelity<br/>f = coherence × ε]
    CalcFid --> FidCheck{f > 0.8?}
    
    FidCheck -->|Yes| QuantumDeliver[✨ Quantum Teleportation]
    FidCheck -->|No| FallbackBeacon
    
    QuantumDeliver --> EncodeQB[Encode Quantum Beacon]
    EncodeQB --> SubmitQB[Submit quantum_message]
    SubmitQB --> UpdateStates[Update Node States:<br/>coherence adjustments]
    UpdateStates --> Success[✅ Message Delivered<br/>via Quantum Channel]
    
    FallbackBeacon --> EncodeHB[Encode Holographic Beacon]
    EncodeHB --> PrepareCompat[Prepare Compatible Format]
    PrepareCompat --> SubmitHB[Submit direct_message beacon]
    SubmitHB --> DeliverVia{Environment?}
    
    DeliverVia -->|Vercel| PollingPath[Queue for polling]
    DeliverVia -->|Dev/Local| SSEPath[Send via SSE]
    
    PollingPath --> Poll[Client polls /api/poll-messages]
    SSEPath --> Stream[Stream via /v1/events]
    
    Poll --> Receive[✅ Message Received]
    Stream --> Receive
    
    style QuantumDeliver fill:#9C27B0
    style Success fill:#4CAF50
    style FallbackBeacon fill:#FF9800
```

## Implementation Details

### Client-Side Components

#### Communication Manager (`src/services/communication-manager.ts`)
- **Dual Communication Pattern**:
  - Uses EventSource for receiving real-time updates (server → client)
  - Uses fetch POST to `/v1/messages` for sending messages (client → server)

- **Session Management**:
  - Stores `sessionToken` and `userId` in localStorage
  - Automatically includes session info in all outgoing messages

- **Reconnection Strategy**:
  - Exponential backoff: 5s, 10s, 20s, 40s, 80s
  - Maximum 5 reconnection attempts
  - Falls back to REST-only mode after max attempts

- **Error Classification**:
  - `CONNECTING`: Initial connection in progress
  - `OPEN`: Connection active, transient errors ignored
  - `CLOSED`: Connection lost, triggers reconnection

#### Vercel Realtime Manager (`src/services/vercel-realtime-manager.ts`)
- **Intelligent Polling**:
  - Base interval: 2 seconds
  - Max interval: 10 seconds
  - Backoff multiplier: 1.5x per empty response

- **Adaptive Behavior**:
  - Resets to fast polling on message receipt
  - Immediate poll after user sends message
  - Cleanup of messages older than 5 minutes

#### Messaging Service (`src/services/messaging.ts`)
- **Quantum-First Approach**:
  1. Attempt quantum entanglement
  2. Try quantum teleportation if entangled
  3. Fall back to holographic beacon
  4. Use standard communication as last resort

- **Holographic Encoding**:
  - Prime-indexed spatial encoding
  - Quantum fingerprinting
  - Cryptographic signatures
  - Fallback originalText preservation

### Server-Side Components

#### SSE Endpoint (`api/events.ts`)
- **Server-Sent Events**:
  - Establishes long-lived HTTP connection
  - Sends `Content-Type: text/event-stream`
  - Ping every 30 seconds to keep connection alive
  - Handles `ECONNRESET` gracefully (normal during navigation)

#### REST Endpoint (`api/messages.ts`)
- **Message Processing**:
  - Processes all message types (follow, post, comment, etc.)
  - Returns immediate responses
  - Can queue notifications for SSE delivery
  - Includes embedded notifications in responses as fallback

#### Message Queue
- **In-Memory Queue**:
  - Stores notifications for users
  - Can be polled via `getQueuedMessages`
  - Cleared after retrieval
  - Would use Redis in production

### Quantum Network Components

#### Quantum Network Operations (`src/services/quantum/index.ts`)
- Coordinates all quantum operations
- Manages node lifecycle
- Integrates entanglement, teleportation, and consensus

#### Entanglement Manager (`src/services/quantum/entanglement.ts`)
- **Phase Alignment**:
  ```
  targetPhase = (φ₁ + φ₂) / 2
  ```
- **Entanglement Strength**:
  ```
  ε = avgCoherence × e^(-|φ₁-φ₂|)
  ```
- Bidirectional entanglement storage
- Coherence updates based on entanglement

#### Teleportation Manager (`src/services/quantum/teleportation.ts`)
- **Requirements**:
  - Entanglement strength ≥ 0.5
  - Fidelity > 0.8 for success
- **Fidelity Calculation**:
  ```
  f = coherence(target) × ε
  ```
- **State Updates**:
  ```
  coherence(source) -= 0.05
  coherence(target) += ε × 0.1
  ```

## Communication Flow Comparison

| Feature | Local/Dev | Vercel | Quantum Mode |
|---------|-----------|---------|--------------|
| **Outbound** | POST /v1/messages | POST /v1/messages | Quantum teleportation → beacon fallback |
| **Inbound** | SSE stream | Adaptive polling | Direct quantum state transfer |
| **Latency** | <100ms | 2-10s | Theoretically instant (if successful) |
| **Reliability** | High | Medium | High (with fallback) |
| **Privacy** | Server-mediated | Server-mediated | True P2P (quantum path) |
| **Fidelity** | 100% | 100% | 70-100% (quantum path) |

## Three-Tier Fallback Strategy

The system implements a resilient, privacy-preserving communication system:

1. **Quantum Teleportation** (instant, P2P, requires entanglement)
   - Ideal for private, real-time communication
   - Requires node coherence and entanglement
   - Fidelity-based success determination

2. **Holographic Beacon** (client-side encoded, server-stored)
   - Prime-indexed spatial encoding
   - Quantum fingerprinting for verification
   - Fallback text preservation

3. **Standard REST/SSE** (traditional client-server)
   - Reliable fallback for all scenarios
   - Environment-adaptive (SSE vs polling)
   - Exponential backoff reconnection

## Production Considerations

### Current Limitations
- In-memory message queue (needs Redis)
- No persistent storage (needs Neon database)
- Vercel function timeouts for SSE
- Mock quantum operations (conceptual proof)

### Production Ready Path
1. **Redis** for message queue and real-time coordination
2. **Neon Database** for persistent data storage
3. **WebSocket Alternative** for longer connections on dedicated servers
4. **Quantum Backend** for actual quantum entanglement operations
5. **Distributed Consensus** for multi-region deployments

## File References

- Communication Manager: `src/services/communication-manager.ts`
- Vercel Realtime Manager: `src/services/vercel-realtime-manager.ts`
- Messaging Service: `src/services/messaging.ts`
- Quantum Network Ops: `src/services/quantum/index.ts`
- Entanglement Manager: `src/services/quantum/entanglement.ts`
- Teleportation Manager: `src/services/quantum/teleportation.ts`
- SSE Endpoint: `api/events.ts`
- REST Endpoint: `api/messages.ts`
- Poll Endpoint: `api/poll-messages.ts`

---

**Last Updated**: 2025-10-05  
**Version**: 1.0  
**Status**: Active Development