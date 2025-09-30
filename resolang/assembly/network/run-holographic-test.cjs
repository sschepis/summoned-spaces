#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔷 Running Holographic Layer Test (Phase 7) 🔷\n');

// Ensure we're in the correct directory
const assemblyDir = path.join(__dirname, '..');
process.chdir(assemblyDir);

// Compile the test file
console.log('📦 Compiling test-holographic-simple.ts...');
try {
  execSync('npx asc network/test-holographic-simple.ts --outFile network/test-holographic-simple.wasm --runtime stub --exportRuntime', {
    stdio: 'inherit'
  });
  console.log('✅ Compilation successful!\n');
} catch (error) {
  console.error('❌ Compilation failed:', error.message);
  process.exit(1);
}

// Run the WebAssembly module
console.log('🚀 Running holographic layer test...\n');
try {
  const wasmBuffer = fs.readFileSync(path.join(__dirname, 'test-holographic-simple.wasm'));
  
  // Create import object
  const importObject = {
    env: {
      abort: (msg, file, line, column) => {
        console.error(`Abort called at ${file}:${line}:${column} - ${msg}`);
      }
    }
  };
  
  // Instantiate the module
  WebAssembly.instantiate(wasmBuffer, importObject).then(result => {
    const { runTest } = result.instance.exports;
    
    if (typeof runTest === 'function') {
      const testResult = runTest();
      
      if (testResult === 1) {
        console.log('✅ All holographic layer tests passed!');
        console.log('\n=== Holographic Layer Summary ===');
        console.log('✓ Created 5 holographic fragments:');
        console.log('  - Identity Constellation (Identity Map)');
        console.log('  - Domain Hierarchy (Domain Tree)');
        console.log('  - Permission Matrix (Permission Graph)');
        console.log('  - Resonance Field (Resonance Field)');
        console.log('  - Validator Network (Validator Network)');
        console.log('\n✓ Created 5 quantum entanglements:');
        console.log('  - identity-domain (strength: 0.9)');
        console.log('  - domain-permission (strength: 0.8)');
        console.log('  - identity-permission (strength: 0.85)');
        console.log('  - validator-resonance (strength: 0.95)');
        console.log('  - full-coherence (strength: 0.7, connects all fragments)');
        console.log('\n✓ Resonance frequencies calculated');
        console.log('✓ Coherence values updated');
        console.log('✓ Dynamic fragment and entanglement creation working');
        console.log('\n✅ Phase 7: Holographic Layer Initialization completed successfully!');
      } else {
        console.error('❌ Holographic layer tests failed!');
        process.exit(1);
      }
    } else {
      console.error('❌ runTest function not found in exports');
      process.exit(1);
    }
  }).catch(error => {
    console.error('❌ Execution failed:', error);
    process.exit(1);
  });
} catch (error) {
  console.error('❌ Failed to run WebAssembly:', error.message);
  process.exit(1);
}