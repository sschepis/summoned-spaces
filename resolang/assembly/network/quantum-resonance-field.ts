/**
 * Quantum Resonance Field for ResonNet Testnet Genesis
 * Implements Phase 1 of the genesis hologram creation
 */

import { PrimeState } from "../prime-resonance";
import { ResonantFragment } from "../resonlang";
import { JSONBuilder } from "../core/serialization";

/**
 * Represents a prime anchor point in the quantum field
 */
export class QuantumPrimeAnchor {
  name: string;
  role: string;
  primes: u32[];
  resonantFragment: ResonantFragment;
  
  constructor(p1: u32, p2: u32, p3: u32, name: string, role: string) {
    this.name = name;
    this.role = role;
    this.primes = [p1, p2, p3];
    
    // Create resonant fragment from prime triplet
    const coeffs = new Map<u32, f64>();
    coeffs.set(p1, 1.0 / Math.sqrt(3.0));
    coeffs.set(p2, 1.0 / Math.sqrt(3.0));
    coeffs.set(p3, 1.0 / Math.sqrt(3.0));
    
    // Center based on prime values
    const centerX = f64(p1 + p2 + p3) / 3.0;
    const centerY = f64(p1 * p2 * p3) % 100.0;
    
    // Entropy based on prime distribution
    const entropy = Math.log(f64(p1)) + Math.log(f64(p2)) + Math.log(f64(p3));
    
    this.resonantFragment = new ResonantFragment(coeffs, centerX, centerY, entropy);
  }
  
  /**
   * Calculate resonance strength with another anchor
   */
  calculateResonance(other: QuantumPrimeAnchor): f64 {
    // Calculate resonance based on shared prime factors and entropy difference
    let sharedPrimes = 0;
    for (let i = 0; i < this.primes.length; i++) {
      for (let j = 0; j < other.primes.length; j++) {
        if (this.primes[i] == other.primes[j]) {
          sharedPrimes++;
        }
      }
    }
    
    // Base resonance from shared primes
    const baseResonance = f64(sharedPrimes) / 3.0;
    
    // Entropy difference factor
    const entropyDiff = Math.abs(this.resonantFragment.entropy - other.resonantFragment.entropy);
    const entropyFactor = Math.exp(-entropyDiff / 10.0);
    
    // Distance in center coordinates
    const dx = this.resonantFragment.center[0] - other.resonantFragment.center[0];
    const dy = this.resonantFragment.center[1] - other.resonantFragment.center[1];
    const distance = Math.sqrt(dx * dx + dy * dy);
    const distanceFactor = Math.exp(-distance / 50.0);
    
    return baseResonance * 0.5 + entropyFactor * 0.3 + distanceFactor * 0.2;
  }
  
  /**
   * Get the quantum state representation
   */
  getQuantumState(): PrimeState {
    const amplitudes = new Map<u32, f64>();
    
    // Create superposition of the three primes
    const normFactor = 1.0 / Math.sqrt(3.0);
    amplitudes.set(this.primes[0], normFactor);
    amplitudes.set(this.primes[1], normFactor);
    amplitudes.set(this.primes[2], normFactor);
    
    return new PrimeState(amplitudes);
  }
  
  toJSON(): string {
    const builder = new JSONBuilder();
    builder.startObject();
    builder.addStringField("name", this.name);
    builder.addStringField("role", this.role);
    
    // Add primes array
    const primeParts: string[] = [];
    primeParts.push("[");
    for (let i = 0; i < this.primes.length; i++) {
      if (i > 0) primeParts.push(",");
      primeParts.push(this.primes[i].toString());
    }
    primeParts.push("]");
    builder.addRawField("primes", primeParts.join(""));
    
    builder.endObject();
    return builder.build();
  }
}

/**
 * Represents a resonance pattern connecting multiple anchors
 */
export class QuantumResonancePattern {
  name: string;
  anchors: QuantumPrimeAnchor[];
  strength: f64;
  
  constructor(name: string, anchors: QuantumPrimeAnchor[]) {
    this.name = name;
    this.anchors = anchors;
    this.strength = this.calculatePatternStrength();
  }
  
