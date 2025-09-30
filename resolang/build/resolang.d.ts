/** Exported memory */
export declare const memory: WebAssembly.Memory;
// Exported runtime interface
export declare function __new(size: number, id: number): number;
export declare function __pin(ptr: number): number;
export declare function __unpin(ptr: number): void;
export declare function __collect(): void;
export declare const __rtti_base: number;
/**
 * assembly/core/math/generatePrimes
 * @param n `i32`
 * @returns `~lib/array/Array<u32>`
 */
export declare function generatePrimes(n: number): Array<number>;
/**
 * assembly/core/serialization/escapeJSON
 * @param str `~lib/string/String`
 * @returns `~lib/string/String`
 */
export declare function escapeJSON(str: string): string;
/** assembly/core/constants/PHI */
export declare const PHI: {
  /** @type `f64` */
  get value(): number
};
/** assembly/core/constants/E */
export declare const E: {
  /** @type `f64` */
  get value(): number
};
/** assembly/core/constants/TWO_PI */
export declare const TWO_PI: {
  /** @type `f64` */
  get value(): number
};
/** assembly/core/constants/MERSENNE_PRIME_31 */
export declare const MERSENNE_PRIME_31: {
  /** @type `u64` */
  get value(): bigint
};
/**
 * assembly/core/constants/generateUniqueId
 * @param prefix `~lib/string/String`
 * @returns `~lib/string/String`
 */
export declare function generateUniqueId(prefix: string): string;
/**
 * assembly/core/constants/degreesToRadians
 * @param degrees `f64`
 * @returns `f64`
 */
export declare function degreesToRadians(degrees: number): number;
/**
 * assembly/core/constants/radiansToDegrees
 * @param radians `f64`
 * @returns `f64`
 */
export declare function radiansToDegrees(radians: number): number;
/**
 * assembly/examples/comprehensive-benchmark-suite/runFullValidationSuite
 * @returns `~lib/string/String`
 */
export declare function runFullValidationSuite(): string;
/**
 * assembly/examples/test-comprehensive-benchmark-suite/runBenchmarkTests
 * @returns `assembly/examples/test-comprehensive-benchmark-suite/BenchmarkTestSuite`
 */
export declare function runBenchmarkTests(): __Internref196;
/** assembly/resolang/currentNode */
export declare const currentNode: {
  /** @type `assembly/resolang/EntangledNode | null` */
  get value(): __Internref4 | null;
  set value(value: __Internref4 | null);
};
/**
 * assembly/resolang/setCurrentNode
 * @param node `assembly/resolang/EntangledNode | null`
 */
export declare function setCurrentNode(node: __Internref4 | null): void;
/** assembly/resolang/PI */
export declare const PI: {
  /** @type `f64` */
  get value(): number
};
/**
 * assembly/operators/tensor
 * @param fragmentA `assembly/resolang/ResonantFragment`
 * @param fragmentB `assembly/resolang/ResonantFragment`
 * @returns `assembly/resolang/ResonantFragment`
 */
export declare function tensor(fragmentA: __Internref85, fragmentB: __Internref85): __Internref85;
/**
 * assembly/operators/collapse
 * @param fragment `assembly/resolang/ResonantFragment`
 * @returns `assembly/resolang/ResonantFragment`
 */
export declare function collapse(fragment: __Internref85): __Internref85;
/**
 * assembly/operators/rotatePhase
 * @param node `assembly/resolang/EntangledNode`
 * @param phaseShift `f64`
 */
export declare function rotatePhase(node: __Internref4, phaseShift: number): void;
/**
 * assembly/operators/linkEntanglement
 * @param nodeA `assembly/resolang/EntangledNode`
 * @param nodeB `assembly/resolang/EntangledNode`
 */
export declare function linkEntanglement(nodeA: __Internref4, nodeB: __Internref4): void;
/**
 * assembly/operators/route
 * @param source `assembly/resolang/EntangledNode`
 * @param target `assembly/resolang/EntangledNode`
 * @param viaNodes `~lib/array/Array<assembly/resolang/EntangledNode>`
 * @returns `bool`
 */
export declare function route(source: __Internref4, target: __Internref4, viaNodes: Array<__Internref4>): boolean;
/**
 * assembly/operators/coherence
 * @param node `assembly/resolang/EntangledNode`
 * @returns `f64`
 */
export declare function coherence(node: __Internref4): number;
/**
 * assembly/operators/entropy
 * @param fragment `assembly/resolang/ResonantFragment`
 * @returns `f64`
 */
export declare function entropy(fragment: __Internref85): number;
/**
 * assembly/functionalBlocks/stabilize
 * @param node `assembly/resolang/EntangledNode`
 * @returns `bool`
 */
export declare function stabilize(node: __Internref4): boolean;
/**
 * assembly/functionalBlocks/teleport
 * @param mem `assembly/resolang/ResonantFragment`
 * @param to `assembly/resolang/EntangledNode`
 * @returns `bool`
 */
export declare function teleport(mem: __Internref85, to: __Internref4): boolean;
/**
 * assembly/functionalBlocks/entangled
 * @param nodeA `assembly/resolang/EntangledNode`
 * @param nodeB `assembly/resolang/EntangledNode`
 * @returns `bool`
 */
export declare function entangled(nodeA: __Internref4, nodeB: __Internref4): boolean;
/**
 * assembly/functionalBlocks/observe
 * @param remote `assembly/resolang/EntangledNode`
 * @returns `~lib/array/Array<f64>`
 */
export declare function observe(remote: __Internref4): Array<number>;
/**
 * assembly/quaternion-entanglement/transmitQuaternionicMessage
 * @param sender `assembly/quaternion-entanglement/QuaternionicAgent`
 * @param receiver `assembly/quaternion-entanglement/QuaternionicAgent`
 * @param message `~lib/string/String`
 * @param synchronizer `assembly/quaternion-entanglement/QuaternionicSynchronizer`
 * @returns `bool`
 */
export declare function transmitQuaternionicMessage(sender: __Internref204, receiver: __Internref204, message: string, synchronizer: __Internref211): boolean;
/**
 * assembly/utils/entropyRate
 * @param phaseRing `~lib/array/Array<f64>`
 * @returns `f64`
 */
export declare function entropyRate(phaseRing: Array<number>): number;
/**
 * assembly/utils/align
 * @param phaseRing `~lib/array/Array<f64>`
 * @returns `~lib/array/Array<f64>`
 */
export declare function align(phaseRing: Array<number>): Array<number>;
/**
 * assembly/utils/generateSymbol
 * @param primes `~lib/array/Array<u32>`
 * @returns `~lib/string/String`
 */
export declare function generateSymbol(primes: Array<number>): string;
/**
 * assembly/utils/toFixed
 * @param value `f64`
 * @param decimals `i32`
 * @returns `~lib/string/String`
 */
export declare function toFixed(value: number, decimals?: number): string;
/**
 * assembly/entropy-viz/initializeEntropyViz
 */
export declare function initializeEntropyViz(): void;
/**
 * assembly/entropy-viz/getGlobalSampler
 * @returns `assembly/entropy-viz/EntropyFieldSampler`
 */
export declare function getGlobalSampler(): __Internref8;
/**
 * assembly/entropy-viz/getGlobalTracker
 * @returns `assembly/entropy-viz/EntropyEvolutionTracker`
 */
export declare function getGlobalTracker(): __Internref12;
/**
 * assembly/entropy-viz/exportEntropyData
 * @returns `~lib/string/String`
 */
export declare function exportEntropyData(): string;
/**
 * assembly/entropy-viz/exportEntropyHistory
 * @returns `~lib/string/String`
 */
export declare function exportEntropyHistory(): string;
/**
 * assembly/core/validation/validateString
 * @returns `assembly/core/validation/StringValidationBuilder`
 */
