/**
 * Test suite for Domain Hierarchy (Phase 4)
 * Tests the creation and management of nested domains for the ResonNet testnet
 */

import { 
  TestnetDomain, 
  DomainNode, 
  DomainHierarchy, 
  createTestnetDomainHierarchy,
  DomainPermissionManager 
} from "./domain-hierarchy-simple";

// Test helper to verify domain properties
function verifyDomain(
  domain: TestnetDomain,
  expectedName: string,
  expectedOwner: string,
  expectedType: string
): void {
  assert(domain.getName() == expectedName, `Domain name should be ${expectedName}`);
  assert(domain.getOwnerId() == expectedOwner, `Owner should be ${expectedOwner}`);
  assert(domain.getMetadata("type") == expectedType, `Type should be ${expectedType}`);
}

// Test 1: Create root domains
export function testCreateRootDomains(): void {
  console.log("\n=== Test 1: Create Root Domains ===");
  
  const hierarchy = new DomainHierarchy();
  const adminId = "testnet-admin";
  
  // Create testnet root
  const testnetRoot = hierarchy.createRootDomain(
    "testnet",
    adminId,
    "Testnet Root Domain"
  );
  
  verifyDomain(testnetRoot.domain, "testnet", adminId, "root");
  assert(testnetRoot.parent == null, "Root domain should have no parent");
  assert(testnetRoot.getFullName() == "testnet", "Full name should be 'testnet'");
  
  // Create dev root
  const devRoot = hierarchy.createRootDomain(
    "dev",
    adminId,
    "Development Domain"
  );
  
  verifyDomain(devRoot.domain, "dev", adminId, "root");
  
  // Create sandbox root
  const sandboxRoot = hierarchy.createRootDomain(
    "sandbox",
    adminId,
    "Experimental Sandbox Domain"
  );
  
  verifyDomain(sandboxRoot.domain, "sandbox", adminId, "root");
  
  // Verify all roots are registered
  assert(hierarchy.roots.size == 3, "Should have 3 root domains");
  assert(hierarchy.allDomains.size == 3, "Should have 3 total domains");
  
  console.log("✓ Created 3 root domains");
}

// Test 2: Create subdomains
export function testCreateSubdomains(): void {
  console.log("\n=== Test 2: Create Subdomains ===");
  
  const hierarchy = new DomainHierarchy();
  const adminId = "testnet-admin";
  
  // Create root first
  hierarchy.createRootDomain("testnet", adminId, "Testnet Root");
  
  // Create testnet subdomains
  const apps = hierarchy.createSubdomain(
    ["testnet"],
    "apps",
    adminId,
    "Test Applications"
  );
  
  assert(apps != null, "Apps subdomain should be created");
  verifyDomain(apps!.domain, "apps", adminId, "subdomain");
  assert(apps!.getFullName() == "apps.testnet", "Full name should be 'apps.testnet'");
  
  const services = hierarchy.createSubdomain(
    ["testnet"],
    "services",
    adminId,
    "Test Services"
  );
  
  assert(services != null, "Services subdomain should be created");
  assert(services!.getFullName() == "services.testnet", "Full name should be 'services.testnet'");
  
  const users = hierarchy.createSubdomain(
    ["testnet"],
    "users",
    adminId,
    "Test User Domains"
  );
  
  assert(users != null, "Users subdomain should be created");
  
  // Verify subdomain count
  const testnetNode = hierarchy.getDomainNode(["testnet"]);
  assert(testnetNode != null, "Testnet node should exist");
  assert(testnetNode!.children.size == 3, "Testnet should have 3 subdomains");
  
  console.log("✓ Created testnet subdomains");
}

// Test 3: Create nested subdomains
export function testCreateNestedSubdomains(): void {
  console.log("\n=== Test 3: Create Nested Subdomains ===");
  
  const hierarchy = createTestnetDomainHierarchy("testnet-admin");
  
  // Verify alice's project structure
  const aliceProject = hierarchy.getDomainNode(["dev", "alice", "project1"]);
  assert(aliceProject != null, "Alice's project1 should exist");
  assert(aliceProject!.getFullName() == "project1.alice.dev", 
    "Full name should be 'project1.alice.dev'");
  assert(aliceProject!.domain.getOwnerId() == "test-user-alice", 
    "Project should be owned by alice");
  
  // Verify API subdomain
  const apiDomain = hierarchy.getDomainNode(["dev", "alice", "project1", "api"]);
  assert(apiDomain != null, "API subdomain should exist");
  assert(apiDomain!.getFullName() == "api.project1.alice.dev", 
    "Full name should be 'api.project1.alice.dev'");
  
  // Verify sandbox structure
  const quantum = hierarchy.getDomainNode(["sandbox", "experiments", "quantum"]);
  assert(quantum != null, "Quantum subdomain should exist");
  assert(quantum!.getFullName() == "quantum.experiments.sandbox", 
    "Full name should be 'quantum.experiments.sandbox'");
  
  console.log("✓ Created nested subdomain structure");
}