  /**
   * Calculate the overall strength of the resonance pattern
   */
  private calculatePatternStrength(): f64 {
    if (this.anchors.length < 2) return 0.0;
    
    let totalResonance: f64 = 0.0;
    let pairCount: i32 = 0;
    
    // Calculate pairwise resonance between all anchors
    for (let i = 0; i < this.anchors.length; i++) {
      for (let j = i + 1; j < this.anchors.length; j++) {
        totalResonance += this.anchors[i].calculateResonance(this.anchors[j]);
        pairCount++;
      }
    }
    
    return pairCount > 0 ? totalResonance / f64(pairCount) : 0.0;
  }
  
  /**
   * Check if the pattern forms a connected graph
   */
  isConnected(): boolean {
    if (this.anchors.length <= 1) return true;
    
    // Simple connectivity check - ensure all anchors have some resonance
    for (let i = 0; i < this.anchors.length; i++) {
      let hasConnection = false;
      for (let j = 0; j < this.anchors.length; j++) {
        if (i != j && this.anchors[i].calculateResonance(this.anchors[j]) > 0.1) {
          hasConnection = true;
          break;
        }
      }
      if (!hasConnection) return false;
    }
    
    return true;
  }
  
  toJSON(): string {
    const builder = new JSONBuilder();
    builder.startObject();
    builder.addStringField("name", this.name);
    builder.addNumberField("strength", this.strength);
    builder.addBooleanField("connected", this.isConnected());
    
    // Add anchor names
    const anchorParts: string[] = [];
    anchorParts.push("[");
    for (let i = 0; i < this.anchors.length; i++) {
      if (i > 0) anchorParts.push(",");
      anchorParts.push('"' + this.anchors[i].name + '"');
    }
    anchorParts.push("]");
    builder.addRawField("anchors", anchorParts.join(""));
    
    builder.endObject();
    return builder.build();
  }
}

/**
 * The quantum resonance field that forms the foundation of the network
 */
export class QuantumResonanceField {
  anchors: Map<string, QuantumPrimeAnchor>;
  patterns: Map<string, QuantumResonancePattern>;
  initialized: boolean;
  
  constructor() {
    this.anchors = new Map<string, QuantumPrimeAnchor>();
    this.patterns = new Map<string, QuantumResonancePattern>();
    this.initialized = false;
  }
  
  /**
   * Initialize the field with prime anchors
   */
  initialize(anchors: QuantumPrimeAnchor[]): void {
    if (this.initialized) {
      throw new Error("Quantum field already initialized");
    }
    
    // Add all anchors to the field
    for (let i = 0; i < anchors.length; i++) {
      const anchor = anchors[i];
      this.anchors.set(anchor.name, anchor);
    }
    
    // Validate prime numbers
    this.validatePrimes();
    
    // Calculate initial field strength
    this.calculateFieldCoherence();
    
    this.initialized = true;
  }
  
  /**
   * Create a resonance pattern between anchors
   */
  createResonancePattern(name: string, anchorNames: string[]): QuantumResonancePattern {
    if (!this.initialized) {
      throw new Error("Quantum field not initialized");
    }
    
    const patternAnchors: QuantumPrimeAnchor[] = [];
    
    // Collect anchors for the pattern
    for (let i = 0; i < anchorNames.length; i++) {
      const anchor = this.anchors.get(anchorNames[i]);
      if (!anchor) {
        throw new Error("Anchor not found: " + anchorNames[i]);
      }
      patternAnchors.push(anchor);
    }
    
    // Create and store the pattern
    const pattern = new QuantumResonancePattern(name, patternAnchors);
    this.patterns.set(name, pattern);
    
    // Verify pattern connectivity
    if (!pattern.isConnected()) {
      console.warn("Warning: Pattern " + name + " is not fully connected");
    }
    
    return pattern;
  }
  
  /**
   * Validate that all primes in anchors are actually prime
   */
  private validatePrimes(): void {
    const keys = this.anchors.keys();
    for (let i = 0; i < keys.length; i++) {
      const anchor = this.anchors.get(keys[i]);
      for (let j = 0; j < anchor.primes.length; j++) {
        if (!isPrime(anchor.primes[j])) {
          throw new Error("Invalid prime in anchor " + anchor.name + ": " + anchor.primes[j].toString());
        }
      }
    }
  }
  
