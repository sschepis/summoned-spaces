/**
 * Standalone test runner for Quantum Resonance Field
 */

import { runQuantumFieldTests } from "./test-quantum-field";

// Run the tests
console.log("=== Running Quantum Resonance Field Tests ===\n");
runQuantumFieldTests();
console.log("\n=== Tests Complete ===");

// Export a dummy function to make this a valid module
export function main(): void {
  // This function exists just to make the module valid
}