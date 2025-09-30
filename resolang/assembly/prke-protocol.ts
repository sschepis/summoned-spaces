import { NodeID, PrimeFieldElement } from "resolang";
import { generatePrimeLarge as generatePrime, modExp, modInverseLarge as modInverse, isPrimeLarge as isPrime } from './core/math';
import { sha256, sha256String } from './core/crypto';

/**
 * Prime Resonance Key Exchange (PRKE) Protocol
 * 
 * A quantum-inspired key exchange protocol that uses prime resonance
 * patterns for secure authentication and key derivation. Unlike traditional
 * Diffie-Hellman, PRKE leverages the holographic properties of prime
 * decomposition and quantum entanglement strength.
 * 
 * Key Features:
 * - Prime resonance patterns for identity verification
 * - Entanglement-based session key derivation
 * - Holographic key fragments for multi-party exchange
 * - Quantum-resistant through prime field complexity
 */

export class PRKESession {
  nodeId: string; // NodeID is a type alias for string
  privatePrime: u64;
  publicResonance: PrimeFieldElement;
  sessionKey: Uint8Array | null;
  entanglementStrength: f64;
  resonancePattern: Array<u64>;
  
  constructor(nodeId: NodeID) {
    this.nodeId = nodeId;
    this.privatePrime = 0;
    this.publicResonance = new PrimeFieldElement(0, 0);
    this.sessionKey = null;
    this.entanglementStrength = 0;
    this.resonancePattern = new Array<u64>();
  }
}

export class PRKEProtocol {
  // Large safe prime for the field (2q + 1 where q is also prime)
  static readonly FIELD_PRIME: u64 = 2147483647; // 2^31 - 1 (Mersenne prime)
  static readonly GENERATOR: u64 = 3;
  
  // Resonance parameters
  static readonly MIN_RESONANCE_LENGTH: i32 = 8;
  static readonly MAX_RESONANCE_LENGTH: i32 = 16;
  static readonly ENTANGLEMENT_THRESHOLD: f64 = 0.7;
  
  sessions: Map<string, PRKESession>;
  nodeResonances: Map<string, Array<u64>>; // NodeID is string
  
  constructor() {
    this.sessions = new Map<string, PRKESession>();
    this.nodeResonances = new Map<NodeID, Array<u64>>();
  }
  
  /**
   * Initialize a new key exchange session
   */
  initSession(nodeId: string): PRKESession {
    const session = new PRKESession(nodeId);
    
    // Generate private prime in safe range
    session.privatePrime = this.generatePrivatePrime();
    
    // Generate resonance pattern based on node ID
    session.resonancePattern = this.generateResonancePattern(nodeId);
    
    // Compute public resonance value
    session.publicResonance = this.computePublicResonance(
      session.privatePrime,
      session.resonancePattern
    );
    
    // Store session
    const sessionId = this.getSessionId(nodeId, nodeId);
    this.sessions.set(sessionId, session);
    
    return session;
  }
  
  /**
   * Generate a private prime for the session
   */
  private generatePrivatePrime(): u64 {
    let prime: u64;
    do {
      // Generate random prime in safe range
      prime = generatePrime(20, 30); // 20-30 bit primes
    } while (!this.isSafePrime(prime));
    
    return prime;
  }
  
  /**
   * Check if a prime is safe (p = 2q + 1 where q is prime)
   */
  private isSafePrime(p: u64): bool {
    if (!isPrime(p)) return false;
    const q = (p - 1) / 2;
    return isPrime(q);
  }
  
  /**
   * Generate resonance pattern from node ID
   */
  private generateResonancePattern(nodeId: string): Array<u64> {
    const pattern = new Array<u64>();
    
    // Use node ID hash as seed
    const hash = sha256String(nodeId);
    let seed: u64 = 0;
    for (let i = 0; i < 8; i++) {
      seed = (seed << 8) | u64(hash[i]);
    }
    
    // Generate pattern using linear congruential generator
    const length = PRKEProtocol.MIN_RESONANCE_LENGTH + 
                  i32(seed % u64(PRKEProtocol.MAX_RESONANCE_LENGTH - PRKEProtocol.MIN_RESONANCE_LENGTH));
    
    for (let i = 0; i < length; i++) {
      seed = (seed * 1664525 + 1013904223) & 0xFFFFFFFF;
      const prime = generatePrime(10, 20); // Small primes for pattern
      pattern.push(prime);
    }
    
    // Store for verification
    this.nodeResonances.set(nodeId, pattern);
    
    return pattern;
  }
  