  /**
   * Calculate overall field coherence
   */
  private calculateFieldCoherence(): f64 {
    let totalCoherence: f64 = 0.0;
    let measurementCount: i32 = 0;
    
    const keys = this.anchors.keys();
    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        const anchor1 = this.anchors.get(keys[i]);
        const anchor2 = this.anchors.get(keys[j]);
        totalCoherence += anchor1.calculateResonance(anchor2);
        measurementCount++;
      }
    }
    
    return measurementCount > 0 ? totalCoherence / f64(measurementCount) : 0.0;
  }
  
  /**
   * Get quantum entanglement between two anchors
   */
  getEntanglement(anchor1Name: string, anchor2Name: string): f64 {
    const anchor1 = this.anchors.get(anchor1Name);
    const anchor2 = this.anchors.get(anchor2Name);
    
    if (!anchor1 || !anchor2) {
      throw new Error("Anchor not found");
    }
    
    return anchor1.calculateResonance(anchor2);
  }
  
  /**
   * Perform quantum measurement on the field
   */
  measure(anchorName: string): PrimeState {
    const anchor = this.anchors.get(anchorName);
    if (!anchor) {
      throw new Error("Anchor not found: " + anchorName);
    }
    
    return anchor.getQuantumState();
  }
  
  toJSON(): string {
    const builder = new JSONBuilder();
    builder.startObject();
    builder.addBooleanField("initialized", this.initialized);
    builder.addNumberField("fieldCoherence", this.calculateFieldCoherence());
    
    // Add anchors
    const anchorParts: string[] = [];
    anchorParts.push("[");
    const anchorKeys = this.anchors.keys();
    for (let i = 0; i < anchorKeys.length; i++) {
      if (i > 0) anchorParts.push(",");
      const anchor = this.anchors.get(anchorKeys[i]);
      anchorParts.push(anchor.toJSON());
    }
    anchorParts.push("]");
    builder.addRawField("anchors", anchorParts.join(""));
    
    // Add patterns
    const patternParts: string[] = [];
    patternParts.push("[");
    const patternKeys = this.patterns.keys();
    for (let i = 0; i < patternKeys.length; i++) {
      if (i > 0) patternParts.push(",");
      const pattern = this.patterns.get(patternKeys[i]);
      patternParts.push(pattern.toJSON());
    }
    patternParts.push("]");
    builder.addRawField("patterns", patternParts.join(""));
    
    builder.endObject();
    return builder.build();
  }
}

/**
 * Helper function to check if a number is prime
 */
function isPrime(n: u32): boolean {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 == 0 || n % 3 == 0) return false;
  
  let i: u32 = 5;
  while (i * i <= n) {
    if (n % i == 0 || n % (i + 2) == 0) return false;
    i += 6;
  }
  
  return true;
}

/**
 * Create the testnet quantum resonance field with predefined anchors
 */
export function createTestnetQuantumField(): QuantumResonanceField {
  const field = new QuantumResonanceField();
  
  // Create the 8 prime anchors as specified in the guide
  const anchors: QuantumPrimeAnchor[] = [
    new QuantumPrimeAnchor(2, 3, 5, "Alpha", "Foundation"),
    new QuantumPrimeAnchor(7, 11, 13, "Beta", "Computation"),
    new QuantumPrimeAnchor(17, 19, 23, "Gamma", "Communication"),
    new QuantumPrimeAnchor(29, 31, 37, "Delta", "Storage"),
    new QuantumPrimeAnchor(41, 43, 47, "Epsilon", "Verification"),
    new QuantumPrimeAnchor(53, 59, 61, "Zeta", "Consensus"),
    new QuantumPrimeAnchor(67, 71, 73, "Eta", "Security"),
    new QuantumPrimeAnchor(79, 83, 89, "Theta", "Governance")
  ];
  
  // Initialize the field
  field.initialize(anchors);
  
  // Create the three resonance patterns
  field.createResonancePattern("testnet-alpha", ["Alpha", "Beta", "Gamma"]);
  field.createResonancePattern("testnet-beta", ["Delta", "Epsilon", "Zeta"]);
  field.createResonancePattern("testnet-gamma", ["Eta", "Theta", "Alpha"]);
  
  return field;
}
