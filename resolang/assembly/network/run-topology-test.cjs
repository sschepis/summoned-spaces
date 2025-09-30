// Node.js runner for Network Topology tests
const fs = require('fs');
const loader = require('@assemblyscript/loader');
const path = require('path');

// Compile the AssemblyScript module
console.log('Compiling Network Topology test...');
const asc = require('assemblyscript/dist/asc.js');

const { error, stdout, stderr, stats } = asc.compileString(
  fs.readFileSync(path.join(__dirname, 'test-topology-simple.ts'), 'utf8'),
  {
    sourceMap: true,
    optimize: false,
    debug: true,
    runtime: 'incremental',
    exportRuntime: true,
    bindings: 'raw',
    outFile: 'test-topology-simple.wasm',
    textFile: 'test-topology-simple.wat',
    stats: true
  }
);

if (error) {
  console.error('Compilation failed:', error);
  console.error('stderr:', stderr.toString());
  process.exit(1);
}

console.log('Compilation successful!');
console.log('stdout:', stdout.toString());

// Write the compiled WASM
const wasmPath = path.join(__dirname, 'test-topology-simple.wasm');
fs.writeFileSync(wasmPath, new Uint8Array(stats.binary));

// Load and run the module
async function runTests() {
  try {
    const wasmBuffer = fs.readFileSync(wasmPath);
    
    // Create import object with minimal runtime
    const importObject = {
      env: {
        abort: (msg, file, line, column) => {
          console.error(`Abort called: ${msg} at ${file}:${line}:${column}`);
          process.exit(1);
        },
        trace: (msg, n, ...args) => {
          console.log(`trace: ${msg}`, ...args);
        },
        seed: () => {
          return Date.now();
        },
        memory: new WebAssembly.Memory({ initial: 1 })
      },
      console: {
        log: (msgPtr) => {
          // For now, just print a placeholder
          console.log('[WASM Log]');
        }
      }
    };

    // Instantiate the module
    const wasmModule = await WebAssembly.compile(wasmBuffer);
    const instance = await WebAssembly.instantiate(wasmModule, importObject);
    
    // Get exports
    const exports = instance.exports;
    
    // Override console.log to capture AssemblyScript output
    const originalLog = console.log;
    const logs = [];
    console.log = (...args) => {
      logs.push(args.join(' '));
      originalLog(...args);
    };
    
    // Run the tests
    console.log('\n=== Running Network Topology Tests ===\n');
    
    if (exports._start) {
      exports._start();
    } else if (exports.runTests) {
      exports.runTests();
    }
    
    // Restore console.log
    console.log = originalLog;
    
    // Check if all tests passed
    const allPassed = logs.some(log => log.includes('All Network Topology Tests Passed'));
    
    if (allPassed) {
      console.log('\n✅ All tests completed successfully!');
      
      // Clean up generated files
      fs.unlinkSync(wasmPath);
      const watPath = path.join(__dirname, 'test-topology-simple.wat');
      if (fs.existsSync(watPath)) {
        fs.unlinkSync(watPath);
      }
    } else {
      console.error('\n❌ Some tests failed!');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  }
}

// Run the tests
runTests().catch(console.error);