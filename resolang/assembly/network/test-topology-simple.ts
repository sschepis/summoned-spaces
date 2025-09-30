// Simple test for Network Topology
// Tests basic functionality without complex WebAssembly features

import {
  NetworkNode,
  NetworkConnection,
  SyncGroup,
  RoutingPath,
  NetworkTopology,
  initializeTestnetTopology
} from "./network-topology";

function testNetworkNode(): void {
  console.log("Testing NetworkNode...");
  
  const node = new NetworkNode(
    "test-node-1",
    "Test Node Alpha",
    "primary",
    "192.168.1.1",
    8080,
    "test-pubkey-1"
  );
  
  assert(node.id == "test-node-1", "Node ID should match");
  assert(node.name == "Test Node Alpha", "Node name should match");
  assert(node.type == "primary", "Node type should match");
  assert(node.address == "192.168.1.1", "Node address should match");
  assert(node.port == 8080, "Node port should match");
  assert(node.publicKey == "test-pubkey-1", "Node public key should match");
  
  console.log("✓ NetworkNode tests passed");
}

function testNetworkConnection(): void {
  console.log("Testing NetworkConnection...");
  
  const connection = new NetworkConnection(
    "test-conn-1",
    "node-1",
    "node-2",
    10,
    1000,
    0.95
  );
  
  assert(connection.id == "test-conn-1", "Connection ID should match");
  assert(connection.fromNodeId == "node-1", "From node ID should match");
  assert(connection.toNodeId == "node-2", "To node ID should match");
  assert(connection.latency == 10, "Latency should match");
  assert(connection.bandwidth == 1000, "Bandwidth should match");
  assert(connection.reliability == 0.95, "Reliability should match");
  
  console.log("✓ NetworkConnection tests passed");
}

function testSyncGroup(): void {
  console.log("Testing SyncGroup...");
  
  const nodeIds = ["node-1", "node-2", "node-3"];
  const group = new SyncGroup(
    "test-sync-1",
    "Test Consensus Group",
    "consensus",
    nodeIds,
    1
  );
  
  assert(group.id == "test-sync-1", "Sync group ID should match");
  assert(group.name == "Test Consensus Group", "Sync group name should match");
  assert(group.type == "consensus", "Sync group type should match");
  assert(group.nodeIds.length == 3, "Should have 3 nodes");
  assert(group.nodeIds[0] == "node-1", "First node ID should match");
  assert(group.priority == 1, "Priority should match");
  
  console.log("✓ SyncGroup tests passed");
}

function testRoutingPath(): void {
  console.log("Testing RoutingPath...");
  
  const path = ["node-1", "node-2", "node-3"];
  const route = new RoutingPath(
    "test-route-1",
    "node-1",
    "node-3",
    path,
    20,
    500,
    0.90
  );
  
  assert(route.id == "test-route-1", "Route ID should match");
  assert(route.sourceNodeId == "node-1", "Source node ID should match");
  assert(route.targetNodeId == "node-3", "Target node ID should match");
  assert(route.path.length == 3, "Path should have 3 nodes");
  assert(route.totalLatency == 20, "Total latency should match");
  assert(route.minBandwidth == 500, "Min bandwidth should match");
  assert(route.reliability == 0.90, "Reliability should match");
  
  console.log("✓ RoutingPath tests passed");
}

function testNetworkTopology(): void {
  console.log("Testing NetworkTopology...");
  
  const topology = new NetworkTopology();
  
  // Add a node
  const node = new NetworkNode(
    "test-node",
    "Test Node",
    "primary",
    "10.0.0.1",
    8080,
    "test-key"
  );
  topology.addNode(node);
  
  // Retrieve the node
  const retrievedNode = topology.getNode("test-node");
  assert(retrievedNode != null, "Should retrieve node");
  assert(retrievedNode!.name == "Test Node", "Retrieved node name should match");
  
  // Add a connection
  const connection = new NetworkConnection(
    "test-conn",
    "node-1",
    "node-2",
    5,
    1000,
    0.99
  );
  topology.addConnection(connection);
  
  // Retrieve the connection
  const retrievedConn = topology.getConnection("test-conn");
  assert(retrievedConn != null, "Should retrieve connection");
  assert(retrievedConn!.latency == 5, "Retrieved connection latency should match");
  
  // Add a sync group
  const syncGroup = new SyncGroup(
    "test-sync",
    "Test Group",
    "consensus",
    ["node-1", "node-2"],
    1
  );
  topology.addSyncGroup(syncGroup);
  
  // Retrieve the sync group
  const retrievedGroup = topology.getSyncGroup("test-sync");
  assert(retrievedGroup != null, "Should retrieve sync group");
  assert(retrievedGroup!.name == "Test Group", "Retrieved group name should match");
  
  // Add a routing path
  const routingPath = new RoutingPath(
    "test-route",
    "node-1",
    "node-2",
    ["node-1", "node-2"],
    5,
    1000,
    0.99
  );
  topology.addRoutingPath(routingPath);
  
  // Retrieve the routing path
  const retrievedPath = topology.getRoutingPath("node-1", "node-2");
  assert(retrievedPath != null, "Should retrieve routing path");
  assert(retrievedPath!.totalLatency == 5, "Retrieved path latency should match");
  
  console.log("✓ NetworkTopology tests passed");
}

function testInitializedTopology(): void {
  console.log("Testing initialized testnet topology...");
  
  const topology = initializeTestnetTopology();
  
  // Check nodes
  assert(topology.nodes.size == 7, "Should have 7 nodes");
  
  // Check primary nodes
  const primaryNode1 = topology.getNode("node-primary-1");
  assert(primaryNode1 != null, "Should have primary node 1");
  assert(primaryNode1!.type == "primary", "Node should be primary type");
  
  // Check connections
  assert(topology.connections.size == 7, "Should have 7 connections");
  
  // Check sync groups
  assert(topology.syncGroups.size == 4, "Should have 4 sync groups");
  
  const consensusGroup = topology.getSyncGroup("sync-consensus-primary");
  assert(consensusGroup != null, "Should have consensus group");
  assert(consensusGroup!.nodeIds.length == 3, "Consensus group should have 3 nodes");
  
  // Check routing paths
  assert(topology.routingTable.size >= 4, "Should have at least 4 routing paths");
  
  // Test getNodeConnections
  const node1Connections = topology.getNodeConnections("node-primary-1");
  assert(node1Connections.length >= 2, "Primary node 1 should have at least 2 connections");
  
  // Test getSyncGroupNodes
  const consensusNodes = topology.getSyncGroupNodes("sync-consensus-primary");
  assert(consensusNodes.length == 3, "Consensus group should return 3 nodes");
  
  // Test network metrics
  const metrics = topology.calculateNetworkMetrics();
  assert(metrics.includes("Nodes: 7"), "Metrics should show 7 nodes");
  assert(metrics.includes("Connections: 7"), "Metrics should show 7 connections");
  
  console.log("✓ Initialized topology tests passed");
  console.log("\nNetwork Metrics:");
  console.log(metrics);
}

// Run all tests
export function runTests(): void {
  console.log("=== Network Topology Tests ===\n");
  
  testNetworkNode();
  testNetworkConnection();
  testSyncGroup();
  testRoutingPath();
  testNetworkTopology();
  testInitializedTopology();
  
  console.log("\n=== All Network Topology Tests Passed! ===");
}

// Run tests if this is the main module
runTests();