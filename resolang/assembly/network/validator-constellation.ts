/**
 * Validator Node Constellation for ResonNet Testnet Genesis
 * Implements Phase 2 of the genesis hologram creation
 */

import { PrimeResonanceIdentity } from "../../../resonnet/assembly/prn-node";
import { QuantumPrimeAnchor, QuantumResonanceField } from "./quantum-resonance-field";
import { JSONBuilder } from "../core/serialization";

/**
 * Represents a validator node in the constellation
 */
export class ValidatorNode {
  id: string;
  name: string;
  endpoint: string;
  primeIdentity: PrimeResonanceIdentity;
  stake: f64;
  location: string;
  nodeType: ValidatorNodeType;
  quantumAnchor: QuantumPrimeAnchor | null;
  
  constructor(
    id: string,
    p1: u32,
    p2: u32,
    p3: u32,
    name: string,
    endpoint: string,
    stake: f64,
    location: string,
    nodeType: ValidatorNodeType
  ) {
    this.id = id;
    this.name = name;
    this.endpoint = endpoint;
    this.primeIdentity = new PrimeResonanceIdentity(p1, p2, p3);
    this.stake = stake;
    this.location = location;
    this.nodeType = nodeType;
    this.quantumAnchor = null;
  }
  
  /**
   * Link this validator to a quantum anchor
   */
  linkToQuantumAnchor(anchor: QuantumPrimeAnchor): void {
    this.quantumAnchor = anchor;
  }
  
  /**
   * Get the validator's voting power based on stake
   */
  getVotingPower(): f64 {
    // Primary validators have 2x voting power multiplier
    const multiplier = this.nodeType == ValidatorNodeType.PRIMARY ? 2.0 : 
                      this.nodeType == ValidatorNodeType.SECONDARY ? 1.5 : 1.0;
    return this.stake * multiplier;
  }
  
  toJSON(): string {
    const builder = new JSONBuilder();
    builder.startObject();
    builder.addStringField("id", this.id);
    builder.addStringField("name", this.name);
    builder.addStringField("endpoint", this.endpoint);
    builder.addRawField("primeIdentity", this.primeIdentity.toJSON());
    builder.addNumberField("stake", this.stake);
    builder.addStringField("location", this.location);
    builder.addStringField("nodeType", ValidatorNodeType[this.nodeType]);
    builder.addNumberField("votingPower", this.getVotingPower());
    
    if (this.quantumAnchor) {
      builder.addStringField("quantumAnchor", this.quantumAnchor.name);
    }
    
    builder.endObject();
    return builder.build();
  }
}

/**
 * Types of validator nodes
 */
export enum ValidatorNodeType {
  PRIMARY = 0,    // High stake, core consensus
  SECONDARY = 1,  // Medium stake, backup consensus
  OBSERVER = 2    // Low stake, monitoring
}

/**
 * Represents a connection between validator nodes
 */
export class NodeConnection {
  fromNode: string;
  toNode: string;
  weight: f64;
  latency: f64;
  bandwidth: f64;
  
  constructor(
    fromNode: string,
    toNode: string,
    weight: f64,
    latency: f64 = 10.0,
    bandwidth: f64 = 1000.0
  ) {
    this.fromNode = fromNode;
    this.toNode = toNode;
    this.weight = weight;
    this.latency = latency;
    this.bandwidth = bandwidth;
  }
  
  toJSON(): string {
    const builder = new JSONBuilder();
    builder.startObject();
    builder.addStringField("from", this.fromNode);
    builder.addStringField("to", this.toNode);
    builder.addNumberField("weight", this.weight);
    builder.addNumberField("latency", this.latency);
    builder.addNumberField("bandwidth", this.bandwidth);
    builder.endObject();
    return builder.build();
  }
}

/**
 * Network topology managing node connections
 */
export class NetworkTopology {
  connections: Map<string, NodeConnection>;
  nodes: Map<string, ValidatorNode>;
  
