// crypto-integration.ts
// Integration of PR-UTC cryptographic system with existing network protocols

import { PRUTCSystem, Keytriplet } from "../crypto/keytriplet";
import { sha256, sha256String, hmacSha256, bytesToHex } from "../core/crypto";
import { PrimeState } from "../prime-resonance";

/**
 * Cryptographic extension for network protocols
 * Provides encryption and authentication for protocol messages
 */
export class CryptoProtocolExtension {
  private prutcSystem: PRUTCSystem;
  private nodeKeytriplets: Map<string, Keytriplet>;
  private activeSessions: Map<string, string>; // nodeId -> sessionId mapping
  
  constructor(globalSeed: string) {
    this.prutcSystem = new PRUTCSystem(globalSeed);
    this.nodeKeytriplets = new Map();
    this.activeSessions = new Map();
  }
  
  /**
   * Register a node with the cryptographic system
   */
  registerNode(nodeId: string): Keytriplet {
    const keytriplet = this.prutcSystem.registerUser(nodeId);
    this.nodeKeytriplets.set(nodeId, keytriplet);
    return keytriplet;
  }
  
  /**
   * Establish secure session between two nodes
   */
  establishSecureChannel(nodeA: string, nodeB: string): string | null {
    // Check if both nodes are registered
    if (!this.nodeKeytriplets.has(nodeA) || !this.nodeKeytriplets.has(nodeB)) {
      console.error("One or both nodes not registered");
      return null;
    }
    
    try {
      const sessionId = this.prutcSystem.establishSession(nodeA, nodeB);
      
      // Store session mapping for both nodes
      const sessionKey = this.getSessionKey(nodeA, nodeB);
      this.activeSessions.set(sessionKey, sessionId);
      
      return sessionId;
    } catch (e) {
      console.error("Failed to establish secure channel");
      return null;
    }
  }
  
  /**
   * Encrypt a message payload
   */
  encryptPayload(
    senderId: string,
    receiverId: string,
    payload: string
  ): EncryptedPayload | null {
    const sessionKey = this.getSessionKey(senderId, receiverId);
    const sessionId = this.activeSessions.get(sessionKey);
    
    if (!sessionId) {
      console.error("No active session between nodes");
      return null;
    }
    
    // Send through PR-UTC system
    this.prutcSystem.sendMessage(sessionId, senderId, payload);
    
    // Create encrypted payload wrapper
    const timestamp = Date.now();
    const nonce = this.generateNonce();
    
    return {
      sessionId: sessionId,
      senderId: senderId,
      receiverId: receiverId,
      timestamp: timestamp,
      nonce: nonce,
      encrypted: true,
      checksum: this.calculateChecksum(payload, nonce)
    };
  }
  
  /**
   * Decrypt a message payload
   */
  decryptPayload(
    receiverId: string,
    encryptedPayload: EncryptedPayload
  ): string | null {
    if (!encryptedPayload.encrypted) {
      return null;
    }
    
    // Receive through PR-UTC system
    const messages = this.prutcSystem.receiveMessages(
      encryptedPayload.sessionId,
      receiverId
    );
    
    if (messages.length > 0) {
      const decrypted = messages[0];
      
      // Verify checksum
      const expectedChecksum = this.calculateChecksum(
        decrypted,
        encryptedPayload.nonce
      );
      
      if (expectedChecksum === encryptedPayload.checksum) {
        return decrypted;
      } else {
        console.error("Checksum verification failed");
        return null;
      }
    }
    
    return null;
  }
  
  /**
   * Sign a message with node's private key
   */
  signMessage(nodeId: string, message: string): string | null {
    const keytriplet = this.nodeKeytriplets.get(nodeId);
    if (!keytriplet) {
      console.error("Node not registered");
      return null;
    }
    
    // Create signature using private key entropy
    const privateKey = keytriplet.getPrivateKey();
    const keyEntropy = privateKey.entropy().toString();
    
    return hmacSha256(
      this.stringToBytes(message),
      this.stringToBytes(keyEntropy)
    ).toString();
  }
  
