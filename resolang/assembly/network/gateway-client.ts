/**
 * Gateway Client for the Prime Resonance Network
 * Handles Layer 1 operations and network connectivity
 */

import { NetworkNode, PrimeResonanceIdentity } from "../../../resonnet/assembly/prn-node";
import { PRNSyncOrchestrator } from "../prn-sync-manager";
import {
  createNode,
  connectNodesByID,
  getNodeStatus,
  sendHeartbeat,
  getAllNodeIds,
  getNetworkStatus
} from "../prn-network-manager";
import { 
  Identity,
  Domain,
  DomainObject,
  Permission,
  Role,
  IdentitySystemFactory
} from "../identity";
import { 
  GenesisConfig,
  loadGenesisState
} from "./genesis";
import { 
  IdentityId,
  DomainId,
  ObjectId,
  TransferRequest,
  PermissionRequest,
  AuthCredentials,
  AuthResult,
  AccessDecision
} from "../identity/types";
import { PermissionEvaluator } from "../identity/permissions";
import { BaseSerializable } from "../core/interfaces";
import { JSONBuilder } from "../core/serialization";

/**
 * Gateway client state
 */
export enum ClientState {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  SYNCING = "syncing",
  READY = "ready",
  ERROR = "error"
}

/**
 * Layer 1 operation types
 */
export enum Layer1Operation {
  // Identity operations
  CREATE_IDENTITY = "create_identity",
  UPDATE_IDENTITY = "update_identity",
  VERIFY_KYC = "verify_kyc",
  
  // Domain operations
  CREATE_DOMAIN = "create_domain",
  TRANSFER_DOMAIN = "transfer_domain",
  ADD_DOMAIN_MEMBER = "add_domain_member",
  REMOVE_DOMAIN_MEMBER = "remove_domain_member",
  
  // Object operations
  CREATE_OBJECT = "create_object",
  TRANSFER_OBJECT = "transfer_object",
  DESTROY_OBJECT = "destroy_object",
  
  // Permission operations
  GRANT_PERMISSION = "grant_permission",
  REVOKE_PERMISSION = "revoke_permission",
  ASSIGN_ROLE = "assign_role",
  UNASSIGN_ROLE = "unassign_role",
  
  // Network operations
  NODE_JOIN = "node_join",
  NODE_LEAVE = "node_leave",
  CONSENSUS_VOTE = "consensus_vote"
}

/**
 * Layer 1 operation request
 */
export class Layer1Request {
  id: string;
  operation: Layer1Operation;
  requesterId: IdentityId;
  timestamp: f64;
  data: Map<string, string>;
  signatures: Map<string, string>;
  
  constructor(
    operation: Layer1Operation,
    requesterId: IdentityId,
    data: Map<string, string> = new Map<string, string>()
  ) {
    this.id = "req_" + Date.now().toString() + "_" + Math.random().toString();
    this.operation = operation;
    this.requesterId = requesterId;
    this.timestamp = Date.now();
    this.data = data;
    this.signatures = new Map<string, string>();
  }
  
  /**
   * Add a signature to the request
   */
  addSignature(signerId: string, signature: string): void {
    this.signatures.set(signerId, signature);
  }
  
  /**
   * Serialize to JSON
   */
  toJSON(): string {
    const builder = new JSONBuilder();
    builder.startObject();
    
    builder.addStringField("id", this.id);
    builder.addStringField("operation", this.operation);
    builder.addStringField("requesterId", this.requesterId);
    builder.addNumberField("timestamp", this.timestamp);
    
    // Serialize data
    builder.addRawField("data", this.serializeMap(this.data));
    
    // Serialize signatures
    builder.addRawField("signatures", this.serializeMap(this.signatures));
    
    builder.endObject();
    return builder.build();
  }
  
  private serializeMap(map: Map<string, string>): string {
    const builder = new JSONBuilder();
    builder.startObject();
    const keys = map.keys();
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = map.get(key);
      builder.addStringField(key, value);
    }
    builder.endObject();
    return builder.build();
  }
}

/**
 * Gateway Client for connecting to the Prime Resonance Network
 * This is the main entry point for applications to interact with the network
 */