  constructor() {
    this.connections = new Map<string, NodeConnection>();
    this.nodes = new Map<string, ValidatorNode>();
  }
  
  /**
   * Add a validator node to the topology
   */
  addNode(node: ValidatorNode): void {
    this.nodes.set(node.id, node);
  }
  
  /**
   * Add a connection between nodes
   */
  addConnection(
    fromNode: string,
    toNode: string,
    weight: f64,
    latency: f64 = 10.0,
    bandwidth: f64 = 1000.0
  ): void {
    const key = fromNode + "->" + toNode;
    const connection = new NodeConnection(fromNode, toNode, weight, latency, bandwidth);
    this.connections.set(key, connection);
    
    // Add reverse connection for bidirectional communication
    const reverseKey = toNode + "->" + fromNode;
    const reverseConnection = new NodeConnection(toNode, fromNode, weight, latency, bandwidth);
    this.connections.set(reverseKey, reverseConnection);
  }
  
  /**
   * Check if the topology forms a connected graph
   */
  isConnected(): boolean {
    if (this.nodes.size == 0) return true;
    
    // Use BFS to check connectivity
    const visited = new Set<string>();
    const queue: string[] = [];
    
    // Start from first node
    const firstNode = this.nodes.keys()[0];
    queue.push(firstNode);
    visited.add(firstNode);
    
    while (queue.length > 0) {
      const current = queue.shift();
      
      // Find all connections from current node
      const connKeys = this.connections.keys();
      for (let i = 0; i < connKeys.length; i++) {
        const conn = this.connections.get(connKeys[i]);
        if (conn.fromNode == current && !visited.has(conn.toNode)) {
          visited.add(conn.toNode);
          queue.push(conn.toNode);
        }
      }
    }
    
    return visited.size == this.nodes.size;
  }
  
  /**
   * Get neighbors of a node
   */
  getNeighbors(nodeId: string): string[] {
    const neighbors: string[] = [];
    const connKeys = this.connections.keys();
    
    for (let i = 0; i < connKeys.length; i++) {
      const conn = this.connections.get(connKeys[i]);
      if (conn.fromNode == nodeId) {
        neighbors.push(conn.toNode);
      }
    }
    
    return neighbors;
  }
  
  toJSON(): string {
    const builder = new JSONBuilder();
    builder.startObject();
    
    // Add nodes
    const nodeParts: string[] = [];
    nodeParts.push("[");
    const nodeKeys = this.nodes.keys();
    for (let i = 0; i < nodeKeys.length; i++) {
      if (i > 0) nodeParts.push(",");
      const node = this.nodes.get(nodeKeys[i]);
      nodeParts.push(node.toJSON());
    }
    nodeParts.push("]");
    builder.addRawField("nodes", nodeParts.join(""));
    
    // Add connections
    const connParts: string[] = [];
    connParts.push("[");
    const connKeys = this.connections.keys();
    let connCount = 0;
    for (let i = 0; i < connKeys.length; i++) {
      // Only include forward connections (skip reverse)
      if (connKeys[i].indexOf("->") > 0) {
        const parts = connKeys[i].split("->");
        if (parts[0] < parts[1]) { // Avoid duplicates
          if (connCount > 0) connParts.push(",");
          const conn = this.connections.get(connKeys[i]);
          connParts.push(conn.toJSON());
          connCount++;
        }
      }
    }
    connParts.push("]");
    builder.addRawField("connections", connParts.join(""));
    
    builder.addBooleanField("isConnected", this.isConnected());
    builder.endObject();
    return builder.build();
  }
}

/**
 * Validator constellation managing all validator nodes
 */
export class ValidatorConstellation {
  validators: Map<string, ValidatorNode>;
  topology: NetworkTopology;
  quantumField: QuantumResonanceField | null;
  
  // Node categories
  primaryValidators: string[];
  secondaryValidators: string[];
  observerNodes: string[];
  
