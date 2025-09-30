#!/bin/bash

# Compile the simplified prime phase-lock test
echo "Compiling Simplified Prime Phase-Lock Synchronization test..."
npx asc assembly/network/test-prime-phase-lock-simple.ts \
  --runtime incremental \
  --exportRuntime \
  --outFile assembly/network/test-prime-phase-lock-simple.wasm \
  --textFile assembly/network/test-prime-phase-lock-simple.wat \
  --sourceMap

if [ $? -ne 0 ]; then
  echo "Compilation failed!"
  exit 1
fi

echo "Compilation successful!"

# Run the test using a simple runner
echo -e "\n=== Running Simplified Prime Phase-Lock Tests ===\n"
node assembly/network/run-phase-lock-simple-test.cjs

# Clean up
rm -f assembly/network/test-prime-phase-lock-simple.wasm
rm -f assembly/network/test-prime-phase-lock-simple.wat
rm -f assembly/network/test-prime-phase-lock-simple.wasm.map

echo -e "\n✅ Test execution completed!"