/**
 * Test suite for Test Identity Generation (Phase 5)
 * Tests the creation of various test identities for the ResonNet testnet
 */

import {
  TestIdentity,
  TestIdentityGenerator,
  createTestnetIdentities,
  IdentityType,
  KYCLevel
} from "./test-identities";

// Simple logging function
function log(message: string): void {
  console.log(message);
}

// Test identity creation
export function testIdentityGeneration(): void {
  log("\n🔷 Testing Identity Generation (Phase 5) 🔷");
  
  // Create all test identities
  const generator = createTestnetIdentities();
  
  log("\n✓ Generated all test identities");
  
  // Test user identities
  log("\n=== Test Users ===");
  const users = generator.getIdentitiesByType(IdentityType.SELF_SOVEREIGN);
  log("Number of self-sovereign identities: " + users.length.toString());
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    log("\n" + user.name + " (" + user.id + ")");
    log("  KYC Level: " + user.kycLevel.toString());
    log("  Roles: " + user.roles.length.toString() + " role(s)");
    if (user.domainId != null) {
      log("  Domain: " + user.domainId!);
    }
    const primeResonance = user.getMetadata("primeResonance");
    if (primeResonance) {
      log("  Prime Resonance: " + primeResonance);
    }
  }
  
  // Test organization identities
  log("\n=== Test Organizations ===");
  const orgs = generator.getIdentitiesByType(IdentityType.MANAGED);
  log("Number of managed identities: " + orgs.length.toString());
  
  for (let i = 0; i < orgs.length; i++) {
    const org = orgs[i];
    log("\n" + org.name + " (" + org.id + ")");
    log("  KYC Level: " + org.kycLevel.toString());
    const industry = org.getMetadata("industry");
    if (industry) {
      log("  Industry: " + industry);
    }
    const managerId = org.getMetadata("managerId");
    if (managerId) {
      log("  Manager: " + managerId);
    }
  }
  
  // Test system identities
  log("\n=== System Identities ===");
  const systems = generator.getIdentitiesByType(IdentityType.SYSTEM);
  log("Number of system identities: " + systems.length.toString());
  
  for (let i = 0; i < systems.length; i++) {
    const system = systems[i];
    log("\n" + system.name + " (" + system.id + ")");
    const purpose = system.getMetadata("purpose");
    if (purpose) {
      log("  Purpose: " + purpose);
    }
    const capabilities = system.getMetadata("capabilities");
    if (capabilities) {
      log("  Capabilities: " + capabilities);
    }
  }
  
  // Test KYC distribution
  log("\n=== KYC Level Distribution ===");
  log("Full KYC: " + generator.getIdentitiesByKYC(KYCLevel.FULL).length.toString());
  log("Enhanced KYC: " + generator.getIdentitiesByKYC(KYCLevel.ENHANCED).length.toString());
  log("Basic KYC: " + generator.getIdentitiesByKYC(KYCLevel.BASIC).length.toString());
  log("No KYC: " + generator.getIdentitiesByKYC(KYCLevel.NONE).length.toString());
  
  // Test role distribution
  log("\n=== Role Distribution ===");
  const roles = ["USER", "DEVELOPER", "TESTER", "ORGANIZATION", "BOT", "VALIDATOR", "ORACLE", "GOVERNANCE"];
  for (let i = 0; i < roles.length; i++) {
    const roleCount = generator.getIdentitiesByRole(roles[i]).length;
    if (roleCount > 0) {
      log(roles[i] + ": " + roleCount.toString() + " identities");
    }
  }
  
  // Test specific identity lookups
  log("\n=== Specific Identity Tests ===");
  
  // Check Alice
  const alice = generator.identities.get("test-user-alice");
  if (alice) {
    log("\nAlice found:");
    log("  Email: " + (alice.getMetadata("email") || "none"));
    log("  Skills: " + (alice.getMetadata("skills") || "none"));
    log("  Has DEVELOPER role: " + (alice.roles.includes("DEVELOPER") ? "YES" : "NO"));
  }
  
  // Check ACME Corp
  const acme = generator.identities.get("test-org-acme");
  if (acme) {
    log("\nACME Corporation found:");
    log("  Type: " + (acme.getMetadata("type") || "none"));
    log("  Industry: " + (acme.getMetadata("industry") || "none"));
    log("  Full KYC: " + (acme.kycLevel == KYCLevel.FULL ? "YES" : "NO"));
  }
  
  // Check Bot Alpha
  const botAlpha = generator.identities.get("test-bot-alpha");
  if (botAlpha) {
    log("\nTest Bot Alpha found:");
    log("  Purpose: " + (botAlpha.getMetadata("purpose") || "none"));
    log("  Operator: " + (botAlpha.getMetadata("operator") || "none"));
  }
  
  // Display summary
  log("\n=== Summary ===");
  log(generator.getSummary());
  
  log("\n✅ Test Identity Generation completed successfully!");
}

// Run the test
testIdentityGeneration();