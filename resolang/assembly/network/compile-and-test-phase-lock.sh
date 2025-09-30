#!/bin/bash

# Compile the prime phase-lock test
echo "Compiling Prime Phase-Lock Synchronization test..."
npx asc assembly/network/test-prime-phase-lock.ts \
  --runtime incremental \
  --exportRuntime \
  --outFile assembly/network/test-prime-phase-lock.wasm \
  --textFile assembly/network/test-prime-phase-lock.wat \
  --sourceMap

if [ $? -ne 0 ]; then
  echo "Compilation failed!"
  exit 1
fi

echo "Compilation successful!"

# Run the test using a simple runner
echo -e "\n=== Running Prime Phase-Lock Tests ===\n"
node assembly/network/run-phase-lock-test.cjs

# Clean up
rm -f assembly/network/test-prime-phase-lock.wasm
rm -f assembly/network/test-prime-phase-lock.wat
rm -f assembly/network/test-prime-phase-lock.wasm.map

echo -e "\n✅ Test execution completed!"