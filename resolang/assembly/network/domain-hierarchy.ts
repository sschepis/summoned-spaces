/**
 * Phase 4: Domain Hierarchy Setup
 * Creates the nested domain structure for the ResonNet testnet genesis hologram
 */

import { Domain } from "../identity/domain";
import { SystemIdentity } from "./system-identities";

/**
 * Domain node in the hierarchy
 */
export class DomainNode {
  domain: Domain;
  parent: DomainNode | null;
  children: Map<string, DomainNode>;
  
  constructor(domain: Domain, parent: DomainNode | null = null) {
    this.domain = domain;
    this.parent = parent;
    this.children = new Map<string, DomainNode>();
  }
  
  /**
   * Add a child domain
   */
  addChild(name: string, domain: Domain): DomainNode {
    const childNode = new DomainNode(domain, this);
    this.children.set(name, childNode);
    return childNode;
  }
  
  /**
   * Get full path from root
   */
  getPath(): string[] {
    const path: string[] = [];
    let current: DomainNode | null = this;
    
    while (current != null) {
      path.unshift(current.domain.getName());
      current = current.parent;
    }
    
    return path;
  }
  
  /**
   * Get full domain name (e.g., "alice.dev.testnet")
   */
  getFullName(): string {
    return this.getPath().join(".");
  }
  
  /**
   * Find a subdomain by path
   */
  findSubdomain(path: string[]): DomainNode | null {
    if (path.length == 0) return this;
    
    const nextName = path[0];
    const child = this.children.get(nextName);
    
    if (!child) return null;
    
    // Remove first element and continue search
    const remainingPath = path.slice(1);
    return child.findSubdomain(remainingPath);
  }
}

/**
 * Domain hierarchy manager
 */
export class DomainHierarchy {
  roots: Map<string, DomainNode>;
  allDomains: Map<string, Domain>;
  
  constructor() {
    this.roots = new Map<string, DomainNode>();
    this.allDomains = new Map<string, Domain>();
  }
  
  /**
   * Create a root domain
   */
  createRootDomain(
    name: string,
    ownerId: string,
    description: string
  ): DomainNode {
    // Create the domain
    const domain = new Domain(
      name,
      null, // No parent for root domains
      ownerId
    );
    
    // Set metadata
    domain.setMetadata("description", description);
    domain.setMetadata("type", "root");
    domain.setMetadata("created", Date.now().toString());
    
    // Create node and add to roots
    const node = new DomainNode(domain);
    this.roots.set(name, node);
    this.allDomains.set(name, domain);
    
    return node;
  }
  
  /**
   * Create a subdomain
   */
  createSubdomain(
    parentPath: string[],
    name: string,
    ownerId: string,
    description: string = ""
  ): DomainNode | null {
    // Find parent node
    const rootName = parentPath[0];
    const rootNode = this.roots.get(rootName);
    
    if (!rootNode) return null;
    
    // Navigate to parent
    const parentNode = parentPath.length > 1 
      ? rootNode.findSubdomain(parentPath.slice(1))
      : rootNode;
      
    if (!parentNode) return null;
    
    // Create subdomain
    const subdomain = new Domain(
      name,
      parentNode.domain.getId(),
      ownerId
    );
    
    // Set metadata
    subdomain.setMetadata("description", description);
    subdomain.setMetadata("type", "subdomain");
    subdomain.setMetadata("created", Date.now().toString());
    
    // Add to parent and register
    const subNode = parentNode.addChild(name, subdomain);
    const fullPath = subNode.getFullName();
    this.allDomains.set(fullPath, subdomain);
    
    return subNode;
  }
  
  /**
   * Get domain by full path
   */
  getDomain(fullPath: string): Domain | null {
    return this.allDomains.has(fullPath) ? this.allDomains.get(fullPath) : null;
  }
  
  /**
   * Get domain node by path array
   */
  getDomainNode(path: string[]): DomainNode | null {
    if (path.length == 0) return null;
    
    const rootName = path[0];
    const rootNode = this.roots.get(rootName);
    
    if (!rootNode) return null;
    
    return path.length > 1 
      ? rootNode.findSubdomain(path.slice(1))
      : rootNode;
  }
  
  /**
   * List all domains at a given level
   */
  listDomainsAtLevel(parentPath: string[]): Domain[] {
    const domains: Domain[] = [];
    
    if (parentPath.length == 0) {
      // List root domains
      const roots = this.roots.values();
      for (let i = 0; i < roots.length; i++) {
        domains.push(roots[i].domain);
      }
    } else {
      // Find parent and list children
      const parentNode = this.getDomainNode(parentPath);
      if (parentNode) {
        const children = parentNode.children.values();
        for (let i = 0; i < children.length; i++) {
          domains.push(children[i].domain);
        }
      }
    }
    
    return domains;
  }
  
  /**
   * Get domain hierarchy as JSON
   */
  toJSON(): string {
    const hierarchy: any = {
      roots: {}
    };
    
    // Convert each root to JSON
    const rootNames = this.roots.keys();
    for (let i = 0; i < rootNames.length; i++) {
      const rootName = rootNames[i];
      const rootNode = this.roots.get(rootName)!;
      hierarchy.roots[rootName] = this.nodeToJSON(rootNode);
    }
    
    return JSON.stringify(hierarchy, null, 2);
  }
  
