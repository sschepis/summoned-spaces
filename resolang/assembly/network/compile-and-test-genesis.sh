#!/bin/bash

# Compile the genesis block test
echo "Compiling Genesis Block test..."
npx asc assembly/network/test-genesis-block.ts \
  --runtime incremental \
  --exportRuntime \
  --outFile assembly/network/test-genesis-block.wasm \
  --textFile assembly/network/test-genesis-block.wat \
  --sourceMap

if [ $? -ne 0 ]; then
  echo "Compilation failed!"
  exit 1
fi

echo "Compilation successful!"

# Run the test using the simple test runner
echo -e "\n=== Running Genesis Block Tests ===\n"
node assembly/network/run-genesis-test-simple.cjs

# Clean up
rm -f assembly/network/test-genesis-block.wasm
rm -f assembly/network/test-genesis-block.wat
rm -f assembly/network/test-genesis-block.wasm.map

echo -e "\n✅ Test execution completed!"