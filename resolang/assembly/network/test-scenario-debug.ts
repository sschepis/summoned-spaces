/**
 * Debug test for Test Scenario Configuration (Phase 6)
 * Returns specific error codes to identify which test is failing
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

// Test scenario configuration with detailed error codes
export function testScenarioConfiguration(): i32 {
  // Create dependencies
  const identityGenerator = createTestnetIdentities();
  const domainHierarchy = createTestnetDomainHierarchy("testnet-admin");
  
  // Create test scenarios
  const scenarioManager = createTestnetScenarios(identityGenerator, domainHierarchy);
  
  // Test 1: Verify scenario creation
  const allScenarios = scenarioManager.scenarios.keys();
  if (allScenarios.length != 5) {
    return 1; // Error: Wrong number of scenarios
  }
  
  // Test 2: Test identity verification scenario exists
  const identityVerification = scenarioManager.scenarios.get("identity-verification");
  if (!identityVerification) {
    return 2; // Error: Identity verification scenario not found
  }
  
  // Test 3: Verify scenario ID
  if (identityVerification.id != "identity-verification") {
    return 3; // Error: Wrong scenario ID
  }
  
  // Test 4: Verify step count
  if (identityVerification.steps.length != 4) {
    return 4; // Error: Wrong number of steps in identity verification
  }
  
  // Test 5: Test domain transfer scenario
  const domainTransfer = scenarioManager.scenarios.get("domain-transfer");
  if (!domainTransfer) {
    return 5; // Error: Domain transfer scenario not found
  }
  
  // Test 6: Verify domain transfer steps
  if (domainTransfer.steps.length != 4) {
    return 6; // Error: Wrong number of steps in domain transfer
  }
  
  // Test 7: Test permission escalation scenario
  const permissionEscalation = scenarioManager.scenarios.get("permission-escalation");
  if (!permissionEscalation) {
    return 7; // Error: Permission escalation scenario not found
  }
  
  // Test 8: Verify priority
  if (permissionEscalation.priority != 3) {
    return 8; // Error: Wrong priority for permission escalation
  }
  
  // Test 9: Test identity recovery scenario
  const identityRecovery = scenarioManager.scenarios.get("identity-recovery");
  if (!identityRecovery) {
    return 9; // Error: Identity recovery scenario not found
  }
  
  // Test 10: Verify recovery steps
  if (identityRecovery.steps.length != 4) {
    return 10; // Error: Wrong number of steps in identity recovery
  }
  
  // Test 11: Test load testing scenario
  const loadTesting = scenarioManager.scenarios.get("load-testing");
  if (!loadTesting) {
    return 11; // Error: Load testing scenario not found
  }
  
  // Test 12: Verify load testing steps
  if (loadTesting.steps.length != 4) {
    return 12; // Error: Wrong number of steps in load testing
  }
  
  // Test 13: Test scenarios by tag
  const identityScenarios = scenarioManager.getScenariosByTag("identity");
  if (identityScenarios.length < 2) {
    return 13; // Error: Not enough identity-tagged scenarios
  }
  
  // Test 14: Test security scenarios
  const securityScenarios = scenarioManager.getScenariosByTag("security");
  if (securityScenarios.length < 2) {
    return 14; // Error: Not enough security-tagged scenarios
  }
  
  // Test 15: Test high priority scenarios (priority >= 3)
  const highPriority = scenarioManager.getScenariosByPriority(3);
  if (highPriority.length != 3) {
    return 15; // Error: Wrong number of high priority scenarios
  }
  
  // Test 16: Test first step action
  const firstStep = identityVerification.steps[0];
  if (firstStep.action != TestActionType.UPGRADE_KYC) {
    return 16; // Error: Wrong action type for first step
  }
  
  // Test 17: Test expected result exists
  if (firstStep.expectedResult.length == 0) {
    return 17; // Error: No expected result for first step
  }
  
  // Test 18: Test parameter access
  const transferStep = domainTransfer.steps[0];
  const domain = transferStep.getParam("domain");
  if (!domain) {
    return 18; // Error: Domain parameter not found
  }
  
  // Test 19: Verify domain parameter value
  if (domain != "project1.alice.dev") {
    return 19; // Error: Wrong domain parameter value
  }
  
  // Test 20: Test scenario summary
  const summary = scenarioManager.getSummary();
  if (summary.length == 0) {
    return 20; // Error: Empty summary
  }
  
  // All tests passed
  return 100; // Success code
}

// Export the test function
export function runTest(): i32 {
  return testScenarioConfiguration();
}