export declare function validateString(): __Internref214;
/**
 * assembly/core/validation/validateNumber
 * @returns `assembly/core/validation/NumberValidationBuilder`
 */
export declare function validateNumber(): __Internref218;
/**
 * assembly/core/validation/validateObject
 * @returns `assembly/core/validation/ObjectValidator`
 */
export declare function validateObject(): __Internref222;
/**
 * assembly/core/math-optimized/modExpOptimized
 * @param base `u64`
 * @param exp `u64`
 * @param mod `u64`
 * @returns `u64`
 */
export declare function modExpOptimized(base: bigint, exp: bigint, mod: bigint): bigint;
/**
 * assembly/core/math-optimized/modInverseOptimized
 * @param a `u64`
 * @param m `u64`
 * @returns `u64`
 */
export declare function modInverseOptimized(a: bigint, m: bigint): bigint;
/**
 * assembly/core/math-optimized/simdArrayMul
 * @param a `~lib/typedarray/Float64Array`
 * @param b `~lib/typedarray/Float64Array`
 * @param result `~lib/typedarray/Float64Array`
 */
export declare function simdArrayMul(a: Float64Array, b: Float64Array, result: Float64Array): void;
/**
 * assembly/core/math-optimized/simdArrayAdd
 * @param a `~lib/typedarray/Float64Array`
 * @param b `~lib/typedarray/Float64Array`
 * @param result `~lib/typedarray/Float64Array`
 */
export declare function simdArrayAdd(a: Float64Array, b: Float64Array, result: Float64Array): void;
/**
 * assembly/core/math-optimized/simdDotProduct
 * @param a `~lib/typedarray/Float64Array`
 * @param b `~lib/typedarray/Float64Array`
 * @returns `f64`
 */
export declare function simdDotProduct(a: Float64Array, b: Float64Array): number;
/**
 * assembly/core/math-optimized/getPrimeCacheStats
 * @returns `~lib/string/String`
 */
export declare function getPrimeCacheStats(): string;
/**
 * assembly/core/math-optimized/resetMathOptimizations
 */
export declare function resetMathOptimizations(): void;
/**
 * assembly/core/math-optimized/getMathPerformanceReport
 * @returns `~lib/string/String`
 */
export declare function getMathPerformanceReport(): string;
/**
 * assembly/core/math-optimized/validateMathOperations
 * @returns `bool`
 */
export declare function validateMathOperations(): boolean;
/**
 * assembly/core/math-optimized/benchmarkMathOperations
 * @returns `~lib/string/String`
 */
export declare function benchmarkMathOperations(): string;
/**
 * assembly/core/math-optimized/testMathOperations
 * @returns `bool`
 */
export declare function testMathOperations(): boolean;
/** assembly/core/math-cache/SMALL_PRIMES */
export declare const SMALL_PRIMES: {
  /** @type `~lib/array/Array<u32>` */
  get value(): Array<number>
};
/** assembly/core/math-cache/primeCache */
export declare const primeCache: {
  /** @type `assembly/core/math-cache/PrimeCache` */
  get value(): __Internref29
};
/**
 * assembly/core/math-extended-gcd/extendedGCD
 * @param a `i64`
 * @param b `i64`
 * @returns `assembly/core/math-extended-gcd/ExtendedGCDResult`
 */
export declare function extendedGCD(a: bigint, b: bigint): __Internref225;
/**
 * assembly/core/math-extended-gcd/modInverse
 * @param a `u64`
 * @param m `u64`
 * @returns `u64`
 */
export declare function modInverse(a: bigint, m: bigint): bigint;
/** assembly/core/math-miller-rabin/MILLER_RABIN_WITNESSES_32 */
export declare const MILLER_RABIN_WITNESSES_32: {
  /** @type `~lib/array/Array<u32>` */
  get value(): Array<number>
};
/** assembly/core/math-miller-rabin/MILLER_RABIN_WITNESSES_64 */
export declare const MILLER_RABIN_WITNESSES_64: {
  /** @type `~lib/array/Array<u64>` */
  get value(): Array<bigint>
};
/**
 * assembly/core/math-miller-rabin/millerRabinDeterministic32
 * @param n `u32`
 * @returns `bool`
 */
export declare function millerRabinDeterministic32(n: number): boolean;
/**
 * assembly/core/math-miller-rabin/millerRabinDeterministic64
 * @param n `u64`
 * @returns `bool`
 */
export declare function millerRabinDeterministic64(n: bigint): boolean;
/**
 * assembly/core/math-montgomery/modExpMontgomery
 * @param base `u64`
 * @param exp `u64`
 * @param mod `u64`
 * @returns `u64`
 */
export declare function modExpMontgomery(base: bigint, exp: bigint, mod: bigint): bigint;
/**
 * assembly/core/math-operations/mulMod
 * @param a `u64`
 * @param b `u64`
 * @param mod `u64`
 * @returns `u64`
 */
export declare function mulMod(a: bigint, b: bigint, mod: bigint): bigint;
/**
 * assembly/core/math-operations/addMod
 * @param a `u64`
 * @param b `u64`
 * @param mod `u64`
 * @returns `u64`
 */
export declare function addMod(a: bigint, b: bigint, mod: bigint): bigint;
/**
 * assembly/core/math-operations/modExp
 * @param base `u64`
 * @param exp `u64`
 * @param mod `u64`
 * @returns `u64`
 */
export declare function modExp(base: bigint, exp: bigint, mod: bigint): bigint;
/**
 * assembly/core/math-operations/arrayMul
 * @param a `~lib/typedarray/Float64Array`
 * @param b `~lib/typedarray/Float64Array`
 * @param result `~lib/typedarray/Float64Array`
 */
export declare function arrayMul(a: Float64Array, b: Float64Array, result: Float64Array): void;
/**
 * assembly/core/math-operations/arrayAdd
 * @param a `~lib/typedarray/Float64Array`
 * @param b `~lib/typedarray/Float64Array`
 * @param result `~lib/typedarray/Float64Array`
 */
export declare function arrayAdd(a: Float64Array, b: Float64Array, result: Float64Array): void;
/**
 * assembly/core/math-operations/dotProduct
 * @param a `~lib/typedarray/Float64Array`
 * @param b `~lib/typedarray/Float64Array`
 * @returns `f64`
 */
export declare function dotProduct(a: Float64Array, b: Float64Array): number;
/**
 * assembly/core/math-operations/vectorMagnitude
 * @param v `~lib/typedarray/Float64Array`
 * @returns `f64`
 */
export declare function vectorMagnitude(v: Float64Array): number;
/**
 * assembly/core/math-operations/normalizeVector
 * @param v `~lib/typedarray/Float64Array`
 * @param result `~lib/typedarray/Float64Array`
 */
export declare function normalizeVector(v: Float64Array, result: Float64Array): void;
/**
 * assembly/core/math-operations/lerp
 * @param a `f64`
 * @param b `f64`
 * @param t `f64`
 * @returns `f64`
 */
export declare function lerp(a: number, b: number, t: number): number;
/**
 * assembly/core/math-operations/clamp
 * @param value `f64`
 * @param min `f64`
 * @param max `f64`
 * @returns `f64`
 */
export declare function clamp(value: number, min: number, max: number): number;
/**
 * assembly/core/math-operations/fastInvSqrt
 * @param x `f64`
 * @returns `f64`
 */
export declare function fastInvSqrt(x: number): number;
/**
 * assembly/core/math-operations/approxEqual
 * @param a `f64`
 * @param b `f64`
 * @param epsilon `f64`
 * @returns `bool`
 */
export declare function approxEqual(a: number, b: number, epsilon?: number): boolean;
/**
 * assembly/core/math-operations/safeDivide
 * @param a `f64`
 * @param b `f64`
 * @returns `f64`
 */
export declare function safeDivide(a: number, b: number): number;
/**
 * assembly/core/math-operations/gcd
 * @param a `u64`
 * @param b `u64`
 * @returns `u64`
 */
