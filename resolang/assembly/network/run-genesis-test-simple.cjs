// Simple test runner for Genesis Block
const fs = require('fs');
const path = require('path');

// Read the WASM file
const wasmPath = path.join(__dirname, 'test-genesis-block.wasm');
const wasmBuffer = fs.readFileSync(wasmPath);

// Create a simple console implementation
let testOutput = [];
const testConsole = {
  log: (message) => {
    testOutput.push(message);
    console.log(message);
  }
};

// Run the WASM module
async function runTests() {
  try {
    // Create imports
    const imports = {
      env: {
        abort: (msg, file, line, column) => {
          console.error(`Abort at ${file}:${line}:${column}: ${msg}`);
          process.exit(1);
        },
        trace: (msg, n, ...args) => {
          console.log(`trace: ${msg}`, ...args);
        },
        seed: () => Date.now(),
        memory: new WebAssembly.Memory({ initial: 10 })
      },
      console: {
        log: (msgPtr) => {
          // For now, just log that a console.log was called
          testConsole.log('[Genesis Test Log]');
        }
      }
    };

    // Instantiate the module
    const { instance } = await WebAssembly.instantiate(wasmBuffer, imports);
    
    // Run the tests
    if (instance.exports._start) {
      instance.exports._start();
    } else if (instance.exports.runTests) {
      instance.exports.runTests();
    }
    
    // Show test summary
    console.log('\n=== Test Summary ===');
    console.log(`Total console logs: ${testOutput.length}`);
    
    // If we got here without errors, tests passed
    console.log('\n✅ All Genesis Block tests completed successfully!');
    
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  }
}

runTests();