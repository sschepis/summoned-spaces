/**
 * Phase 5: Test Identity Generation
 * Creates various test identities to simulate different user scenarios
 * for the ResonNet testnet genesis hologram
 */

// Define enums locally to avoid interface issues
export enum IdentityType {
  SELF_SOVEREIGN = 0,
  MANAGED = 1,
  SYSTEM = 2
}

export enum KYCLevel {
  NONE = 0,
  BASIC = 1,
  ENHANCED = 2,
  FULL = 3
}

// Helper function to get identity type name
export function getIdentityTypeName(type: IdentityType): string {
  if (type == IdentityType.SELF_SOVEREIGN) return "self_sovereign";
  if (type == IdentityType.MANAGED) return "managed";
  if (type == IdentityType.SYSTEM) return "system";
  return "unknown";
}

/**
 * Simplified test identity for testnet
 */
export class TestIdentity {
  id: string;
  type: IdentityType;
  kycLevel: KYCLevel;
  name: string;
  roles: string[];
  metadata: Map<string, string>;
  domainId: string | null;
  createdAt: f64;
  
  constructor(
    id: string,
    type: IdentityType,
    kycLevel: KYCLevel,
    name: string,
    roles: string[] = [],
    domainId: string | null = null
  ) {
    this.id = id;
    this.type = type;
    this.kycLevel = kycLevel;
    this.name = name;
    this.roles = roles;
    this.domainId = domainId;
    this.metadata = new Map<string, string>();
    this.createdAt = <f64>Date.now();
  }
  
  addRole(role: string): void {
    if (!this.roles.includes(role)) {
      this.roles.push(role);
    }
  }
  
  setMetadata(key: string, value: string): void {
    this.metadata.set(key, value);
  }
  
  getMetadata(key: string): string | null {
    return this.metadata.has(key) ? this.metadata.get(key) : null;
  }
}

/**
 * Test identity generator
 */
export class TestIdentityGenerator {
  identities: Map<string, TestIdentity>;
  
  constructor() {
    this.identities = new Map<string, TestIdentity>();
  }
  
  /**
   * Generate test users (self-sovereign identities)
   */
  generateTestUsers(): void {
    // Alice - Enhanced KYC Developer
    const alice = new TestIdentity(
      "test-user-alice",
      IdentityType.SELF_SOVEREIGN,
      KYCLevel.ENHANCED,
      "Alice (Test User)",
      ["USER", "DEVELOPER"],
      "alice.dev"
    );
    alice.setMetadata("email", "alice@testnet.resonet.io");
    alice.setMetadata("skills", "typescript,quantum-computing");
    alice.setMetadata("primeResonance", "251,257,263");
    this.identities.set(alice.id, alice);
    
    // Bob - Enhanced KYC Regular User
    const bob = new TestIdentity(
      "test-user-bob",
      IdentityType.SELF_SOVEREIGN,
      KYCLevel.ENHANCED,
      "Bob (Test User)",
      ["USER"],
      "bob.dev"
    );
    bob.setMetadata("email", "bob@testnet.resonet.io");
    bob.setMetadata("interests", "defi,gaming");
    bob.setMetadata("primeResonance", "269,271,277");
    this.identities.set(bob.id, bob);
    
    // Carol - Basic KYC Tester
    const carol = new TestIdentity(
      "test-user-carol",
      IdentityType.SELF_SOVEREIGN,
      KYCLevel.BASIC,
      "Carol (Test User)",
      ["USER", "TESTER"],
      "carol.dev"
    );
    carol.setMetadata("email", "carol@testnet.resonet.io");
    carol.setMetadata("focus", "qa,automation");
    carol.setMetadata("primeResonance", "281,283,293");
    this.identities.set(carol.id, carol);
    
    // Dave - No KYC Anonymous User
    const dave = new TestIdentity(
      "test-user-dave",
      IdentityType.SELF_SOVEREIGN,
      KYCLevel.NONE,
      "Dave (Anonymous)",
      ["USER"],
      null
    );
    dave.setMetadata("anonymous", "true");
    dave.setMetadata("primeResonance", "307,311,313");
    this.identities.set(dave.id, dave);
  }
  
