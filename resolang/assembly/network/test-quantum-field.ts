/**
 * Test file for Quantum Resonance Field
 * Verifies Phase 1 implementation
 */

import {
  QuantumPrimeAnchor,
  QuantumResonancePattern,
  QuantumResonanceField,
  createTestnetQuantumField
} from "./quantum-resonance-field";
import { toFixed } from "../utils";

/**
 * Test the quantum resonance field initialization
 */
export function testQuantumFieldInitialization(): void {
  console.log("=== Testing Quantum Resonance Field Initialization ===");
  
  // Create the testnet quantum field
  const field = createTestnetQuantumField();
  
  // Verify field is initialized
  console.log("Field initialized: " + field.initialized.toString());
  
  // Check anchors
  const anchorNames = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta", "Theta"];
  console.log("\nVerifying anchors:");
  
  for (let i = 0; i < anchorNames.length; i++) {
    const anchor = field.anchors.get(anchorNames[i]);
    if (anchor) {
      console.log(`  ${anchor.name} (${anchor.role}): [${anchor.primes.join(", ")}]`);
    } else {
      console.log(`  ERROR: Anchor ${anchorNames[i]} not found!`);
    }
  }
  
  // Check patterns
  const patternNames = ["testnet-alpha", "testnet-beta", "testnet-gamma"];
  console.log("\nVerifying resonance patterns:");
  
  for (let i = 0; i < patternNames.length; i++) {
    const pattern = field.patterns.get(patternNames[i]);
    if (pattern) {
      console.log(`  ${pattern.name}: strength=${toFixed(pattern.strength, 4)}, connected=${pattern.isConnected()}`);
    } else {
      console.log(`  ERROR: Pattern ${patternNames[i]} not found!`);
    }
  }
  
  // Test quantum measurements
  console.log("\nTesting quantum measurements:");
  const alphaState = field.measure("Alpha");
  console.log("  Alpha quantum state has " + alphaState.amplitudes.size.toString() + " components");
  
  // Test entanglement
  console.log("\nTesting entanglement between anchors:");
  const entanglementAB = field.getEntanglement("Alpha", "Beta");
  const entanglementAG = field.getEntanglement("Alpha", "Gamma");
  const entanglementDT = field.getEntanglement("Delta", "Theta");
  
  console.log(`  Alpha <-> Beta: ${toFixed(entanglementAB, 4)}`);
  console.log(`  Alpha <-> Gamma: ${toFixed(entanglementAG, 4)}`);
  console.log(`  Delta <-> Theta: ${toFixed(entanglementDT, 4)}`);
  
  // Output JSON representation
  console.log("\nJSON representation:");
  console.log(field.toJSON());
}

/**
 * Test individual anchor functionality
 */
export function testQuantumAnchors(): void {
  console.log("\n=== Testing Quantum Prime Anchors ===");
  
  // Create test anchors
  const anchor1 = new QuantumPrimeAnchor(2, 3, 5, "Test1", "Testing");
  const anchor2 = new QuantumPrimeAnchor(7, 11, 13, "Test2", "Testing");
  const anchor3 = new QuantumPrimeAnchor(2, 7, 17, "Test3", "Testing"); // Shares prime 2 with anchor1, 7 with anchor2
  
  console.log("Created test anchors:");
  console.log(`  ${anchor1.name}: [${anchor1.primes.join(", ")}]`);
  console.log(`  ${anchor2.name}: [${anchor2.primes.join(", ")}]`);
  console.log(`  ${anchor3.name}: [${anchor3.primes.join(", ")}]`);
  
  // Test resonance calculations
  console.log("\nResonance calculations:");
  const res12 = anchor1.calculateResonance(anchor2);
  const res13 = anchor1.calculateResonance(anchor3);
  const res23 = anchor2.calculateResonance(anchor3);
  
  console.log(`  Test1 <-> Test2: ${toFixed(res12, 4)} (no shared primes)`);
  console.log(`  Test1 <-> Test3: ${toFixed(res13, 4)} (shares prime 2)`);
  console.log(`  Test2 <-> Test3: ${toFixed(res23, 4)} (shares prime 7)`);
  
  // Test quantum states
  console.log("\nQuantum states:");
  const state1 = anchor1.getQuantumState();
  const state2 = anchor2.getQuantumState();
  
  console.log(`  Anchor1 state components: ${state1.amplitudes.size}`);
  console.log(`  Anchor2 state components: ${state2.amplitudes.size}`);
}

/**
 * Test resonance pattern functionality
 */
export function testResonancePatterns(): void {
  console.log("\n=== Testing Resonance Patterns ===");
  
  // Create a custom field
  const field = new QuantumResonanceField();
  
  // Create anchors with specific relationships
  const anchors: QuantumPrimeAnchor[] = [
    new QuantumPrimeAnchor(2, 3, 5, "A", "Test"),
    new QuantumPrimeAnchor(3, 5, 7, "B", "Test"),    // Shares 3,5 with A
    new QuantumPrimeAnchor(5, 7, 11, "C", "Test"),   // Shares 5 with A,B and 7 with B
    new QuantumPrimeAnchor(13, 17, 19, "D", "Test")  // No shared primes
  ];
  
  field.initialize(anchors);
  
  // Create patterns
  const connectedPattern = field.createResonancePattern("connected", ["A", "B", "C"]);
  const disconnectedPattern = field.createResonancePattern("disconnected", ["A", "D"]);
  const fullPattern = field.createResonancePattern("full", ["A", "B", "C", "D"]);
  
  console.log("Pattern analysis:");
  console.log(`  Connected pattern (A-B-C): strength=${toFixed(connectedPattern.strength, 4)}, connected=${connectedPattern.isConnected()}`);
  console.log(`  Disconnected pattern (A-D): strength=${toFixed(disconnectedPattern.strength, 4)}, connected=${disconnectedPattern.isConnected()}`);
  console.log(`  Full pattern (A-B-C-D): strength=${toFixed(fullPattern.strength, 4)}, connected=${fullPattern.isConnected()}`);
}

/**
 * Run all quantum field tests
 */
export function runQuantumFieldTests(): void {
  console.log("Starting Quantum Resonance Field Tests\n");
  
  testQuantumFieldInitialization();
  testQuantumAnchors();
  testResonancePatterns();
  
  console.log("\n=== Quantum Field Tests Complete ===");
}
