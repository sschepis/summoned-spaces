#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔷 Running Test Scenario Configuration Test 🔷\n');

// Ensure we're in the correct directory
const assemblyDir = path.join(__dirname, '..');
process.chdir(assemblyDir);

// Compile the test file
console.log('📦 Compiling test-scenario-config.ts...');
try {
  execSync('npx asc network/test-scenario-config.ts --outFile network/test-scenario-config.wasm --runtime stub', {
    stdio: 'inherit'
  });
  console.log('✅ Compilation successful!\n');
} catch (error) {
  console.error('❌ Compilation failed:', error.message);
  process.exit(1);
}

// Run the WebAssembly module
console.log('🚀 Running test scenario configuration...\n');
try {
  const wasmBuffer = fs.readFileSync(path.join(__dirname, 'test-scenario-config.wasm'));
  
  // Create import object with console support
  const importObject = {
    env: {
      abort: (msg, file, line, column) => {
        console.error(`Abort called at ${file}:${line}:${column} - ${msg}`);
      },
      'console.log': (msgPtr) => {
        // For now, just log a placeholder
        console.log('[WASM Log]');
      }
    }
  };
  
  // Instantiate the module
  WebAssembly.instantiate(wasmBuffer, importObject).then(result => {
    console.log('✅ Test scenario configuration executed successfully!');
  }).catch(error => {
    console.error('❌ Execution failed:', error);
  });
} catch (error) {
  console.error('❌ Failed to run WebAssembly:', error.message);
  process.exit(1);
}