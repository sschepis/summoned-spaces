const fs = require('fs');
const loader = require('@assemblyscript/loader');

// Provide imports for the WebAssembly module
const imports = {
  env: {
    "console.log": (msgPtr) => {
      // Simple console.log implementation
      console.log("WASM:", msgPtr);
    },
    "Date.now": () => {
      return Date.now();
    },
    abort: (msgPtr, filePtr, line, column) => {
      console.error(`Abort at ${line}:${column}`);
    }
  }
};

// Load and run the WebAssembly module
const wasmModule = loader.instantiateSync(fs.readFileSync('./test-domain.wasm'), imports);

// The module should auto-execute via _start
if (wasmModule.exports._start) {
  wasmModule.exports._start();
}