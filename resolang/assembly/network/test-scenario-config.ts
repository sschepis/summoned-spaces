/**
 * Test suite for Test Scenario Configuration (Phase 6)
 * Tests the creation and management of test scenarios for the ResonNet testnet
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

// Simple logging function
function log(message: string): void {
  console.log(message);
}

// Test scenario configuration
export function testScenarioConfiguration(): void {
  log("\n🔷 Testing Scenario Configuration (Phase 6) 🔷");
  
  // Create dependencies
  const identityGenerator = createTestnetIdentities();
  const domainHierarchy = createTestnetDomainHierarchy("testnet-admin");
  
  // Create test scenarios
  const scenarioManager = createTestnetScenarios(identityGenerator, domainHierarchy);
  
  log("\n✓ Created test scenario manager with dependencies");
  
  // Test scenario creation
  log("\n=== Test Scenarios Created ===");
  const allScenarios = scenarioManager.scenarios.keys();
  log("Total scenarios: " + allScenarios.length.toString());
  
  for (let i = 0; i < allScenarios.length; i++) {
    const scenario = scenarioManager.scenarios.get(allScenarios[i])!;
    log("\n" + scenario.name);
    log("  ID: " + scenario.id);
    log("  Description: " + scenario.description);
    log("  Priority: " + scenario.priority.toString());
    log("  Steps: " + scenario.steps.length.toString());
    log("  Tags: " + scenario.tags.length.toString() + " tags");
  }
  
  // Test identity verification scenario
  log("\n=== Identity Verification Scenario ===");
  const identityVerification = scenarioManager.scenarios.get("identity-verification");
  if (identityVerification) {
    log("Scenario: " + identityVerification.name);
    log("Steps:");
    for (let i = 0; i < identityVerification.steps.length; i++) {
      const step = identityVerification.steps[i];
      log("  Step " + (i + 1).toString() + ": " + getActionName(step.action));
      const identityId = step.identityId;
      if (identityId) {
        log("    Identity: " + identityId);
      }
      log("    Expected: " + step.expectedResult);
    }
  }
  
  // Test domain transfer scenario
  log("\n=== Domain Transfer Scenario ===");
  const domainTransfer = scenarioManager.scenarios.get("domain-transfer");
  if (domainTransfer) {
    log("Scenario: " + domainTransfer.name);
    log("Steps:");
    for (let i = 0; i < domainTransfer.steps.length; i++) {
      const step = domainTransfer.steps[i];
      log("  Step " + (i + 1).toString() + ": " + getActionName(step.action));
      const domain = step.getParam("domain");
      if (domain) {
        log("    Domain: " + domain);
      }
      log("    Expected: " + step.expectedResult);
    }
  }
  
  // Test scenarios by tag
  log("\n=== Scenarios by Tag ===");
  const tags = ["identity", "permissions", "security", "performance"];
  for (let i = 0; i < tags.length; i++) {
    const taggedScenarios = scenarioManager.getScenariosByTag(tags[i]);
    log(tags[i] + ": " + taggedScenarios.length.toString() + " scenarios");
  }
  
  // Test scenarios by priority
  log("\n=== High Priority Scenarios ===");
  const highPriority = scenarioManager.getScenariosByPriority(3);
  for (let i = 0; i < highPriority.length; i++) {
    const scenario = highPriority[i];
    log("- " + scenario.name + " (Priority: " + scenario.priority.toString() + ")");
  }
  
  // Test load testing scenario details
  log("\n=== Load Testing Scenario ===");
  const loadTesting = scenarioManager.scenarios.get("load-testing");
  if (loadTesting) {
    log("Scenario: " + loadTesting.name);
    for (let i = 0; i < loadTesting.steps.length; i++) {
      const step = loadTesting.steps[i];
      log("\nStep " + (i + 1).toString() + ": " + getActionName(step.action));
      
      // Show parameters
      const paramKeys = step.params.keys();
      if (paramKeys.length > 0) {
        log("  Parameters:");
        for (let j = 0; j < paramKeys.length; j++) {
          const key = paramKeys[j];
          const value = step.params.get(key);
          log("    " + key + ": " + value);
        }
      }
    }
  }
  
  // Test scenario summary
  log("\n=== Scenario Summary ===");
  log(scenarioManager.getSummary());
  
  // Verify scenario integrity
  log("\n=== Scenario Integrity Check ===");
  let allValid = true;
  
  for (let i = 0; i < allScenarios.length; i++) {
    const scenario = scenarioManager.scenarios.get(allScenarios[i])!;
    
    // Check each scenario has steps
    if (scenario.steps.length == 0) {
      log("❌ " + scenario.name + " has no steps!");
      allValid = false;
    }
    
    // Check each step has expected result
    for (let j = 0; j < scenario.steps.length; j++) {
      const step = scenario.steps[j];
      if (step.expectedResult.length == 0) {
        log("❌ " + scenario.name + " step " + (j + 1).toString() + " has no expected result!");
        allValid = false;
      }
    }
  }
  
  if (allValid) {
    log("✓ All scenarios have valid structure");
  }
  
  log("\n✅ Test Scenario Configuration completed successfully!");
}

// Helper function to get action name
function getActionName(action: TestActionType): string {
  if (action == TestActionType.UPGRADE_KYC) return "Upgrade KYC";
  if (action == TestActionType.VERIFY_PERMISSIONS) return "Verify Permissions";
  if (action == TestActionType.CHECK_AUDIT_TRAIL) return "Check Audit Trail";
  if (action == TestActionType.TRANSFER_DOMAIN) return "Transfer Domain";
  if (action == TestActionType.CREATE_SUBDOMAIN) return "Create Subdomain";
  if (action == TestActionType.ASSIGN_ROLE) return "Assign Role";
  if (action == TestActionType.REMOVE_ROLE) return "Remove Role";
  if (action == TestActionType.RECOVER_IDENTITY) return "Recover Identity";
  if (action == TestActionType.CREATE_IDENTITY) return "Create Identity";
  if (action == TestActionType.EXECUTE_TRANSACTION) return "Execute Transaction";
  return "Unknown Action";
}

// Run the test
testScenarioConfiguration();