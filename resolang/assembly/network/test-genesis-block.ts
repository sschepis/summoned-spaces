// Test for Genesis Block Creation
// Tests the genesis block structure and validation

import {
  GenesisHeader,
  StateRoot,
  NetworkConfiguration,
  GenesisData,
  GenesisBlock,
  calculateMerkleRoot,
  createTestnetGenesisBlock
} from "./genesis-block";

function testGenesisHeader(): void {
  console.log("Testing GenesisHeader...");
  
  const header = new GenesisHeader(
    "1.0.0",
    "test-network",
    1234567890,
    "previous-hash",
    "merkle-root"
  );
  
  assert(header.version == "1.0.0", "Version should match");
  assert(header.networkId == "test-network", "Network ID should match");
  assert(header.timestamp == 1234567890, "Timestamp should match");
  assert(header.previousHash == "previous-hash", "Previous hash should match");
  assert(header.merkleRoot == "merkle-root", "Merkle root should match");
  
  // Test validator signature
  header.addValidatorSignature("validator-1", "signature-1");
  assert(header.validatorSignatures.has("validator-1"), "Should have validator signature");
  assert(header.validatorSignatures.get("validator-1") == "signature-1", "Signature should match");
  
  // Test hash generation
  const hash = header.getHash();
  assert(hash.startsWith("genesis-hash-"), "Hash should have correct prefix");
  
  console.log("✓ GenesisHeader tests passed");
}

function testStateRoot(): void {
  console.log("Testing StateRoot...");
  
  const stateRoot = new StateRoot(
    "identity-root",
    "domain-root",
    "permission-root",
    "resonance-root",
    "holographic-root"
  );
  
  assert(stateRoot.identityMerkleRoot == "identity-root", "Identity root should match");
  assert(stateRoot.domainMerkleRoot == "domain-root", "Domain root should match");
  assert(stateRoot.permissionMerkleRoot == "permission-root", "Permission root should match");
  assert(stateRoot.resonanceMerkleRoot == "resonance-root", "Resonance root should match");
  assert(stateRoot.holographicMerkleRoot == "holographic-root", "Holographic root should match");
  
  const combinedRoot = stateRoot.calculateCombinedRoot();
  assert(combinedRoot.startsWith("state-root-"), "Combined root should have correct prefix");
  
  console.log("✓ StateRoot tests passed");
}

function testNetworkConfiguration(): void {
  console.log("Testing NetworkConfiguration...");
  
  const config = new NetworkConfiguration(
    0.67,    // consensus threshold
    5000,    // block time
    100,     // max validators
    1000000, // min stake
    2880,    // epoch duration
    0.95,    // quantum field strength
    1.618    // resonance amplification
  );
  
  assert(config.consensusThreshold == 0.67, "Consensus threshold should match");
  assert(config.blockTime == 5000, "Block time should match");
  assert(config.maxValidators == 100, "Max validators should match");
  assert(config.minStake == 1000000, "Min stake should match");
  assert(config.epochDuration == 2880, "Epoch duration should match");
  assert(config.quantumFieldStrength == 0.95, "Quantum field strength should match");
  assert(config.resonanceAmplification == 1.618, "Resonance amplification should match");
  
  console.log("✓ NetworkConfiguration tests passed");
}

function testGenesisData(): void {
  console.log("Testing GenesisData...");
  
  const data = new GenesisData();
  
  // Test adding identities
  data.addIdentity("identity-1");
  data.addIdentity("identity-2");
  assert(data.identities.length == 2, "Should have 2 identities");
  assert(data.identities[0] == "identity-1", "First identity should match");
  
  // Test adding domains
  data.addDomain("domain-1");
  assert(data.domains.length == 1, "Should have 1 domain");
  assert(data.domains[0] == "domain-1", "Domain should match");
  
  // Test adding validators
  data.addValidator("validator-1");
  data.addValidator("validator-2");
  data.addValidator("validator-3");
  assert(data.validators.length == 3, "Should have 3 validators");
  
  // Test adding prime anchors
  data.addPrimeAnchor("Alpha", 2);
  data.addPrimeAnchor("Beta", 3);
  assert(data.primeAnchors.has("Alpha"), "Should have Alpha anchor");
  assert(data.primeAnchors.get("Alpha") == 2, "Alpha value should be 2");
  
  // Test adding quantum entanglements
  data.addQuantumEntanglement("entangle-1");
  assert(data.quantumEntanglements.length == 1, "Should have 1 entanglement");
  
  console.log("✓ GenesisData tests passed");
}

function testGenesisBlock(): void {
  console.log("Testing GenesisBlock...");
  
  const header = new GenesisHeader(
    "1.0.0",
    "test-net",
    1234567890,
    "0000000000000000",
    "test-merkle"
  );
  
  const stateRoot = new StateRoot(
    "id-root",
    "dom-root",
    "perm-root",
    "res-root",
    "holo-root"
  );
  
  const config = new NetworkConfiguration(
    0.67, 5000, 100, 1000000, 2880, 0.95, 1.618
  );
  
  const data = new GenesisData();
  data.addValidator("validator-1");
  
  const genesis = new GenesisBlock(header, stateRoot, config, data);
  
  // Test validation
  assert(genesis.validate(), "Genesis block should be valid");
  
  // Test holographic checksum
  assert(genesis.holographicChecksum.startsWith("holographic-"), "Checksum should have correct prefix");
  
  // Test serialization
  const serialized = genesis.serialize();
  assert(serialized.includes('"version": "1.0.0"'), "Serialized should contain version");
  assert(serialized.includes('"networkId": "test-net"'), "Serialized should contain network ID");
  assert(serialized.includes('"consensusThreshold": 0.67'), "Serialized should contain consensus threshold");
  
  console.log("✓ GenesisBlock tests passed");
}

