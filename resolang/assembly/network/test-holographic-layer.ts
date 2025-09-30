/**
 * Test suite for Holographic Layer (Phase 7)
 * Tests the creation of quantum entanglements between network components
 */

import {
  HolographicFragment,
  QuantumEntanglement,
  HolographicLayer,
  FragmentType,
  createTestnetHolographicLayer
} from "./holographic-layer";

// Simple logging function
function log(message: string): void {
  console.log(message);
}

// Test holographic layer creation
export function testHolographicLayer(): void {
  log("\n🔷 Testing Holographic Layer (Phase 7) 🔷");
  
  // Create the testnet holographic layer
  const layer = createTestnetHolographicLayer();
  
  log("\n✓ Created testnet holographic layer");
  
  // Test fragment creation
  log("\n=== Holographic Fragments ===");
  const fragmentKeys = layer.fragments.keys();
  log("Total fragments: " + fragmentKeys.length.toString());
  
  for (let i = 0; i < fragmentKeys.length; i++) {
    const fragment = layer.fragments.get(fragmentKeys[i]);
    if (fragment) {
      log("\n" + fragment.getSummary());
      
      // Show some fragment data
      const dataKeys = fragment.data.keys();
      if (dataKeys.length > 0) {
        log("  Sample data:");
        for (let j = 0; j < Math.min(3, dataKeys.length); j++) {
          const key = dataKeys[j];
          const value = fragment.data.get(key);
          if (value) {
            log("    " + key + " => " + value);
          }
        }
        if (dataKeys.length > 3) {
          log("    ... and " + (dataKeys.length - 3).toString() + " more entries");
        }
      }
    }
  }
  
  // Test entanglement creation
  log("\n=== Quantum Entanglements ===");
  const entanglementKeys = layer.entanglements.keys();
  log("Total entanglements: " + entanglementKeys.length.toString());
  
  for (let i = 0; i < entanglementKeys.length; i++) {
    const entanglement = layer.entanglements.get(entanglementKeys[i]);
    if (entanglement) {
      log("\n" + entanglement.getSummary());
      log("  Fragments:");
      for (let j = 0; j < entanglement.fragmentIds.length; j++) {
        log("    - " + entanglement.fragmentIds[j]);
      }
    }
  }
  
  // Test coherence updates
  log("\n=== Coherence Updates ===");
  log("Updating all entanglement coherences...");
  layer.updateCoherences();
  log("✓ Coherences updated");
  
  // Show updated coherences
  for (let i = 0; i < entanglementKeys.length; i++) {
    const entanglement = layer.entanglements.get(entanglementKeys[i]);
    if (entanglement) {
      log(entanglement.name + " coherence: " + entanglement.coherence.toString());
    }
  }
  
  // Test adding new fragment
  log("\n=== Dynamic Fragment Addition ===");
  const newFragment = new HolographicFragment("test-fragment", FragmentType.IDENTITY_MAP);
  newFragment.addData("test1", "value1");
  newFragment.addData("test2", "value2");
  layer.addFragment(newFragment);
  log("✓ Added new fragment: " + newFragment.getSummary());
  
  // Test creating new entanglement
  const newEntanglement = layer.createEntanglement(
    "test-entanglement",
    ["test-fragment", "identity-constellation"],
    0.75
  );
  log("✓ Created new entanglement: " + newEntanglement.getSummary());
  
  // Show final summary
  log("\n=== Holographic Layer Summary ===");
  log(layer.getSummary());
  
  log("\n✅ Holographic Layer test completed successfully!");
}

// Run the test
testHolographicLayer();