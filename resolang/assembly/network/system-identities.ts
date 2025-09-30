/**
 * System Identities for ResonNet Testnet Genesis
 * Implements Phase 3 of the genesis hologram creation
 */

import {
  Identity,
  IdentityType,
  KYCLevel,
  IIdentity,
  IdentityCreationParams
} from "../identity";
import { Role, Permission } from "../identity/permissions";
import { PermissionScope } from "../identity/interfaces";
import { PermissionDefinition } from "../identity/types";
import { IdentityPrimeMapping } from "../identity/prime-mapping";
import { JSONBuilder } from "../core/serialization";

/**
 * Extended system identity with additional metadata
 */
export class SystemIdentity extends Identity {
  systemRole: string;
  serviceEndpoint: string;
  capabilities: string[];
  roles: Role[];
  
  constructor(
    id: string,
    name: string,
    systemRole: string,
    serviceEndpoint: string,
    capabilities: string[]
  ) {
    // Create metadata for system identity
    const metadata = new Map<string, string>();
    metadata.set("name", name);
    metadata.set("systemRole", systemRole);
    metadata.set("serviceEndpoint", serviceEndpoint);
    metadata.set("created", Date.now().toString());
    metadata.set("version", "1.0.0");
    
    // Create params for base Identity
    const params: IdentityCreationParams = {
      type: "system",
      kycLevel: KYCLevel.FULL,
      metadata: metadata,
      creatorId: null,
      domainId: null
    };
    
    // All system identities are SYSTEM type with FULL KYC
    super(params);
    
    this.systemRole = systemRole;
    this.serviceEndpoint = serviceEndpoint;
    this.capabilities = capabilities;
    this.roles = [];
  }
  
  /**
   * Add a role to this identity
   */
  addRole(role: Role): void {
    this.roles.push(role);
  }
  
  /**
   * Get all roles
   */
  getRoles(): Role[] {
    return this.roles;
  }
  
  /**
   * Add a capability to this system identity
   */
  addCapability(capability: string): void {
    if (!this.capabilities.includes(capability)) {
      this.capabilities.push(capability);
    }
  }
  
  /**
   * Check if identity has a specific capability
   */
  hasCapability(capability: string): boolean {
    for (let i = 0; i < this.capabilities.length; i++) {
      if (this.capabilities[i] == capability) {
        return true;
      }
    }
    return false;
  }
  
  /**
   * Get metadata value by key
   */
  getMetadataValue(key: string): string | null {
    return this.metadata.has(key) ? this.metadata.get(key) : null;
  }
  
  toJSON(): string {
    const builder = new JSONBuilder();
    builder.startObject();
    
    // Base identity fields
    builder.addStringField("id", this.id);
    builder.addStringField("type", this.type == IdentityType.SELF_SOVEREIGN ? "SELF_SOVEREIGN" :
                                   this.type == IdentityType.MANAGED ? "MANAGED" : "SYSTEM");
    builder.addIntegerField("kycLevel", this.kycLevel);
    builder.addStringField("systemRole", this.systemRole);
    builder.addStringField("serviceEndpoint", this.serviceEndpoint);
    
    // Capabilities array
    const capParts: string[] = [];
    capParts.push("[");
    for (let i = 0; i < this.capabilities.length; i++) {
      if (i > 0) capParts.push(",");
      capParts.push('"' + this.capabilities[i] + '"');
    }
    capParts.push("]");
    builder.addRawField("capabilities", capParts.join(""));
    
    // Metadata
    const metaParts: string[] = [];
    metaParts.push("{");
    const keys = this.metadata.keys();
    for (let i = 0; i < keys.length; i++) {
      if (i > 0) metaParts.push(",");
      const key = keys[i];
      metaParts.push('"' + key + '":"' + this.metadata.get(key) + '"');
    }
    metaParts.push("}");
    builder.addRawField("metadata", metaParts.join(""));
    
    builder.endObject();
    return builder.build();
  }
}

/**
 * System roles with predefined permissions
 */