  /**
   * Verify a message signature
   */
  verifySignature(
    nodeId: string,
    message: string,
    signature: string
  ): boolean {
    const keytriplet = this.nodeKeytriplets.get(nodeId);
    if (!keytriplet) {
      return false;
    }
    
    // Recreate signature and compare
    const expectedSignature = this.signMessage(nodeId, message);
    return expectedSignature === signature;
  }
  
  /**
   * Evolve all registered keys
   */
  evolveKeys(deltaT: f64): void {
    this.prutcSystem.evolveKeys(deltaT);
  }
  
  /**
   * Get session statistics
   */
  getStats(): CryptoStats {
    return {
      registeredNodes: this.nodeKeytriplets.size,
      activeSessions: this.activeSessions.size,
      keyEvolutionRate: 3600.0 // 1 hour default
    };
  }
  
  // Helper methods
  
  private getSessionKey(nodeA: string, nodeB: string): string {
    // Create consistent session key regardless of order
    return nodeA < nodeB ? `${nodeA}:${nodeB}` : `${nodeB}:${nodeA}`;
  }
  
  private generateNonce(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString();
    return bytesToHex(sha256String(timestamp + random));
  }
  
  private calculateChecksum(data: string, nonce: string): string {
    return bytesToHex(sha256String(data + nonce));
  }
  
  private stringToBytes(str: string): Uint8Array {
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      bytes[i] = str.charCodeAt(i);
    }
    return bytes;
  }
}

/**
 * Encrypted payload structure
 */
export class EncryptedPayload {
  sessionId: string;
  senderId: string;
  receiverId: string;
  timestamp: f64;
  nonce: string;
  encrypted: boolean;
  checksum: string;
  
  constructor(
    sessionId: string = "",
    senderId: string = "",
    receiverId: string = "",
    timestamp: f64 = 0,
    nonce: string = "",
    encrypted: boolean = false,
    checksum: string = ""
  ) {
    this.sessionId = sessionId;
    this.senderId = senderId;
    this.receiverId = receiverId;
    this.timestamp = timestamp;
    this.nonce = nonce;
    this.encrypted = encrypted;
    this.checksum = checksum;
  }
}

/**
 * Cryptographic statistics
 */
export class CryptoStats {
  registeredNodes: i32;
  activeSessions: i32;
  keyEvolutionRate: f64;
  
  constructor(
    registeredNodes: i32 = 0,
    activeSessions: i32 = 0,
    keyEvolutionRate: f64 = 3600.0
  ) {
    this.registeredNodes = registeredNodes;
    this.activeSessions = activeSessions;
    this.keyEvolutionRate = keyEvolutionRate;
  }
}

/**
 * Protocol message wrapper with cryptographic support
 */
export class CryptoProtocolMessage {
  // Original message fields
  type: i32;
  sourceId: string;
  targetId: string;
  payload: string;
  
  // Cryptographic fields
  encrypted: boolean;
  signature: string;
  encryptedPayload: EncryptedPayload | null;
  
  constructor(
    type: i32,
    sourceId: string,
    targetId: string,
    payload: string
  ) {
    this.type = type;
    this.sourceId = sourceId;
    this.targetId = targetId;
    this.payload = payload;
    this.encrypted = false;
    this.signature = "";
    this.encryptedPayload = null;
  }
  
  /**
   * Encrypt this message
   */
  encrypt(crypto: CryptoProtocolExtension): boolean {
    const encrypted = crypto.encryptPayload(
      this.sourceId,
      this.targetId,
      this.payload
    );
    
    if (encrypted) {
      this.encrypted = true;
      this.encryptedPayload = encrypted;
      this.payload = "[ENCRYPTED]";
      return true;
    }
    
    return false;
  }
  
  /**
   * Decrypt this message
   */
  decrypt(crypto: CryptoProtocolExtension): boolean {
    if (!this.encrypted || !this.encryptedPayload) {
      return false;
    }
    
    const decrypted = crypto.decryptPayload(
      this.targetId,
      this.encryptedPayload
    );
    
    if (decrypted) {
      this.payload = decrypted;
      this.encrypted = false;
      return true;
    }
    
    return false;
  }
  
  /**
   * Sign this message
   */
  sign(crypto: CryptoProtocolExtension): boolean {
    const messageData = `${this.type}:${this.sourceId}:${this.targetId}:${this.payload}`;
    const signature = crypto.signMessage(this.sourceId, messageData);
    
    if (signature) {
      this.signature = signature;
      return true;
    }
    
    return false;
  }
  
