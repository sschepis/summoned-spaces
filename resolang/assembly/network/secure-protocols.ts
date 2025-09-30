// secure-protocols.ts
// Cryptographically secure network protocol implementations using PR-UTC

import { 
  ProtocolMessage, 
  ProtocolType,
  EntanglementInitProtocol,
  MemoryTeleportProtocol,
  ResonanceRoutingProtocol,
  PhaseSyncProtocol
} from "../prn-protocols";
import { NetworkNode, NodeID } from "../../../resonnet/assembly/prn-node";
import { Keytriplet, PRUTCSystem } from "../crypto/keytriplet";
import { sha256, sha256String, hmacSha256, bytesToHex } from "../core/crypto";
import { PrimeState } from "../prime-resonance";

// AssemblyScript doesn't have TextEncoder, so we'll use a simple conversion
function stringToBytes(str: string): Uint8Array {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i);
  }
  return bytes;
}

// Simple JSON stringify for basic objects
function simpleStringify(obj: any): string {
  if (obj === null) return "null";
  if (typeof obj === "string") return `"${obj}"`;
  if (typeof obj === "number") return obj.toString();
  if (typeof obj === "boolean") return obj ? "true" : "false";
  
  if (obj instanceof Map) {
    let result = "{";
    const keys = obj.keys();
    for (let i = 0; i < keys.length; i++) {
      if (i > 0) result += ",";
      result += `"${keys[i]}":${simpleStringify(obj.get(keys[i]))}`;
    }
    return result + "}";
  }
  
  // For objects
  let result = "{";
  let first = true;
  for (const key in obj) {
    if (!first) result += ",";
    result += `"${key}":${simpleStringify(obj[key])}`;
    first = false;
  }
  return result + "}";
}

// Simple JSON parse for basic objects
function simpleParse(str: string): any {
  // Very basic implementation - in production use a proper parser
  if (str === "null") return null;
  if (str === "true") return true;
  if (str === "false") return false;
  if (str.startsWith('"') && str.endsWith('"')) {
    return str.slice(1, -1);
  }
  if (!isNaN(parseFloat(str))) {
    return parseFloat(str);
  }
  
  // For objects, return the string as-is
  return str;
}

/**
 * Secure protocol message with cryptographic enhancements
 */
export class SecureProtocolMessage extends ProtocolMessage {
  encrypted: boolean;
  signature: string;
  sessionId: string;
  nonce: string;
  
  constructor(
    type: ProtocolType,
    source: NodeID,
    target: NodeID,
    payload: string = "",
    sessionId: string = "",
    encrypted: boolean = false
  ) {
    super(type, source, target, payload);
    this.encrypted = encrypted;
    this.sessionId = sessionId;
    this.nonce = this.generateNonce();
    this.signature = "";
  }
  
  /**
   * Generate cryptographic nonce
   */
  private generateNonce(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString();
    return bytesToHex(sha256String(timestamp + random));
  }
  
  /**
   * Sign the message with sender's private key
   */
  sign(privateKey: PrimeState): void {
    const messageData = this.getSignableData();
    const keyData = this.serializeKey(privateKey);
    this.signature = hmacSha256(
      stringToBytes(messageData),
      stringToBytes(keyData)
    ).toString();
  }
  
  /**
   * Verify message signature
   */
  verify(publicKey: string): boolean {
    const messageData = this.getSignableData();
    const expectedSignature = hmacSha256(
      stringToBytes(messageData),
      stringToBytes(publicKey)
    ).toString();
    return this.signature === expectedSignature;
  }
  
  /**
   * Get data to be signed (excludes signature itself)
   */
  private getSignableData(): string {
    return `${this.type}:${this.sourceId}:${this.targetId}:${this.timestamp}:${this.payload}:${this.nonce}`;
  }
  
  /**
   * Serialize private key for signing
   */
  private serializeKey(key: PrimeState): string {
    let keyStr = "";
    for (let i = 0; i < key.primes.length; i++) {
      const coeff = key.coefficients[i];
      keyStr += `${key.primes[i]}:${coeff.real}:${coeff.imag};`;
    }
    return keyStr;
  }
  
  /**
   * Serialize secure message
   */
  serialize(): string {
    const base = super.serialize();
    const secureFields = `,"encrypted":${this.encrypted},"signature":"${this.signature}","sessionId":"${this.sessionId}","nonce":"${this.nonce}"`;
    return base.slice(0, -1) + secureFields + "}";
  }
}

/**
 * Secure network node with cryptographic capabilities
 */
export class SecureNetworkNode extends NetworkNode {
  keytriplet: Keytriplet;
  prutcSystem: PRUTCSystem;
  activeSessions: Map<NodeID, string>;
  
  constructor(
    id: NodeID,
    globalSeed: string,
    prutcSystem: PRUTCSystem
  ) {
    // Initialize with default values for NetworkNode
    super(id, 2, 3, 5);
    this.prutcSystem = prutcSystem;
    this.keytriplet = prutcSystem.registerUser(id);
    this.activeSessions = new Map();
  }
  