function testGenesisBlockValidation(): void {
  console.log("Testing GenesisBlock validation...");
  
  // Test invalid genesis block (empty version)
  const header1 = new GenesisHeader("", "test", 123, "prev", "merkle");
  const stateRoot = new StateRoot("a", "b", "c", "d", "e");
  const config = new NetworkConfiguration(0.67, 5000, 100, 1000000, 2880, 0.95, 1.618);
  const data1 = new GenesisData();
  data1.addValidator("val-1");
  
  const genesis1 = new GenesisBlock(header1, stateRoot, config, data1);
  assert(!genesis1.validate(), "Genesis with empty version should be invalid");
  
  // Test invalid genesis block (no validators)
  const header2 = new GenesisHeader("1.0", "test", 123, "prev", "merkle");
  const data2 = new GenesisData();
  
  const genesis2 = new GenesisBlock(header2, stateRoot, config, data2);
  assert(!genesis2.validate(), "Genesis with no validators should be invalid");
  
  // Test invalid genesis block (bad consensus threshold)
  const config2 = new NetworkConfiguration(1.5, 5000, 100, 1000000, 2880, 0.95, 1.618);
  const data3 = new GenesisData();
  data3.addValidator("val-1");
  
  const genesis3 = new GenesisBlock(header2, stateRoot, config2, data3);
  assert(!genesis3.validate(), "Genesis with invalid consensus threshold should be invalid");
  
  console.log("✓ GenesisBlock validation tests passed");
}

function testMerkleRoot(): void {
  console.log("Testing merkle root calculation...");
  
  // Test empty array
  const emptyRoot = calculateMerkleRoot([]);
  assert(emptyRoot == "empty-root", "Empty array should return empty-root");
  
  // Test single element
  const singleRoot = calculateMerkleRoot(["hash1"]);
  assert(singleRoot == "hash1", "Single element should return itself");
  
  // Test multiple elements
  const multiRoot = calculateMerkleRoot(["hash1", "hash2", "hash3"]);
  assert(multiRoot.startsWith("merkle-"), "Multiple elements should return merkle- prefix");
  
  console.log("✓ Merkle root calculation tests passed");
}

function testTestnetGenesisBlock(): void {
  console.log("Testing testnet genesis block creation...");
  
  const genesis = createTestnetGenesisBlock();
  
  // Validate the genesis block
  assert(genesis.validate(), "Testnet genesis block should be valid");
  
  // Check header
  assert(genesis.header.version == "1.0.0-testnet", "Version should be testnet version");
  assert(genesis.header.networkId == "resonet-testnet-alpha", "Network ID should be testnet alpha");
  assert(genesis.header.timestamp == 1736668800000, "Timestamp should match expected value");
  assert(genesis.header.validatorSignatures.size == 3, "Should have 3 validator signatures");
  
  // Check configuration
  assert(genesis.configuration.consensusThreshold == 0.67, "Consensus threshold should be 67%");
  assert(genesis.configuration.blockTime == 5000, "Block time should be 5 seconds");
  assert(genesis.configuration.maxValidators == 100, "Max validators should be 100");
  assert(genesis.configuration.quantumFieldStrength == 0.95, "Quantum field strength should be 0.95");
  assert(genesis.configuration.resonanceAmplification == 1.618, "Resonance should be golden ratio");
  
  // Check data
  assert(genesis.data.identities.length == 6, "Should have 6 identities");
  assert(genesis.data.domains.length == 4, "Should have 4 domains");
  assert(genesis.data.validators.length == 5, "Should have 5 validators");
  assert(genesis.data.primeAnchors.size == 8, "Should have 8 prime anchors");
  assert(genesis.data.quantumEntanglements.length == 5, "Should have 5 entanglements");
  
  // Check specific data
  assert(genesis.data.primeAnchors.get("Alpha") == 2, "Alpha prime should be 2");
  assert(genesis.data.primeAnchors.get("Theta") == 19, "Theta prime should be 19");
  assert(genesis.data.domains[0] == "resonet", "First domain should be resonet");
  
  console.log("✓ Testnet genesis block tests passed");
  console.log("\nGenesis Block Summary:");
  console.log("- Network: " + genesis.header.networkId);
  console.log("- Version: " + genesis.header.version);
  console.log("- Identities: " + genesis.data.identities.length.toString());
  console.log("- Validators: " + genesis.data.validators.length.toString());
  console.log("- Prime Anchors: " + genesis.data.primeAnchors.size.toString());
  console.log("- Holographic Checksum: " + genesis.holographicChecksum);
}

// Run all tests
export function runTests(): void {
  console.log("=== Genesis Block Tests ===\n");
  
  testGenesisHeader();
  testStateRoot();
  testNetworkConfiguration();
  testGenesisData();
  testGenesisBlock();
  testGenesisBlockValidation();
  testMerkleRoot();
  testTestnetGenesisBlock();
  
  console.log("\n=== All Genesis Block Tests Passed! ===");
}

// Run tests if this is the main module
runTests();