export class GatewayClient extends BaseSerializable {
  // Client identity
  private clientId: string;
  private identity: Identity | null;
  private node: NetworkNode | null;
  
  // Network connection
  private syncOrchestrator: PRNSyncOrchestrator | null;
  private genesisConfig: GenesisConfig | null;
  
  // Client state
  private state: ClientState;
  private connectedNodes: Map<string, NetworkNode>;
  private lastSyncTime: f64;
  
  // Local caches
  private identityCache: Map<string, Identity>;
  private domainCache: Map<string, Domain>;
  private objectCache: Map<string, DomainObject>;
  private permissionEvaluator: PermissionEvaluator;
  
  // Pending operations
  private pendingRequests: Map<string, Layer1Request>;
  
  constructor(clientId: string) {
    super();
    this.clientId = clientId;
    this.identity = null;
    this.node = null;
    
    this.syncOrchestrator = null;
    this.genesisConfig = null;
    
    this.state = ClientState.DISCONNECTED;
    this.connectedNodes = new Map<string, NetworkNode>();
    this.lastSyncTime = 0;
    
    this.identityCache = new Map<string, Identity>();
    this.domainCache = new Map<string, Domain>();
    this.objectCache = new Map<string, DomainObject>();
    this.permissionEvaluator = new PermissionEvaluator();
    
    this.pendingRequests = new Map<string, Layer1Request>();
  }
  
  /**
   * Connect to the Prime Resonance Network
   */
  connect(
    identity: Identity,
    primeP1: u32,
    primeP2: u32,
    primeP3: u32
  ): boolean {
    if (this.state != ClientState.DISCONNECTED) {
      console.error("Client already connected or connecting");
      return false;
    }
    
    this.state = ClientState.CONNECTING;
    this.identity = identity;
    
    try {
      // Load genesis configuration
      this.genesisConfig = loadGenesisState("");
      
      // Create network node with prime identity
      this.node = new NetworkNode(
        this.clientId,
        primeP1,
        primeP2,
        primeP3
      );
      
      // Connect identity to prime resonance
      identity.connectToPrimeResonance(this.node.id);
      
      // Create node in network
      createNode(this.clientId);
      
      // Initialize sync orchestrator
      this.syncOrchestrator = new PRNSyncOrchestrator();
      
      // Connect to genesis nodes
      this.connectToGenesisNodes();
      
      // Start synchronization
      this.startSync();
      
      this.state = ClientState.SYNCING;
      return true;
      
    } catch (e) {
      console.error("Failed to connect to network: " + (e as Error).message);
      this.state = ClientState.ERROR;
      return false;
    }
  }
  
  /**
   * Disconnect from the network
   */
  disconnect(): void {
    if (this.state == ClientState.DISCONNECTED) {
      return;
    }
    
    // Stop sync
    if (this.syncOrchestrator) {
      // Note: PRNSyncOrchestrator doesn't have a stopSync method
      // We'll need to implement proper cleanup later
    }
    
    // Disconnect from nodes
    const nodeIds = this.connectedNodes.keys();
    for (let i = 0; i < nodeIds.length; i++) {
      this.disconnectFromNode(nodeIds[i]);
    }
    
    // Clear state
    this.state = ClientState.DISCONNECTED;
    this.identity = null;
    this.node = null;
    this.syncOrchestrator = null;
    
    // Clear caches
    this.identityCache.clear();
    this.domainCache.clear();
    this.objectCache.clear();
    this.pendingRequests.clear();
  }
  
  /**
   * Get current client state
   */
  getState(): ClientState {
    return this.state;
  }
  
  /**
   * Check if client is ready for operations
   */
  isReady(): boolean {
    return this.state == ClientState.READY;
  }
  
  // ========== Layer 1 Operations ==========
  