  /**
   * Generate test organizations (managed identities)
   */
  generateTestOrganizations(): void {
    // ACME Corporation - Full KYC
    const acme = new TestIdentity(
      "test-org-acme",
      IdentityType.MANAGED,
      KYCLevel.FULL,
      "ACME Corporation",
      ["ORGANIZATION"],
      "acme.testnet"
    );
    acme.setMetadata("type", "corporation");
    acme.setMetadata("industry", "technology");
    acme.setMetadata("managerId", "test-user-alice");
    acme.setMetadata("primeResonance", "317,331,337");
    this.identities.set(acme.id, acme);
    
    // Globex Industries - Enhanced KYC
    const globex = new TestIdentity(
      "test-org-globex",
      IdentityType.MANAGED,
      KYCLevel.ENHANCED,
      "Globex Industries",
      ["ORGANIZATION"],
      "globex.testnet"
    );
    globex.setMetadata("type", "multinational");
    globex.setMetadata("industry", "manufacturing");
    globex.setMetadata("managerId", "test-user-bob");
    globex.setMetadata("primeResonance", "347,349,353");
    this.identities.set(globex.id, globex);
    
    // StartupX - Basic KYC
    const startupx = new TestIdentity(
      "test-org-startupx",
      IdentityType.MANAGED,
      KYCLevel.BASIC,
      "StartupX",
      ["ORGANIZATION", "STARTUP"],
      "startupx.sandbox"
    );
    startupx.setMetadata("type", "startup");
    startupx.setMetadata("industry", "fintech");
    startupx.setMetadata("managerId", "test-user-carol");
    startupx.setMetadata("primeResonance", "359,367,373");
    this.identities.set(startupx.id, startupx);
  }
  
  /**
   * Generate test bots (system identities)
   */
  generateTestBots(): void {
    // Test Bot Alpha - Testing Automation
    const botAlpha = new TestIdentity(
      "test-bot-alpha",
      IdentityType.SYSTEM,
      KYCLevel.FULL,
      "Test Bot Alpha",
      ["BOT", "TESTER"],
      "bots.services.testnet"
    );
    botAlpha.setMetadata("purpose", "automated-testing");
    botAlpha.setMetadata("capabilities", "transaction-testing,stress-testing");
    botAlpha.setMetadata("operator", "testnet-admin");
    botAlpha.setMetadata("primeResonance", "379,383,389");
    this.identities.set(botAlpha.id, botAlpha);
    
    // Test Bot Beta - Monitoring
    const botBeta = new TestIdentity(
      "test-bot-beta",
      IdentityType.SYSTEM,
      KYCLevel.FULL,
      "Test Bot Beta",
      ["BOT", "MONITOR"],
      "bots.services.testnet"
    );
    botBeta.setMetadata("purpose", "network-monitoring");
    botBeta.setMetadata("capabilities", "health-check,alert-generation");
    botBeta.setMetadata("operator", "testnet-admin");
    botBeta.setMetadata("primeResonance", "397,401,409");
    this.identities.set(botBeta.id, botBeta);
    
    // Test Bot Gamma - Data Collection
    const botGamma = new TestIdentity(
      "test-bot-gamma",
      IdentityType.SYSTEM,
      KYCLevel.FULL,
      "Test Bot Gamma",
      ["BOT", "COLLECTOR"],
      "bots.services.testnet"
    );
    botGamma.setMetadata("purpose", "data-collection");
    botGamma.setMetadata("capabilities", "metrics-gathering,log-analysis");
    botGamma.setMetadata("operator", "testnet-admin");
    botGamma.setMetadata("primeResonance", "419,421,431");
    this.identities.set(botGamma.id, botGamma);
  }
  
