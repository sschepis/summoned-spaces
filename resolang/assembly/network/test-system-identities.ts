/**
 * Test suite for System Identities (Phase 3)
 * Tests the creation and management of system identities for the ResonNet testnet
 */

import { SystemIdentity, SystemRole, SystemIdentityRegistry } from "./system-identities";
import { IdentityType, KYCLevel } from "../identity";

// Test helper to verify system identity properties
function verifySystemIdentity(
  identity: SystemIdentity,
  expectedId: string,
  expectedName: string,
  expectedRole: string,
  expectedCapabilities: string[]
): void {
  assert(identity.getId() == expectedId, `Identity ID should be ${expectedId}`);
  assert(identity.getMetadataValue("name") == expectedName, `Name should be ${expectedName}`);
  assert(identity.systemRole == expectedRole, `System role should be ${expectedRole}`);
  assert(identity.getType() == IdentityType.SYSTEM, "Should be SYSTEM type");
  assert(identity.getKYCLevel() == KYCLevel.FULL, "Should have FULL KYC");
  
  // Verify capabilities
  assert(identity.capabilities.length == expectedCapabilities.length, 
    `Should have ${expectedCapabilities.length} capabilities`);
  
  for (let i = 0; i < expectedCapabilities.length; i++) {
    assert(identity.hasCapability(expectedCapabilities[i]), 
      `Should have capability: ${expectedCapabilities[i]}`);
  }
}

// Test 1: Create core system identities
export function testCreateSystemIdentities(): void {
  console.log("\n=== Test 1: Create Core System Identities ===");
  
  const registry = new SystemIdentityRegistry();
  
  // Create network oracle
  const oracle = registry.createSystemIdentity(
    "network-oracle",
    "Network Oracle",
    "oracle",
    "prn://system/oracle",
    ["quantum.field.manage", "consensus.participate", "network.state.write"],
    []
  );
  
  verifySystemIdentity(
    oracle,
    "network-oracle",
    "Network Oracle",
    "oracle",
    ["quantum.field.manage", "consensus.participate", "network.state.write"]
  );
  
  // Create testnet admin
  const admin = registry.createSystemIdentity(
    "testnet-admin",
    "Testnet Administrator",
    "admin",
    "prn://system/admin",
    ["network.manage", "identity.manage", "domain.manage"],
    []
  );
  
  verifySystemIdentity(
    admin,
    "testnet-admin",
    "Testnet Administrator",
    "admin",
    ["network.manage", "identity.manage", "domain.manage"]
  );
  
  // Create faucet service
  const faucet = registry.createSystemIdentity(
    "faucet-service",
    "Testnet Faucet",
    "service",
    "prn://services/faucet",
    ["tokens.mint", "tokens.distribute"],
    []
  );
  
  verifySystemIdentity(
    faucet,
    "faucet-service",
    "Testnet Faucet",
    "service",
    ["tokens.mint", "tokens.distribute"]
  );
  
  console.log("✓ Created 3 core system identities");
}

// Test 2: Assign roles to system identities
export function testAssignSystemRoles(): void {
  console.log("\n=== Test 2: Assign System Roles ===");
  
  const registry = new SystemIdentityRegistry();
  
  // Create identities
  const oracle = registry.createSystemIdentity(
    "network-oracle",
    "Network Oracle",
    "oracle",
    "prn://system/oracle",
    ["quantum.field.manage"]
  );
  
  const admin = registry.createSystemIdentity(
    "testnet-admin",
    "Testnet Administrator",
    "admin",
    "prn://system/admin",
    ["network.manage"]
  );
  
  // Assign roles
  registry.assignRole("network-oracle", SystemRole.ORACLE);
  registry.assignRole("testnet-admin", SystemRole.SUPER_ADMIN);
  
  // Verify role assignment
  const oracleRoles = oracle.getRoles();
  assert(oracleRoles.length == 1, "Oracle should have 1 role");
  assert(oracleRoles[0].getName() == "Network Oracle", "Should have Oracle role");
  
  const adminRoles = admin.getRoles();
  assert(adminRoles.length == 1, "Admin should have 1 role");
  assert(adminRoles[0].getName() == "Super Administrator", "Should have Super Admin role");
  
  console.log("✓ Assigned system roles to identities");
}

// Test 3: Create service provider identities
export function testCreateServiceProviders(): void {
  console.log("\n=== Test 3: Create Service Provider Identities ===");
  
  const registry = new SystemIdentityRegistry();
  
  // Create KYC provider
  const kycProvider = registry.createSystemIdentity(
    "kyc-provider-1",
    "Verified KYC Service",
    "kyc-provider",
    "prn://services/kyc/verified",
    ["identity.verify", "kyc.update", "kyc.report"],
    []
  );
  
  registry.assignRole("kyc-provider-1", SystemRole.KYC_PROVIDER);
  
  // Create exchange service
  const exchange = registry.createSystemIdentity(
    "exchange-1",
    "ResonNet DEX",
    "exchange",
    "prn://services/exchange/dex",
    ["trade.execute", "order.manage", "liquidity.provide"],
    []
  );
  
  registry.assignRole("exchange-1", SystemRole.EXCHANGE);
  
  // Create monitoring service
  const monitor = registry.createSystemIdentity(
    "monitor-1",
    "Network Monitor",
    "monitor",
    "prn://services/monitor",
    ["metrics.collect", "alerts.create", "status.report"],
    []
  );
  
  registry.assignRole("monitor-1", SystemRole.MONITOR);
  
  console.log("✓ Created 3 service provider identities");
  
  // Verify service providers
  assert(registry.getIdentity("kyc-provider-1") != null, "KYC provider should exist");
  assert(registry.getIdentity("exchange-1") != null, "Exchange should exist");
  assert(registry.getIdentity("monitor-1") != null, "Monitor should exist");
}