// Test 4: Domain navigation and lookup
export function testDomainNavigation(): void {
  console.log("\n=== Test 4: Domain Navigation ===");
  
  const hierarchy = createTestnetDomainHierarchy("testnet-admin");
  
  // Test getDomain by full path
  const appsDomain = hierarchy.getDomain("apps.testnet");
  assert(appsDomain != null, "Should find apps.testnet domain");
  assert(appsDomain!.getName() == "apps", "Domain name should be 'apps'");
  
  // Test getDomainNode by path array
  const aliceNode = hierarchy.getDomainNode(["dev", "alice"]);
  assert(aliceNode != null, "Should find alice node");
  assert(aliceNode!.domain.getOwnerId() == "test-user-alice", 
    "Alice domain should be owned by alice");
  
  // Test path traversal
  const apiNode = hierarchy.getDomainNode(["dev", "alice", "project1", "api"]);
  assert(apiNode != null, "Should find API node");
  const path = apiNode!.getPath();
  assert(path.length == 4, "Path should have 4 elements");
  assert(path[0] == "dev", "First element should be 'dev'");
  assert(path[1] == "alice", "Second element should be 'alice'");
  assert(path[2] == "project1", "Third element should be 'project1'");
  assert(path[3] == "api", "Fourth element should be 'api'");
  
  console.log("✓ Domain navigation working correctly");
}

// Test 5: List domains at different levels
export function testListDomains(): void {
  console.log("\n=== Test 5: List Domains at Levels ===");
  
  const hierarchy = createTestnetDomainHierarchy("testnet-admin");
  
  // List root domains
  const roots = hierarchy.listDomainsAtLevel([]);
  assert(roots.length == 3, "Should have 3 root domains");
  
  const rootNames: string[] = [];
  for (let i = 0; i < roots.length; i++) {
    rootNames.push(roots[i].getName());
  }
  assert(rootNames.includes("testnet"), "Should include testnet");
  assert(rootNames.includes("dev"), "Should include dev");
  assert(rootNames.includes("sandbox"), "Should include sandbox");
  
  // List testnet subdomains
  const testnetSubs = hierarchy.listDomainsAtLevel(["testnet"]);
  assert(testnetSubs.length == 3, "Testnet should have 3 subdomains");
  
  // List dev subdomains
  const devSubs = hierarchy.listDomainsAtLevel(["dev"]);
  assert(devSubs.length == 3, "Dev should have 3 subdomains (alice, bob, carol)");
  
  // List alice's subdomains
  const aliceSubs = hierarchy.listDomainsAtLevel(["dev", "alice"]);
  assert(aliceSubs.length == 1, "Alice should have 1 subdomain (project1)");
  assert(aliceSubs[0].getName() == "project1", "Alice's subdomain should be project1");
  
  console.log("✓ Domain listing working correctly");
}

// Test 6: Domain permissions
export function testDomainPermissions(): void {
  console.log("\n=== Test 6: Domain Permissions ===");
  
  const hierarchy = createTestnetDomainHierarchy("testnet-admin");
  const permManager = new DomainPermissionManager(hierarchy);
  
  // Test owner permissions
  assert(permManager.canCreateSubdomain("test-user-alice", ["dev", "alice"]), 
    "Alice should be able to create subdomains in her domain");
  assert(permManager.canModifyDomain("test-user-alice", ["dev", "alice"]), 
    "Alice should be able to modify her domain");
  
  // Test non-owner permissions
  assert(!permManager.canCreateSubdomain("test-user-bob", ["dev", "alice"]), 
    "Bob should NOT be able to create subdomains in Alice's domain");
  assert(!permManager.canModifyDomain("test-user-bob", ["dev", "alice"]), 
    "Bob should NOT be able to modify Alice's domain");
  
  // Test parent owner permissions
  assert(permManager.canModifyDomain("testnet-admin", ["dev", "alice"]), 
    "Admin should be able to modify child domains");
  assert(permManager.canModifyDomain("testnet-admin", ["dev", "alice", "project1"]), 
    "Admin should be able to modify nested child domains");
  
  // Test getDomainsOwnedBy
  const aliceDomains = permManager.getDomainsOwnedBy("test-user-alice");
  assert(aliceDomains.length == 3, "Alice should own 3 domains");
  
  const adminDomains = permManager.getDomainsOwnedBy("testnet-admin");
  assert(adminDomains.length > 5, "Admin should own many domains");
  
  console.log("✓ Domain permissions working correctly");
}

// Test 7: Domain hierarchy string representation
export function testDomainHierarchyDisplay(): void {
  console.log("\n=== Test 7: Domain Hierarchy Display ===");
  
  const hierarchy = createTestnetDomainHierarchy("testnet-admin");
  
  const display = hierarchy.toString();
  console.log("\nDomain Hierarchy Structure:");
  console.log(display);
  
  // Verify the string contains expected domains
  assert(display.includes("testnet"), "Display should include testnet");
  assert(display.includes("apps"), "Display should include apps");
  assert(display.includes("alice"), "Display should include alice");
  assert(display.includes("project1"), "Display should include project1");
  assert(display.includes("quantum"), "Display should include quantum");
  
  console.log("✓ Domain hierarchy display generated");
}

// Run all tests
export function runDomainHierarchyTests(): void {
  console.log("\n🔷 Running Domain Hierarchy Tests (Phase 4) 🔷");
  
  testCreateRootDomains();
  testCreateSubdomains();
  testCreateNestedSubdomains();
  testDomainNavigation();
  testListDomains();
  testDomainPermissions();
  testDomainHierarchyDisplay();
  
  console.log("\n✅ All Domain Hierarchy tests passed!");
}