  /**
   * Generate special test identities
   */
  generateSpecialIdentities(): void {
    // Validator Identity
    const validator = new TestIdentity(
      "test-validator-1",
      IdentityType.SYSTEM,
      KYCLevel.FULL,
      "Test Validator Node 1",
      ["VALIDATOR"],
      "validators.testnet"
    );
    validator.setMetadata("nodeId", "validator-prime-1");
    validator.setMetadata("stake", "100000");
    validator.setMetadata("primeResonance", "433,439,443");
    this.identities.set(validator.id, validator);
    
    // Oracle Identity
    const oracle = new TestIdentity(
      "test-oracle-1",
      IdentityType.SYSTEM,
      KYCLevel.FULL,
      "Test Oracle Service",
      ["ORACLE"],
      "oracles.services.testnet"
    );
    oracle.setMetadata("dataFeeds", "price,weather,random");
    oracle.setMetadata("reliability", "99.9");
    oracle.setMetadata("primeResonance", "449,457,461");
    this.identities.set(oracle.id, oracle);
    
    // Governance Identity
    const governance = new TestIdentity(
      "test-governance",
      IdentityType.MANAGED,
      KYCLevel.FULL,
      "Test Governance Council",
      ["GOVERNANCE"],
      "governance.testnet"
    );
    governance.setMetadata("members", "alice,bob,carol");
    governance.setMetadata("votingPower", "equal");
    governance.setMetadata("primeResonance", "463,467,479");
    this.identities.set(governance.id, governance);
  }
  
  /**
   * Get all identities by type
   */
  getIdentitiesByType(type: IdentityType): TestIdentity[] {
    const result: TestIdentity[] = [];
    const keys = this.identities.keys();
    
    for (let i = 0; i < keys.length; i++) {
      const identity = this.identities.get(keys[i]);
      if (identity && identity.type == type) {
        result.push(identity);
      }
    }
    
    return result;
  }
  
  /**
   * Get all identities by KYC level
   */
  getIdentitiesByKYC(level: KYCLevel): TestIdentity[] {
    const result: TestIdentity[] = [];
    const keys = this.identities.keys();
    
    for (let i = 0; i < keys.length; i++) {
      const identity = this.identities.get(keys[i]);
      if (identity && identity.kycLevel == level) {
        result.push(identity);
      }
    }
    
    return result;
  }
  
  /**
   * Get identities by role
   */
  getIdentitiesByRole(role: string): TestIdentity[] {
    const result: TestIdentity[] = [];
    const keys = this.identities.keys();
    
    for (let i = 0; i < keys.length; i++) {
      const identity = this.identities.get(keys[i]);
      if (identity && identity.roles.includes(role)) {
        result.push(identity);
      }
    }
    
    return result;
  }
  
  /**
   * Generate summary statistics
   */
  getSummary(): string {
    let summary = "Test Identity Summary:\n";
    summary += "=====================\n\n";
    
    // Count by type
    summary += "By Type:\n";
    summary += "- Self-Sovereign: " + this.getIdentitiesByType(IdentityType.SELF_SOVEREIGN).length.toString() + "\n";
    summary += "- Managed: " + this.getIdentitiesByType(IdentityType.MANAGED).length.toString() + "\n";
    summary += "- System: " + this.getIdentitiesByType(IdentityType.SYSTEM).length.toString() + "\n\n";
    
    // Count by KYC
    summary += "By KYC Level:\n";
    summary += "- Full: " + this.getIdentitiesByKYC(KYCLevel.FULL).length.toString() + "\n";
    summary += "- Enhanced: " + this.getIdentitiesByKYC(KYCLevel.ENHANCED).length.toString() + "\n";
    summary += "- Basic: " + this.getIdentitiesByKYC(KYCLevel.BASIC).length.toString() + "\n";
    summary += "- None: " + this.getIdentitiesByKYC(KYCLevel.NONE).length.toString() + "\n\n";
    
    // Count by role
    summary += "By Role:\n";
    const roles = ["USER", "DEVELOPER", "TESTER", "ORGANIZATION", "BOT", "VALIDATOR", "ORACLE", "GOVERNANCE"];
    for (let i = 0; i < roles.length; i++) {
      const count = this.getIdentitiesByRole(roles[i]).length;
      if (count > 0) {
        summary += "- " + roles[i] + ": " + count.toString() + "\n";
      }
    }
    
    summary += "\nTotal Identities: " + this.identities.size.toString();
    
    return summary;
  }
}

/**
 * Create all test identities for the testnet
 */
export function createTestnetIdentities(): TestIdentityGenerator {
  const generator = new TestIdentityGenerator();
  
  // Generate all categories
  generator.generateTestUsers();
  generator.generateTestOrganizations();
  generator.generateTestBots();
  generator.generateSpecialIdentities();
  
  return generator;
}