#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔷 Running Test Scenario Debug 🔷\n');

// Ensure we're in the correct directory
const assemblyDir = path.join(__dirname, '..');
process.chdir(assemblyDir);

// Compile the test file
console.log('📦 Compiling test-scenario-debug.ts...');
try {
  execSync('npx asc network/test-scenario-debug.ts --outFile network/test-scenario-debug.wasm --runtime stub --exportRuntime', {
    stdio: 'inherit'
  });
  console.log('✅ Compilation successful!\n');
} catch (error) {
  console.error('❌ Compilation failed:', error.message);
  process.exit(1);
}

// Run the WebAssembly module
console.log('🚀 Running test scenario debug...\n');
try {
  const wasmBuffer = fs.readFileSync(path.join(__dirname, 'test-scenario-debug.wasm'));
  
  // Create import object
  const importObject = {
    env: {
      abort: (msg, file, line, column) => {
        console.error(`Abort called at ${file}:${line}:${column} - ${msg}`);
      },
      'Date.now': () => Date.now()
    }
  };
  
  // Instantiate the module
  WebAssembly.instantiate(wasmBuffer, importObject).then(result => {
    const { runTest } = result.instance.exports;
    
    if (typeof runTest === 'function') {
      const testResult = runTest();
      console.log('Test result code:', testResult);
      
      const errorMessages = {
        1: 'Wrong number of scenarios (expected 5)',
        2: 'Identity verification scenario not found',
        3: 'Wrong scenario ID',
        4: 'Wrong number of steps in identity verification (expected 4)',
        5: 'Domain transfer scenario not found',
        6: 'Wrong number of steps in domain transfer (expected 5)',
        7: 'Permission escalation scenario not found',
        8: 'Wrong priority for permission escalation (expected 3)',
        9: 'Identity recovery scenario not found',
        10: 'Wrong number of steps in identity recovery (expected 4)',
        11: 'Load testing scenario not found',
        12: 'Wrong number of steps in load testing (expected 4)',
        13: 'Not enough identity-tagged scenarios',
        14: 'Not enough security-tagged scenarios',
        15: 'Wrong number of high priority scenarios (expected 3)',
        16: 'Wrong action type for first step',
        17: 'No expected result for first step',
        18: 'Domain parameter not found',
        19: 'Wrong domain parameter value',
        20: 'Empty summary',
        100: 'All tests passed!'
      };
      
      const message = errorMessages[testResult] || 'Unknown error';
      
      if (testResult === 100) {
        console.log('✅', message);
        console.log('\n✅ Phase 6: Test Scenario Configuration completed successfully!');
      } else {
        console.error('❌ Test failed:', message);
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