const fs = require('fs');
const loader = require('@assemblyscript/loader');

// Variable to hold the module instance
let wasmModule;

// Provide imports for the WebAssembly module
const imports = {
  env: {
    "console.log": (msgPtr) => {
      // Get the string from WebAssembly memory
      if (wasmModule && wasmModule.exports.__getString) {
        const message = wasmModule.exports.__getString(msgPtr);
        console.log(message);
      } else {
        console.log("WASM Log:", msgPtr);
      }
    },
    "Date.now": () => {
      return Date.now();
    },
    abort: (msgPtr, filePtr, line, column) => {
      if (wasmModule && wasmModule.exports.__getString) {
        const msg = wasmModule.exports.__getString(msgPtr);
        const file = wasmModule.exports.__getString(filePtr);
        console.error(`Abort: ${msg} at ${file}:${line}:${column}`);
      } else {
        console.error(`Abort at ${line}:${column}`);
      }
      process.exit(1);
    }
  }
};

// Load and run the WebAssembly module
wasmModule = loader.instantiateSync(fs.readFileSync('./test-identity.wasm'), imports);

// The module should auto-execute via _start
if (wasmModule.exports._start) {
  wasmModule.exports._start();
}