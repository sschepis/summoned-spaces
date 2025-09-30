/**
 * Genesis configuration for the Prime Resonance Network
 * Defines the initial state of the global network
 */

import { 
  Identity, 
  Domain, 
  Permission, 
  Role,
  IdentitySystemFactory 
} from "../identity";
import {
  GlobalPermissions,
  SystemRoles
} from "../identity/types";
import {
  KYCLevel,
  IdentityType
} from "../identity/interfaces";
import { NetworkNode, PrimeResonanceIdentity } from "../../../resonnet/assembly/prn-node";
import { JSONBuilder } from "../core/serialization";

/**
 * Genesis configuration for the network
 */
export class GenesisConfig {
  // Network parameters
  networkName: string;
  networkVersion: string;
  genesisTimestamp: f64;
  
  // Genesis nodes
  genesisNodes: GenesisNode[];
  
  // Genesis identities
  genesisIdentities: GenesisIdentity[];
  
  // Genesis domains
  genesisDomains: GenesisDomain[];
  
  // Global permissions and roles
  globalPermissions: Map<string, Permission>;
  systemRoles: Map<string, Role>;
  
  // Network parameters
  consensusThreshold: f64;
  minNodeStake: f64;
  maxNodeCount: i32;
  
  constructor() {
    this.networkName = "Prime Resonance Network";
    this.networkVersion = "1.0.0";
    this.genesisTimestamp = Date.now();
    
    this.genesisNodes = [];
    this.genesisIdentities = [];
    this.genesisDomains = [];
    
    // Initialize global permissions and roles
    this.globalPermissions = IdentitySystemFactory.createGlobalPermissions();
    this.systemRoles = IdentitySystemFactory.createSystemRoles(this.globalPermissions);
    
    // Network parameters
    this.consensusThreshold = 0.67; // 2/3 consensus
    this.minNodeStake = 1000.0;
    this.maxNodeCount = 10000;
  }
  
  /**
   * Create the default genesis configuration
   */
  static createDefault(): GenesisConfig {
    const config = new GenesisConfig();
    
    // Create genesis nodes (initial validator set)
    config.addGenesisNode(
      "genesis-1",
      2, 3, 5, // Prime triplet
      "Genesis Node 1",
      "https://genesis1.prn.network"
    );
    
    config.addGenesisNode(
      "genesis-2", 
      7, 11, 13, // Prime triplet
      "Genesis Node 2",
      "https://genesis2.prn.network"
    );
    
    config.addGenesisNode(
      "genesis-3",
      17, 19, 23, // Prime triplet
      "Genesis Node 3", 
      "https://genesis3.prn.network"
    );
    
    // Create genesis identities (system identities)
    const networkAdmin = config.addGenesisIdentity(
      "network-admin",
      IdentityType.SYSTEM,
      KYCLevel.FULL,
      "Prime Resonance Network Administrator"
    );
    
    const registryAdmin = config.addGenesisIdentity(
      "registry-admin",
      IdentityType.SYSTEM,
      KYCLevel.FULL,
      "Domain Registry Administrator"
    );
    
    const auditSystem = config.addGenesisIdentity(
      "audit-system",
      IdentityType.SYSTEM,
      KYCLevel.FULL,
      "Audit System"
    );
    
    // Create genesis domains
    config.addGenesisDomain(
      "prn",
      networkAdmin.id,
      "Prime Resonance Network Root Domain"
    );
    
    config.addGenesisDomain(
      "registry",
      registryAdmin.id,
      "Domain Registry"
    );
    
    config.addGenesisDomain(
      "system",
      networkAdmin.id,
      "System Domain"
    );
    
    return config;
  }
  
  /**
   * Add a genesis node
   */
  addGenesisNode(
    id: string,
    p1: u32,
    p2: u32,
    p3: u32,
    name: string,
    endpoint: string
  ): GenesisNode {
    const node = new GenesisNode(id, p1, p2, p3, name, endpoint);
    this.genesisNodes.push(node);
    return node;
  }
  
  /**
   * Add a genesis identity
   */
  addGenesisIdentity(
    id: string,
    type: IdentityType,
    kycLevel: KYCLevel,
    name: string
  ): GenesisIdentity {
    const identity = new GenesisIdentity(id, type, kycLevel, name);
    this.genesisIdentities.push(identity);
    return identity;
  }
  
  /**
   * Add a genesis domain
   */
  addGenesisDomain(
    name: string,
    ownerId: string,
    description: string
  ): GenesisDomain {
    const domain = new GenesisDomain(name, ownerId, description);
    this.genesisDomains.push(domain);
    return domain;
  }
  
  /**
   * Serialize to JSON for storage
   */
  toJSON(): string {
    const builder = new JSONBuilder();
    builder.startObject();
    
    // Network info
    builder.addStringField("networkName", this.networkName);
    builder.addStringField("networkVersion", this.networkVersion);
    builder.addNumberField("genesisTimestamp", this.genesisTimestamp);
    
    // Network parameters
    builder.addNumberField("consensusThreshold", this.consensusThreshold);
    builder.addNumberField("minNodeStake", this.minNodeStake);
    builder.addIntegerField("maxNodeCount", this.maxNodeCount);
    
    // Genesis nodes
    builder.addRawField("genesisNodes", this.serializeNodes());
    
    // Genesis identities
    builder.addRawField("genesisIdentities", this.serializeIdentities());
    
    // Genesis domains
    builder.addRawField("genesisDomains", this.serializeDomains());
    
    // Global permissions
    builder.addRawField("globalPermissions", this.serializePermissions());
    
    // System roles
    builder.addRawField("systemRoles", this.serializeRoles());
    
    builder.endObject();
    return builder.build();
  }
  
