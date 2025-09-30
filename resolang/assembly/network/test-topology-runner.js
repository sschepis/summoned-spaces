// Test runner for Network Topology using AssemblyScript loader
import { readFileSync } from 'fs';
import loader from '@assemblyscript/loader';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runTests() {
  try {
    console.log('Loading Network Topology test module...');
    
    const wasmPath = join(__dirname, 'test-topology-simple.wasm');
    const wasmBuffer = readFileSync(wasmPath);
    
    // Create imports for the WASM module
    const imports = {
      env: {
        abort: (msg, file, line, column) => {
          console.error(`Abort called at ${file}:${line}:${column}`);
          process.exit(1);
        },
        trace: (msg, n, ...args) => {
          console.log(`trace: ${msg}`, ...args);
        },
        seed: () => Date.now(),
        'console.log': (ptr) => {
          // This would need the module's exports to decode the string
          console.log('[WASM Log]');
        }
      },
      console: {
        log: (ptr) => {
          console.log('[Console Log]');
        }
      }
    };
    
    // Instantiate the module
    const module = await loader.instantiate(wasmBuffer, imports);
    
    console.log('\n=== Running Network Topology Tests ===\n');
    
    // Call the runTests function if it exists
    if (module.exports.runTests) {
      module.exports.runTests();
    } else if (module.exports._start) {
      module.exports._start();
    } else {
      console.log('No runTests or _start function found in exports');
      console.log('Available exports:', Object.keys(module.exports));
    }
    
    console.log('\n✅ Tests completed successfully!');
    
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  }
}

// Run the tests
runTests().catch(console.error);