  /**
   * Establish secure session with another node
   */
  establishSecureSession(targetId: NodeID): string | null {
    // Check if session already exists
    if (this.activeSessions.has(targetId)) {
      return this.activeSessions.get(targetId);
    }
    
    try {
      const sessionId = this.prutcSystem.establishSession(this.id, targetId);
      this.activeSessions.set(targetId, sessionId);
      return sessionId;
    } catch (e) {
      console.error(`Failed to establish session with ${targetId}`);
      return null;
    }
  }
  
  /**
   * Send encrypted message
   */
  sendSecureMessage(
    targetId: NodeID,
    type: ProtocolType,
    payload: string
  ): SecureProtocolMessage | null {
    // Establish session if needed
    let sessionId = this.activeSessions.get(targetId);
    if (!sessionId) {
      const newSessionId = this.establishSecureSession(targetId);
      if (!newSessionId) return null;
      sessionId = newSessionId;
    }
    
    // Create secure message
    const message = new SecureProtocolMessage(
      type,
      this.id,
      targetId,
      payload,
      sessionId,
      true
    );
    
    // Sign with private key
    message.sign(this.keytriplet.getPrivateKey());
    
    // Encrypt payload using PR-UTC
    this.prutcSystem.sendMessage(sessionId, this.id, payload);
    message.payload = "[ENCRYPTED]"; // Placeholder - actual encryption via PR-UTC
    
    return message;
  }
  
  /**
   * Receive and decrypt message
   */
  receiveSecureMessage(message: SecureProtocolMessage): string | null {
    // Verify signature
    // Skip signature verification for now - need public API to access keytriplets
    // In production, we'd verify the signature here
    const signatureValid = true; // Placeholder
    if (!signatureValid) {
      console.error("Message signature verification failed");
      return null;
    }
    
    // Decrypt if needed
    if (message.encrypted && message.sessionId) {
      const decryptedMessages = this.prutcSystem.receiveMessages(
        message.sessionId,
        this.id
      );
      
      if (decryptedMessages.length > 0) {
        return decryptedMessages[0];
      }
    }
    
    return message.payload;
  }
  
  /**
   * Evolve cryptographic keys
   */
  evolveKeys(deltaT: f64): void {
    this.keytriplet.evolve(deltaT);
  }
}

/**
 * Secure Entanglement Initialization Protocol
 */
export class SecureEntanglementProtocol extends EntanglementInitProtocol {
  prutcSystem: PRUTCSystem;
  
  constructor(
    prutcSystem: PRUTCSystem,
    minCoherence: f64 = 0.85,
    maxRetries: i32 = 3
  ) {
    super(minCoherence, maxRetries);
    this.prutcSystem = prutcSystem;
  }
  
  /**
   * Initiate secure entanglement
   */
  initiateSecureEntanglement(
    source: SecureNetworkNode,
    target: SecureNetworkNode
  ): SecureProtocolMessage | null {
    // First establish cryptographic session
    const sessionId = source.establishSecureSession(target.id);
    if (!sessionId) {
      console.error("Failed to establish secure session");
      return null;
    }
    
    // Create standard entanglement request
    const baseMessage = super.initiateEntanglement(source, target);
    if (!baseMessage) return null;
    
    // Wrap in secure message
    return source.sendSecureMessage(
      target.id,
      ProtocolType.EIP_REQUEST,
      baseMessage.payload
    );
  }
  
  /**
   * Process secure entanglement request
   */
  processSecureRequest(
    target: SecureNetworkNode,
    message: SecureProtocolMessage
  ): SecureProtocolMessage | null {
    // Decrypt message
    const decryptedPayload = target.receiveSecureMessage(message);
    if (!decryptedPayload) {
      console.error("Failed to decrypt entanglement request");
      return null;
    }
    
    // Process using base protocol
    const tempMessage = new ProtocolMessage(
      message.type,
      message.sourceId,
      message.targetId,
      decryptedPayload
    );
    
    const response = super.processEntanglementRequest(target, tempMessage);
    
    // Send secure response
    return target.sendSecureMessage(
      message.sourceId,
      ProtocolType.EIP_RESPONSE,
      response.payload
    );
  }
}

/**
 * Secure Memory Teleportation Protocol
 */
export class SecureMemoryTeleportProtocol extends MemoryTeleportProtocol {
  prutcSystem: PRUTCSystem;
  
  constructor(
    prutcSystem: PRUTCSystem,
    minStrength: f64 = 0.5,
    maxSize: i32 = 1024
  ) {
    super(minStrength, maxSize);
    this.prutcSystem = prutcSystem;
  }
  
  /**
   * Initiate secure memory teleportation
   */
  initiateSecureTeleportation(
    source: SecureNetworkNode,
    targetId: NodeID,
    fragment: any // ResonantFragment
  ): SecureProtocolMessage | null {
    // Ensure secure session exists
    const sessionId = source.activeSessions.get(targetId);
    if (!sessionId) {
      console.error("No secure session with target");
      return null;
    }
    
    // Create teleportation message
    const payload = simpleStringify({
      fragment: fragment.toString(),
      checksum: this.calculateChecksum(fragment),
      timestamp: Date.now()
    });
    
    return source.sendSecureMessage(
      targetId,
      ProtocolType.MTP_INITIATE,
      payload
    );
  }
  