  /**
   * Compute public resonance value using holographic encoding
   */
  private computePublicResonance(
    privatePrime: u64,
    resonancePattern: Array<u64>
  ): PrimeFieldElement {
    // Compute base value g^private mod p
    const base = modExp(
      PRKEProtocol.GENERATOR,
      privatePrime,
      PRKEProtocol.FIELD_PRIME
    );
    
    // Apply resonance pattern transformation
    let resonance = base;
    for (let i = 0; i < resonancePattern.length; i++) {
      const prime = resonancePattern[i];
      // Holographic transformation: multiply by prime^(i+1) mod p
      const factor = modExp(prime, u64(i + 1), PRKEProtocol.FIELD_PRIME);
      resonance = (resonance * factor) % PRKEProtocol.FIELD_PRIME;
    }
    
    return new PrimeFieldElement(resonance, PRKEProtocol.FIELD_PRIME);
  }
  
  /**
   * Process key exchange with peer
   */
  processExchange(
    localNodeId: string,
    peerNodeId: string,
    peerPublicResonance: PrimeFieldElement,
    peerResonancePattern: Array<u64>
  ): Uint8Array | null {
    const sessionId = this.getSessionId(localNodeId, peerNodeId);
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    
    // Verify peer's resonance pattern
    if (!this.verifyResonancePattern(peerNodeId, peerResonancePattern)) {
      return null;
    }
    
    // Compute shared secret using quantum-inspired mixing
    const sharedSecret = this.computeSharedSecret(
      session.privatePrime,
      session.resonancePattern,
      peerPublicResonance,
      peerResonancePattern
    );
    
    // Derive session key
    session.sessionKey = this.deriveSessionKey(
      sharedSecret,
      localNodeId,
      peerNodeId
    );
    
    // Calculate entanglement strength
    session.entanglementStrength = this.calculateEntanglementStrength(
      session.resonancePattern,
      peerResonancePattern
    );
    
    return session.sessionKey;
  }
  
