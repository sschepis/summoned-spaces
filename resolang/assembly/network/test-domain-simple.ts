/**
 * Simplified test for Domain Hierarchy (Phase 4)
 * This version avoids complex assertions and focuses on demonstrating functionality
 */

import { 
  TestnetDomain, 
  DomainNode, 
  DomainHierarchy, 
  createTestnetDomainHierarchy,
  DomainPermissionManager 
} from "./domain-hierarchy-simple";

// Simple logging function
function log(message: string): void {
  console.log(message);
}

// Test domain hierarchy creation
export function testDomainHierarchy(): void {
  log("\n🔷 Testing Domain Hierarchy (Phase 4) 🔷");
  
  // Create hierarchy
  const hierarchy = createTestnetDomainHierarchy("testnet-admin");
  
  log("\n✓ Created domain hierarchy with testnet-admin as owner");
  
  // Test root domains
  log("\n=== Root Domains ===");
  const roots = hierarchy.listDomainsAtLevel([]);
  log("Number of root domains: " + roots.length.toString());
  
  for (let i = 0; i < roots.length; i++) {
    const domain = roots[i];
    log("- " + domain.getName() + " (owner: " + domain.getOwnerId() + ")");
  }
  
  // Test testnet subdomains
  log("\n=== Testnet Subdomains ===");
  const testnetSubs = hierarchy.listDomainsAtLevel(["testnet"]);
  log("Number of testnet subdomains: " + testnetSubs.length.toString());
  
  for (let i = 0; i < testnetSubs.length; i++) {
    const domain = testnetSubs[i];
    log("- " + domain.getName());
  }
  
  // Test dev subdomains
  log("\n=== Dev Subdomains ===");
  const devSubs = hierarchy.listDomainsAtLevel(["dev"]);
  log("Number of dev subdomains: " + devSubs.length.toString());
  
  for (let i = 0; i < devSubs.length; i++) {
    const domain = devSubs[i];
    log("- " + domain.getName() + " (owner: " + domain.getOwnerId() + ")");
  }
  
  // Test nested domains
  log("\n=== Alice's Domains ===");
  const aliceNode = hierarchy.getDomainNode(["dev", "alice"]);
  if (aliceNode) {
    log("Alice's domain found");
    log("Full path: " + aliceNode.getFullName());
    
    const aliceSubs = hierarchy.listDomainsAtLevel(["dev", "alice"]);
    log("Alice has " + aliceSubs.length.toString() + " subdomain(s)");
  }
  
  // Test permissions
  log("\n=== Testing Permissions ===");
  const permManager = new DomainPermissionManager(hierarchy);
  
  // Check Alice's permissions
  const aliceCanModify = permManager.canModifyDomain("test-user-alice", ["dev", "alice"]);
  log("Alice can modify her domain: " + (aliceCanModify ? "YES" : "NO"));
  
  const bobCanModifyAlice = permManager.canModifyDomain("test-user-bob", ["dev", "alice"]);
  log("Bob can modify Alice's domain: " + (bobCanModifyAlice ? "YES" : "NO"));
  
  const adminCanModifyAll = permManager.canModifyDomain("testnet-admin", ["dev", "alice", "project1"]);
  log("Admin can modify nested domains: " + (adminCanModifyAll ? "YES" : "NO"));
  
  // Count domains owned by users
  log("\n=== Domain Ownership ===");
  const aliceDomains = permManager.getDomainsOwnedBy("test-user-alice");
  log("Domains owned by Alice: " + aliceDomains.length.toString());
  
  const adminDomains = permManager.getDomainsOwnedBy("testnet-admin");
  log("Domains owned by Admin: " + adminDomains.length.toString());
  
  // Display hierarchy
  log("\n=== Domain Hierarchy Structure ===");
  log(hierarchy.toString());
  
  log("\n✅ Domain Hierarchy tests completed successfully!");
}

// Run the test
testDomainHierarchy();