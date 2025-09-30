/**
 * Simplified test for Holographic Layer (Phase 7)
 * Tests the creation of quantum entanglements without console output
 */

import {
  HolographicFragment,
  QuantumEntanglement,
  HolographicLayer,
  FragmentType,
  createTestnetHolographicLayer
} from "./holographic-layer";

// Test holographic layer functionality
export function testHolographicLayer(): boolean {
  // Create the testnet holographic layer
  const layer = createTestnetHolographicLayer();
  
  // Verify fragment creation
  const fragmentKeys = layer.fragments.keys();
  if (fragmentKeys.length != 5) {
    return false; // Expected 5 fragments
  }
  
  // Verify specific fragments exist
  const identityFragment = layer.fragments.get("identity-constellation");
  if (!identityFragment || identityFragment.type != FragmentType.IDENTITY_MAP) {
    return false;
  }
  
  const domainFragment = layer.fragments.get("domain-hierarchy");
  if (!domainFragment || domainFragment.type != FragmentType.DOMAIN_TREE) {
    return false;
  }
  
  const permissionFragment = layer.fragments.get("permission-matrix");
  if (!permissionFragment || permissionFragment.type != FragmentType.PERMISSION_GRAPH) {
    return false;
  }
  
  const resonanceFragment = layer.fragments.get("resonance-field");
  if (!resonanceFragment || resonanceFragment.type != FragmentType.RESONANCE_FIELD) {
    return false;
  }
  
  const validatorFragment = layer.fragments.get("validator-network");
  if (!validatorFragment || validatorFragment.type != FragmentType.VALIDATOR_NETWORK) {
    return false;
  }
  
  // Verify fragment data
  if (identityFragment.data.keys().length < 6) {
    return false; // Should have at least 6 identity relationships
  }
  
  if (domainFragment.data.keys().length < 7) {
    return false; // Should have at least 7 domains
  }
  
  // Verify resonance frequencies are set
  if (identityFragment.resonanceFrequency <= 0.0 || identityFragment.resonanceFrequency > 1.0) {
    return false;
  }
  
  // Verify entanglement creation
  const entanglementKeys = layer.entanglements.keys();
  if (entanglementKeys.length != 5) {
    return false; // Expected 5 entanglements
  }
  
  // Verify specific entanglements
  const identityDomainEntanglement = layer.entanglements.get("identity-domain");
  if (!identityDomainEntanglement) {
    return false;
  }
  
  if (identityDomainEntanglement.fragmentIds.length != 2) {
    return false;
  }
  
  if (identityDomainEntanglement.strength != 0.9) {
    return false;
  }
  
  // Verify full coherence entanglement
  const fullCoherence = layer.entanglements.get("full-coherence");
  if (!fullCoherence) {
    return false;
  }
  
  if (fullCoherence.fragmentIds.length != 5) {
    return false; // Should connect all 5 fragments
  }
  
  if (fullCoherence.strength != 0.7) {
    return false;
  }
  
  // Test coherence calculation
  layer.updateCoherences();
  
  // Verify coherence is within valid range
  for (let i = 0; i < entanglementKeys.length; i++) {
    const entanglement = layer.entanglements.get(entanglementKeys[i]);
    if (entanglement) {
      if (entanglement.coherence < 0.0 || entanglement.coherence > 1.0) {
        return false;
      }
    }
  }
  
  // Test dynamic fragment addition
  const newFragment = new HolographicFragment("test-fragment", FragmentType.IDENTITY_MAP);
  newFragment.addData("test1", "value1");
  newFragment.addData("test2", "value2");
  layer.addFragment(newFragment);
  
  if (layer.fragments.keys().length != 6) {
    return false; // Should now have 6 fragments
  }
  
  // Test dynamic entanglement creation
  const newEntanglement = layer.createEntanglement(
    "test-entanglement",
    ["test-fragment", "identity-constellation"],
    0.75
  );
  
  if (!newEntanglement || newEntanglement.strength != 0.75) {
    return false;
  }
  
  if (layer.entanglements.keys().length != 6) {
    return false; // Should now have 6 entanglements
  }
  
  // Verify summary generation
  const summary = layer.getSummary();
  if (summary.length == 0) {
    return false;
  }
  
  // All tests passed
  return true;
}

// Export a simple test function
export function runTest(): i32 {
  const result = testHolographicLayer();
  return result ? 1 : 0;
}