  /**
   * Create a new identity
   */
  createIdentity(
    type: string,
    metadata: Map<string, string>,
    creatorId: string | null = null
  ): Layer1Request | null {
    if (!this.isReady() || !this.identity) {
      console.error("Client not ready");
      return null;
    }
    
    // Check permissions
    const canCreate = this.checkPermission("identity.create");
    if (!canCreate.allowed) {
      console.error("Permission denied: " + canCreate.reason);
      return null;
    }
    
    // Create request data
    const data = new Map<string, string>();
    data.set("type", type);
    data.set("creatorId", creatorId || this.identity.getId());
    
    // Add metadata
    const metadataKeys = metadata.keys();
    for (let i = 0; i < metadataKeys.length; i++) {
      const key = metadataKeys[i];
      data.set("metadata." + key, metadata.get(key));
    }
    
    // Create Layer 1 request
    const request = new Layer1Request(
      Layer1Operation.CREATE_IDENTITY,
      this.identity.getId(),
      data
    );
    
    // Submit request
    return this.submitRequest(request);
  }
  
  /**
   * Create a new domain
   */
  createDomain(
    name: string,
    parentId: string | null = null
  ): Layer1Request | null {
    if (!this.isReady() || !this.identity) {
      console.error("Client not ready");
      return null;
    }
    
    // Check permissions
    const permission = parentId ? "domain.create_subdomain" : "domain.create";
    const canCreate = this.checkPermission(permission, parentId);
    if (!canCreate.allowed) {
      console.error("Permission denied: " + canCreate.reason);
      return null;
    }
    
    // Create request data
    const data = new Map<string, string>();
    data.set("name", name);
    data.set("ownerId", this.identity.getId());
    if (parentId) {
      data.set("parentId", parentId);
    }
    
    // Create Layer 1 request
    const request = new Layer1Request(
      Layer1Operation.CREATE_DOMAIN,
      this.identity.getId(),
      data
    );
    
    // Submit request
    return this.submitRequest(request);
  }
  
  /**
   * Create a new object
   */
  createObject(
    type: string,
    domainId: string,
    fungible: boolean,
    transferable: boolean,
    destructible: boolean,
    data: Map<string, string>
  ): Layer1Request | null {
    if (!this.isReady() || !this.identity) {
      console.error("Client not ready");
      return null;
    }
    
    // Check permissions
    const canCreate = this.checkPermission("object.create", domainId);
    if (!canCreate.allowed) {
      console.error("Permission denied: " + canCreate.reason);
      return null;
    }
    
    // Create request data
    const requestData = new Map<string, string>();
    requestData.set("type", type);
    requestData.set("ownerId", this.identity.getId());
    requestData.set("domainId", domainId);
    requestData.set("fungible", fungible.toString());
    requestData.set("transferable", transferable.toString());
    requestData.set("destructible", destructible.toString());
    
    // Add object data
    const dataKeys = data.keys();
    for (let i = 0; i < dataKeys.length; i++) {
      const key = dataKeys[i];
      requestData.set("data." + key, data.get(key));
    }
    
    // Create Layer 1 request
    const request = new Layer1Request(
      Layer1Operation.CREATE_OBJECT,
      this.identity.getId(),
      requestData
    );
    
    // Submit request
    return this.submitRequest(request);
  }
  
  /**
   * Transfer domain ownership
   */
  transferDomain(
    domainId: string,
    newOwnerId: string
  ): Layer1Request | null {
    if (!this.isReady() || !this.identity) {
      console.error("Client not ready");
      return null;
    }
    
    // Check permissions
    const canTransfer = this.checkPermission("domain.transfer", domainId);
    if (!canTransfer.allowed) {
      console.error("Permission denied: " + canTransfer.reason);
      return null;
    }
    
    // Create request data
    const data = new Map<string, string>();
    data.set("domainId", domainId);
    data.set("newOwnerId", newOwnerId);
    
    // Create Layer 1 request
    const request = new Layer1Request(
      Layer1Operation.TRANSFER_DOMAIN,
      this.identity.getId(),
      data
    );
    
    // Submit request
    return this.submitRequest(request);
  }
  