export class SystemRole extends Role {
  static SUPER_ADMIN: string = "SUPER_ADMIN";
  static ORACLE: string = "ORACLE";
  static AUDITOR: string = "AUDITOR";
  static SERVICE_PROVIDER: string = "SERVICE_PROVIDER";
  static KYC_PROVIDER: string = "KYC_PROVIDER";
  static MONITOR: string = "MONITOR";
  static EXCHANGE: string = "EXCHANGE";
  
  /**
   * Create system roles with appropriate permissions
   */
  static createSystemRoles(): Map<string, Role> {
    const roles = new Map<string, Role>();
    
    // Super Admin - all permissions
    const superAdminDef: PermissionDefinition = {
      id: "*",
      name: "All Permissions",
      description: "Complete system access",
      scope: PermissionScope.GLOBAL,
      implications: [],
      conditions: new Map<string, string>()
    };
    const superAdminPerms: Permission[] = [new Permission(superAdminDef)];
    const superAdminRole = new Role(
      "Super Administrator",
      "Full system access and control"
    );
    for (let i = 0; i < superAdminPerms.length; i++) {
      superAdminRole.addPermission(superAdminPerms[i]);
    }
    roles.set(SystemRole.SUPER_ADMIN, superAdminRole);
    
    // Oracle - network state management
    const oraclePerms: Permission[] = [];
    const oraclePermDefs: PermissionDefinition[] = [
      {
        id: "network.state.read",
        name: "Read Network State",
        description: "Read network state",
        scope: PermissionScope.GLOBAL,
        implications: [],
        conditions: new Map<string, string>()
      },
      {
        id: "network.state.write",
        name: "Write Network State",
        description: "Modify network state",
        scope: PermissionScope.GLOBAL,
        implications: [],
        conditions: new Map<string, string>()
      },
      {
        id: "quantum.field.manage",
        name: "Manage Quantum Field",
        description: "Manage quantum resonance field",
        scope: PermissionScope.GLOBAL,
        implications: [],
        conditions: new Map<string, string>()
      },
      {
        id: "consensus.participate",
        name: "Participate in Consensus",
        description: "Participate in network consensus",
        scope: PermissionScope.GLOBAL,
        implications: [],
        conditions: new Map<string, string>()
      }
    ];
    for (let i = 0; i < oraclePermDefs.length; i++) {
      oraclePerms.push(new Permission(oraclePermDefs[i]));
    }
    const oracleRole = new Role(
      "Network Oracle",
      "Network state oracle and consensus participant"
    );
    for (let i = 0; i < oraclePerms.length; i++) {
      oracleRole.addPermission(oraclePerms[i]);
    }
    roles.set(SystemRole.ORACLE, oracleRole);
    
    // Auditor - read-only access to everything
    const auditorPerms: Permission[] = [];
    const auditorPermDefs: PermissionDefinition[] = [
      {
        id: "*.read",
        name: "Read All",
        description: "Read access to all resources",
        scope: PermissionScope.GLOBAL,
        implications: [],
        conditions: new Map<string, string>()
      },
      {
        id: "audit.trail.read",
        name: "Read Audit Trail",
        description: "Access audit logs",
        scope: PermissionScope.GLOBAL,
        implications: [],
        conditions: new Map<string, string>()
      },
      {
        id: "audit.report.create",
        name: "Create Audit Reports",
        description: "Generate audit reports",
        scope: PermissionScope.GLOBAL,
        implications: [],
        conditions: new Map<string, string>()
      }
    ];
    for (let i = 0; i < auditorPermDefs.length; i++) {
      auditorPerms.push(new Permission(auditorPermDefs[i]));
    }
    const auditorRole = new Role(
      "System Auditor",
      "Audit and compliance monitoring"
    );
    for (let i = 0; i < auditorPerms.length; i++) {
      auditorRole.addPermission(auditorPerms[i]);
    }
    roles.set(SystemRole.AUDITOR, auditorRole);
    
    // Service Provider - service operations
    const servicePerms: Permission[] = [];
    const servicePermDefs: PermissionDefinition[] = [
      {
        id: "service.register",
        name: "Register Service",
        description: "Register new services",
        scope: PermissionScope.DOMAIN,
        implications: [],
        conditions: new Map<string, string>()
      },
      {
        id: "service.operate",
        name: "Operate Service",
        description: "Run service operations",
        scope: PermissionScope.DOMAIN,
        implications: [],
        conditions: new Map<string, string>()
      },
      {
        id: "identity.verify",
        name: "Verify Identity",
        description: "Verify user identities",
        scope: PermissionScope.DOMAIN,
        implications: [],
        conditions: new Map<string, string>()
      },
      {
        id: "transaction.process",
        name: "Process Transactions",
        description: "Process user transactions",
        scope: PermissionScope.DOMAIN,
        implications: [],
        conditions: new Map<string, string>()
      }
    ];
    for (let i = 0; i < servicePermDefs.length; i++) {
      servicePerms.push(new Permission(servicePermDefs[i]));
    }
    const serviceRole = new Role(
      "Service Provider",
      "External service provider"
    );
    for (let i = 0; i < servicePerms.length; i++) {
      serviceRole.addPermission(servicePerms[i]);
    }
    roles.set(SystemRole.SERVICE_PROVIDER, serviceRole);
    
    // KYC Provider - identity verification
    const kycPerms: Permission[] = [];
    const kycPermDefs: PermissionDefinition[] = [
      {
        id: "identity.kyc.read",
        name: "Read KYC Data",
        description: "Read identity KYC information",
        scope: PermissionScope.GLOBAL,
        implications: [],
        conditions: new Map<string, string>()
      },
      {
        id: "identity.kyc.update",
        name: "Update KYC",
        description: "Update identity KYC levels",
        scope: PermissionScope.GLOBAL,
        implications: [],
        conditions: new Map<string, string>()
      },
      {
        id: "identity.kyc.verify",
        name: "Verify KYC",
        description: "Perform KYC verification",
        scope: PermissionScope.GLOBAL,
        implications: [],
        conditions: new Map<string, string>()
      },
      {
        id: "kyc.report.create",
        name: "Create KYC Reports",
        description: "Generate KYC reports",
        scope: PermissionScope.GLOBAL,
        implications: [],
        conditions: new Map<string, string>()
      }
    ];
    for (let i = 0; i < kycPermDefs.length; i++) {
      kycPerms.push(new Permission(kycPermDefs[i]));
    }
    const kycRole = new Role(
      "KYC Provider",
      "Know Your Customer verification service"
    );
    for (let i = 0; i < kycPerms.length; i++) {
      kycRole.addPermission(kycPerms[i]);
    }
    roles.set(SystemRole.KYC_PROVIDER, kycRole);
    
    // Monitor - system monitoring
    const monitorPerms: Permission[] = [];
    const monitorPermDefs: PermissionDefinition[] = [
      {
        id: "system.metrics.read",
        name: "Read Metrics",
        description: "Read system metrics",
        scope: PermissionScope.GLOBAL,
        implications: [],
        conditions: new Map<string, string>()
      },
      {
        id: "network.status.read",
        name: "Read Network Status",
        description: "Monitor network status",
        scope: PermissionScope.GLOBAL,
        implications: [],
        conditions: new Map<string, string>()
      },
      {
        id: "alert.create",
        name: "Create Alerts",
        description: "Create system alerts",
        scope: PermissionScope.GLOBAL,
        implications: [],
        conditions: new Map<string, string>()
      },
      {
        id: "log.read",
        name: "Read Logs",
        description: "Access system logs",
        scope: PermissionScope.GLOBAL,
        implications: [],
        conditions: new Map<string, string>()
      }
    ];
    for (let i = 0; i < monitorPermDefs.length; i++) {
      monitorPerms.push(new Permission(monitorPermDefs[i]));
    }
    const monitorRole = new Role(
      "System Monitor",
      "System monitoring and alerting"
    );
    for (let i = 0; i < monitorPerms.length; i++) {
      monitorRole.addPermission(monitorPerms[i]);
    }
    roles.set(SystemRole.MONITOR, monitorRole);
    
    // Exchange - trading operations
    const exchangePerms: Permission[] = [];
    const exchangePermDefs: PermissionDefinition[] = [
      {
        id: "trade.execute",
        name: "Execute Trades",
        description: "Execute trading operations",
        scope: PermissionScope.DOMAIN,
        implications: [],
        conditions: new Map<string, string>()
      },
      {
        id: "order.manage",
        name: "Manage Orders",
        description: "Manage trading orders",
        scope: PermissionScope.DOMAIN,
        implications: [],
        conditions: new Map<string, string>()
      },
      {
        id: "balance.read",
        name: "Read Balances",
        description: "Read user balances",
        scope: PermissionScope.DOMAIN,
        implications: [],
        conditions: new Map<string, string>()
      },
      {
        id: "balance.update",
        name: "Update Balances",
        description: "Update user balances",
        scope: PermissionScope.DOMAIN,
        implications: [],
        conditions: new Map<string, string>()
      }
    ];
    for (let i = 0; i < exchangePermDefs.length; i++) {
      exchangePerms.push(new Permission(exchangePermDefs[i]));
    }
    const exchangeRole = new Role(
      "Exchange Service",
      "Trading and exchange operations"
    );
    for (let i = 0; i < exchangePerms.length; i++) {
      exchangeRole.addPermission(exchangePerms[i]);
    }
    roles.set(SystemRole.EXCHANGE, exchangeRole);
    
    return roles;
  }
}