  /**
   * Verify this message's signature
   */
  verify(crypto: CryptoProtocolExtension): boolean {
    if (!this.signature) {
      return false;
    }
    
    const messageData = `${this.type}:${this.sourceId}:${this.targetId}:${this.payload}`;
    return crypto.verifySignature(this.sourceId, messageData, this.signature);
  }
}

/**
 * Example: Integrating cryptography with existing protocols
 */
export function demonstrateCryptoIntegration(): void {
  console.log("=== Cryptographic Protocol Integration Demo ===");
  
  // Initialize crypto extension
  const crypto = new CryptoProtocolExtension("PRIME_RESONANCE_NETWORK_2025");
  
  // Register nodes
  const nodeA = "node-A";
  const nodeB = "node-B";
  
  crypto.registerNode(nodeA);
  crypto.registerNode(nodeB);
  console.log("Nodes registered with cryptographic system");
  
  // Establish secure channel
  const sessionId = crypto.establishSecureChannel(nodeA, nodeB);
  if (sessionId) {
    console.log("Secure channel established: " + sessionId);
  }
  
  // Create a protocol message
  const message = new CryptoProtocolMessage(
    1, // Message type
    nodeA,
    nodeB,
    "Hello, this is a secure message!"
  );
  
  // Sign the message
  if (message.sign(crypto)) {
    console.log("Message signed");
  }
  
  // Encrypt the message
  if (message.encrypt(crypto)) {
    console.log("Message encrypted");
  }
  
  // Simulate transmission...
  
  // Verify signature
  if (message.verify(crypto)) {
    console.log("Signature verified");
  }
  
  // Decrypt the message
  if (message.decrypt(crypto)) {
    console.log("Message decrypted: " + message.payload);
  }
  
  // Evolve keys
  crypto.evolveKeys(3600.0);
  console.log("Keys evolved");
  
  // Get statistics
  const stats = crypto.getStats();
  console.log("Crypto stats - Nodes: " + stats.registeredNodes.toString() + 
              ", Sessions: " + stats.activeSessions.toString());
}

/**
 * Integration helper for existing protocol handlers
 */
export class ProtocolCryptoAdapter {
  private crypto: CryptoProtocolExtension;
  
  constructor(globalSeed: string) {
    this.crypto = new CryptoProtocolExtension(globalSeed);
  }
  
  /**
   * Wrap existing protocol message with crypto
   */
  wrapMessage(
    type: i32,
    sourceId: string,
    targetId: string,
    payload: string,
    encrypt: boolean = true,
    sign: boolean = true
  ): CryptoProtocolMessage {
    const message = new CryptoProtocolMessage(type, sourceId, targetId, payload);
    
    if (sign) {
      message.sign(this.crypto);
    }
    
    if (encrypt) {
      message.encrypt(this.crypto);
    }
    
    return message;
  }
  
  /**
   * Unwrap crypto message to get original payload
   */
  unwrapMessage(message: CryptoProtocolMessage): string | null {
    // Verify signature if present
    if (message.signature && !message.verify(this.crypto)) {
      console.error("Signature verification failed");
      return null;
    }
    
    // Decrypt if needed
    if (message.encrypted) {
      if (!message.decrypt(this.crypto)) {
        console.error("Decryption failed");
        return null;
      }
    }
    
    return message.payload;
  }
  
  /**
   * Register all nodes from a list
   */
  registerNodes(nodeIds: Array<string>): void {
    for (let i = 0; i < nodeIds.length; i++) {
      this.crypto.registerNode(nodeIds[i]);
    }
  }
  
  /**
   * Establish secure channels between all node pairs
   */
  establishAllChannels(nodeIds: Array<string>): i32 {
    let established = 0;
    
    for (let i = 0; i < nodeIds.length; i++) {
      for (let j = i + 1; j < nodeIds.length; j++) {
        if (this.crypto.establishSecureChannel(nodeIds[i], nodeIds[j])) {
          established++;
        }
      }
    }
    
    return established;
  }
  
  /**
   * Get the crypto extension for direct access
   */
  getCrypto(): CryptoProtocolExtension {
    return this.crypto;
  }
}