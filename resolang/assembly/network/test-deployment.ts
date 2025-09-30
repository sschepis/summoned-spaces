// Test for Deployment and Activation
// Tests the final phase of testnet genesis hologram deployment

import {
  DeploymentCheckResult,
  NodeInitializationStatus,
  NetworkActivationStatus,
  TestnetDeployment,
  deployTestnet
} from "./deployment-activation";

function testDeploymentCheckResult(): void {
  console.log("Testing DeploymentCheckResult...");
  
  const check = new DeploymentCheckResult(
    "Test Check",
    true,
    "Check passed successfully"
  );
  
  assert(check.checkName == "Test Check", "Check name should match");
  assert(check.passed == true, "Check should pass");
  assert(check.message == "Check passed successfully", "Message should match");
  assert(check.timestamp > 0, "Timestamp should be set");
  
  console.log("✓ DeploymentCheckResult tests passed");
}

function testNodeInitializationStatus(): void {
  console.log("Testing NodeInitializationStatus...");
  
  const status = new NodeInitializationStatus("test-node-1");
  
  assert(status.nodeId == "test-node-1", "Node ID should match");
  assert(status.initialized == false, "Should start uninitialized");
  assert(status.quantumFieldActive == false, "Quantum field should start inactive");
  assert(status.connectionsEstablished == 0, "Should start with no connections");
  assert(status.syncStatus == "pending", "Sync status should be pending");
  
  // Update status
  status.initialized = true;
  status.quantumFieldActive = true;
  status.connectionsEstablished = 3;
  status.syncStatus = "syncing";
  
  assert(status.initialized == true, "Should be initialized");
  assert(status.quantumFieldActive == true, "Quantum field should be active");
  assert(status.connectionsEstablished == 3, "Should have 3 connections");
  assert(status.syncStatus == "syncing", "Should be syncing");
  
  console.log("✓ NodeInitializationStatus tests passed");
}

function testNetworkActivationStatus(): void {
  console.log("Testing NetworkActivationStatus...");
  
  const status = new NetworkActivationStatus();
  
  assert(status.consensusStarted == false, "Consensus should not be started");
  assert(status.transactionsEnabled == false, "Transactions should be disabled");
  assert(status.publicAccessOpen == false, "Public access should be closed");
  assert(status.apiEndpointsActive == false, "API endpoints should be inactive");
  assert(status.activationTimestamp == 0, "Activation timestamp should be 0");
  
  // Update status
  status.consensusStarted = true;
  status.transactionsEnabled = true;
  status.publicAccessOpen = true;
  status.apiEndpointsActive = true;
  status.activationTimestamp = 1234567890;
  
  assert(status.consensusStarted == true, "Consensus should be started");
  assert(status.transactionsEnabled == true, "Transactions should be enabled");
  assert(status.publicAccessOpen == true, "Public access should be open");
  assert(status.apiEndpointsActive == true, "API endpoints should be active");
  assert(status.activationTimestamp == 1234567890, "Activation timestamp should match");
  
  console.log("✓ NetworkActivationStatus tests passed");
}

function testTestnetDeployment(): void {
  console.log("Testing TestnetDeployment...");
  
  const deployment = new TestnetDeployment();
  
  // Check initial state
  assert(deployment.genesisBlock != null, "Should have genesis block");
  assert(deployment.networkTopology != null, "Should have network topology");
  assert(deployment.quantumField != null, "Should have quantum field");
  assert(deployment.holographicLayer != null, "Should have holographic layer");
  assert(deployment.deploymentChecks.size == 0, "Should start with no checks");
  assert(deployment.nodeStatuses.size == 0, "Should start with no node statuses");
  
  console.log("✓ TestnetDeployment initialization tests passed");
}