export declare function gcd(a: bigint, b: bigint): bigint;
/**
 * assembly/core/math-operations/lcm
 * @param a `u64`
 * @param b `u64`
 * @returns `u64`
 */
export declare function lcm(a: bigint, b: bigint): bigint;
/**
 * assembly/core/math-operations/isPerfectSquare
 * @param n `u64`
 * @returns `bool`
 */
export declare function isPerfectSquare(n: bigint): boolean;
/**
 * assembly/core/math-operations/isqrt
 * @param n `u64`
 * @returns `u64`
 */
export declare function isqrt(n: bigint): bigint;
/** assembly/core/math-performance/globalMathProfiler */
export declare const globalMathProfiler: {
  /** @type `assembly/core/math-performance/MathProfiler` */
  get value(): __Internref54
};
/**
 * assembly/core/math-performance/profileMathOperation
 * @param name `~lib/string/String`
 * @param operation `() => void`
 */
export declare function profileMathOperation(name: string, operation: __Internref253): void;
/** assembly/core/math-performance/globalMathMemoryTracker */
export declare const globalMathMemoryTracker: {
  /** @type `assembly/core/math-performance/MathMemoryTracker` */
  get value(): __Internref58
};
/**
 * assembly/core/math-primes/isPrimeOptimized
 * @param n `u64`
 * @returns `bool`
 */
export declare function isPrimeOptimized(n: bigint): boolean;
/**
 * assembly/core/math-primes/generatePrimeOptimized
 * @param minBits `i32`
 * @param maxBits `i32`
 * @returns `u64`
 */
export declare function generatePrimeOptimized(minBits: number, maxBits: number): bigint;
/**
 * assembly/core/math-primes/generatePrimesOptimized
 * @param n `i32`
 * @returns `~lib/array/Array<u32>`
 */
export declare function generatePrimesOptimized(n: number): Array<number>;
/**
 * assembly/core/math-primes/isGaussianPrime
 * @param real `f64`
 * @param imag `f64`
 * @returns `bool`
 */
export declare function isGaussianPrime(real: number, imag: number): boolean;
/**
 * assembly/core/math-primes/sieveOfEratosthenes
 * @param n `u32`
 * @returns `~lib/array/Array<u32>`
 */
export declare function sieveOfEratosthenes(n: number): Array<number>;
/**
 * assembly/core/math-primes/nextPrime
 * @param n `u64`
 * @returns `u64`
 */
export declare function nextPrime(n: bigint): bigint;
/**
 * assembly/core/math-primes/previousPrime
 * @param n `u64`
 * @returns `u64`
 */
export declare function previousPrime(n: bigint): bigint;
/**
 * assembly/identity/index/exampleUsage
 */
export declare function exampleUsage(): void;
/** assembly/identity/interfaces/IdentityType */
export declare enum IdentityType {
  /** @type `i32` */
  SELF_SOVEREIGN,
  /** @type `i32` */
  MANAGED,
  /** @type `i32` */
  SYSTEM,
}
/** assembly/identity/interfaces/KYCLevel */
export declare enum KYCLevel {
  /** @type `i32` */
  NONE,
  /** @type `i32` */
  BASIC,
  /** @type `i32` */
  ENHANCED,
  /** @type `i32` */
  FULL,
}
/** assembly/identity/interfaces/KYCVerificationStatus */
export declare enum KYCVerificationStatus {
  /** @type `i32` */
  PENDING,
  /** @type `i32` */
  IN_PROGRESS,
  /** @type `i32` */
  COMPLETED,
  /** @type `i32` */
  FAILED,
  /** @type `i32` */
  EXPIRED,
}
/** assembly/identity/interfaces/PermissionScope */
export declare enum PermissionScope {
  /** @type `i32` */
  GLOBAL,
  /** @type `i32` */
  DOMAIN,
  /** @type `i32` */
  OBJECT,
}
/** assembly/identity/interfaces/AuditAction */
export declare enum AuditAction {
  /** @type `i32` */
  CREATE,
  /** @type `i32` */
  UPDATE,
  /** @type `i32` */
  DELETE,
  /** @type `i32` */
  TRANSFER,
  /** @type `i32` */
  GRANT_PERMISSION,
  /** @type `i32` */
  REVOKE_PERMISSION,
  /** @type `i32` */
  ADD_MEMBER,
  /** @type `i32` */
  REMOVE_MEMBER,
  /** @type `i32` */
  VERIFY_KYC,
  /** @type `i32` */
  AUTHENTICATE,
  /** @type `i32` */
  DEACTIVATE,
  /** @type `i32` */
  REACTIVATE,
}
/** assembly/identity/interfaces/AuditResult */
export declare enum AuditResult {
  /** @type `i32` */
  SUCCESS,
  /** @type `i32` */
  FAILURE,
  /** @type `i32` */
  PARTIAL,
}
/** assembly/identity/interfaces/RecoveryMethod */
export declare enum RecoveryMethod {
  /** @type `i32` */
  MULTI_SIGNATURE,
  /** @type `i32` */
  SOCIAL_RECOVERY,
  /** @type `i32` */
  TIME_LOCKED,
  /** @type `i32` */
  HARDWARE_KEY,
}
/** assembly/identity/prime-mapping/globalPrimeMapper */
export declare const globalPrimeMapper: {
  /** @type `assembly/identity/prime-mapping/IdentityPrimeMapper` */
  get value(): __Internref73
};
/** assembly/identity/ownership-transfer/TransferType */
export declare enum TransferType {
  /** @type `i32` */
  DOMAIN,
  /** @type `i32` */
  OBJECT,
}
/** assembly/identity/ownership-transfer/TransferStatus */
export declare enum TransferStatus {
  /** @type `i32` */
  PENDING,
  /** @type `i32` */
  APPROVED,
  /** @type `i32` */
  REJECTED,
  /** @type `i32` */
  CANCELLED,
  /** @type `i32` */
  EXPIRED,
  /** @type `i32` */
  COMPLETED,
}
/** assembly/identity/ownership-transfer/globalTransferManager */
export declare const globalTransferManager: {
  /** @type `assembly/identity/ownership-transfer/OwnershipTransferManager` */
  get value(): __Internref76
};
/** assembly/identity/audit-trail/AuditEventType */
export declare enum AuditEventType {
  /** @type `i32` */
  IDENTITY_CREATED,
  /** @type `i32` */
  IDENTITY_UPDATED,
  /** @type `i32` */
  IDENTITY_KYC_CHANGED,
  /** @type `i32` */
  IDENTITY_DEACTIVATED,
  /** @type `i32` */
  IDENTITY_REACTIVATED,
  /** @type `i32` */
  DOMAIN_CREATED,
  /** @type `i32` */
  DOMAIN_UPDATED,
  /** @type `i32` */
  DOMAIN_MEMBER_ADDED,
  /** @type `i32` */
  DOMAIN_MEMBER_REMOVED,
  /** @type `i32` */
  DOMAIN_OWNERSHIP_TRANSFERRED,
  /** @type `i32` */
  OBJECT_CREATED,
  /** @type `i32` */
  OBJECT_UPDATED,
  /** @type `i32` */
  OBJECT_TRANSFERRED,
  /** @type `i32` */
  OBJECT_DESTROYED,
  /** @type `i32` */
  PERMISSION_GRANTED,
  /** @type `i32` */
  PERMISSION_REVOKED,
  /** @type `i32` */
  ROLE_ASSIGNED,
  /** @type `i32` */
  ROLE_REMOVED,
  /** @type `i32` */
  AUTH_LOGIN,
  /** @type `i32` */
  AUTH_LOGOUT,
  /** @type `i32` */
  AUTH_FAILED,
  /** @type `i32` */
  AUTH_SESSION_EXPIRED,
  /** @type `i32` */
  NODE_CONNECTED,
  /** @type `i32` */
  NODE_DISCONNECTED,
  /** @type `i32` */
  SYNC_STARTED,
  /** @type `i32` */
  SYNC_COMPLETED,
  /** @type `i32` */
  SYNC_FAILED,
}
/** assembly/identity/audit-trail/AuditSeverity */
export declare enum AuditSeverity {
  /** @type `i32` */
  INFO,
  /** @type `i32` */
  WARNING,
  /** @type `i32` */
  ERROR,
  /** @type `i32` */
  CRITICAL,
}
/** assembly/identity/audit-trail/globalAuditTrail */
export declare const globalAuditTrail: {
  /** @type `assembly/identity/audit-trail/AuditTrailManager` */
  get value(): __Internref59
};
/** assembly/identity/resolang-processor/globalResoLangProcessor */
export declare const globalResoLangProcessor: {
  /** @type `assembly/identity/resolang-processor/IdentityResoLangProcessor` */
  get value(): __Internref83
};
/**
 * assembly/identity/resolang-processor/quantumCheckPermission
 * @param identity `assembly/identity/interfaces/IIdentity`
 * @param permission `~lib/string/String`
 * @param resource `~lib/string/String | null`
 * @returns `bool`
 */