  constructor() {
    this.validators = new Map<string, ValidatorNode>();
    this.topology = new NetworkTopology();
    this.quantumField = null;
    this.primaryValidators = [];
    this.secondaryValidators = [];
    this.observerNodes = [];
  }
  
  /**
   * Link to quantum resonance field
   */
  linkQuantumField(field: QuantumResonanceField): void {
    this.quantumField = field;
    
    // Link validators to quantum anchors
    // Primary validators get the first anchors
    const anchorNames = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta", "Theta"];
    let anchorIndex = 0;
    
    // Link primary validators
    for (let i = 0; i < this.primaryValidators.length && anchorIndex < anchorNames.length; i++) {
      const validator = this.validators.get(this.primaryValidators[i]);
      const anchor = field.anchors.get(anchorNames[anchorIndex]);
      if (validator && anchor) {
        validator.linkToQuantumAnchor(anchor);
        anchorIndex++;
      }
    }
    
    // Link secondary validators
    for (let i = 0; i < this.secondaryValidators.length && anchorIndex < anchorNames.length; i++) {
      const validator = this.validators.get(this.secondaryValidators[i]);
      const anchor = field.anchors.get(anchorNames[anchorIndex]);
      if (validator && anchor) {
        validator.linkToQuantumAnchor(anchor);
        anchorIndex++;
      }
    }
  }
  
  /**
   * Add a validator to the constellation
   */
  addValidator(validator: ValidatorNode): void {
    this.validators.set(validator.id, validator);
    this.topology.addNode(validator);
    
    // Categorize by type
    if (validator.nodeType == ValidatorNodeType.PRIMARY) {
      this.primaryValidators.push(validator.id);
    } else if (validator.nodeType == ValidatorNodeType.SECONDARY) {
      this.secondaryValidators.push(validator.id);
    } else {
      this.observerNodes.push(validator.id);
    }
  }
  
  /**
   * Create network topology connections
   */
  createTopology(): void {
    // Create primary ring topology
    for (let i = 0; i < this.primaryValidators.length; i++) {
      const current = this.primaryValidators[i];
      const next = this.primaryValidators[(i + 1) % this.primaryValidators.length];
      this.topology.addConnection(current, next, 1.0, 5.0, 10000.0);
    }
    
    // Connect secondary validators to primary validators
    for (let i = 0; i < this.secondaryValidators.length; i++) {
      const secondary = this.secondaryValidators[i];
      const primaryIndex = i % this.primaryValidators.length;
      const primary = this.primaryValidators[primaryIndex];
      this.topology.addConnection(secondary, primary, 0.8, 10.0, 5000.0);
    }
    
    // Connect observers to secondary validators
    for (let i = 0; i < this.observerNodes.length; i++) {
      const observer = this.observerNodes[i];
      const secondaryIndex = i % this.secondaryValidators.length;
      if (secondaryIndex < this.secondaryValidators.length) {
        const secondary = this.secondaryValidators[secondaryIndex];
        this.topology.addConnection(observer, secondary, 0.6, 15.0, 1000.0);
      }
    }
  }
  
  /**
   * Calculate total stake in the network
   */
  getTotalStake(): f64 {
    let total = 0.0;
    const keys = this.validators.keys();
    for (let i = 0; i < keys.length; i++) {
      const validator = this.validators.get(keys[i]);
      total += validator.stake;
    }
    return total;
  }
  
  /**
   * Calculate total voting power
   */
  getTotalVotingPower(): f64 {
    let total = 0.0;
    const keys = this.validators.keys();
    for (let i = 0; i < keys.length; i++) {
      const validator = this.validators.get(keys[i]);
      total += validator.getVotingPower();
    }
    return total;
  }
  
  /**
   * Check if constellation meets consensus threshold
   */
  meetsConsensusThreshold(threshold: f64): boolean {
    const primaryPower = this.getCategoryVotingPower(ValidatorNodeType.PRIMARY);
    const totalPower = this.getTotalVotingPower();
    return (primaryPower / totalPower) >= threshold;
  }
  
