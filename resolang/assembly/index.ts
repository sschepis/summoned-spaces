// Main entry point for ResoLang core library
// This file exports all public APIs that ResonNet and other projects can use

export * from './resolang';

// Core operations
export * from './operators';
export * from './functionalBlocks';
export * from './quaternion';
export * from './quaternion-entanglement';

// Utilities
export * from './utils';
export * from './entropy-viz';

// Core infrastructure
export * from './core/interfaces';
export * from './core/errors';
export * from './core/validation';
export * from './core/math-optimized';
export { generatePrimes } from './core/math';

// Crypto exports
export * from './crypto/index';

// Identity exports
export * from './identity/index';
export { IdentityResoLangProcessor } from './identity/resolang-processor';

// Quantum operations (individual exports since no index file)
export * from './quantum/phase-lock-ring';
export * from './quantum/prime-memory';
export * from './quantum/prime-operators';
export * from './quantum/prime-state';
export * from './quantum/quantum-consciousness-resonance';
export { PrimeState } from './quantum/prime-state';

// Runtime exports (core components only)
export * from './runtime/argument';
export * from './runtime/execution/context';
export * from './runtime/execution/controlFlow';
export * from './runtime/execution/stack';
export * from './runtime/entropy/evolution';
export * from './runtime/instructions/types';
export * from './runtime/memory/holographic';
export * from './runtime/state/globalState';
export * from './runtime/state/primeState';
// export * from './runtime/state/registerState'; // Ambiguous export
export { IRISAInstruction, RISAEngine, IExecutionResult } from './runtime';

// Specific additional exports to avoid conflicts
export { PrimeFieldElement, Complex } from './types';
export {
  JSONBuilder,
  SerializationOptions,
  escapeJSON,
  SerializationUtils
} from './core/serialization';
export { getMapKeys } from './map-exports';
export {
  PHI,
  E,
  TWO_PI,
  MERSENNE_PRIME_31,
  generateUniqueId,
  degreesToRadians,
  radiansToDegrees
} from './core/constants';

// P = NP Breakthrough Validation Framework exports
export {
  ComprehensiveBenchmarkSuite,
  runFullValidationSuite
} from './examples/comprehensive-benchmark-suite';

export {
  runBenchmarkTests
} from './examples/test-comprehensive-benchmark-suite';

// Explicit quaternion class exports for external consumption
export {
  Quaternion,
  SplitPrimeFactorizer,
  QuaternionicResonanceField,
  TwistDynamics,
  QuaternionicProjector,
  QuaternionPool
} from './quaternion';

export {
  EntangledQuaternionPair,
  QuaternionicSynchronizer,
  QuaternionicAgent
} from './quaternion-entanglement';

// WebAssembly-compatible quaternion function exports
export * from './quaternion-exports';

// WebAssembly-compatible quantum function exports
export * from './quantum-exports';
// WebAssembly-compatible complex number function exports
export * from './complex-exports';


// WebAssembly-compatible prime state function exports
export * from './prime-state-exports';
// WebAssembly-compatible P=NP solver function exports
// WebAssembly-compatible map function exports
export * from './map-exports';
export * from './pnp-exports';
// WebAssembly-compatible runtime function exports
export * from './runtime-exports';