export declare function quantumCheckPermission(identity: __Record100<undefined>, permission: string, resource?: string | null): boolean;
/**
 * assembly/identity/resolang-processor/quantumProcessTransfer
 * @param request `assembly/identity/ownership-transfer/TransferRequest`
 * @param approvers `~lib/array/Array<assembly/identity/interfaces/IIdentity>`
 * @returns `bool`
 */
export declare function quantumProcessTransfer(request: __Internref77, approvers: Array<__Record100<undefined>>): boolean;
/**
 * assembly/identity/resolang-processor/quantumRecoverIdentity
 * @param lostIdentityId `~lib/string/String`
 * @param recoveryIdentities `~lib/array/Array<assembly/identity/interfaces/IIdentity>`
 * @param requiredSignatures `i32`
 * @returns `bool`
 */
export declare function quantumRecoverIdentity(lostIdentityId: string, recoveryIdentities: Array<__Record100<undefined>>, requiredSignatures?: number): boolean;
/**
 * assembly/identity/resolang-processor/quantumCreateAuditEntry
 * @param entry `assembly/identity/audit-trail/AuditEntry`
 */
export declare function quantumCreateAuditEntry(entry: __Internref61): void;
/**
 * assembly/identity/resolang-processor/quantumVerifyAuditIntegrity
 * @returns `bool`
 */
export declare function quantumVerifyAuditIntegrity(): boolean;
/** assembly/identity/identity-recovery/RecoveryStatus */
export declare enum RecoveryStatus {
  /** @type `i32` */
  PENDING,
  /** @type `i32` */
  EXECUTED,
  /** @type `i32` */
  CANCELLED,
  /** @type `i32` */
  EXPIRED,
}
/** assembly/identity/identity-recovery/globalRecoveryManager */
export declare const globalRecoveryManager: {
  /** @type `assembly/identity/identity-recovery/IdentityRecoveryManager` */
  get value(): __Internref93
};
/** assembly/identity/domain-registry/DomainStatus */
export declare enum DomainStatus {
  /** @type `i32` */
  ACTIVE,
  /** @type `i32` */
  SUSPENDED,
  /** @type `i32` */
  EXPIRED,
  /** @type `i32` */
  RESERVED,
}
/** assembly/identity/permission-inheritance/InheritanceMode */
export declare enum InheritanceMode {
  /** @type `i32` */
  NONE,
  /** @type `i32` */
  ADDITIVE,
  /** @type `i32` */
  RESTRICTIVE,
  /** @type `i32` */
  OVERRIDE,
}
/** assembly/identity/permission-inheritance/globalPermissionInheritance */
export declare const globalPermissionInheritance: {
  /** @type `assembly/identity/permission-inheritance/PermissionInheritanceManager` */
  get value(): __Internref102
};
/** assembly/identity/authentication/AuthMethod */
export declare enum AuthMethod {
  /** @type `i32` */
  PASSWORD,
  /** @type `i32` */
  BIOMETRIC,
  /** @type `i32` */
  HARDWARE_KEY,
  /** @type `i32` */
  QUANTUM_SIGNATURE,
  /** @type `i32` */
  MULTI_FACTOR,
}
/** assembly/identity/authentication/SessionStatus */
export declare enum SessionStatus {
  /** @type `i32` */
  ACTIVE,
  /** @type `i32` */
  EXPIRED,
  /** @type `i32` */
  REVOKED,
  /** @type `i32` */
  SUSPENDED,
}
/** assembly/identity/authentication/globalAuthManager */
export declare const globalAuthManager: {
  /** @type `assembly/identity/authentication/AuthenticationManager` */
  get value(): __Internref115
};
/**
 * assembly/quantum/prime-memory/primeSpectrum
 * @param state `assembly/quantum/prime-state/PrimeState`
 * @returns `~lib/map/Map<u32,f64>`
 */
export declare function primeSpectrum(state: __Internref245): __Internref11;
/**
 * assembly/quantum/prime-memory/symbolicCollapse
 * @param state `assembly/quantum/prime-state/PrimeState`
 * @param n `u32`
 * @param resonanceFactor `f64`
 * @returns `assembly/quantum/prime-state/PrimeState`
 */
export declare function symbolicCollapse(state: __Internref245, n: number, resonanceFactor?: number): __Internref245;
/**
 * assembly/quantum/prime-operators/primeOperator
 * @param state `assembly/quantum/prime-state/PrimeState`
 * @returns `~lib/map/Map<u32,f64>`
 */
export declare function primeOperator(state: __Internref245): __Internref11;
/**
 * assembly/quantum/prime-operators/factorizationOperator
 * @param n `u32`
 * @returns `assembly/quantum/prime-state/PrimeState`
 */
export declare function factorizationOperator(n: number): __Internref245;
/**
 * assembly/quantum/prime-operators/rotationOperator
 * @param n `u32`
 * @param p `u32`
 * @returns `f64`
 */
export declare function rotationOperator(n: number, p: number): number;
/** assembly/quantum/prime-state/DELTA_S */
export declare const DELTA_S: {
  /** @type `f64` */
  get value(): number
};
/** assembly/runtime/execution/controlFlow/ControlFlowType */
export declare enum ControlFlowType {
  /** @type `i32` */
  SEQUENTIAL,
  /** @type `i32` */
  CONDITIONAL,
  /** @type `i32` */
  LOOP,
  /** @type `i32` */
  JUMP,
  /** @type `i32` */
  CALL,
  /** @type `i32` */
  RETURN,
  /** @type `i32` */
  BREAK,
  /** @type `i32` */
  CONTINUE,
  /** @type `i32` */
  HALT,
}
/** assembly/runtime/state/primeState/BasisType */
export declare enum BasisType {
  /** @type `i32` */
  PRIME,
  /** @type `i32` */
  FOURIER,
  /** @type `i32` */
  WAVELET,
  /** @type `i32` */
  POLYNOMIAL,
  /** @type `i32` */
  MODULAR,
}
/**
 * assembly/quaternion-exports/createQuaternion
 * @param w `f64`
 * @param x `f64`
 * @param y `f64`
 * @param z `f64`
 * @returns `assembly/quaternion/Quaternion`
 */
export declare function createQuaternion(w: number, x: number, y: number, z: number): __Internref205;
/**
 * assembly/quaternion-exports/quaternionMultiply
 * @param q1 `assembly/quaternion/Quaternion`
 * @param q2 `assembly/quaternion/Quaternion`
 * @returns `assembly/quaternion/Quaternion`
 */
