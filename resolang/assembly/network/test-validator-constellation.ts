/**
 * Test file for Validator Constellation
 * Verifies Phase 2 implementation
 */

import {
  ValidatorNode,
  ValidatorNodeType,
  NodeConnection,
  NetworkTopology,
  ValidatorConstellation,
  createTestnetValidatorConstellation
} from "./validator-constellation";
import { createTestnetQuantumField } from "./quantum-resonance-field";
import { toFixed } from "../utils";

/**
 * Test validator node creation and properties
 */
export function testValidatorNodes(): void {
  console.log("=== Testing Validator Nodes ===");
  
  // Create test validators
  const primary = new ValidatorNode(
    "test-primary",
    101, 103, 107,
    "Test Primary Validator",
    "https://test-primary.resonet.io",
    50000.0,
    "US-East",
    ValidatorNodeType.PRIMARY
  );
  
  const secondary = new ValidatorNode(
    "test-secondary",
    109, 113, 127,
    "Test Secondary Validator",
    "https://test-secondary.resonet.io",
    25000.0,
    "EU-West",
    ValidatorNodeType.SECONDARY
  );
  
  const observer = new ValidatorNode(
    "test-observer",
    131, 137, 139,
    "Test Observer Node",
    "https://test-observer.resonet.io",
    10000.0,
    "Asia-Pacific",
    ValidatorNodeType.OBSERVER
  );
  
  console.log("\nValidator properties:");
  console.log(`  Primary: stake=${primary.stake}, voting power=${toFixed(primary.getVotingPower(), 2)}`);
  console.log(`  Secondary: stake=${secondary.stake}, voting power=${toFixed(secondary.getVotingPower(), 2)}`);
  console.log(`  Observer: stake=${observer.stake}, voting power=${toFixed(observer.getVotingPower(), 2)}`);
  
  // Test voting power multipliers
  console.log("\nVoting power multipliers:");
  console.log(`  Primary multiplier: ${toFixed(primary.getVotingPower() / primary.stake, 1)}x`);
  console.log(`  Secondary multiplier: ${toFixed(secondary.getVotingPower() / secondary.stake, 1)}x`);
  console.log(`  Observer multiplier: ${toFixed(observer.getVotingPower() / observer.stake, 1)}x`);
}

/**
 * Test network topology
 */
export function testNetworkTopology(): void {
  console.log("\n=== Testing Network Topology ===");
  
  const topology = new NetworkTopology();
  
  // Add nodes
  const node1 = new ValidatorNode("node1", 2, 3, 5, "Node 1", "https://node1.io", 10000.0, "US", ValidatorNodeType.PRIMARY);
  const node2 = new ValidatorNode("node2", 7, 11, 13, "Node 2", "https://node2.io", 10000.0, "EU", ValidatorNodeType.PRIMARY);
  const node3 = new ValidatorNode("node3", 17, 19, 23, "Node 3", "https://node3.io", 10000.0, "Asia", ValidatorNodeType.PRIMARY);
  const node4 = new ValidatorNode("node4", 29, 31, 37, "Node 4", "https://node4.io", 5000.0, "US", ValidatorNodeType.SECONDARY);
  
  topology.addNode(node1);
  topology.addNode(node2);
  topology.addNode(node3);
  topology.addNode(node4);
  
  // Create connections
  topology.addConnection("node1", "node2", 1.0, 10.0, 1000.0);
  topology.addConnection("node2", "node3", 1.0, 15.0, 1000.0);
  topology.addConnection("node3", "node1", 1.0, 20.0, 1000.0);
  topology.addConnection("node4", "node1", 0.8, 5.0, 500.0);
  
  console.log("Network topology created:");
  console.log(`  Nodes: ${topology.nodes.size}`);
  console.log(`  Connections: ${topology.connections.size / 2} (bidirectional)`);
  console.log(`  Is connected: ${topology.isConnected()}`);
  
  // Test neighbors
  console.log("\nNode neighbors:");
  const node1Neighbors = topology.getNeighbors("node1");
  const node4Neighbors = topology.getNeighbors("node4");
  console.log(`  node1 neighbors: [${node1Neighbors.join(", ")}]`);
  console.log(`  node4 neighbors: [${node4Neighbors.join(", ")}]`);
  
  // Test disconnected topology
  const disconnected = new NetworkTopology();
  disconnected.addNode(node1);
  disconnected.addNode(node2);
  disconnected.addNode(node3);
  // No connections added
  console.log("\nDisconnected topology:");
  console.log(`  Is connected: ${disconnected.isConnected()}`);
}