function testPreDeploymentChecks(): void {
  console.log("Testing pre-deployment checks...");
  
  const deployment = new TestnetDeployment();
  const checksPass = deployment.runPreDeploymentChecks();
  
  assert(checksPass == true, "Pre-deployment checks should pass");
  assert(deployment.deploymentChecks.size == 5, "Should have 5 deployment checks");
  
  // Check individual checks
  const genesisCheck = deployment.deploymentChecks.get("genesis-validation");
  assert(genesisCheck != null, "Should have genesis validation check");
  assert(genesisCheck!.passed == true, "Genesis validation should pass");
  
  const quantumCheck = deployment.deploymentChecks.get("quantum-operations");
  assert(quantumCheck != null, "Should have quantum operations check");
  assert(quantumCheck!.passed == true, "Quantum operations should pass");
  
  const connectivityCheck = deployment.deploymentChecks.get("node-connectivity");
  assert(connectivityCheck != null, "Should have node connectivity check");
  assert(connectivityCheck!.passed == true, "Node connectivity should pass");
  
  const holographicCheck = deployment.deploymentChecks.get("holographic-validation");
  assert(holographicCheck != null, "Should have holographic validation check");
  assert(holographicCheck!.passed == true, "Holographic validation should pass");
  
  const securityCheck = deployment.deploymentChecks.get("security-audit");
  assert(securityCheck != null, "Should have security audit check");
  assert(securityCheck!.passed == true, "Security audit should pass");
  
  console.log("✓ Pre-deployment checks tests passed");
}

function testNodeInitialization(): void {
  console.log("Testing node initialization...");
  
  const deployment = new TestnetDeployment();
  
  // Run pre-deployment checks first
  deployment.runPreDeploymentChecks();
  
  // Initialize nodes
  const nodesInitialized = deployment.initializeNodes();
  
  assert(nodesInitialized == true, "Nodes should initialize successfully");
  assert(deployment.nodeStatuses.size == 7, "Should have 7 node statuses");
  
  // Check a specific node
  const primaryNode1 = deployment.nodeStatuses.get("node-primary-1");
  assert(primaryNode1 != null, "Should have primary node 1 status");
  assert(primaryNode1!.initialized == true, "Primary node 1 should be initialized");
  assert(primaryNode1!.quantumFieldActive == true, "Primary node 1 quantum field should be active");
  assert(primaryNode1!.connectionsEstablished > 0, "Primary node 1 should have connections");
  
  console.log("✓ Node initialization tests passed");
}

function testNetworkActivation(): void {
  console.log("Testing network activation...");
  
  const deployment = new TestnetDeployment();
  
  // Run pre-deployment checks and initialize nodes first
  deployment.runPreDeploymentChecks();
  deployment.initializeNodes();
  
  // Activate network
  const networkActivated = deployment.activateNetwork();
  
  assert(networkActivated == true, "Network should activate successfully");
  assert(deployment.activationStatus.consensusStarted == true, "Consensus should be started");
  assert(deployment.activationStatus.transactionsEnabled == true, "Transactions should be enabled");
  assert(deployment.activationStatus.apiEndpointsActive == true, "API endpoints should be active");
  assert(deployment.activationStatus.publicAccessOpen == true, "Public access should be open");
  assert(deployment.activationStatus.activationTimestamp > 0, "Activation timestamp should be set");
  
  console.log("✓ Network activation tests passed");
}

function testDeploymentReport(): void {
  console.log("Testing deployment report generation...");
  
  const deployment = new TestnetDeployment();
  
  // Run full deployment
  deployment.runPreDeploymentChecks();
  deployment.initializeNodes();
  deployment.activateNetwork();
  
  // Generate report
  const report = deployment.generateDeploymentReport();
  
  assert(report.includes("ResonNet Testnet Deployment Report"), "Report should have title");
  assert(report.includes("Pre-deployment Checks:"), "Report should have checks section");
  assert(report.includes("Node Initialization:"), "Report should have node section");
  assert(report.includes("Network Activation:"), "Report should have activation section");
  assert(report.includes("Genesis Block:"), "Report should have genesis block section");
  assert(report.includes("✓ PASSED"), "Report should show passed checks");
  assert(report.includes("resonet-testnet-alpha"), "Report should include network ID");
  
  console.log("✓ Deployment report tests passed");
}

function testFullDeployment(): void {
  console.log("Testing full testnet deployment...");
  
  const success = deployTestnet();
  
  assert(success == true, "Full deployment should succeed");
  
  console.log("✓ Full deployment test passed");
}

// Run all tests
export function runTests(): void {
  console.log("=== Deployment and Activation Tests ===\n");
  
  testDeploymentCheckResult();
  testNodeInitializationStatus();
  testNetworkActivationStatus();
  testTestnetDeployment();
  testPreDeploymentChecks();
  testNodeInitialization();
  testNetworkActivation();
  testDeploymentReport();
  testFullDeployment();
  
  console.log("\n=== All Deployment and Activation Tests Passed! ===");
  console.log("\n🎉 ResonNet Testnet Genesis Hologram Complete! 🎉");
  console.log("All 10 phases have been successfully implemented and tested.");
}

// Run tests if this is the main module
runTests();