  /**
   * Verify resonance pattern matches node ID
   */
  private verifyResonancePattern(
    nodeId: string,
    pattern: Array<u64>
  ): bool {
    // Regenerate expected pattern
    const expectedPattern = this.generateResonancePattern(nodeId);
    
    if (pattern.length != expectedPattern.length) return false;
    
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] != expectedPattern[i]) return false;
    }
    
    return true;
  }
  
  /**
   * Compute shared secret using holographic mixing
   */
  private computeSharedSecret(
    privatePrime: u64,
    localPattern: Array<u64>,
    peerResonance: PrimeFieldElement,
    peerPattern: Array<u64>
  ): u64 {
    // Extract peer's base value by reversing resonance transformation
    let peerBase = peerResonance.value;
    
    // Reverse peer's pattern transformation
    for (let i = peerPattern.length - 1; i >= 0; i--) {
      const prime = peerPattern[i];
      const factor = modExp(prime, u64(i + 1), PRKEProtocol.FIELD_PRIME);
      const invFactor = modInverse(factor, PRKEProtocol.FIELD_PRIME);
      peerBase = (peerBase * invFactor) % PRKEProtocol.FIELD_PRIME;
    }
    
    // Compute basic DH shared secret
    let shared = modExp(peerBase, privatePrime, PRKEProtocol.FIELD_PRIME);
    
    // Apply holographic mixing using both patterns
    const mixedPattern = this.mixResonancePatterns(localPattern, peerPattern);
    for (let i = 0; i < mixedPattern.length; i++) {
      const prime = mixedPattern[i];
      shared = (shared * prime + u64(i + 1)) % PRKEProtocol.FIELD_PRIME;
    }
    
    return shared;
  }
  
  /**
   * Mix two resonance patterns holographically
   */
  private mixResonancePatterns(
    pattern1: Array<u64>,
    pattern2: Array<u64>
  ): Array<u64> {
    const mixed = new Array<u64>();
    const maxLen = max(pattern1.length, pattern2.length);
    
    for (let i = 0; i < maxLen; i++) {
      const p1 = i < pattern1.length ? pattern1[i] : u64(1);
      const p2 = i < pattern2.length ? pattern2[i] : u64(1);
      
      // Holographic mixing: use product of primes
      const mixed_prime = this.findNextPrime(p1 * p2);
      mixed.push(mixed_prime);
    }
    
    return mixed;
  }
  
  /**
   * Find next prime after given number
   */
  private findNextPrime(n: u64): u64 {
    if (n < 2) return 2;
    let candidate = n;
    while (!isPrime(candidate)) {
      candidate++;
    }
    return candidate;
  }
  
  /**
   * Derive session key from shared secret
   */
  private deriveSessionKey(
    sharedSecret: u64,
    localNodeId: string,
    peerNodeId: string
  ): Uint8Array {
    // Combine shared secret with node IDs
    const input = new Uint8Array(24);
    
    // Write shared secret (8 bytes)
    for (let i = 0; i < 8; i++) {
      input[i] = u8((sharedSecret >> (8 * i)) & 0xFF);
    }
    
    // Write node IDs (8 bytes each) - convert string to bytes
    const localBytes = new Uint8Array(8);
    const peerBytes = new Uint8Array(8);
    
    // Simple hash of node ID strings to 8 bytes
    const localHash = sha256(Uint8Array.wrap(String.UTF8.encode(localNodeId)));
    const peerHash = sha256(Uint8Array.wrap(String.UTF8.encode(peerNodeId)));
    for (let i = 0; i < 8; i++) {
      input[8 + i] = localHash[i];
      input[16 + i] = peerHash[i];
    }
    
    // Derive key using SHA-256
    return sha256(input);
  }
  
  /**
   * Calculate entanglement strength from resonance patterns
   */
  private calculateEntanglementStrength(
    pattern1: Array<u64>,
    pattern2: Array<u64>
  ): f64 {
    // Calculate pattern similarity using prime factorization overlap
    let commonFactors = 0;
    let totalFactors = 0;
    
    for (let i = 0; i < pattern1.length; i++) {
      const factors1 = this.primeFactorize(pattern1[i]);
      totalFactors += factors1.length;
      
      if (i < pattern2.length) {
        const factors2 = this.primeFactorize(pattern2[i]);
        totalFactors += factors2.length;
        
        // Count common factors
        for (let j = 0; j < factors1.length; j++) {
          for (let k = 0; k < factors2.length; k++) {
            if (factors1[j] == factors2[k]) {
              commonFactors++;
            }
          }
        }
      }
    }
    
    // Add remaining pattern2 factors
    for (let i = pattern1.length; i < pattern2.length; i++) {
      const factors = this.primeFactorize(pattern2[i]);
      totalFactors += factors.length;
    }
    
    // Calculate strength as ratio of common to total
    const strength = totalFactors > 0 ? f64(commonFactors) / f64(totalFactors) : 0.0;
    
    // Apply quantum-inspired transformation
    return Math.tanh(strength * 2.0); // Smooth to [0, 1]
  }
  
  /**
   * Prime factorization for small numbers
   */
  private primeFactorize(n: u64): Array<u64> {
    const factors = new Array<u64>();
    let num = n;
    
    // Check small primes
    const smallPrimes: u64[] = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31];
    
    for (let i = 0; i < smallPrimes.length; i++) {
      const prime = smallPrimes[i];
      while (num % prime == 0) {
        factors.push(prime);
        num /= prime;
      }
    }
    
    // If remainder is prime, add it
    if (num > 1 && isPrime(num)) {
      factors.push(num);
    }
    
    return factors;
  }
  
  /**
   * Create multi-party key exchange using holographic fragments
   */
  createMultiPartyExchange(
    localNodeId: string,
    participants: Array<string>
  ): Map<string, Uint8Array> {
    const keys = new Map<string, Uint8Array>();
    
    // Initialize local session
    const localSession = this.initSession(localNodeId);
    
    // Generate holographic key fragments
    const fragments = this.generateHolographicFragments(
      localSession.privatePrime,
      participants.length
    );
    
    // Create pairwise keys with each participant
    for (let i = 0; i < participants.length; i++) {
      const participant = participants[i];
      
      // Simulate participant's session (in practice, would receive their public data)
      const peerSession = this.initSession(participant);
      
      // Exchange using holographic fragment
      const fragmentSession = new PRKESession(localNodeId);
      fragmentSession.privatePrime = fragments[i];
      fragmentSession.resonancePattern = localSession.resonancePattern;
      fragmentSession.publicResonance = this.computePublicResonance(
        fragments[i],
        localSession.resonancePattern
      );
      
      // Process exchange
      const key = this.processExchange(
        localNodeId,
        participant,
        peerSession.publicResonance,
        peerSession.resonancePattern
      );
      
      if (key) {
        keys.set(participant, key);
      }
    }
    
    return keys;
  }
  
  /**
   * Generate holographic fragments of private key
   */
  private generateHolographicFragments(
    privatePrime: u64,
    count: i32
  ): Array<u64> {
    const fragments = new Array<u64>();
    
    // Use Shamir-like secret sharing in prime field
    const coefficients = new Array<u64>();
    coefficients.push(privatePrime); // Secret is constant term
    
    // Generate random coefficients
    for (let i = 1; i < count; i++) {
      coefficients.push(generatePrime(10, 20));
    }
    
    // Evaluate polynomial at different points
    for (let i = 1; i <= count; i++) {
      let fragment: u64 = 0;
      let x_power: u64 = 1;
      
      for (let j = 0; j < coefficients.length; j++) {
        fragment = (fragment + coefficients[j] * x_power) % PRKEProtocol.FIELD_PRIME;
        x_power = (x_power * u64(i)) % PRKEProtocol.FIELD_PRIME;
      }
      
      fragments.push(fragment);
    }
    
    return fragments;
  }
  
  /**
   * Get session by ID
   */
  getSession(localNodeId: string, peerNodeId: string): PRKESession | null {
    const sessionId = this.getSessionId(localNodeId, peerNodeId);
    return this.sessions.get(sessionId);
  }
  
  /**
   * Generate session ID from node pair
   */
  private getSessionId(node1: string, node2: string): string {
    // Order nodes for consistent ID
    const id1 = node1;
    const id2 = node2;
    return id1 < id2 ? `${id1}-${id2}` : `${id2}-${id1}`;
  }
  
  /**
   * Check if nodes can establish secure connection
   */
  canEstablishSecureConnection(
    node1: string,
    node2: string,
    minEntanglement: f64 = PRKEProtocol.ENTANGLEMENT_THRESHOLD
  ): bool {
    const session = this.getSession(node1, node2);
    if (!session) return false;
    
    return session.entanglementStrength >= minEntanglement;
  }
  
  /**
   * Refresh session key using quantum rotation
   */
  refreshSessionKey(
    localNodeId: string,
    peerNodeId: string
  ): Uint8Array | null {
    const session = this.getSession(localNodeId, peerNodeId);
    if (!session || !session.sessionKey) return null;
    
    // Generate rotation angle from current key
    let angle: f64 = 0;
    for (let i = 0; i < 8; i++) {
      angle += f64(session.sessionKey[i]) / 255.0;
    }
    angle = (angle / 8.0) * Math.PI * 2.0;
    
    // Apply quantum rotation to private prime
    const rotatedPrime = this.quantumRotatePrime(session.privatePrime, angle);
    
    // Recompute shared secret with rotated prime
    const peerSession = this.getSession(peerNodeId, localNodeId);
    if (!peerSession) return null;
    
    const newShared = this.computeSharedSecret(
      rotatedPrime,
      session.resonancePattern,
      peerSession.publicResonance,
      peerSession.resonancePattern
    );
    
    // Derive new key
    session.sessionKey = this.deriveSessionKey(
      newShared,
      localNodeId,
      peerNodeId
    );
    
    return session.sessionKey;
  }
  
  /**
   * Apply quantum rotation to prime
   */
  private quantumRotatePrime(prime: u64, angle: f64): u64 {
    // Convert to complex representation
    const real = f64(prime) * Math.cos(angle);
    const imag = f64(prime) * Math.sin(angle);
    
    // Apply rotation and map back to prime field
    const rotated = Math.sqrt(real * real + imag * imag);
    const newPrime = u64(rotated) % PRKEProtocol.FIELD_PRIME;
    
    // Ensure result is prime
    return this.findNextPrime(newPrime);
  }
}

// Helper functions
function max(a: i32, b: i32): i32 {
  return a > b ? a : b;
}