  /**
   * Convert a node to JSON representation
   */
  private nodeToJSON(node: DomainNode): any {
    const json: any = {
      name: node.domain.getName(),
      owner: node.domain.getOwnerId(),
      path: node.getFullName(),
      metadata: {}
    };
    
    // Add metadata
    const metadataKeys = ["description", "type", "created"];
    for (let i = 0; i < metadataKeys.length; i++) {
      const key = metadataKeys[i];
      const value = node.domain.getMetadata(key);
      if (value) {
        json.metadata[key] = value;
      }
    }
    
    // Add children if any
    if (node.children.size > 0) {
      json.children = {};
      const childNames = node.children.keys();
      for (let i = 0; i < childNames.length; i++) {
        const childName = childNames[i];
        const childNode = node.children.get(childName)!;
        json.children[childName] = this.nodeToJSON(childNode);
      }
    }
    
    return json;
  }
}

/**
 * Create the testnet domain hierarchy
 */
export function createTestnetDomainHierarchy(adminId: string): DomainHierarchy {
  const hierarchy = new DomainHierarchy();
  
  // Create root domains
  const testnetRoot = hierarchy.createRootDomain(
    "testnet",
    adminId,
    "Testnet Root Domain"
  );
  
  const devRoot = hierarchy.createRootDomain(
    "dev",
    adminId,
    "Development Domain"
  );
  
  const sandboxRoot = hierarchy.createRootDomain(
    "sandbox",
    adminId,
    "Experimental Sandbox Domain"
  );
  
  // Create testnet subdomains
  hierarchy.createSubdomain(
    ["testnet"],
    "apps",
    adminId,
    "Test Applications"
  );
  
  hierarchy.createSubdomain(
    ["testnet"],
    "services",
    adminId,
    "Test Services"
  );
  
  hierarchy.createSubdomain(
    ["testnet"],
    "users",
    adminId,
    "Test User Domains"
  );
  
  // Create dev subdomains (will be assigned to test users later)
  hierarchy.createSubdomain(
    ["dev"],
    "alice",
    "test-user-alice",
    "Alice's Development Workspace"
  );
  
  hierarchy.createSubdomain(
    ["dev"],
    "bob",
    "test-user-bob",
    "Bob's Development Workspace"
  );
  
  hierarchy.createSubdomain(
    ["dev"],
    "carol",
    "test-user-carol",
    "Carol's Development Workspace"
  );
  
  // Create nested subdomains for alice
  hierarchy.createSubdomain(
    ["dev", "alice"],
    "project1",
    "test-user-alice",
    "Alice's First Project"
  );
  
  hierarchy.createSubdomain(
    ["dev", "alice", "project1"],
    "api",
    "test-user-alice",
    "Project API Subdomain"
  );
  
  // Create sandbox subdomains
  hierarchy.createSubdomain(
    ["sandbox"],
    "experiments",
    adminId,
    "Experimental Features"
  );
  
  hierarchy.createSubdomain(
    ["sandbox", "experiments"],
    "quantum",
    adminId,
    "Quantum Testing Area"
  );
  
  return hierarchy;
}

/**
 * Domain permission manager
 */
export class DomainPermissionManager {
  hierarchy: DomainHierarchy;
  
  constructor(hierarchy: DomainHierarchy) {
    this.hierarchy = hierarchy;
  }
  
  /**
   * Check if an identity has permission to create subdomains
   */
  canCreateSubdomain(identityId: string, parentPath: string[]): boolean {
    const parentNode = this.hierarchy.getDomainNode(parentPath);
    if (!parentNode) return false;
    
    // Owner can always create subdomains
    if (parentNode.domain.getOwnerId() == identityId) return true;
    
    // Check if identity has subdomain creation permission
    // This would integrate with the permission system
    // For now, only owners can create subdomains
    return false;
  }
  
  /**
   * Check if an identity has permission to modify a domain
   */
  canModifyDomain(identityId: string, domainPath: string[]): boolean {
    const node = this.hierarchy.getDomainNode(domainPath);
    if (!node) return false;
    
    // Owner can always modify
    if (node.domain.getOwnerId() == identityId) return true;
    
    // Check inherited permissions from parent domains
    let current: DomainNode | null = node.parent;
    while (current != null) {
      if (current.domain.getOwnerId() == identityId) {
        // Check if parent owner has modify rights on children
        // For testnet, parent owners have full control
        return true;
      }
      current = current.parent;
    }
    
    return false;
  }
  
  /**
   * Get all domains owned by an identity
   */
  getDomainsOwnedBy(identityId: string): Domain[] {
    const owned: Domain[] = [];
    const allDomains = this.hierarchy.allDomains.values();
    
    for (let i = 0; i < allDomains.length; i++) {
      const domain = allDomains[i];
      if (domain.getOwnerId() == identityId) {
        owned.push(domain);
      }
    }
    
    return owned;
  }
}