export declare function quaternionMultiply(q1: __Internref205, q2: __Internref205): __Internref205;
/**
 * assembly/quaternion-exports/quaternionConjugate
 * @param q `assembly/quaternion/Quaternion`
 * @returns `assembly/quaternion/Quaternion`
 */
export declare function quaternionConjugate(q: __Internref205): __Internref205;
/**
 * assembly/quaternion-exports/quaternionNorm
 * @param q `assembly/quaternion/Quaternion`
 * @returns `f64`
 */
export declare function quaternionNorm(q: __Internref205): number;
/**
 * assembly/quaternion-exports/quaternionNormalize
 * @param q `assembly/quaternion/Quaternion`
 * @returns `assembly/quaternion/Quaternion`
 */
export declare function quaternionNormalize(q: __Internref205): __Internref205;
/**
 * assembly/quaternion-exports/quaternionToBlochVector
 * @param q `assembly/quaternion/Quaternion`
 * @returns `~lib/typedarray/Float64Array`
 */
export declare function quaternionToBlochVector(q: __Internref205): Float64Array;
/**
 * assembly/quaternion-exports/quaternionExp
 * @param q `assembly/quaternion/Quaternion`
 * @returns `assembly/quaternion/Quaternion`
 */
export declare function quaternionExp(q: __Internref205): __Internref205;
/**
 * assembly/quaternion-exports/quaternionRotate
 * @param q `assembly/quaternion/Quaternion`
 * @param angle `f64`
 * @returns `assembly/quaternion/Quaternion`
 */
export declare function quaternionRotate(q: __Internref205, angle: number): __Internref205;
/**
 * assembly/quaternion-exports/quaternionToString
 * @param q `assembly/quaternion/Quaternion`
 * @returns `~lib/string/String`
 */
export declare function quaternionToString(q: __Internref205): string;
/**
 * assembly/quaternion-exports/quaternionToJSON
 * @param q `assembly/quaternion/Quaternion`
 * @returns `~lib/string/String`
 */
export declare function quaternionToJSON(q: __Internref205): string;
/**
 * assembly/quaternion-exports/isSplitPrime
 * @param p `u32`
 * @returns `bool`
 */
export declare function isSplitPrime(p: number): boolean;
/**
 * assembly/quaternion-exports/createQuaternionFromPrime
 * @param p `u32`
 * @returns `assembly/quaternion/Quaternion | null`
 */
export declare function createQuaternionFromPrime(p: number): __Internref205 | null;
/**
 * assembly/quaternion-exports/createQuaternionicResonanceField
 * @returns `assembly/quaternion/QuaternionicResonanceField`
 */
export declare function createQuaternionicResonanceField(): __Internref206;
/**
 * assembly/quaternion-exports/addPrimeToResonanceField
 * @param field `assembly/quaternion/QuaternionicResonanceField`
 * @param p `u32`
 * @returns `bool`
 */
export declare function addPrimeToResonanceField(field: __Internref206, p: number): boolean;
/**
 * assembly/quaternion-exports/computeResonanceField
 * @param field `assembly/quaternion/QuaternionicResonanceField`
 * @param x `f64`
 * @param t `f64`
 * @returns `assembly/quaternion/Quaternion`
 */
export declare function computeResonanceField(field: __Internref206, x: number, t: number): __Internref205;
/**
 * assembly/quaternion-exports/optimizeResonanceFieldParameters
 * @param field `assembly/quaternion/QuaternionicResonanceField`
 * @param target `assembly/quaternion/Quaternion`
 * @param iterations `i32`
 */
export declare function optimizeResonanceFieldParameters(field: __Internref206, target: __Internref205, iterations?: number): void;
/**
 * assembly/quaternion-exports/createTwistDynamics
 * @returns `assembly/quaternion/TwistDynamics`
 */
export declare function createTwistDynamics(): __Internref209;
/**
 * assembly/quaternion-exports/computeTwistAngleFromQuaternion
 * @param dynamics `assembly/quaternion/TwistDynamics`
 * @param q `assembly/quaternion/Quaternion`
 * @returns `f64`
 */
export declare function computeTwistAngleFromQuaternion(dynamics: __Internref209, q: __Internref205): number;
/**
 * assembly/quaternion-exports/evolveTwistDynamics
 * @param dynamics `assembly/quaternion/TwistDynamics`
 * @param dt `f64`
 */
export declare function evolveTwistDynamics(dynamics: __Internref209, dt: number): void;
/**
 * assembly/quaternion-exports/checkTwistCollapse
 * @param dynamics `assembly/quaternion/TwistDynamics`
 * @param entropy `f64`
 * @param entropyThreshold `f64`
 * @param angleThreshold `f64`
 * @returns `bool`
 */
export declare function checkTwistCollapse(dynamics: __Internref209, entropy: number, entropyThreshold: number, angleThreshold: number): boolean;
/**
 * assembly/quaternion-exports/getTwistAngle
 * @param dynamics `assembly/quaternion/TwistDynamics`
 * @returns `f64`
 */
export declare function getTwistAngle(dynamics: __Internref209): number;
/**
 * assembly/quaternion-exports/setTwistAngle
 * @param dynamics `assembly/quaternion/TwistDynamics`
 * @param angle `f64`
 */
export declare function setTwistAngle(dynamics: __Internref209, angle: number): void;
/**
 * assembly/quaternion-exports/createQuaternionicProjector
 * @param errorCorrection `f64`
 * @returns `assembly/quaternion/QuaternionicProjector`
 */
export declare function createQuaternionicProjector(errorCorrection?: number): __Internref210;
/**
 * assembly/quaternion-exports/projectQuaternion
 * @param projector `assembly/quaternion/QuaternionicProjector`
 * @param q `assembly/quaternion/Quaternion`
 * @returns `~lib/typedarray/Float64Array`
 */
export declare function projectQuaternion(projector: __Internref210, q: __Internref205): Float64Array;
/**
 * assembly/quaternion-exports/computeQuaternionEigenvalues
 * @param projector `assembly/quaternion/QuaternionicProjector`
 * @param q `assembly/quaternion/Quaternion`
 * @returns `~lib/typedarray/Float64Array`
 */
export declare function computeQuaternionEigenvalues(projector: __Internref210, q: __Internref205): Float64Array;
/**
 * assembly/quaternion-exports/createQuaternionPool
 * @param maxSize `i32`
 * @returns `assembly/quaternion/QuaternionPool`
 */
export declare function createQuaternionPool(maxSize?: number): __Internref248;
/**
 * assembly/quaternion-exports/allocateQuaternionFromPool
 * @param pool `assembly/quaternion/QuaternionPool`
 * @returns `assembly/quaternion/Quaternion`
 */
export declare function allocateQuaternionFromPool(pool: __Internref248): __Internref205;
/**
 * assembly/quaternion-exports/deallocateQuaternionToPool
 * @param pool `assembly/quaternion/QuaternionPool`
 * @param q `assembly/quaternion/Quaternion`
 */
export declare function deallocateQuaternionToPool(pool: __Internref248, q: __Internref205): void;
/**
 * assembly/quaternion-exports/createEntangledQuaternionPair
 * @param q1 `assembly/quaternion/Quaternion`
 * @param q2 `assembly/quaternion/Quaternion`
 * @param couplingStrength `f64`
 * @returns `assembly/quaternion-entanglement/EntangledQuaternionPair`
 */
export declare function createEntangledQuaternionPair(q1: __Internref205, q2: __Internref205, couplingStrength?: number): __Internref212;
/**
 * assembly/quaternion-exports/evolveEntangledPair
 * @param pair `assembly/quaternion-entanglement/EntangledQuaternionPair`
 * @param dt `f64`
 */
export declare function evolveEntangledPair(pair: __Internref212, dt: number): void;
/**
 * assembly/quaternion-exports/computeEntangledPairFidelity
 * @param pair `assembly/quaternion-entanglement/EntangledQuaternionPair`
 * @param target `assembly/quaternion-entanglement/EntangledQuaternionPair`
 * @returns `f64`
 */