/**
 * System identity registry managing all system identities
 */
export class SystemIdentityRegistry {
  identities: Map<string, SystemIdentity>;
  roles: Map<string, Role>;
  primeMappings: Map<string, IdentityPrimeMapping>;
  
  constructor() {
    this.identities = new Map<string, SystemIdentity>();
    this.roles = SystemRole.createSystemRoles();
    this.primeMappings = new Map<string, IdentityPrimeMapping>();
  }
  
  /**
   * Create and register a system identity
   */
  createSystemIdentity(
    id: string,
    name: string,
    systemRole: string,
    serviceEndpoint: string,
    capabilities: string[],
    roleNames: string[]
  ): SystemIdentity {
    // Create the identity
    const identity = new SystemIdentity(id, name, systemRole, serviceEndpoint, capabilities);
    
    // Assign roles
    for (let i = 0; i < roleNames.length; i++) {
      const role = this.roles.get(roleNames[i]);
      if (role) {
        identity.addRole(role);
      }
    }
    
    // Map to prime resonance (using simple hash-based mapping for now)
    const hash = this.hashString(identity.getId());
    const primeMapping = new IdentityPrimeMapping(
      identity.getId(),
      this.generatePrime(hash, 100),
      this.generatePrime(hash + 1, 100),
      this.generatePrime(hash + 2, 100)
    );
    this.primeMappings.set(identity.getId(), primeMapping);
    
    // Register
    this.identities.set(id, identity);
    
    return identity;
  }
  