/**
 * Test the full validator constellation
 */
export function testValidatorConstellation(): void {
  console.log("\n=== Testing Validator Constellation ===");
  
  const constellation = createTestnetValidatorConstellation();
  
  console.log("Constellation statistics:");
  console.log(`  Total validators: ${constellation.validators.size}`);
  console.log(`  Primary validators: ${constellation.primaryValidators.length}`);
  console.log(`  Secondary validators: ${constellation.secondaryValidators.length}`);
  console.log(`  Observer nodes: ${constellation.observerNodes.length}`);
  console.log(`  Total stake: ${toFixed(constellation.getTotalStake(), 0)}`);
  console.log(`  Total voting power: ${toFixed(constellation.getTotalVotingPower(), 0)}`);
  
  // Check consensus threshold
  const threshold = 0.67; // 2/3 consensus
  console.log(`\nConsensus check (threshold=${threshold}):`);
  console.log(`  Meets threshold: ${constellation.meetsConsensusThreshold(threshold)}`);
  
  // Check topology connectivity
  console.log("\nTopology check:");
  console.log(`  Network is connected: ${constellation.topology.isConnected()}`);
  
  // List all validators
  console.log("\nValidator details:");
  const validatorIds = constellation.validators.keys();
  for (let i = 0; i < validatorIds.length; i++) {
    const validator = constellation.validators.get(validatorIds[i]);
    const neighbors = constellation.topology.getNeighbors(validator.id);
    console.log(`  ${validator.name}:`);
    console.log(`    - Location: ${validator.location}`);
    console.log(`    - Stake: ${toFixed(validator.stake, 0)}`);
    console.log(`    - Type: ${ValidatorNodeType[validator.nodeType]}`);
    console.log(`    - Neighbors: [${neighbors.join(", ")}]`);
  }
}

/**
 * Test quantum field integration
 */
export function testQuantumFieldIntegration(): void {
  console.log("\n=== Testing Quantum Field Integration ===");
  
  // Create constellation and quantum field
  const constellation = createTestnetValidatorConstellation();
  const quantumField = createTestnetQuantumField();
  
  // Link them together
  constellation.linkQuantumField(quantumField);
  
  console.log("Quantum anchor assignments:");
  const validatorIds = constellation.validators.keys();
  for (let i = 0; i < validatorIds.length; i++) {
    const validator = constellation.validators.get(validatorIds[i]);
    if (validator.quantumAnchor) {
      console.log(`  ${validator.name} -> ${validator.quantumAnchor.name} (${validator.quantumAnchor.role})`);
    } else {
      console.log(`  ${validator.name} -> No quantum anchor`);
    }
  }
  
  // Check resonance between linked validators
  console.log("\nResonance between quantum-linked validators:");
  const prime1 = constellation.validators.get("validator-prime-1");
  const prime2 = constellation.validators.get("validator-prime-2");
  
  if (prime1 && prime2 && prime1.quantumAnchor && prime2.quantumAnchor) {
    const resonance = prime1.quantumAnchor.calculateResonance(prime2.quantumAnchor);
    console.log(`  ${prime1.name} <-> ${prime2.name}: ${toFixed(resonance, 4)}`);
  }
}

/**
 * Test JSON serialization
 */
export function testSerialization(): void {
  console.log("\n=== Testing JSON Serialization ===");
  
  const constellation = createTestnetValidatorConstellation();
  const json = constellation.toJSON();
  
  console.log("Constellation JSON length: " + json.length.toString() + " characters");
  console.log("JSON preview (first 200 chars):");
  console.log(json.substring(0, 200) + "...");
}

/**
 * Run all validator constellation tests
 */
export function runValidatorConstellationTests(): void {
  console.log("Starting Validator Constellation Tests\n");
  
  testValidatorNodes();
  testNetworkTopology();
  testValidatorConstellation();
  testQuantumFieldIntegration();
  testSerialization();
  
  console.log("\n=== Validator Constellation Tests Complete ===");
}