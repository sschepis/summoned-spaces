/**
 * Example usage of the Gateway Client with Genesis Configuration
 * This demonstrates how to connect to the Prime Resonance Network
 * and perform basic Layer 1 operations
 */

import { GatewayClient } from "./gateway-client";
import { loadGenesisState } from "./genesis";
import { Identity } from "../identity/identity";
import { IdentityType, KYCLevel } from "../identity/interfaces";
import { IdentityCreationParams } from "../identity/types";
import {
  getNetworkStatus,
  getAllNodeIds,
  getNodeStatus
} from "../prn-network-manager";

// Example: Initialize and connect to the network
export function exampleNetworkConnection(): void {
  console.log("=== PRN Gateway Client Example ===");
  
  // Load genesis configuration
  const genesisConfig = loadGenesisState("");
  console.log("Loaded genesis configuration with " + genesisConfig.genesisNodes.length.toString() + " nodes");
  
  // Create a new identity for the client
  const identityParams = new IdentityCreationParams();
  identityParams.type = "self_sovereign";
  identityParams.kycLevel = KYCLevel.NONE;
  identityParams.metadata = new Map<string, string>();
  identityParams.metadata.set("name", "Example Client");
  identityParams.metadata.set("created", "2025-01-12");
  
  const clientIdentity = new Identity(identityParams);
  
  // Create gateway client
  const gateway = new GatewayClient("gateway-client-001");
  
  // Connect to the network with prime resonance values
  const connected = gateway.connect(
    clientIdentity,
    7919,  // Gaussian prime
    11,    // Eisenstein prime  
    13     // Quaternionic prime
  );
  
  if (connected) {
    console.log("Successfully connected to PRN!");
    console.log("Client state: " + gateway.getState().toString());
    
    // Example: Create a new identity
    const identityMetadata = new Map<string, string>();
    identityMetadata.set("name", "Alice");
    identityMetadata.set("email", "alice@example.com");
    
    const newIdentityRequest = gateway.createIdentity(
      IdentityType.MANAGED,
      identityMetadata
    );
    
    if (newIdentityRequest) {
      console.log("Identity creation request submitted: " + newIdentityRequest.id);
    }
    
    // Example: Create a domain
    const domainMetadata = new Map<string, string>();
    domainMetadata.set("description", "Example domain for testing");
    domainMetadata.set("website", "https://example.prn");
    
    const domainRequest = gateway.createDomain(
      "example.prn"
      // Note: createDomain only takes name and optional parentId
    );
    
    if (domainRequest) {
      console.log("Domain creation request submitted: " + domainRequest.id);
    }
    
    // Example: Check permissions
    // Note: checkPermission is private, so we'd need to use a public method
    // or make it public in the gateway client
    console.log("Permission check example would go here");
    
    // Disconnect when done
    gateway.disconnect();
    console.log("Disconnected from PRN");
    
  } else {
    console.error("Failed to connect to PRN");
  }
}

// Example: Working with domains and objects
export function exampleDomainOperations(gateway: GatewayClient): void {
  if (!gateway.isReady()) {
    console.error("Gateway not ready");
    return;
  }
  
  // Create a subdomain
  const subdomainMetadata = new Map<string, string>();
  subdomainMetadata.set("type", "application");
  subdomainMetadata.set("version", "1.0.0");
  
  const subdomainRequest = gateway.createDomain(
    "app.example.prn",
    "example.prn" // parent domain
  );
  
  if (subdomainRequest) {
    console.log("Subdomain request: " + subdomainRequest.id);
  }
  
  // Create a domain object
  const objectMetadata = new Map<string, string>();
  objectMetadata.set("name", "TestToken");
  objectMetadata.set("symbol", "TST");
  objectMetadata.set("decimals", "18");
  
  const properties = new Map<string, string>();
  properties.set("totalSupply", "1000000");
  
  const objectRequest = gateway.createObject(
    "example.prn",
    "FungibleToken",
    true,  // isFungible
    true,  // isTransferable
    true,  // isDestructible
    objectMetadata
  );
  
  if (objectRequest) {
    console.log("Object creation request: " + objectRequest.id);
  }
}

// Example: Permission management
export function examplePermissionManagement(gateway: GatewayClient): void {
  if (!gateway.isReady()) {
    console.error("Gateway not ready");
    return;
  }
  
  // Grant permission to another identity
  const grantRequest = gateway.grantPermission(
    "identity-002", // target identity
    "domain.create",
    "example.prn"   // resource (optional)
  );
  
  if (grantRequest) {
    console.log("Permission grant request: " + grantRequest.id);
  }
  
  // Create a custom role
  const roleMetadata = new Map<string, string>();
  roleMetadata.set("name", "Developer");
  roleMetadata.set("description", "Can create and manage applications");
  
  const permissions = [
    "domain.create",
    "object.create",
    "object.update"
  ];
  
  // Note: Role creation would need to be added to the gateway client
  // This is just an example of how it could work
  console.log("Custom role example prepared with permissions: " + permissions.join(", "));
}

// Example: Monitoring network status
export function exampleNetworkMonitoring(): void {
  // Get network status
  const networkStatus = getNetworkStatus();
  console.log("Network status: " + networkStatus);
  
  // Get all connected nodes
  const nodeIds = getAllNodeIds();
  console.log("Connected nodes: " + nodeIds.length.toString());
  
  for (let i = 0; i < nodeIds.length; i++) {
    const nodeStatus = getNodeStatus(nodeIds[i]);
    console.log("Node " + nodeIds[i] + ": " + nodeStatus);
  }
}