  /**
   * Get voting power for a category of nodes
   */
  private getCategoryVotingPower(nodeType: ValidatorNodeType): f64 {
    let total = 0.0;
    const keys = this.validators.keys();
    for (let i = 0; i < keys.length; i++) {
      const validator = this.validators.get(keys[i]);
      if (validator.nodeType == nodeType) {
        total += validator.getVotingPower();
      }
    }
    return total;
  }
  
  toJSON(): string {
    const builder = new JSONBuilder();
    builder.startObject();
    
    // Summary statistics
    builder.addIntegerField("totalValidators", this.validators.size);
    builder.addIntegerField("primaryCount", this.primaryValidators.length);
    builder.addIntegerField("secondaryCount", this.secondaryValidators.length);
    builder.addIntegerField("observerCount", this.observerNodes.length);
    builder.addNumberField("totalStake", this.getTotalStake());
    builder.addNumberField("totalVotingPower", this.getTotalVotingPower());
    
    // Validators by category
    builder.addRawField("primaryValidators", this.serializeArray(this.primaryValidators));
    builder.addRawField("secondaryValidators", this.serializeArray(this.secondaryValidators));
    builder.addRawField("observerNodes", this.serializeArray(this.observerNodes));
    
    // Topology
    builder.addRawField("topology", this.topology.toJSON());
    
    builder.endObject();
    return builder.build();
  }
  
  private serializeArray(arr: string[]): string {
    const parts: string[] = [];
    parts.push("[");
    for (let i = 0; i < arr.length; i++) {
      if (i > 0) parts.push(",");
      parts.push('"' + arr[i] + '"');
    }
    parts.push("]");
    return parts.join("");
  }
}

/**
 * Create the testnet validator constellation
 */
export function createTestnetValidatorConstellation(): ValidatorConstellation {
  const constellation = new ValidatorConstellation();
  
  // Add primary validators (high stake)
  constellation.addValidator(new ValidatorNode(
    "validator-prime-1",
    101, 103, 107,
    "Prime Validator Alpha",
    "https://validator1.testnet.resonet.io",
    50000.0,
    "US-East",
    ValidatorNodeType.PRIMARY
  ));
  
  constellation.addValidator(new ValidatorNode(
    "validator-prime-2",
    109, 113, 127,
    "Prime Validator Beta",
    "https://validator2.testnet.resonet.io",
    50000.0,
    "EU-West",
    ValidatorNodeType.PRIMARY
  ));
  
  constellation.addValidator(new ValidatorNode(
    "validator-prime-3",
    131, 137, 139,
    "Prime Validator Gamma",
    "https://validator3.testnet.resonet.io",
    50000.0,
    "Asia-Pacific",
    ValidatorNodeType.PRIMARY
  ));
  
  // Add secondary validators (medium stake)
  constellation.addValidator(new ValidatorNode(
    "validator-secondary-1",
    149, 151, 157,
    "Secondary Validator Delta",
    "https://validator4.testnet.resonet.io",
    25000.0,
    "US-West",
    ValidatorNodeType.SECONDARY
  ));
  
  constellation.addValidator(new ValidatorNode(
    "validator-secondary-2",
    163, 167, 173,
    "Secondary Validator Epsilon",
    "https://validator5.testnet.resonet.io",
    25000.0,
    "EU-East",
    ValidatorNodeType.SECONDARY
  ));
  
  // Add observer nodes (low stake)
  constellation.addValidator(new ValidatorNode(
    "observer-1",
    179, 181, 191,
    "Observer Node Zeta",
    "https://observer1.testnet.resonet.io",
    10000.0,
    "South-America",
    ValidatorNodeType.OBSERVER
  ));
  
  constellation.addValidator(new ValidatorNode(
    "observer-2",
    193, 197, 199,
    "Observer Node Eta",
    "https://observer2.testnet.resonet.io",
    10000.0,
    "Africa",
    ValidatorNodeType.OBSERVER
  ));
  
  // Create the network topology
  constellation.createTopology();
  
  return constellation;
}