/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Quantum Network Type Definitions
 */

export interface QuantumNode {
  id: string;
  primes: [number, number, number]; // Gaussian, Eisenstein, Quaternionic primes
  phaseRing: number[];
  coherence: number;
  entanglements: Map<string, number>; // nodeId -> entanglement strength
  holographicField?: any;
}

export interface QuantumResult {
  success: boolean;
  data?: any;
  metadata: Map<string, number>;
  entropy?: number;
  coherence?: number;
  fidelity?: number;
}

export interface MemoryFragment {
  coeffs: Map<number, number>;
  center: [number, number];
  entropy: number;
  nodeId: string;
}

export interface NetworkStats {
  totalNodes: number;
  totalEntanglements: number;
  avgCoherence: number;
}

export interface Anomaly {
  nodeId: string;
  deviation: number;
  entropy: number;
}

export interface HealingResult {
  nodeId: string;
  healed: boolean;
  coherence: number;
}