  private serializeNodes(): string {
    const parts: string[] = [];
    parts.push("[");
    for (let i = 0; i < this.genesisNodes.length; i++) {
      if (i > 0) parts.push(",");
      parts.push(this.genesisNodes[i].toJSON());
    }
    parts.push("]");
    return parts.join("");
  }
  
  private serializeIdentities(): string {
    const parts: string[] = [];
    parts.push("[");
    for (let i = 0; i < this.genesisIdentities.length; i++) {
      if (i > 0) parts.push(",");
      parts.push(this.genesisIdentities[i].toJSON());
    }
    parts.push("]");
    return parts.join("");
  }
  
  private serializeDomains(): string {
    const parts: string[] = [];
    parts.push("[");
    for (let i = 0; i < this.genesisDomains.length; i++) {
      if (i > 0) parts.push(",");
      parts.push(this.genesisDomains[i].toJSON());
    }
    parts.push("]");
    return parts.join("");
  }
  
  private serializePermissions(): string {
    const parts: string[] = [];
    parts.push("{");
    const keys = this.globalPermissions.keys();
    for (let i = 0; i < keys.length; i++) {
      if (i > 0) parts.push(",");
      const key = keys[i];
      const perm = this.globalPermissions.get(key);
      parts.push('"' + key + '":' + perm.toJSON());
    }
    parts.push("}");
    return parts.join("");
  }
  
  private serializeRoles(): string {
    const parts: string[] = [];
    parts.push("{");
    const keys = this.systemRoles.keys();
    for (let i = 0; i < keys.length; i++) {
      if (i > 0) parts.push(",");
      const key = keys[i];
      const role = this.systemRoles.get(key);
      parts.push('"' + key + '":' + role.toJSON());
    }
    parts.push("}");
    return parts.join("");
  }
}

/**
 * Genesis node configuration
 */
export class GenesisNode {
  id: string;
  primeIdentity: PrimeResonanceIdentity;
  name: string;
  endpoint: string;
  stake: f64;
  
  constructor(
    id: string,
    p1: u32,
    p2: u32,
    p3: u32,
    name: string,
    endpoint: string
  ) {
    this.id = id;
    this.primeIdentity = new PrimeResonanceIdentity(p1, p2, p3);
    this.name = name;
    this.endpoint = endpoint;
    this.stake = 10000.0; // Initial stake for genesis nodes
  }
  
  toJSON(): string {
    const builder = new JSONBuilder();
    builder.startObject();
    builder.addStringField("id", this.id);
    builder.addRawField("primeIdentity", this.primeIdentity.toJSON());
    builder.addStringField("name", this.name);
    builder.addStringField("endpoint", this.endpoint);
    builder.addNumberField("stake", this.stake);
    builder.endObject();
    return builder.build();
  }
}

/**
 * Genesis identity configuration
 */
export class GenesisIdentity {
  id: string;
  type: IdentityType;
  kycLevel: KYCLevel;
  name: string;
  roles: string[];
  
  constructor(
    id: string,
    type: IdentityType,
    kycLevel: KYCLevel,
    name: string
  ) {
    this.id = id;
    this.type = type;
    this.kycLevel = kycLevel;
    this.name = name;
    this.roles = [];
    
    // Assign default roles based on identity
    if (id == "network-admin") {
      this.roles.push(SystemRoles.SUPER_ADMIN);
    } else if (id == "registry-admin") {
      this.roles.push(SystemRoles.DOMAIN_ADMIN);
    } else if (id == "audit-system") {
      this.roles.push(SystemRoles.AUDITOR);
    }
  }
  
  toJSON(): string {
    const builder = new JSONBuilder();
    builder.startObject();
    builder.addStringField("id", this.id);
    builder.addStringField("type", this.type);
    builder.addIntegerField("kycLevel", this.kycLevel);
    builder.addStringField("name", this.name);
    
    // Add roles array
    const parts: string[] = [];
    parts.push("[");
    for (let i = 0; i < this.roles.length; i++) {
      if (i > 0) parts.push(",");
      parts.push('"' + this.roles[i] + '"');
    }
    parts.push("]");
    builder.addRawField("roles", parts.join(""));
    
    builder.endObject();
    return builder.build();
  }
}

/**
 * Genesis domain configuration
 */
export class GenesisDomain {
  name: string;
  ownerId: string;
  description: string;
  requiredKYCLevel: KYCLevel;
  
  constructor(
    name: string,
    ownerId: string,
    description: string
  ) {
    this.name = name;
    this.ownerId = ownerId;
    this.description = description;
    this.requiredKYCLevel = KYCLevel.NONE; // Default for genesis domains
  }
  
  toJSON(): string {
    const builder = new JSONBuilder();
    builder.startObject();
    builder.addStringField("name", this.name);
    builder.addStringField("ownerId", this.ownerId);
    builder.addStringField("description", this.description);
    builder.addIntegerField("requiredKYCLevel", this.requiredKYCLevel);
    builder.endObject();
    return builder.build();
  }
}

/**
 * Create and save the genesis configuration
 */
export function createGenesisState(): GenesisConfig {
  const genesis = GenesisConfig.createDefault();
  
  // The genesis state will be saved to a file that gets checked into the repo
  // In a real implementation, this would write to disk
  console.log("Genesis state created:");
  console.log(genesis.toJSON());
  
  return genesis;
}

/**
 * Load genesis configuration from JSON
 */
export function loadGenesisState(json: string): GenesisConfig {
  // In a real implementation, this would parse the JSON and reconstruct the genesis state
  // For now, we'll return the default
  return GenesisConfig.createDefault();
}