export declare function computeEntangledPairFidelity(pair: __Internref212, target: __Internref212): number;
/**
 * assembly/quaternion-exports/optimizeEntanglement
 * @param pair `assembly/quaternion-entanglement/EntangledQuaternionPair`
 * @param target `assembly/quaternion-entanglement/EntangledQuaternionPair`
 * @param iterations `i32`
 */
export declare function optimizeEntanglement(pair: __Internref212, target: __Internref212, iterations?: number): void;
/**
 * assembly/quaternion-exports/createQuaternionicSynchronizer
 * @returns `assembly/quaternion-entanglement/QuaternionicSynchronizer`
 */
export declare function createQuaternionicSynchronizer(): __Internref211;
/**
 * assembly/quaternion-exports/measureQuaternionPhaseDifference
 * @param sync `assembly/quaternion-entanglement/QuaternionicSynchronizer`
 * @param q1 `assembly/quaternion/Quaternion`
 * @param q2 `assembly/quaternion/Quaternion`
 * @returns `f64`
 */
export declare function measureQuaternionPhaseDifference(sync: __Internref211, q1: __Internref205, q2: __Internref205): number;
/**
 * assembly/quaternion-exports/synchronizeQuaternions
 * @param sync `assembly/quaternion-entanglement/QuaternionicSynchronizer`
 * @param q1 `assembly/quaternion/Quaternion`
 * @param q2 `assembly/quaternion/Quaternion`
 * @param id1 `~lib/string/String`
 * @param id2 `~lib/string/String`
 * @param targetPhaseDiff `f64`
 * @param tolerance `f64`
 * @returns `bool`
 */
export declare function synchronizeQuaternions(sync: __Internref211, q1: __Internref205, q2: __Internref205, id1: string, id2: string, targetPhaseDiff?: number, tolerance?: number): boolean;
/**
 * assembly/quaternion-exports/runAdaptiveSynchronization
 * @param sync `assembly/quaternion-entanglement/QuaternionicSynchronizer`
 * @param pair `assembly/quaternion-entanglement/EntangledQuaternionPair`
 * @param maxIterations `i32`
 * @param dt `f64`
 * @returns `bool`
 */
export declare function runAdaptiveSynchronization(sync: __Internref211, pair: __Internref212, maxIterations?: number, dt?: number): boolean;
/**
 * assembly/quaternion-exports/createQuaternionicAgent
 * @param q `assembly/quaternion/Quaternion`
 * @returns `assembly/quaternion-entanglement/QuaternionicAgent`
 */
export declare function createQuaternionicAgent(q: __Internref205): __Internref204;
/**
 * assembly/quaternion-exports/encodeQuaternionicMessage
 * @param agent `assembly/quaternion-entanglement/QuaternionicAgent`
 * @param message `~lib/string/String`
 */
export declare function encodeQuaternionicMessage(agent: __Internref204, message: string): void;
/**
 * assembly/quaternion-exports/decodeQuaternionicMessage
 * @param agent `assembly/quaternion-entanglement/QuaternionicAgent`
 * @returns `~lib/string/String`
 */
export declare function decodeQuaternionicMessage(agent: __Internref204): string;
/**
 * assembly/quaternion-exports/entangleQuaternionicAgents
 * @param agent1 `assembly/quaternion-entanglement/QuaternionicAgent`
 * @param agent2 `assembly/quaternion-entanglement/QuaternionicAgent`
 * @param targetFidelity `f64`
 * @returns `assembly/quaternion-entanglement/EntangledQuaternionPair`
 */
export declare function entangleQuaternionicAgents(agent1: __Internref204, agent2: __Internref204, targetFidelity?: number): __Internref212;
/**
 * assembly/quaternion-exports/applyQuaternionicSymbolicCollapse
 * @param agent `assembly/quaternion-entanglement/QuaternionicAgent`
 * @param entropyThreshold `f64`
 * @returns `bool`
 */
export declare function applyQuaternionicSymbolicCollapse(agent: __Internref204, entropyThreshold?: number): boolean;
/**
 * assembly/quaternion-exports/getQuaternionicAgentQuaternion
 * @param agent `assembly/quaternion-entanglement/QuaternionicAgent`
 * @returns `assembly/quaternion/Quaternion`
 */
export declare function getQuaternionicAgentQuaternion(agent: __Internref204): __Internref205;
/**
 * assembly/quaternion-exports/getQuaternionicAgentEntanglementFidelity
 * @param agent `assembly/quaternion-entanglement/QuaternionicAgent`
 * @returns `f64`
 */
export declare function getQuaternionicAgentEntanglementFidelity(agent: __Internref204): number;
/**
 * assembly/quaternion-exports/getQuaternionW
 * @param q `assembly/quaternion/Quaternion`
 * @returns `f64`
 */
export declare function getQuaternionW(q: __Internref205): number;
/**
 * assembly/quaternion-exports/getQuaternionX
 * @param q `assembly/quaternion/Quaternion`
 * @returns `f64`
 */
export declare function getQuaternionX(q: __Internref205): number;
/**
 * assembly/quaternion-exports/getQuaternionY
 * @param q `assembly/quaternion/Quaternion`
 * @returns `f64`
 */
export declare function getQuaternionY(q: __Internref205): number;
/**
 * assembly/quaternion-exports/getQuaternionZ
 * @param q `assembly/quaternion/Quaternion`
 * @returns `f64`
 */
export declare function getQuaternionZ(q: __Internref205): number;
/**
 * assembly/quaternion-exports/setQuaternionComponents
 * @param q `assembly/quaternion/Quaternion`
 * @param w `f64`
 * @param x `f64`
 * @param y `f64`
 * @param z `f64`
 */
export declare function setQuaternionComponents(q: __Internref205, w: number, x: number, y: number, z: number): void;
/**
 * assembly/quantum-exports/createHolographicEncoding
 * @returns `assembly/quantum/holographic-encoding/HolographicEncoding`
 */
export declare function createHolographicEncoding(): __Internref249;
/**
 * assembly/quantum-exports/holographicEncodingEncode
 * @param encoding `assembly/quantum/holographic-encoding/HolographicEncoding`
 * @param x `f64`
 * @param y `f64`
 * @param entropy `f64`
 * @returns `f64`
 */
export declare function holographicEncodingEncode(encoding: __Internref249, x: number, y: number, entropy: number): number;
/**
 * assembly/quantum-exports/holographicEncodingDecode
 * @param encoding `assembly/quantum/holographic-encoding/HolographicEncoding`
 * @param queryX `f64`
 * @param queryY `f64`
 * @returns `f64`
 */
export declare function holographicEncodingDecode(encoding: __Internref249, queryX: number, queryY: number): number;
/**
 * assembly/quantum-exports/holographicEncodingClear
 * @param encoding `assembly/quantum/holographic-encoding/HolographicEncoding`
 */
export declare function holographicEncodingClear(encoding: __Internref249): void;
/**
 * assembly/quantum-exports/createEntropyEvolution
 * @param S0 `f64`
 * @param lambda `f64`
 * @returns `assembly/quantum/entropy-evolution/EntropyEvolution`
 */
export declare function createEntropyEvolution(S0: number, lambda: number): __Internref250;
/**
 * assembly/quantum-exports/entropyEvolutionEvolve
 * @param evolution `assembly/quantum/entropy-evolution/EntropyEvolution`
 * @param time `f64`
 * @returns `f64`
 */
export declare function entropyEvolutionEvolve(evolution: __Internref250, time: number): number;
/**
 * assembly/quantum-exports/entropyEvolutionCollapseProbability
 * @param evolution `assembly/quantum/entropy-evolution/EntropyEvolution`
 * @param t `f64`
 * @returns `f64`
 */
