/**
 * Simplified test for Test Scenario Configuration (Phase 6)
 * Tests the creation and management of test scenarios without console output
 */

import { 
  TestStep,
  TestScenario,
  TestScenarioManager,
  TestActionType,
  createTestnetScenarios
} from "./test-scenarios";
import { createTestnetIdentities } from "./test-identities";
import { createTestnetDomainHierarchy } from "./domain-hierarchy-simple";

// Test scenario configuration
export function testScenarioConfiguration(): boolean {
  // Create dependencies
  const identityGenerator = createTestnetIdentities();
  const domainHierarchy = createTestnetDomainHierarchy("testnet-admin");
  
  // Create test scenarios
  const scenarioManager = createTestnetScenarios(identityGenerator, domainHierarchy);
  
  // Verify scenario creation
  const allScenarios = scenarioManager.scenarios.keys();
  if (allScenarios.length != 5) {
    return false; // Expected 5 scenarios
  }
  
  // Test identity verification scenario
  const identityVerification = scenarioManager.scenarios.get("identity-verification");
  if (!identityVerification) {
    return false;
  }
  
  // Verify scenario properties
  if (identityVerification.id != "identity-verification") {
    return false;
  }
  
  if (identityVerification.steps.length != 4) {
    return false; // Expected 4 steps
  }
  
  // Test domain transfer scenario
  const domainTransfer = scenarioManager.scenarios.get("domain-transfer");
  if (!domainTransfer) {
    return false;
  }
  
  if (domainTransfer.steps.length != 4) {
    return false; // Expected 4 steps
  }
  
  // Test permission escalation scenario
  const permissionEscalation = scenarioManager.scenarios.get("permission-escalation");
  if (!permissionEscalation) {
    return false;
  }
  
  if (permissionEscalation.priority != 3) {
    return false; // Expected high priority
  }
  
  // Test identity recovery scenario
  const identityRecovery = scenarioManager.scenarios.get("identity-recovery");
  if (!identityRecovery) {
    return false;
  }
  
  if (identityRecovery.steps.length != 4) {
    return false; // Expected 4 steps
  }
  
  // Test load testing scenario
  const loadTesting = scenarioManager.scenarios.get("load-testing");
  if (!loadTesting) {
    return false;
  }
  
  if (loadTesting.steps.length != 4) {
    return false; // Expected 4 steps
  }
  
  // Test scenarios by tag
  const identityScenarios = scenarioManager.getScenariosByTag("identity");
  if (identityScenarios.length < 2) {
    return false; // Should have at least 2 identity-related scenarios
  }
  
  const securityScenarios = scenarioManager.getScenariosByTag("security");
  if (securityScenarios.length < 2) {
    return false; // Should have at least 2 security-related scenarios
  }
  
  // Test scenarios by priority (priority >= 3)
  const highPriority = scenarioManager.getScenariosByPriority(3);
  if (highPriority.length != 3) {
    return false; // Expected 3 high priority scenarios
  }
  
  // Test step properties
  const firstStep = identityVerification.steps[0];
  if (firstStep.action != TestActionType.UPGRADE_KYC) {
    return false;
  }
  
  if (firstStep.expectedResult.length == 0) {
    return false; // Should have expected result
  }
  
  // Test parameter access
  const transferStep = domainTransfer.steps[0];
  const domain = transferStep.getParam("domain");
  if (!domain || domain != "project1.alice.dev") {
    return false;
  }
  
  // Test scenario summary
  const summary = scenarioManager.getSummary();
  if (summary.length == 0) {
    return false;
  }
  
  // All tests passed
  return true;
}

// Export a simple test function
export function runTest(): i32 {
  const result = testScenarioConfiguration();
  return result ? 1 : 0;
}