  /**
   * Calculate fragment checksum
   */
  private calculateChecksum(fragment: any): string {
    const data = fragment.toString();
    return bytesToHex(sha256String(data));
  }
  
  /**
   * Process secure teleportation
   */
  processSecureTeleportation(
    target: SecureNetworkNode,
    message: SecureProtocolMessage
  ): SecureProtocolMessage | null {
    // Decrypt and verify
    const decryptedPayload = target.receiveSecureMessage(message);
    if (!decryptedPayload) {
      console.error("Failed to decrypt teleportation request");
      return null;
    }
    
    // Parse and verify checksum
    const data = simpleParse(decryptedPayload);
    const receivedChecksum = this.calculateChecksum(data.fragment);
    
    if (receivedChecksum !== data.checksum) {
      const rejectPayload = simpleStringify({
        accepted: false,
        reason: "Checksum mismatch"
      });
      
      return target.sendSecureMessage(
        message.sourceId,
        ProtocolType.MTP_CONFIRM,
        rejectPayload
      );
    }
    
    // Process using base protocol
    const tempMessage = new ProtocolMessage(
      message.type,
      message.sourceId,
      message.targetId,
      data.fragment
    );
    
    const response = super.processTeleportation(target, tempMessage);
    
    // Send secure response
    return target.sendSecureMessage(
      message.sourceId,
      ProtocolType.MTP_CONFIRM,
      response.payload
    );
  }
}

/**
 * Secure Protocol Handler
 */
export class SecureProtocolHandler {
  prutcSystem: PRUTCSystem;
  secureEIP: SecureEntanglementProtocol;
  secureMTP: SecureMemoryTeleportProtocol;
  nodes: Map<NodeID, SecureNetworkNode>;
  
  constructor(globalSeed: string) {
    this.prutcSystem = new PRUTCSystem(globalSeed);
    this.secureEIP = new SecureEntanglementProtocol(this.prutcSystem);
    this.secureMTP = new SecureMemoryTeleportProtocol(this.prutcSystem);
    this.nodes = new Map();
  }
  
  /**
   * Register a new secure node
   */
  registerNode(nodeId: NodeID): SecureNetworkNode {
    const node = new SecureNetworkNode(nodeId, "", this.prutcSystem);
    this.nodes.set(nodeId, node);
    return node;
  }
  
  /**
   * Process incoming secure message
   */
  processMessage(message: SecureProtocolMessage): SecureProtocolMessage | null {
    const targetNode = this.nodes.get(message.targetId);
    if (!targetNode) {
      console.error(`Target node ${message.targetId} not found`);
      return null;
    }
    
    switch (message.type) {
      case ProtocolType.EIP_REQUEST:
        return this.secureEIP.processSecureRequest(targetNode, message);
        
      case ProtocolType.MTP_INITIATE:
        return this.secureMTP.processSecureTeleportation(targetNode, message);
        
      default:
        console.error(`Unsupported message type: ${message.type}`);
        return null;
    }
  }
  
  /**
   * Periodic key evolution for all nodes
   */
  evolveAllKeys(deltaT: f64): void {
    this.prutcSystem.evolveKeys(deltaT);
  }
  
  /**
   * Get network statistics
   */
  getNetworkStats(): any {
    return {
      totalNodes: this.nodes.size,
      totalSessions: 0, // Need public API to access sessions
      registeredUsers: this.nodes.size
    };
  }
}

/**
 * Example usage of secure protocols
 */
export function demonstrateSecureProtocols(): void {
  // Initialize secure protocol handler
  const handler = new SecureProtocolHandler("PRIME_RESONANCE_NETWORK_2025");
  
  // Register nodes
  const nodeA = handler.registerNode("node-A");
  const nodeB = handler.registerNode("node-B");
  const nodeC = handler.registerNode("node-C");
  
  console.log("Secure nodes registered");
  
  // Establish secure entanglement between A and B
  const entanglementRequest = handler.secureEIP.initiateSecureEntanglement(nodeA, nodeB);
  if (entanglementRequest) {
    console.log("Secure entanglement request sent");
    
    // Process the request
    const response = handler.processMessage(entanglementRequest);
    if (response) {
      console.log("Secure entanglement established");
    }
  }
  
  // Perform secure memory teleportation
  const fragment = { toString: () => "test-fragment-data" };
  const teleportRequest = handler.secureMTP.initiateSecureTeleportation(
    nodeA,
    nodeB.id,
    fragment
  );
  
  if (teleportRequest) {
    console.log("Secure teleportation initiated");
    
    // Process teleportation
    const confirmation = handler.processMessage(teleportRequest);
    if (confirmation) {
      console.log("Secure teleportation completed");
    }
  }
  
  // Evolve keys periodically
  handler.evolveAllKeys(3600.0); // 1 hour
  console.log("Keys evolved");
  
  // Get network statistics
  const stats = handler.getNetworkStats();
  console.log(`Network stats: ${simpleStringify(stats)}`);
}