export declare function entropyEvolutionCollapseProbability(evolution: __Internref250, t: number): number;
/**
 * assembly/complex-exports/createComplex
 * @param real `f64`
 * @param imag `f64`
 * @returns `assembly/types/Complex`
 */
export declare function createComplex(real: number, imag: number): __Internref246;
/**
 * assembly/complex-exports/complexAdd
 * @param a `assembly/types/Complex`
 * @param b `assembly/types/Complex`
 * @returns `assembly/types/Complex`
 */
export declare function complexAdd(a: __Internref246, b: __Internref246): __Internref246;
/**
 * assembly/complex-exports/complexMultiply
 * @param a `assembly/types/Complex`
 * @param b `assembly/types/Complex`
 * @returns `assembly/types/Complex`
 */
export declare function complexMultiply(a: __Internref246, b: __Internref246): __Internref246;
/**
 * assembly/complex-exports/complexMagnitude
 * @param a `assembly/types/Complex`
 * @returns `f64`
 */
export declare function complexMagnitude(a: __Internref246): number;
/**
 * assembly/complex-exports/complexFromPolar
 * @param magnitude `f64`
 * @param phase `f64`
 * @returns `assembly/types/Complex`
 */
export declare function complexFromPolar(magnitude: number, phase: number): __Internref246;
/**
 * assembly/complex-exports/getComplexReal
 * @param a `assembly/types/Complex`
 * @returns `f64`
 */
export declare function getComplexReal(a: __Internref246): number;
/**
 * assembly/complex-exports/getComplexImag
 * @param a `assembly/types/Complex`
 * @returns `f64`
 */
export declare function getComplexImag(a: __Internref246): number;
/**
 * assembly/prime-state-exports/createPrimeState
 * @returns `assembly/quantum/prime-state/PrimeState`
 */
export declare function createPrimeState(): __Internref245;
/**
 * assembly/prime-state-exports/getPrimeStateAmplitudes
 * @param state `assembly/quantum/prime-state/PrimeState`
 * @returns `~lib/map/Map<f64,f64>`
 */
export declare function getPrimeStateAmplitudes(state: __Internref245): __Internref251;
/**
 * assembly/prime-state-exports/getPrimeStateCoefficients
 * @param state `assembly/quantum/prime-state/PrimeState`
 * @returns `~lib/array/Array<assembly/types/Complex>`
 */
export declare function getPrimeStateCoefficients(state: __Internref245): Array<__Internref246>;
/**
 * assembly/prime-state-exports/setPrimeStateAmplitudes
 * @param state `assembly/quantum/prime-state/PrimeState`
 * @param amplitudes `~lib/map/Map<f64,f64>`
 */
export declare function setPrimeStateAmplitudes(state: __Internref245, amplitudes: __Internref251): void;
/**
 * assembly/pnp-exports/createState
 * @param type `i32`
 * @param vars `~lib/array/Array<i32>`
 * @param constraints `~lib/array/Array<assembly/examples/universal-symbolic-transformer/UniversalConstraint>`
 * @returns `assembly/examples/universal-symbolic-transformer/UniversalSymbolicState`
 */
export declare function createState(type: number, vars: Array<number>, constraints: Array<__Internref183>): __Internref182;
/**
 * assembly/pnp-exports/isStateSatisfied
 * @param state `assembly/examples/universal-symbolic-transformer/UniversalSymbolicState`
 * @returns `bool`
 */
export declare function isStateSatisfied(state: __Internref182): boolean;
/**
 * assembly/pnp-exports/getSolutionEncoding
 * @param state `assembly/examples/universal-symbolic-transformer/UniversalSymbolicState`
 * @returns `~lib/array/Array<i32>`
 */
export declare function getSolutionEncoding(state: __Internref182): Array<number>;
/**
 * assembly/pnp-exports/createTransformer
 * @param problem_dimension `i32`
 * @returns `assembly/examples/universal-symbolic-transformer/UniversalSymbolicTransformer`
 */
export declare function createTransformer(problem_dimension: number): __Internref187;
/**
 * assembly/pnp-exports/encodeProblem
 * @param problem_type `i32`
 * @param variables `~lib/array/Array<i32>`
 * @param raw_constraints `~lib/array/Array<~lib/array/Array<i32>>`
 * @param weights `~lib/array/Array<f64>`
 * @returns `assembly/examples/universal-symbolic-transformer/UniversalSymbolicState`
 */
export declare function encodeProblem(problem_type: number, variables: Array<number>, raw_constraints: Array<Array<number>>, weights: Array<number>): __Internref182;
/**
 * assembly/pnp-exports/solveProblem
 * @param transformer `assembly/examples/universal-symbolic-transformer/UniversalSymbolicTransformer`
 * @param problem_state `assembly/examples/universal-symbolic-transformer/UniversalSymbolicState`
 * @returns `assembly/examples/universal-symbolic-transformer/UniversalSymbolicState`
 */
export declare function solveProblem(transformer: __Internref187, problem_state: __Internref182): __Internref182;
/**
 * assembly/pnp-exports/verifyConvergence
 * @param transformer `assembly/examples/universal-symbolic-transformer/UniversalSymbolicTransformer`
 * @returns `bool`
 */
export declare function verifyConvergence(transformer: __Internref187): boolean;
/** assembly/examples/universal-symbolic-transformer/NPProblemType */
export declare enum NPProblemType {
  /** @type `i32` */
  SAT,
  /** @type `i32` */
  VERTEX_COVER,
  /** @type `i32` */
  HAMILTONIAN_PATH,
  /** @type `i32` */
  GRAPH_COLORING,
  /** @type `i32` */
  KNAPSACK,
  /** @type `i32` */
  TSP,
  /** @type `i32` */
  SUBSET_SUM,
  /** @type `i32` */
  CLIQUE,
  /** @type `i32` */
  INDEPENDENT_SET,
  /** @type `i32` */
  PARTITION,
  /** @type `i32` */
  INTEGER_PROGRAMMING,
  /** @type `i32` */
  STEINER_TREE,
  /** @type `i32` */
  SET_COVER,
  /** @type `i32` */
  BIN_PACKING,
  /** @type `i32` */
  SCHEDULING,
}
/**
 * assembly/runtime-exports/createIdentityProcessor
 * @returns `assembly/runtime/processor/IdentityResoLangProcessor`
 */
export declare function createIdentityProcessor(): __Internref171;
/**
 * assembly/runtime-exports/checkPermission
 * @param processor `assembly/runtime/processor/IdentityResoLangProcessor`
 * @param identity `assembly/identity/interfaces/IIdentity`
 * @param permission `~lib/string/String`
 * @param resource `~lib/string/String | null`
 * @returns `bool`
 */
export declare function checkPermission(processor: __Internref171, identity: __Record100<undefined>, permission: string, resource?: string | null): boolean;
/**
 * assembly/runtime-exports/processTransferRequest
 * @param processor `assembly/runtime/processor/IdentityResoLangProcessor`
 * @param request `assembly/identity/ownership-transfer/TransferRequest`
 * @param approvers `~lib/array/Array<assembly/identity/interfaces/IIdentity>`
 * @returns `bool`
 */
export declare function processTransferRequest(processor: __Internref171, request: __Internref77, approvers: Array<__Record100<undefined>>): boolean;
/**
 * assembly/runtime-exports/recoverIdentity
 * @param processor `assembly/runtime/processor/IdentityResoLangProcessor`
 * @param lostIdentityId `~lib/string/String`
 * @param recoveryIdentities `~lib/array/Array<assembly/identity/interfaces/IIdentity>`
 * @param requiredSignatures `i32`
 * @returns `bool`
 */
export declare function recoverIdentity(processor: __Internref171, lostIdentityId: string, recoveryIdentities: Array<__Record100<undefined>>, requiredSignatures?: number): boolean;
/**
 * assembly/runtime-exports/createAuditEntry
 * @param processor `assembly/runtime/processor/IdentityResoLangProcessor`
 * @param entry `assembly/identity/audit-trail/AuditEntry`
 */
