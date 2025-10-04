/**
 * Holographic Memory Type Definitions
 */

export interface PublicResonance {
  primaryPrimes: number[];
  harmonicPrimes: number[];
}

export interface PrimeResonanceIdentity {
  publicResonance: PublicResonance;
  privateResonance: {
    secretPrimes: number[];
    eigenPhase: number;
    authenticationSeed: number;
  };
  fingerprint: string;
  nodeAddress: string;
}

export interface ResonantFragment {
  coeffs: Map<number, number>;
  center: [number, number];
  entropy: number;
  primeResonance?: number;
  holographicField?: unknown; // Will hold the WASM HolographicEncoding instance
}

export interface EncodedMemory extends ResonantFragment {
  index: number[];
  epoch: number;
  fingerprint: Uint8Array;
  signature: Uint8Array;
  originalText: string;
}

export interface CachedBeaconData {
  prime_indices: string;
  fingerprint: Uint8Array | string;
  epoch: number;
  [key: string]: unknown;
}