  /**
   * Transfer object ownership
   */
  transferObject(
    objectId: string,
    newOwnerId: string
  ): Layer1Request | null {
    if (!this.isReady() || !this.identity) {
      console.error("Client not ready");
      return null;
    }
    
    // Get object to check domain
    const object = this.objectCache.get(objectId);
    if (!object) {
      console.error("Object not found");
      return null;
    }
    
    // Check permissions
    const canTransfer = this.checkPermission("object.transfer", object.getDomainId());
    if (!canTransfer.allowed) {
      console.error("Permission denied: " + canTransfer.reason);
      return null;
    }
    
    // Check if object is transferable
    if (!object.getProperties().transferable) {
      console.error("Object is not transferable");
      return null;
    }
    
    // Create request data
    const data = new Map<string, string>();
    data.set("objectId", objectId);
    data.set("newOwnerId", newOwnerId);
    
    // Create Layer 1 request
    const request = new Layer1Request(
      Layer1Operation.TRANSFER_OBJECT,
      this.identity.getId(),
      data
    );
    
    // Submit request
    return this.submitRequest(request);
  }
  
  // ========== Permission Operations ==========
  
  /**
   * Grant permission to an identity
   */
  grantPermission(
    identityId: string,
    permissionId: string,
    domainId: string | null = null
  ): Layer1Request | null {
    if (!this.isReady() || !this.identity) {
      console.error("Client not ready");
      return null;
    }
    
    // Check permissions
    const canGrant = this.checkPermission("permission.grant", domainId);
    if (!canGrant.allowed) {
      console.error("Permission denied: " + canGrant.reason);
      return null;
    }
    
    // Create request data
    const data = new Map<string, string>();
    data.set("identityId", identityId);
    data.set("permissionId", permissionId);
    if (domainId) {
      data.set("domainId", domainId);
    }
    
    // Create Layer 1 request
    const request = new Layer1Request(
      Layer1Operation.GRANT_PERMISSION,
      this.identity.getId(),
      data
    );
    
    // Submit request
    return this.submitRequest(request);
  }
  
  /**
   * Assign role to an identity
   */
  assignRole(
    identityId: string,
    roleId: string,
    domainId: string | null = null
  ): Layer1Request | null {
    if (!this.isReady() || !this.identity) {
      console.error("Client not ready");
      return null;
    }
    
    // Check permissions
    const canAssign = this.checkPermission("role.assign", domainId);
    if (!canAssign.allowed) {
      console.error("Permission denied: " + canAssign.reason);
      return null;
    }
    
    // Create request data
    const data = new Map<string, string>();
    data.set("identityId", identityId);
    data.set("roleId", roleId);
    if (domainId) {
      data.set("domainId", domainId);
    }
    
    // Create Layer 1 request
    const request = new Layer1Request(
      Layer1Operation.ASSIGN_ROLE,
      this.identity.getId(),
      data
    );
    
    // Submit request
    return this.submitRequest(request);
  }
  
  // ========== Query Operations ==========
  
  /**
   * Get identity by ID
   */
  getIdentity(identityId: string): Identity | null {
    return this.identityCache.get(identityId);
  }
  
  /**
   * Get domain by ID
   */
  getDomain(domainId: string): Domain | null {
    return this.domainCache.get(domainId);
  }
  
  /**
   * Get object by ID
   */
  getObject(objectId: string): DomainObject | null {
    return this.objectCache.get(objectId);
  }
  
  /**
   * Get connected nodes
   */
  getConnectedNodes(): NetworkNode[] {
    return this.connectedNodes.values();
  }
  
  // ========== Private Methods ==========
  
  /**
   * Connect to genesis nodes
   */
  private connectToGenesisNodes(): void {
    if (!this.genesisConfig) {
      return;
    }
    
    const genesisNodes = this.genesisConfig.genesisNodes;
    for (let i = 0; i < genesisNodes.length; i++) {
      const genesisNode = genesisNodes[i];
      
      // Create network node from genesis config
      const node = new NetworkNode(
        genesisNode.id,
        genesisNode.primeIdentity.gaussianPrime,
        genesisNode.primeIdentity.eisensteinPrime,
        genesisNode.primeIdentity.quaternionicPrime
      );
      
      // Connect to node using network manager functions
      connectNodesByID(this.clientId, node.id, 0.9);
      this.connectedNodes.set(node.id, node);
    }
  }
  
  /**
   * Disconnect from a node
   */
  private disconnectFromNode(nodeId: string): void {
    // In the current network manager, there's no disconnect function
    // We'll just remove from our local tracking
    this.connectedNodes.delete(nodeId);
  }
  