export declare function createAuditEntry(processor: __Internref171, entry: __Internref61): void;
/**
 * assembly/runtime-exports/verifyAuditIntegrity
 * @param processor `assembly/runtime/processor/IdentityResoLangProcessor`
 * @returns `bool`
 */
export declare function verifyAuditIntegrity(processor: __Internref171): boolean;
/**
 * assembly/runtime-exports/syncWithNetwork
 * @param processor `assembly/runtime/processor/IdentityResoLangProcessor`
 * @returns `bool`
 */
export declare function syncWithNetwork(processor: __Internref171): boolean;
/** assembly/examples/test-comprehensive-benchmark-suite/BenchmarkTestSuite */
declare class __Internref196 extends Number {
  private __nominal196: symbol;
  private __nominal0: symbol;
}
/** assembly/resolang/EntangledNode */
declare class __Internref4 extends Number {
  private __nominal4: symbol;
  private __nominal0: symbol;
}
/** assembly/resolang/ResonantFragment */
declare class __Internref85 extends Number {
  private __nominal85: symbol;
  private __nominal0: symbol;
}
/** assembly/quaternion-entanglement/QuaternionicAgent */
declare class __Internref204 extends Number {
  private __nominal204: symbol;
  private __nominal0: symbol;
}
/** assembly/quaternion-entanglement/QuaternionicSynchronizer */
declare class __Internref211 extends Number {
  private __nominal211: symbol;
  private __nominal0: symbol;
}
/** assembly/entropy-viz/EntropyFieldSampler */
declare class __Internref8 extends Number {
  private __nominal8: symbol;
  private __nominal0: symbol;
}
/** assembly/entropy-viz/EntropyEvolutionTracker */
declare class __Internref12 extends Number {
  private __nominal12: symbol;
  private __nominal0: symbol;
}
/** assembly/core/validation/StringValidationBuilder */
declare class __Internref214 extends Number {
  private __nominal214: symbol;
  private __nominal215: symbol;
  private __nominal0: symbol;
}
/** assembly/core/validation/NumberValidationBuilder */
declare class __Internref218 extends Number {
  private __nominal218: symbol;
  private __nominal219: symbol;
  private __nominal0: symbol;
}
/** assembly/core/validation/ObjectValidator */
declare class __Internref222 extends Number {
  private __nominal222: symbol;
  private __nominal0: symbol;
}
/** assembly/core/math-cache/PrimeCache */
declare class __Internref29 extends Number {
  private __nominal29: symbol;
  private __nominal0: symbol;
}
/** assembly/core/math-extended-gcd/ExtendedGCDResult */
declare class __Internref225 extends Number {
  private __nominal225: symbol;
  private __nominal0: symbol;
}
/** assembly/core/math-performance/MathProfiler */
declare class __Internref54 extends Number {
  private __nominal54: symbol;
  private __nominal0: symbol;
}
/** ~lib/function/Function<%28%29=>void> */
declare class __Internref253 extends Number {
  private __nominal253: symbol;
  private __nominal0: symbol;
}
/** assembly/core/math-performance/MathMemoryTracker */
declare class __Internref58 extends Number {
  private __nominal58: symbol;
  private __nominal0: symbol;
}
/** assembly/identity/prime-mapping/IdentityPrimeMapper */
declare class __Internref73 extends Number {
  private __nominal73: symbol;
  private __nominal60: symbol;
  private __nominal0: symbol;
}
/** assembly/identity/ownership-transfer/OwnershipTransferManager */
declare class __Internref76 extends Number {
  private __nominal76: symbol;
  private __nominal60: symbol;
  private __nominal0: symbol;
}
/** assembly/identity/audit-trail/AuditTrailManager */
declare class __Internref59 extends Number {
  private __nominal59: symbol;
  private __nominal60: symbol;
  private __nominal0: symbol;
}
/** assembly/identity/resolang-processor/IdentityResoLangProcessor */
declare class __Internref83 extends Number {
  private __nominal83: symbol;
  private __nominal0: symbol;
}
/** assembly/identity/interfaces/IIdentity */
declare interface __Record100<TOmittable> {
}
/** assembly/identity/ownership-transfer/TransferRequest */
declare class __Internref77 extends Number {
  private __nominal77: symbol;
  private __nominal60: symbol;
  private __nominal0: symbol;
}
/** assembly/identity/audit-trail/AuditEntry */
declare class __Internref61 extends Number {
  private __nominal61: symbol;
  private __nominal60: symbol;
  private __nominal0: symbol;
}
/** assembly/identity/identity-recovery/IdentityRecoveryManager */
declare class __Internref93 extends Number {
  private __nominal93: symbol;
  private __nominal0: symbol;
}
/** assembly/identity/permission-inheritance/PermissionInheritanceManager */
declare class __Internref102 extends Number {
  private __nominal102: symbol;
  private __nominal60: symbol;
  private __nominal0: symbol;
}
/** assembly/identity/authentication/AuthenticationManager */
declare class __Internref115 extends Number {
  private __nominal115: symbol;
  private __nominal0: symbol;
}
/** assembly/quantum/prime-state/PrimeState */
declare class __Internref245 extends Number {
  private __nominal245: symbol;
  private __nominal0: symbol;
}
/** ~lib/map/Map<u32,f64> */
declare class __Internref11 extends Number {
  private __nominal11: symbol;
  private __nominal0: symbol;
}
/** assembly/quaternion/Quaternion */
declare class __Internref205 extends Number {
  private __nominal205: symbol;
  private __nominal0: symbol;
}
/** assembly/quaternion/QuaternionicResonanceField */
declare class __Internref206 extends Number {
  private __nominal206: symbol;
  private __nominal0: symbol;
}
/** assembly/quaternion/TwistDynamics */
declare class __Internref209 extends Number {
  private __nominal209: symbol;
  private __nominal0: symbol;
}
/** assembly/quaternion/QuaternionicProjector */
declare class __Internref210 extends Number {
  private __nominal210: symbol;
  private __nominal0: symbol;
}
/** assembly/quaternion/QuaternionPool */
declare class __Internref248 extends Number {
  private __nominal248: symbol;
  private __nominal0: symbol;
}
/** assembly/quaternion-entanglement/EntangledQuaternionPair */
declare class __Internref212 extends Number {
  private __nominal212: symbol;
  private __nominal0: symbol;
}
/** assembly/quantum/holographic-encoding/HolographicEncoding */
declare class __Internref249 extends Number {
  private __nominal249: symbol;
  private __nominal0: symbol;
}
/** assembly/quantum/entropy-evolution/EntropyEvolution */
declare class __Internref250 extends Number {
  private __nominal250: symbol;
  private __nominal0: symbol;
}
/** assembly/types/Complex */
declare class __Internref246 extends Number {
  private __nominal246: symbol;
  private __nominal0: symbol;
}
/** ~lib/map/Map<f64,f64> */
declare class __Internref251 extends Number {
  private __nominal251: symbol;
  private __nominal0: symbol;
}
/** assembly/examples/universal-symbolic-transformer/UniversalConstraint */
declare class __Internref183 extends Number {
  private __nominal183: symbol;
  private __nominal0: symbol;
}
/** assembly/examples/universal-symbolic-transformer/UniversalSymbolicState */
declare class __Internref182 extends Number {
  private __nominal182: symbol;
  private __nominal0: symbol;
}
/** assembly/examples/universal-symbolic-transformer/UniversalSymbolicTransformer */
declare class __Internref187 extends Number {
  private __nominal187: symbol;
  private __nominal0: symbol;
}
/** assembly/runtime/processor/IdentityResoLangProcessor */
declare class __Internref171 extends Number {
  private __nominal171: symbol;
  private __nominal0: symbol;
}
