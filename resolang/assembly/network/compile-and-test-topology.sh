#!/bin/bash

# Compile the topology test
echo "Compiling Network Topology test..."
npx asc assembly/network/test-topology-simple.ts \
  --runtime incremental \
  --exportRuntime \
  --outFile assembly/network/test-topology-simple.wasm \
  --textFile assembly/network/test-topology-simple.wat \
  --sourceMap

if [ $? -ne 0 ]; then
  echo "Compilation failed!"
  exit 1
fi

echo "Compilation successful!"

# Run the test using the test runner
node assembly/network/test-topology-runner.js

# Clean up
rm -f assembly/network/test-topology-simple.wasm
rm -f assembly/network/test-topology-simple.wat
rm -f assembly/network/test-topology-simple.wasm.map

echo -e "\n✅ Test execution completed!"