  /**
   * Start synchronization process
   */
  private startSync(): void {
    if (!this.syncOrchestrator || !this.node) {
      return;
    }
    
    // Register our node with the orchestrator
    this.syncOrchestrator.registerNode(this.node);
    
    // For now, we'll mark as ready immediately
    // In a real implementation, this would be async
    this.lastSyncTime = 0; // AssemblyScript doesn't have Date.now()
    if (this.state == ClientState.SYNCING) {
      this.state = ClientState.READY;
      console.log("Gateway client ready");
    }
  }
  
  /**
   * Check permission for current identity
   */
  private checkPermission(
    permissionId: string,
    domainId: string | null = null
  ): AccessDecision {
    if (!this.identity) {
      return AccessDecision.deny("No identity");
    }
    
    // Get identity permissions and roles
    // In a real implementation, these would be fetched from the network state
    const permissions: string[] = [];
    const roles: Role[] = [];
    
    const hasPermission = this.permissionEvaluator.hasPermission(
      permissions,
      roles,
      permissionId,
      domainId
    );
    
    return hasPermission ? 
      AccessDecision.allow() : 
      AccessDecision.deny("Missing permission: " + permissionId);
  }
  
  /**
   * Submit a Layer 1 request to the network
   */
  private submitRequest(request: Layer1Request): Layer1Request {
    // Add to pending requests
    this.pendingRequests.set(request.id, request);
    
    // In a real implementation, this would:
    // 1. Sign the request with the identity's private key
    // 2. Broadcast to connected nodes
    // 3. Wait for consensus
    // 4. Update local state when confirmed
    
    console.log("Submitting Layer 1 request: " + request.toJSON());
    
    // In AssemblyScript, we don't have setTimeout
    // For now, handle the request synchronously
    // In a real implementation, this would be handled by the network layer
    this.handleRequestConfirmation(request.id, true);
    
    return request;
  }
  
  /**
   * Handle request confirmation from the network
   */
  private handleRequestConfirmation(requestId: string, success: boolean): void {
    const request = this.pendingRequests.get(requestId);
    if (!request) {
      return;
    }
    
    if (success) {
      console.log("Request confirmed: " + requestId);
      // Update local caches based on operation type
      this.updateLocalState(request);
    } else {
      console.error("Request failed: " + requestId);
    }
    
    // Remove from pending
    this.pendingRequests.delete(requestId);
  }
  
  /**
   * Update local state based on confirmed request
   */
  private updateLocalState(request: Layer1Request): void {
    // In a real implementation, this would update the local caches
    // based on the operation type and data
    console.log("Updating local state for operation: " + request.operation);
  }
  
  // Serializable implementation
  toString(): string {
    return this.toJSON();
  }
  
  toJSON(): string {
    const builder = new JSONBuilder();
    builder.startObject();
    
    builder.addStringField("clientId", this.clientId);
    builder.addStringField("state", this.state);
    builder.addNumberField("lastSyncTime", this.lastSyncTime);
    
    if (this.identity) {
      builder.addStringField("identityId", this.identity.getId());
    }
    
    if (this.node) {
      builder.addStringField("nodeId", this.node.id);
    }
    
    // Add connected nodes
    const nodeIds: string[] = [];
    const keys = this.connectedNodes.keys();
    for (let i = 0; i < keys.length; i++) {
      nodeIds.push(keys[i]);
    }
    builder.addRawField("connectedNodes", this.serializeStringArray(nodeIds));
    
    // Add pending requests count
    builder.addIntegerField("pendingRequests", this.pendingRequests.size);
    
    builder.endObject();
    return builder.build();
  }
  
  private serializeStringArray(values: string[]): string {
    const parts: string[] = [];
    parts.push("[");
    for (let i = 0; i < values.length; i++) {
      if (i > 0) parts.push(",");
      parts.push('"' + this.escapeJSON(values[i]) + '"');
    }
    parts.push("]");
    return parts.join("");
  }
}

/**
 * Create a gateway client instance
 */
export function createGatewayClient(clientId: string): GatewayClient {
  return new GatewayClient(clientId);
}