// Test 4: Prime resonance mapping for system identities
export function testSystemIdentityPrimeMapping(): void {
  console.log("\n=== Test 4: Prime Resonance Mapping ===");
  
  const registry = new SystemIdentityRegistry();
  
  // Create identities
  const oracle = registry.createSystemIdentity(
    "network-oracle",
    "Network Oracle",
    "oracle",
    "prn://system/oracle",
    ["quantum.field.manage"],
    []
  );
  
  const admin = registry.createSystemIdentity(
    "testnet-admin",
    "Testnet Administrator",
    "admin",
    "prn://system/admin",
    ["network.manage"],
    []
  );
  
  // Verify prime mappings were created
  const oracleMapping = registry.primeMappings.get("network-oracle");
  assert(oracleMapping != null, "Oracle should have prime mapping");
  assert(oracleMapping!.identityId == "network-oracle", "Mapping should reference oracle ID");
  assert(oracleMapping!.gaussianPrime > 0, "Should have gaussian prime");
  assert(oracleMapping!.eisensteinPrime > 0, "Should have eisenstein prime");
  assert(oracleMapping!.quaternionicPrime > 0, "Should have quaternionic prime");
  
  const adminMapping = registry.primeMappings.get("testnet-admin");
  assert(adminMapping != null, "Admin should have prime mapping");
  assert(adminMapping!.identityId == "testnet-admin", "Mapping should reference admin ID");
  
  console.log("✓ Prime resonance mappings created for system identities");
}

// Test 5: System identity registry operations
export function testSystemIdentityRegistry(): void {
  console.log("\n=== Test 5: System Identity Registry Operations ===");
  
  const registry = new SystemIdentityRegistry();
  
  // Create multiple identities
  const identityIds = [
    "network-oracle",
    "testnet-admin",
    "faucet-service",
    "kyc-provider-1",
    "exchange-1"
  ];
  
  for (let i = 0; i < identityIds.length; i++) {
    registry.createSystemIdentity(
      identityIds[i],
      `System Identity ${i}`,
      "service",
      `prn://system/${identityIds[i]}`,
      ["test.capability"],
      []
    );
  }
  
  // Test getIdentity
  const oracle = registry.getIdentity("network-oracle");
  assert(oracle != null, "Should retrieve oracle identity");
  assert(oracle!.getId() == "network-oracle", "Retrieved correct identity");
  
  // Test getAllIdentities
  const allIdentities = registry.getAllIdentities();
  assert(allIdentities.length == 5, "Should have 5 identities");
  
  // Test hasIdentity
  assert(registry.hasIdentity("network-oracle"), "Should have oracle");
  assert(registry.hasIdentity("testnet-admin"), "Should have admin");
  assert(!registry.hasIdentity("non-existent"), "Should not have non-existent");
  
  // Test JSON serialization
  const json = registry.toJSON();
  assert(json.includes("network-oracle"), "JSON should include oracle");
  assert(json.includes("testnet-admin"), "JSON should include admin");
  assert(json.includes("SystemRole"), "JSON should include roles");
  
  console.log("✓ Registry operations working correctly");
}

// Test 6: System role permissions
export function testSystemRolePermissions(): void {
  console.log("\n=== Test 6: System Role Permissions ===");
  
  const registry = new SystemIdentityRegistry();
  
  // Create identity with SUPER_ADMIN role
  const admin = registry.createSystemIdentity(
    "testnet-admin",
    "Testnet Administrator",
    "admin",
    "prn://system/admin",
    ["network.manage"]
  );
  
  registry.assignRole("testnet-admin", SystemRole.SUPER_ADMIN);
  
  // Verify super admin has all permissions
  const adminRole = admin.getRoles()[0];
  const permissions = adminRole.getPermissions();
  assert(permissions.length > 0, "Super admin should have permissions");
  assert(permissions[0].getId() == "*", "Super admin should have wildcard permission");
  
  // Create identity with ORACLE role
  const oracle = registry.createSystemIdentity(
    "network-oracle",
    "Network Oracle",
    "oracle",
    "prn://system/oracle",
    ["quantum.field.manage"]
  );
  
  registry.assignRole("network-oracle", SystemRole.ORACLE);
  
  // Verify oracle has specific permissions
  const oracleRole = oracle.getRoles()[0];
  const oraclePerms = oracleRole.getPermissions();
  assert(oraclePerms.length == 4, "Oracle should have 4 permissions");
  
  // Check specific oracle permissions
  const permIds = oraclePerms.map<string>((p) => p.getId());
  assert(permIds.includes("network.state.read"), "Should have state read permission");
  assert(permIds.includes("network.state.write"), "Should have state write permission");
  assert(permIds.includes("quantum.field.manage"), "Should have quantum field permission");
  assert(permIds.includes("consensus.participate"), "Should have consensus permission");
  
  console.log("✓ System role permissions configured correctly");
}

// Run all tests
export function runSystemIdentityTests(): void {
  console.log("\n🔷 Running System Identity Tests (Phase 3) 🔷");
  
  testCreateSystemIdentities();
  testAssignSystemRoles();
  testCreateServiceProviders();
  testSystemIdentityPrimeMapping();
  testSystemIdentityRegistry();
  testSystemRolePermissions();
  
  console.log("\n✅ All System Identity tests passed!");
}