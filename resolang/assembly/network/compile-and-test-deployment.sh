#!/bin/bash

# Compile the deployment test
echo "Compiling Deployment and Activation test..."
npx asc assembly/network/test-deployment.ts \
  --runtime incremental \
  --exportRuntime \
  --outFile assembly/network/test-deployment.wasm \
  --textFile assembly/network/test-deployment.wat \
  --sourceMap

if [ $? -ne 0 ]; then
  echo "Compilation failed!"
  exit 1
fi

echo "Compilation successful!"

# Run the test using a simple runner
echo -e "\n=== Running Deployment and Activation Tests ===\n"
node assembly/network/run-deployment-test.cjs

# Clean up
rm -f assembly/network/test-deployment.wasm
rm -f assembly/network/test-deployment.wat
rm -f assembly/network/test-deployment.wasm.map

echo -e "\n✅ Test execution completed!"