  /**
   * Get a system identity by ID
   */
  getIdentity(id: string): SystemIdentity | null {
    return this.identities.has(id) ? this.identities.get(id) : null;
  }
  
  /**
   * Assign a role to a system identity
   */
  assignRole(identityId: string, roleName: string): void {
    const identity = this.identities.get(identityId);
    const role = this.roles.get(roleName);
    
    if (identity && role) {
      identity.addRole(role);
    }
  }
  
  /**
   * Check if an identity exists
   */
  hasIdentity(id: string): boolean {
    return this.identities.has(id) as boolean;
  }
  
  /**
   * Get all identities
   */
  getAllIdentities(): SystemIdentity[] {
    return this.identities.values();
  }
  
  
  /**
   * Get all identities with a specific role
   */
  getIdentitiesByRole(roleName: string): SystemIdentity[] {
    const result: SystemIdentity[] = [];
    const keys = this.identities.keys();
    
    for (let i = 0; i < keys.length; i++) {
      const identity = this.identities.get(keys[i]);
      const roles = identity.getRoles();
      for (let j = 0; j < roles.length; j++) {
        if (roles[j].getId() == roleName) {
          result.push(identity);
          break;
        }
      }
    }
    
    return result;
  }
  
  /**
   * Simple hash function for string
   */
  private hashString(str: string): u32 {
    let hash: u32 = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
  
  /**
   * Generate a prime number starting from a seed
   */
  private generatePrime(seed: u32, max: u32): u32 {
    let candidate = seed % max + 2;
    while (!this.isPrime(candidate) && candidate < 1000) {
      candidate++;
    }
    return candidate;
  }
  
  /**
   * Check if a number is prime
   */
  private isPrime(n: u32): boolean {
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
  
  toJSON(): string {
    const builder = new JSONBuilder();
    builder.startObject();
    
    // Identities
    const identityParts: string[] = [];
    identityParts.push("{");
    const identityKeys = this.identities.keys();
    for (let i = 0; i < identityKeys.length; i++) {
      if (i > 0) identityParts.push(",");
      const key = identityKeys[i];
      const identity = this.identities.get(key);
      identityParts.push('"' + key + '":' + identity.toJSON());
    }
    identityParts.push("}");
    builder.addRawField("identities", identityParts.join(""));
    
    // Roles
    const roleParts: string[] = [];
    roleParts.push("{");
    const roleKeys = this.roles.keys();
    for (let i = 0; i < roleKeys.length; i++) {
      if (i > 0) roleParts.push(",");
      const key = roleKeys[i];
      const role = this.roles.get(key);
      roleParts.push('"' + key + '":' + role.toJSON());
    }
    roleParts.push("}");
    builder.addRawField("roles", roleParts.join(""));
    
    builder.endObject();
    return builder.build();
  }
}

/**
 * Create the testnet system identities
 */
export function createTestnetSystemIdentities(): SystemIdentityRegistry {
  const registry = new SystemIdentityRegistry();
  
  // Network Oracle
  registry.createSystemIdentity(
    "network-oracle",
    "Network Oracle",
    "ORACLE",
    "https://oracle.testnet.resonet.io",
    ["quantum-state-management", "consensus-participation", "network-monitoring"],
    [SystemRole.SUPER_ADMIN, SystemRole.ORACLE]
  );
  
  // Testnet Administrator
  registry.createSystemIdentity(
    "testnet-admin",
    "Testnet Administrator",
    "ADMINISTRATOR",
    "https://admin.testnet.resonet.io",
    ["network-configuration", "identity-management", "domain-management"],
    [SystemRole.SUPER_ADMIN]
  );
  
  // Faucet Service
  registry.createSystemIdentity(
    "faucet-service",
    "Testnet Faucet Service",
    "FAUCET",
    "https://faucet.testnet.resonet.io",
    ["token-distribution", "balance-management"],
    [SystemRole.SERVICE_PROVIDER]
  );
  
  // Monitoring Service
  registry.createSystemIdentity(
    "monitoring-service",
    "Network Monitoring Service",
    "MONITOR",
    "https://monitor.testnet.resonet.io",
    ["metrics-collection", "alert-generation", "log-analysis"],
    [SystemRole.AUDITOR, SystemRole.MONITOR]
  );
  
  // Test KYC Provider
  registry.createSystemIdentity(
    "test-kyc-provider",
    "Test KYC Provider",
    "KYC_PROVIDER",
    "https://kyc.testnet.resonet.io",
    ["identity-verification", "document-validation", "compliance-checking"],
    [SystemRole.KYC_PROVIDER]
  );
  
  // Test Exchange
  registry.createSystemIdentity(
    "test-exchange",
    "Test Exchange Service",
    "EXCHANGE",
    "https://exchange.testnet.resonet.io",
    ["trading", "order-matching", "liquidity-provision"],
    [SystemRole.SERVICE_PROVIDER, SystemRole.EXCHANGE]
  );
  
  // Audit System
  registry.createSystemIdentity(
    "audit-system",
    "Audit System",
    "AUDITOR",
    "https://audit.testnet.resonet.io",
    ["audit-trail-analysis", "compliance-reporting", "security-monitoring"],
    [SystemRole.AUDITOR]
  );
  
  // Quantum State Manager
  registry.createSystemIdentity(
    "quantum-state-manager",
    "Quantum State Manager",
    "QUANTUM_MANAGER",
    "https://quantum.testnet.resonet.io",
    ["quantum-field-management", "entanglement-coordination", "resonance-optimization"],
    [SystemRole.ORACLE]
  );
  
  return registry;
}